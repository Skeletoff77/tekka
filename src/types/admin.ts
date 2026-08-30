/**
 * Tekka Admin Portal & Analytics Type Definitions
 */

import { RoomStatus, TekkaRoom } from './room';

export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface AdminUser {
  uid: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  lastLoginAt?: string;
  grantedBy?: string;
}

export type PresenceLocation = 'game-hub' | 'room-lobby' | 'in-game' | 'admin-portal';

export interface LivePresence {
  sessionId: string;
  visitorId?: string; // Stable device visitor ID
  uid?: string;
  tekkaName?: string;
  isAnonymous: boolean;
  location: PresenceLocation;
  roomId?: string;
  gameId?: string;
  lastHeartbeat: number; // epoch ms
  createdAt: string;
}

export interface AdminOverviewStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsers: number;
  suspendedUsers: number;
  onlineSessions: number; // Total active browser tabs/heartbeats
  uniqueOnlineUsers: number; // Unique distinct visitors/users currently online
  currentVisitors: number; // Alias for uniqueOnlineUsers
  anonymousVisitors: number;
  authenticatedOnlineUsers: number;
  uniqueVisitorsToday: number;
  uniqueVisitorsThisWeek: number;
  uniqueVisitorsThisMonth: number;
  totalRooms: number;
  activeRooms: number;
  currentlyPlayingGames: number;
  completedGames: number;
  abandonedGames: number;
  gamesPlayedToday: number;
  gamesPlayedThisWeek: number;
  gamesPlayedThisMonth: number;
  usersInRooms: number;
  usersOnGameHub: number;
  usersInGame: number;
  usersInAdmin: number;
  lastUpdated: number;
}

export interface UserManagementProfile {
  uid: string;
  tekkaName: string;
  tekkaNameNormalized?: string;
  email: string;
  createdAt: string;
  lastActive: string | number;
  isOnline: boolean;
  gamesPlayed: number;
  gamesWon: number;
  totalPoints: number;
  currentRoomId?: string;
  currentRoomCode?: string;
  status: 'active' | 'suspended';
  memberTier: string;
  avatarUrl: string;
  bio?: string;
  country?: string;
}

export type AdminActionType =
  | 'USER_VIEWED'
  | 'USER_SUSPENDED'
  | 'USER_ACTIVATED'
  | 'USER_DELETED'
  | 'ROOM_VIEWED'
  | 'ROOM_TERMINATED'
  | 'ADMIN_LOGIN'
  | 'ADMIN_LOGOUT'
  | 'STATS_VIEWED'
  | 'SETTINGS_CHANGED'
  | 'PRESENCE_CLEANUP';

export interface AdminAuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: AdminActionType;
  targetType: 'user' | 'room' | 'system' | 'auth';
  targetId?: string;
  targetName?: string;
  timestamp: number;
  result: 'SUCCESS' | 'FAILURE';
  details?: Record<string, any>;
}

export interface GameAnalyticsData {
  gameId: string;
  gameName: string;
  totalStarted: number;
  totalCompleted: number;
  currentlyRunning: number;
  abandoned: number;
  completionRate: number; // 0-100 percentage
  avgDurationMinutes: number;
  avgPlayers: number;
  playedToday: number;
  playedThisWeek: number;
  playedThisMonth: number;
}

export interface ChorPoliceAnalyticsData {
  totalMatches: number;
  completedMatches: number;
  abandonedMatches: number;
  currentlyRunning: number;
  averageRoundsCompleted: number;
  averageMatchDurationMinutes: number;
  mostCommonWinner: { tekkaName: string; wins: number } | null;
  playerWinCounts: { playerId: string; tekkaName: string; wins: number; matches: number }[];
  averageScore: number;
  highestScore: { score: number; tekkaName: string; date: string } | null;
  roundDistribution: { rounds: number; count: number }[];
}

export interface ChakrantoAnalyticsData {
  totalMatches: number;
  completedMatches: number;
  abandonedMatches: number;
  currentlyRunning: number;
  totalPlayers: number;
  avgPlayers: number;
  avgDurationMinutes: number;
  totalEliminations: number;
  avgEliminationsPerMatch: number;
  actionStats: {
    roptaniAttempted: number;
    roptaniResolved: number;
    birbikromAttempted: number;
    birbikromResolved: number;
    dakatiAttempted: number;
    dakatiResolved: number;
    gharMotkanoAttempted: number;
    gharMotkanoResolved: number;
    shadhbodolAttempted: number;
    shadhbodolResolved: number;
    hottayaAttempted: number;
    hottayaResolved: number;
  };
  challengeStats: {
    totalAttempted: number;
    successful: number; // Bluff caught (challenger won)
    failed: number; // Truth proven (defender won)
  };
  blockStats: {
    totalAttempted: number;
    successful: number; // Accepted by actor
    failed: number; // Challenged and caught
  };
  coinEconomy: {
    totalCoinsGenerated: number; // +2 Roptani, +3 Birbikrom
    totalCoinsStolen: number; // Dakati
    totalCoinsSpent: number; // -3 Ghar Motkano, -7 Hottaya
  };
  cardSacrifices: {
    totalCardsSacrificed: number;
  };
  topWinners: { playerId: string; tekkaName: string; wins: number; matches: number }[];
}

export interface GameMatchRecord {
  id: string;
  roomId: string;
  roomCode: string;
  gameId: string;
  gameName: string;
  status: 'PLAYING' | 'FINISHED' | 'ABANDONED';
  startedAt: string; // ISO
  completedAt?: string; // ISO
  durationSeconds?: number;
  playerCount: number;
  playerIds: string[];
  playerNames: string[];
  winnerIds?: string[];
  winnerNames?: string[];
  scores?: { playerId: string; tekkaName: string; score: number; rank: number }[];
  roundsPlayed?: number;
  totalRounds?: number;
  // Chakranto specific metrics
  chakrantoStats?: {
    totalTurns: number;
    eliminations: number;
    actions: {
      roptaniAttempted: number;
      roptaniResolved: number;
      birbikromAttempted: number;
      birbikromResolved: number;
      dakatiAttempted: number;
      dakatiResolved: number;
      gharMotkanoAttempted: number;
      gharMotkanoResolved: number;
      shadhbodolAttempted: number;
      shadhbodolResolved: number;
      hottayaAttempted: number;
      hottayaResolved: number;
    };
    challenges: {
      total: number;
      successful: number;
      failed: number;
    };
    blocks: {
      total: number;
      successful: number;
      failed: number;
    };
    coinsGenerated: number;
    coinsStolen: number;
    coinsSpent: number;
    cardsSacrificed: number;
  };
  updatedAt: string;
}

export interface RoomInspectionData {
  room: TekkaRoom;
  publicState?: any;
  durationFormatted: string;
  isActive: boolean;
}
