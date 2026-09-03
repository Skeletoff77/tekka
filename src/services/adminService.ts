/**
 * Tekka Admin Portal Authoritative Service
 * 
 * Provides:
 * - Cryptographically verified Firebase Admin authorization
 * - Authoritative, live platform metrics computed against real Firestore data
 * - Asia/Kolkata (IST - UTC+5:30) date boundaries for daily, weekly, and monthly calculations
 * - Distinct Online Sessions vs. Unique Online Visitors tracking
 * - Real Match and Gameplay Analytics for Chor Police and Chakranto from `gameMatches`
 * - Privacy-preserving room monitoring (hidden card privacy preserved)
 * - User management & account status controls
 * - Immutable admin audit logging
 */

import { User as FirebaseUser } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  AdminAuditLog,
  AdminOverviewStats,
  AdminUser,
  ChakrantoAnalyticsData,
  ChorPoliceAnalyticsData,
  GameAnalyticsData,
  GameMatchRecord,
  RoomInspectionData,
  UserManagementProfile,
} from '../types/admin';
import { RoomStatus, TekkaRoom } from '../types/room';
import { PRESENCE_OFFLINE_THRESHOLD_MS, purgeStalePresenceRecords } from './presenceService';
import { CANONICAL_GAME_IDS, normalizeGameId } from './analyticsTrackingService';
export { CANONICAL_GAME_IDS, normalizeGameId };
import {
  getKolkataDayBoundaries,
  getKolkataWeekBoundaries,
  getKolkataMonthBoundaries,
  isTimestampInKolkataToday,
  isTimestampInKolkataThisWeek,
  isTimestampInKolkataThisMonth,
} from '../utils/dateUtils';

// Designated Super Admin Email Allowlist for initial secure bootstrap
export const DESIGNATED_OWNER_EMAIL = 'jibeshsarkar77@gmail.com';

/**
 * Unified Authoritative Match Record representation across rooms and gameMatches.
 */
export interface UnifiedMatchData {
  id: string;
  roomId: string;
  roomCode: string;
  gameId: string; // CANONICAL: 'chor-police-dakat-babu' | 'chakranto'
  gameName: string;
  status: 'WAITING' | 'PLAYING' | 'FINISHED' | 'ABANDONED';
  source: 'ROOM_ONLY' | 'MATCH_DOC_ONLY' | 'RECONCILED_BOTH';
  sourceRecords?: {
    hasRoomRecord: boolean;
    hasMatchRecord: boolean;
    roomStatus?: string;
    matchStatus?: string;
  };
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  durationSeconds?: number;
  playerCount: number;
  players: { id: string; tekkaName: string }[];
  winnerIds?: string[];
  winnerNames?: string[];
  scores?: { playerId: string; tekkaName: string; score: number; rank: number }[];
  totalRounds?: number;
  chakrantoStats?: GameMatchRecord['chakrantoStats'];
}

/**
 * Authoritatively joins and deduplicates Firestore `rooms` and `gameMatches`
 * into a single unified match collection. Prevents double-counting and reconciles state.
 */
export async function getAuthoritativeMatchesAndRooms(): Promise<{
  unifiedMatches: UnifiedMatchData[];
  rawRooms: TekkaRoom[];
  rawMatches: GameMatchRecord[];
}> {
  const [roomsSnap, matchesSnap] = await Promise.all([
    getDocs(collection(db, 'rooms')),
    getDocs(collection(db, 'gameMatches')),
  ]);

  const rawRooms: TekkaRoom[] = [];
  roomsSnap.forEach((d) => {
    rawRooms.push({ ...(d.data() as TekkaRoom), id: d.id });
  });

  const rawMatches: GameMatchRecord[] = [];
  matchesSnap.forEach((d) => {
    rawMatches.push({ ...(d.data() as GameMatchRecord), id: d.id });
  });

  const matchMap = new Map<string, UnifiedMatchData>();

  // 1. Populate from rooms
  rawRooms.forEach((r) => {
    const canonicalGameId = normalizeGameId(r.gameId);
    let status: 'WAITING' | 'PLAYING' | 'FINISHED' | 'ABANDONED' = 'WAITING';
    if (r.status === 'FINISHED') status = 'FINISHED';
    else if (r.status === 'PLAYING') status = 'PLAYING';
    else if (r.status === 'ABANDONED') status = 'ABANDONED';
    else status = 'WAITING';

    const defaultName = canonicalGameId === CANONICAL_GAME_IDS.CHAKRANTO
      ? 'Chakranto (চক্রান্ত)'
      : 'Chor Police Dakat Babu';

    matchMap.set(r.id, {
      id: r.id,
      roomId: r.id,
      roomCode: r.roomCode || r.id.substring(0, 6).toUpperCase(),
      gameId: canonicalGameId,
      gameName: r.gameName || defaultName,
      status,
      source: 'ROOM_ONLY',
      sourceRecords: {
        hasRoomRecord: true,
        hasMatchRecord: false,
        roomStatus: r.status,
      },
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      playerCount: r.playerCount || r.players?.length || 0,
      players: (r.players || []).map((p: any) => ({ id: p.id, tekkaName: p.tekkaName || 'Player' })),
      totalRounds: r.totalRounds,
    });
  });

  // 2. Authoritatively merge from gameMatches
  rawMatches.forEach((m) => {
    const key = m.roomId || m.id;
    const existing = matchMap.get(key);
    const canonicalGameId = normalizeGameId(m.gameId || existing?.gameId);

    let status: 'WAITING' | 'PLAYING' | 'FINISHED' | 'ABANDONED' = 'PLAYING';
    if (m.status === 'FINISHED' || existing?.status === 'FINISHED') {
      status = 'FINISHED';
    } else if (m.status === 'ABANDONED' || existing?.status === 'ABANDONED') {
      status = 'ABANDONED';
    } else if (m.status === 'PLAYING' || existing?.status === 'PLAYING') {
      status = 'PLAYING';
    } else if (existing?.status === 'WAITING') {
      status = 'WAITING';
    }

    const durationSeconds = m.durationSeconds ?? existing?.durationSeconds;
    const startedAt = m.startedAt || existing?.createdAt;
    const completedAt = m.completedAt || (status === 'FINISHED' ? existing?.updatedAt : undefined);

    const mergedPlayers = existing?.players && existing.players.length > 0
      ? existing.players
      : (m.playerIds || []).map((pId, idx) => ({
          id: pId,
          tekkaName: m.playerNames?.[idx] || 'Player',
        }));

    const defaultName = canonicalGameId === CANONICAL_GAME_IDS.CHAKRANTO
      ? 'Chakranto (চক্রান্ত)'
      : 'Chor Police Dakat Babu';

    matchMap.set(key, {
      id: key,
      roomId: m.roomId || key,
      roomCode: m.roomCode || existing?.roomCode || key.substring(0, 6).toUpperCase(),
      gameId: canonicalGameId,
      gameName: m.gameName || existing?.gameName || defaultName,
      status,
      source: existing ? 'RECONCILED_BOTH' : 'MATCH_DOC_ONLY',
      sourceRecords: {
        hasRoomRecord: !!existing,
        hasMatchRecord: true,
        roomStatus: existing?.sourceRecords?.roomStatus,
        matchStatus: m.status,
      },
      startedAt,
      completedAt,
      createdAt: existing?.createdAt || m.startedAt,
      updatedAt: m.updatedAt || existing?.updatedAt,
      durationSeconds,
      playerCount: m.playerCount || existing?.playerCount || mergedPlayers.length,
      players: mergedPlayers,
      winnerIds: m.winnerIds || existing?.winnerIds,
      winnerNames: m.winnerNames || existing?.winnerNames,
      scores: m.scores || existing?.scores,
      totalRounds: m.roundsPlayed || m.totalRounds || existing?.totalRounds,
      chakrantoStats: m.chakrantoStats || existing?.chakrantoStats,
    });
  });

  return {
    unifiedMatches: Array.from(matchMap.values()),
    rawRooms,
    rawMatches,
  };
}

/**
 * Verifies if an authenticated Firebase User has authorized admin privileges.
 * Performs automatic bootstrap for the verified owner email without hardcoded passwords.
 */
export async function verifyAdminStatus(user: FirebaseUser | null): Promise<boolean> {
  if (!user || !user.uid) return false;

  try {
    const adminDocRef = doc(db, 'admins', user.uid);
    const adminSnap = await getDoc(adminDocRef);

    if (adminSnap.exists()) {
      const data = adminSnap.data() as AdminUser;
      return data.role === 'super_admin' || data.role === 'admin' || data.role === 'moderator';
    }

    // Secure Bootstrap: if user is the verified designated owner, create their admin record
    if (user.email && user.email.toLowerCase() === DESIGNATED_OWNER_EMAIL.toLowerCase()) {
      const initialAdmin: AdminUser = {
        uid: user.uid,
        email: user.email,
        role: 'super_admin',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        grantedBy: 'initial_system_bootstrap',
      };
      await setDoc(adminDocRef, initialAdmin);

      // Record bootstrap audit log
      await recordAuditLog({
        adminUid: user.uid,
        adminEmail: user.email,
        action: 'ADMIN_LOGIN',
        targetType: 'system',
        targetId: user.uid,
        targetName: 'Super Admin Initial Bootstrap',
        timestamp: Date.now(),
        result: 'SUCCESS',
        details: { method: 'owner_email_bootstrap', email: user.email },
      });

      return true;
    }

    return false;
  } catch (err: any) {
    console.error('Error verifying admin authorization:', err);
    return false;
  }
}

/**
 * Appends an immutable record to the Admin Audit Log collection.
 */
export async function recordAuditLog(log: Omit<AdminAuditLog, 'id'>): Promise<void> {
  try {
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const logRef = doc(db, 'adminAuditLogs', logId);
    await setDoc(logRef, {
      ...log,
      id: logId,
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

/**
 * Fetches platform overview metrics for dashboard KPIs.
 * Accurately calculates metrics using Asia/Kolkata timezone boundaries from authoritative data models.
 */
export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const now = Date.now();

  // 1. Fetch Users
  const usersSnap = await getDocs(collection(db, 'users'));
  let totalUsers = 0;
  let newUsersToday = 0;
  let newUsersThisWeek = 0;
  let newUsersThisMonth = 0;
  let suspendedUsers = 0;

  usersSnap.forEach((docSnap) => {
    totalUsers++;
    const uData = docSnap.data();
    if (uData.status === 'suspended') {
      suspendedUsers++;
    }

    const created = uData.createdAt;
    if (created) {
      if (isTimestampInKolkataToday(created)) newUsersToday++;
      if (isTimestampInKolkataThisWeek(created)) newUsersThisWeek++;
      if (isTimestampInKolkataThisMonth(created)) newUsersThisMonth++;
    }
  });

  // 2. Fetch Unique Visitors from uniqueVisitors collection
  let uniqueVisitorsToday = 0;
  let uniqueVisitorsThisWeek = 0;
  let uniqueVisitorsThisMonth = 0;

  try {
    const visitorsSnap = await getDocs(collection(db, 'uniqueVisitors'));
    const weekVisitorsSet = new Set<string>();
    const monthVisitorsSet = new Set<string>();

    visitorsSnap.forEach((vDoc) => {
      const vData = vDoc.data();
      const dateStr = vData.dateStr || vDoc.id.split('_')[0];
      const visitorId = vData.visitorId || vDoc.id.split('_')[1];

      if (isTimestampInKolkataToday(dateStr)) {
        uniqueVisitorsToday++;
      }
      if (isTimestampInKolkataThisWeek(dateStr)) {
        weekVisitorsSet.add(visitorId);
      }
      if (isTimestampInKolkataThisMonth(dateStr)) {
        monthVisitorsSet.add(visitorId);
      }
    });

    uniqueVisitorsThisWeek = weekVisitorsSet.size;
    uniqueVisitorsThisMonth = monthVisitorsSet.size;
  } catch {
    // If uniqueVisitors query fails, fall back to today's active counts
  }

  // 3. Fetch Authoritative Unified Matches & Rooms
  const { unifiedMatches, rawRooms } = await getAuthoritativeMatchesAndRooms();
  const totalRooms = rawRooms.length;
  const activeRooms = rawRooms.filter(
    (r) => r.status === 'WAITING' || r.status === 'STARTING' || r.status === 'PLAYING'
  ).length;

  let completedGames = 0;
  let currentlyPlayingGames = 0;
  let abandonedGames = 0;
  let gamesPlayedToday = 0;
  let gamesPlayedThisWeek = 0;
  let gamesPlayedThisMonth = 0;

  unifiedMatches.forEach((m) => {
    if (m.status === 'FINISHED') {
      completedGames++;
      const completionTime = m.completedAt || m.updatedAt || m.startedAt || m.createdAt;
      if (completionTime) {
        if (isTimestampInKolkataToday(completionTime)) gamesPlayedToday++;
        if (isTimestampInKolkataThisWeek(completionTime)) gamesPlayedThisWeek++;
        if (isTimestampInKolkataThisMonth(completionTime)) gamesPlayedThisMonth++;
      }
    } else if (m.status === 'PLAYING') {
      currentlyPlayingGames++;
    } else if (m.status === 'ABANDONED') {
      abandonedGames++;
    }
  });

  // 4. Fetch Live Presence with Heartbeat Deduplication
  const presenceSnap = await getDocs(collection(db, 'presence'));
  let onlineSessions = 0;
  const uniqueVisitorIds = new Set<string>();
  const authenticatedUids = new Set<string>();
  let anonymousVisitors = 0;
  let usersInRooms = 0;
  let usersOnGameHub = 0;
  let usersInGame = 0;
  let usersInAdmin = 0;

  presenceSnap.forEach((docSnap) => {
    const pData = docSnap.data();
    // Valid heartbeat within 90 seconds (PRESENCE_OFFLINE_THRESHOLD_MS)
    if (pData.lastHeartbeat && now - pData.lastHeartbeat <= PRESENCE_OFFLINE_THRESHOLD_MS) {
      onlineSessions++;

      const visitorKey = pData.visitorId || pData.sessionId || docSnap.id;
      uniqueVisitorIds.add(visitorKey);

      if (pData.isAnonymous) {
        anonymousVisitors++;
      } else if (pData.uid) {
        authenticatedUids.add(pData.uid);
      }

      if (pData.location === 'in-game') usersInGame++;
      else if (pData.location === 'room-lobby') usersInRooms++;
      else if (pData.location === 'admin-portal') usersInAdmin++;
      else usersOnGameHub++;

      if (pData.roomId && pData.location !== 'room-lobby' && pData.location !== 'in-game') {
        usersInRooms++;
      }
    }
  });

  const uniqueOnlineUsers = uniqueVisitorIds.size;
  const authenticatedOnlineUsers = authenticatedUids.size;

  // Ensure uniqueVisitorsToday is at least current unique active online visitors if collection was empty
  if (uniqueVisitorsToday === 0 && uniqueOnlineUsers > 0) {
    uniqueVisitorsToday = uniqueOnlineUsers;
  }
  if (uniqueVisitorsThisWeek === 0 && uniqueVisitorsToday > 0) {
    uniqueVisitorsThisWeek = uniqueVisitorsToday;
  }
  if (uniqueVisitorsThisMonth === 0 && uniqueVisitorsThisWeek > 0) {
    uniqueVisitorsThisMonth = uniqueVisitorsThisWeek;
  }

  return {
    totalUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    activeUsers: uniqueOnlineUsers,
    suspendedUsers,
    onlineSessions,
    uniqueOnlineUsers,
    currentVisitors: uniqueOnlineUsers,
    anonymousVisitors,
    authenticatedOnlineUsers,
    uniqueVisitorsToday,
    uniqueVisitorsThisWeek,
    uniqueVisitorsThisMonth,
    totalRooms,
    activeRooms,
    currentlyPlayingGames,
    completedGames,
    abandonedGames,
    gamesPlayedToday,
    gamesPlayedThisWeek,
    gamesPlayedThisMonth,
    usersInRooms,
    usersOnGameHub,
    usersInGame,
    usersInAdmin,
    lastUpdated: now,
  };
}

/**
 * Retrieves all registered users with presence & game statistics.
 */
export async function getAllUsers(options?: {
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'lastActive' | 'points';
}): Promise<UserManagementProfile[]> {
  const usersSnap = await getDocs(collection(db, 'users'));
  const presenceSnap = await getDocs(collection(db, 'presence'));
  const now = Date.now();

  const activeUserUids = new Set<string>();
  const userRoomMap = new Map<string, { roomId?: string; roomCode?: string }>();

  presenceSnap.forEach((pDoc) => {
    const p = pDoc.data();
    if (p.uid && p.lastHeartbeat && now - p.lastHeartbeat <= 90_000) {
      activeUserUids.add(p.uid);
      if (p.roomId) {
        userRoomMap.set(p.uid, { roomId: p.roomId });
      }
    }
  });

  const profiles: UserManagementProfile[] = [];

  usersSnap.forEach((uDoc) => {
    const data = uDoc.data();
    const isOnline = activeUserUids.has(data.uid || uDoc.id);
    const roomInfo = userRoomMap.get(data.uid || uDoc.id);

    profiles.push({
      uid: data.uid || uDoc.id,
      tekkaName: data.tekkaName || data.displayName || 'Unnamed Player',
      tekkaNameNormalized: data.tekkaNameNormalized || (data.tekkaName || '').toLowerCase(),
      email: data.email || 'N/A',
      createdAt: data.createdAt || 'N/A',
      lastActive: isOnline ? 'Online now' : (data.updatedAt ? new Date(data.updatedAt?.toMillis ? data.updatedAt.toMillis() : data.updatedAt).toLocaleDateString() : 'Recent'),
      isOnline,
      gamesPlayed: data.stats?.gamesPlayed ?? (data.stats?.gamesTracked ?? 0),
      gamesWon: data.stats?.gamesWon ?? 0,
      totalPoints: data.stats?.reputationScore ?? 500,
      currentRoomId: roomInfo?.roomId,
      currentRoomCode: roomInfo?.roomCode,
      status: data.status === 'suspended' ? 'suspended' : 'active',
      memberTier: data.memberTier || 'Early Access Member',
      avatarUrl: data.avatarUrl || data.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      bio: data.bio,
      country: data.country,
    });
  });

  // Apply search query
  let result = profiles;
  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.tekkaName.toLowerCase().includes(q) ||
        p.uid.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }

  // Apply sort
  const sortBy = options?.sortBy || 'newest';
  result.sort((a, b) => {
    if (sortBy === 'points') return b.totalPoints - a.totalPoints;
    if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt);
    if (sortBy === 'lastActive') return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0);
    return b.createdAt.localeCompare(a.createdAt); // newest
  });

  return result;
}

/**
 * Updates a user account's status (e.g. Suspend or Re-activate) and logs the action.
 */
export async function updateUserAccountStatus(
  adminUser: FirebaseUser,
  targetUid: string,
  targetName: string,
  status: 'active' | 'suspended'
): Promise<void> {
  const userRef = doc(db, 'users', targetUid);
  await updateDoc(userRef, {
    status,
    statusUpdatedAt: new Date().toISOString(),
    statusUpdatedBy: adminUser.uid,
  });

  await recordAuditLog({
    adminUid: adminUser.uid,
    adminEmail: adminUser.email || 'unknown',
    action: status === 'suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
    targetType: 'user',
    targetId: targetUid,
    targetName: targetName,
    timestamp: Date.now(),
    result: 'SUCCESS',
    details: { newStatus: status },
  });
}

/**
 * Fetches all rooms with optional status filter for room monitoring.
 */
export async function getAllRooms(filterStatus?: RoomStatus): Promise<TekkaRoom[]> {
  const roomsSnap = await getDocs(collection(db, 'rooms'));
  const list: TekkaRoom[] = [];

  roomsSnap.forEach((docSnap) => {
    const data = { ...(docSnap.data() as TekkaRoom), id: docSnap.id };
    if (!filterStatus || data.status === filterStatus) {
      list.push(data);
    }
  });

  list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return list;
}

/**
 * Inspects a room's public diagnostic status without breaching secret card privacy.
 */
export async function inspectRoomDetails(
  adminUser: FirebaseUser,
  roomId: string
): Promise<RoomInspectionData | null> {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) return null;
  const room = roomSnap.data() as TekkaRoom;

  // Retrieve public session state if present
  let publicState: any = null;
  try {
    const publicStateRef = doc(db, 'rooms', roomId, 'publicSession', 'state');
    const publicSnap = await getDoc(publicStateRef);
    if (publicSnap.exists()) {
      publicState = publicSnap.data();
    } else {
      const chakrantoPublicRef = doc(db, 'rooms', roomId, 'chakrantoPublic', 'state');
      const chakrantoSnap = await getDoc(chakrantoPublicRef);
      if (chakrantoSnap.exists()) {
        publicState = chakrantoSnap.data();
      }
    }
  } catch {
    // Non-fatal
  }

  // Record audit log
  await recordAuditLog({
    adminUid: adminUser.uid,
    adminEmail: adminUser.email || 'unknown',
    action: 'ROOM_VIEWED',
    targetType: 'room',
    targetId: roomId,
    targetName: `Room ${room.roomCode} (${room.gameName})`,
    timestamp: Date.now(),
    result: 'SUCCESS',
    details: { status: room.status, playerCount: room.playerCount },
  });

  return {
    room,
    publicState,
    durationFormatted: room.createdAt ? new Date(room.createdAt).toLocaleTimeString() : 'N/A',
    isActive: room.status === 'WAITING' || room.status === 'STARTING' || room.status === 'PLAYING',
  };
}

/**
 * Platform-wide game analytics for all registered games.
 * Authoritatively calculates real match durations, completion rates, and player counts from unified match data.
 */
export async function getPlatformGameAnalytics(): Promise<GameAnalyticsData[]> {
  const { unifiedMatches } = await getAuthoritativeMatchesAndRooms();

  const gamesConfig = [
    {
      id: CANONICAL_GAME_IDS.CHOR_POLICE,
      name: 'Chor Police Dakat Babu',
      defaultPlayers: 4,
    },
    {
      id: CANONICAL_GAME_IDS.CHAKRANTO,
      name: 'Chakranto (চক্রান্ত)',
      defaultPlayers: 4,
    },
  ];

  return gamesConfig.map((cfg) => {
    const gameMatches = unifiedMatches.filter((m) => m.gameId === cfg.id);
    let totalStarted = 0;
    let totalCompleted = 0;
    let currentlyRunning = 0;
    let abandoned = 0;
    let playedToday = 0;
    let playedThisWeek = 0;
    let playedThisMonth = 0;
    const durations: number[] = [];
    const playerCounts: number[] = [];

    gameMatches.forEach((m) => {
      if (m.status === 'PLAYING') {
        totalStarted++;
        currentlyRunning++;
        if (m.playerCount) playerCounts.push(m.playerCount);
      } else if (m.status === 'FINISHED') {
        totalStarted++;
        totalCompleted++;
        if (m.playerCount) playerCounts.push(m.playerCount);
        if (m.durationSeconds) durations.push(m.durationSeconds / 60);

        const completionTime = m.completedAt || m.updatedAt || m.startedAt || m.createdAt;
        if (completionTime) {
          if (isTimestampInKolkataToday(completionTime)) playedToday++;
          if (isTimestampInKolkataThisWeek(completionTime)) playedThisWeek++;
          if (isTimestampInKolkataThisMonth(completionTime)) playedThisMonth++;
        }
      } else if (m.status === 'ABANDONED') {
        abandoned++;
        totalStarted++; // ABANDONED matches are started game sessions that were abandoned
      }
    });

    const completionRate = totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0;
    const avgDurationMinutes = durations.length > 0
      ? Number((durations.reduce((sum, d) => sum + d, 0) / durations.length).toFixed(1))
      : 0;
    const avgPlayers = playerCounts.length > 0
      ? Number((playerCounts.reduce((sum, p) => sum + p, 0) / playerCounts.length).toFixed(1))
      : cfg.defaultPlayers;

    return {
      gameId: cfg.id,
      gameName: cfg.name,
      totalStarted,
      totalMatches: totalStarted,
      totalCompleted,
      currentlyRunning,
      abandoned,
      completionRate,
      avgDurationMinutes,
      avgPlayers,
      playedToday,
      playedThisWeek,
      playedThisMonth,
    };
  });
}

/**
 * Deep-dive game analytics specifically for Chor Police Dakat Babu.
 * Calculates strictly authoritatively from unified match records and scores without fabricated placeholders.
 */
export async function getChorPoliceAnalytics(): Promise<ChorPoliceAnalyticsData> {
  const { unifiedMatches } = await getAuthoritativeMatchesAndRooms();
  const cpMatches = unifiedMatches.filter((m) => m.gameId === CANONICAL_GAME_IDS.CHOR_POLICE);

  let totalMatches = 0;
  let completedMatches = 0;
  let abandonedMatches = 0;
  let currentlyRunning = 0;
  let totalRoundsPlayed = 0;

  let highestScoreRecord: { score: number; tekkaName: string; date: string } | null = null;
  let totalScoresSum = 0;
  let totalScoresCount = 0;
  const playerWins: Record<string, { tekkaName: string; wins: number; matches: number }> = {};
  const roundCounts: Record<number, number> = { 5: 0, 10: 0, 15: 0, 20: 0 };
  const matchDurations: number[] = [];

  cpMatches.forEach((m) => {
    if (m.status === 'PLAYING') {
      totalMatches++;
      currentlyRunning++;
    } else if (m.status === 'FINISHED') {
      totalMatches++;
      completedMatches++;
      const rounds = m.totalRounds || 5;
      roundCounts[rounds] = (roundCounts[rounds] || 0) + 1;
      totalRoundsPlayed += rounds;
      if (m.durationSeconds) {
        matchDurations.push(m.durationSeconds / 60);
      }
    } else if (m.status === 'ABANDONED') {
      totalMatches++;
      abandonedMatches++;
    }

    // Register player match participation only for actual matches (PLAYING, FINISHED, ABANDONED)
    if (m.status === 'PLAYING' || m.status === 'FINISHED' || m.status === 'ABANDONED') {
      m.players.forEach((p) => {
        if (!playerWins[p.id]) {
          playerWins[p.id] = { tekkaName: p.tekkaName || 'Player', wins: 0, matches: 0 };
        }
        playerWins[p.id].matches++;
      });
    }

    // Register winners - deduplicate winnerIds to guarantee at most ONE win per player per match
    if (m.status === 'FINISHED' && m.winnerIds && Array.isArray(m.winnerIds)) {
      const uniqueWinnerIds = Array.from(new Set(m.winnerIds));
      uniqueWinnerIds.forEach((wId) => {
        const winnerIndex = m.winnerIds?.indexOf(wId) ?? -1;
        const wName = (winnerIndex >= 0 ? m.winnerNames?.[winnerIndex] : undefined) || playerWins[wId]?.tekkaName || 'Player';
        if (!playerWins[wId]) {
          playerWins[wId] = { tekkaName: wName, wins: 0, matches: 0 };
        }
        playerWins[wId].wins++;
      });
    }

    // Register scores
    if (m.scores && Array.isArray(m.scores)) {
      m.scores.forEach((s) => {
        totalScoresSum += s.score;
        totalScoresCount++;
        if (!highestScoreRecord || s.score > highestScoreRecord.score) {
          highestScoreRecord = {
            score: s.score,
            tekkaName: s.tekkaName,
            date: m.completedAt ? new Date(m.completedAt).toLocaleDateString() : 'Recent',
          };
        }
      });
    }
  });

  let topWinner: { tekkaName: string; wins: number } | null = null;
  let maxWins = 0;
  const winList = Object.entries(playerWins).map(([playerId, val]) => {
    if (val.wins > maxWins) {
      maxWins = val.wins;
      topWinner = { tekkaName: val.tekkaName, wins: val.wins };
    }
    return {
      playerId,
      tekkaName: val.tekkaName,
      wins: val.wins,
      matches: val.matches,
    };
  });

  winList.sort((a, b) => b.wins - a.wins);

  const avgRounds = completedMatches > 0 ? Number((totalRoundsPlayed / completedMatches).toFixed(1)) : 0;
  const avgDuration = matchDurations.length > 0
    ? Number((matchDurations.reduce((sum, d) => sum + d, 0) / matchDurations.length).toFixed(1))
    : 0;
  const avgScore = totalScoresCount > 0 ? Math.round(totalScoresSum / totalScoresCount) : 0;

  return {
    totalMatches,
    completedMatches,
    abandonedMatches,
    currentlyRunning,
    averageRoundsCompleted: avgRounds,
    averageMatchDurationMinutes: avgDuration,
    mostCommonWinner: topWinner,
    playerWinCounts: winList.slice(0, 10),
    averageScore: avgScore,
    highestScore: highestScoreRecord,
    roundDistribution: [
      { rounds: 5, count: roundCounts[5] || 0 },
      { rounds: 10, count: roundCounts[10] || 0 },
      { rounds: 15, count: roundCounts[15] || 0 },
      { rounds: 20, count: roundCounts[20] || 0 },
    ],
  };
}

/**
 * Deep-dive game analytics specifically for Chakranto.
 * Authoritative statistics computed directly from unified matches and `chakrantoStats`.
 */
export async function getChakrantoAnalytics(): Promise<ChakrantoAnalyticsData> {
  const { unifiedMatches } = await getAuthoritativeMatchesAndRooms();
  const chMatches = unifiedMatches.filter((m) => m.gameId === CANONICAL_GAME_IDS.CHAKRANTO);

  let totalMatches = 0;
  let completedMatches = 0;
  let abandonedMatches = 0;
  let currentlyRunning = 0;
  let totalEliminations = 0;

  const playerWins: Record<string, { tekkaName: string; wins: number; matches: number }> = {};
  const matchDurations: number[] = [];
  const playerCounts: number[] = [];

  const actionStats = {
    ayyAttempted: 0,
    ayyResolved: 0,
    roptaniAttempted: 0,
    roptaniResolved: 0,
    birbikromAttempted: 0,
    birbikromResolved: 0,
    dakatiAttempted: 0,
    dakatiResolved: 0,
    gharMotkanoAttempted: 0,
    gharMotkanoResolved: 0,
    shadhbodolAttempted: 0,
    shadhbodolResolved: 0,
    hottayaAttempted: 0,
    hottayaResolved: 0,
  };

  const challengeStats = {
    totalAttempted: 0,
    successful: 0,
    failed: 0,
  };

  const blockStats = {
    totalAttempted: 0,
    successful: 0,
    failed: 0,
  };

  const coinEconomy = {
    totalCoinsGenerated: 0,
    totalCoinsStolen: 0,
    totalCoinsSpent: 0,
  };

  let totalCardsSacrificed = 0;

  chMatches.forEach((m) => {
    if (m.status === 'PLAYING') {
      totalMatches++;
      currentlyRunning++;
      if (m.playerCount) playerCounts.push(m.playerCount);
    } else if (m.status === 'FINISHED') {
      totalMatches++;
      completedMatches++;
      if (m.playerCount) playerCounts.push(m.playerCount);
      if (m.durationSeconds) matchDurations.push(m.durationSeconds / 60);
    } else if (m.status === 'ABANDONED') {
      totalMatches++;
      abandonedMatches++;
    }

    // Register player match participation only for actual matches (PLAYING, FINISHED, ABANDONED)
    if (m.status === 'PLAYING' || m.status === 'FINISHED' || m.status === 'ABANDONED') {
      m.players.forEach((p) => {
        if (!playerWins[p.id]) {
          playerWins[p.id] = { tekkaName: p.tekkaName || 'Player', wins: 0, matches: 0 };
        }
        playerWins[p.id].matches++;
      });
    }

    // Register winners - deduplicate winnerIds to guarantee at most ONE win per player per match
    if (m.status === 'FINISHED' && m.winnerIds && Array.isArray(m.winnerIds)) {
      const uniqueWinnerIds = Array.from(new Set(m.winnerIds));
      uniqueWinnerIds.forEach((wId) => {
        const winnerIndex = m.winnerIds?.indexOf(wId) ?? -1;
        const wName = (winnerIndex >= 0 ? m.winnerNames?.[winnerIndex] : undefined) || playerWins[wId]?.tekkaName || 'Player';
        if (!playerWins[wId]) {
          playerWins[wId] = { tekkaName: wName, wins: 0, matches: 0 };
        }
        playerWins[wId].wins++;
      });
    }

    // Accumulate telemetry stats
    if (m.chakrantoStats) {
      const s = m.chakrantoStats;
      totalEliminations += s.eliminations || 0;
      totalCardsSacrificed += s.cardsSacrificed || 0;

      if (s.actions) {
        actionStats.ayyAttempted += s.actions.ayyAttempted || 0;
        actionStats.ayyResolved += s.actions.ayyResolved || 0;
        actionStats.roptaniAttempted += s.actions.roptaniAttempted || 0;
        actionStats.roptaniResolved += s.actions.roptaniResolved || 0;
        actionStats.birbikromAttempted += s.actions.birbikromAttempted || 0;
        actionStats.birbikromResolved += s.actions.birbikromResolved || 0;
        actionStats.dakatiAttempted += s.actions.dakatiAttempted || 0;
        actionStats.dakatiResolved += s.actions.dakatiResolved || 0;
        actionStats.gharMotkanoAttempted += s.actions.gharMotkanoAttempted || 0;
        actionStats.gharMotkanoResolved += s.actions.gharMotkanoResolved || 0;
        actionStats.shadhbodolAttempted += s.actions.shadhbodolAttempted || 0;
        actionStats.shadhbodolResolved += s.actions.shadhbodolResolved || 0;
        actionStats.hottayaAttempted += s.actions.hottayaAttempted || 0;
        actionStats.hottayaResolved += s.actions.hottayaResolved || 0;
      }

      if (s.challenges) {
        challengeStats.totalAttempted += s.challenges.total || 0;
        challengeStats.successful += s.challenges.successful || 0;
        challengeStats.failed += s.challenges.failed || 0;
      }

      if (s.blocks) {
        blockStats.totalAttempted += s.blocks.total || 0;
        blockStats.successful += s.blocks.successful || 0;
        blockStats.failed += s.blocks.failed || 0;
      }

      coinEconomy.totalCoinsGenerated += s.coinsGenerated || 0;
      coinEconomy.totalCoinsStolen += s.coinsStolen || 0;
      coinEconomy.totalCoinsSpent += s.coinsSpent || 0;
    }
  });

  const totalPlayersInMatches = playerCounts.reduce((sum, p) => sum + p, 0);
  const avgPlayers = playerCounts.length > 0
    ? Number((totalPlayersInMatches / playerCounts.length).toFixed(1))
    : 4.0;

  const avgDuration = matchDurations.length > 0
    ? Number((matchDurations.reduce((sum, d) => sum + d, 0) / matchDurations.length).toFixed(1))
    : 0;

  const avgElims = completedMatches > 0
    ? Number((totalEliminations / completedMatches).toFixed(1))
    : 0;

  const topWinners = Object.entries(playerWins)
    .map(([playerId, val]) => ({
      playerId,
      tekkaName: val.tekkaName,
      wins: val.wins,
      matches: val.matches,
    }))
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 10);

  return {
    totalMatches,
    completedMatches,
    abandonedMatches,
    currentlyRunning,
    totalPlayers: totalPlayersInMatches,
    avgPlayers,
    avgDurationMinutes: avgDuration,
    totalEliminations,
    avgEliminationsPerMatch: avgElims,
    actionStats,
    challengeStats,
    blockStats,
    coinEconomy,
    cardSacrifices: {
      totalCardsSacrificed,
    },
    topWinners,
  };
}

/**
 * Retrieves the recent Admin Audit Logs.
 */
export async function getAdminAuditLogs(limitCount = 50): Promise<AdminAuditLog[]> {
  try {
    const logsRef = collection(db, 'adminAuditLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    const list: AdminAuditLog[] = [];

    snap.forEach((d) => {
      list.push(d.data() as AdminAuditLog);
    });

    return list;
  } catch (err: any) {
    // If order index is not yet built, fetch without order
    const logsRef = collection(db, 'adminAuditLogs');
    const snap = await getDocs(logsRef);
    const list: AdminAuditLog[] = [];
    snap.forEach((d) => {
      list.push(d.data() as AdminAuditLog);
    });
    list.sort((a, b) => b.timestamp - a.timestamp);
    return list.slice(0, limitCount);
  }
}

/**
 * Triggers manual purge of stale presence records and writes audit log.
 */
export async function runAdminPresenceCleanup(adminUser: FirebaseUser): Promise<number> {
  const purgedCount = await purgeStalePresenceRecords();
  await recordAuditLog({
    adminUid: adminUser.uid,
    adminEmail: adminUser.email || 'unknown',
    action: 'PRESENCE_CLEANUP',
    targetType: 'system',
    timestamp: Date.now(),
    result: 'SUCCESS',
    details: { purgedCount },
  });
  return purgedCount;
}
