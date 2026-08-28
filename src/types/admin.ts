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
  onlineUsers: number;
  currentVisitors: number;
  anonymousVisitors: number;
  authenticatedOnlineUsers: number;
  totalRooms: number;
  activeRooms: number;
  currentlyPlayingGames: number;
  completedGames: number;
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
  averageRoundsCompleted: number;
  averageMatchDurationMinutes: number;
  mostCommonWinner: { tekkaName: string; wins: number } | null;
  playerWinCounts: { playerId: string; tekkaName: string; wins: number; matches: number }[];
  averageScore: number;
  highestScore: { score: number; tekkaName: string; date: string } | null;
  roundDistribution: { rounds: number; count: number }[];
}

export interface RoomInspectionData {
  room: TekkaRoom;
  publicState?: any;
  durationFormatted: string;
  isActive: boolean;
}
