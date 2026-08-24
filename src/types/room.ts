import { RoundOption } from '../games/chorPoliceDakatBabu/types';

export type RoomStatus = 'WAITING' | 'STARTING' | 'PLAYING' | 'FINISHED' | 'ABANDONED';

export interface RoomPlayer {
  id: string; // Firebase Auth UID
  tekkaName: string; // Public unique Tekka name handle
  photoURL?: string;
  avatarUrl?: string;
  isHost: boolean;
  seatIndex: number;
  joinedAt: string;
  isReady?: boolean;
  isOnline?: boolean;
}

export interface TekkaRoom {
  id: string; // Firestore document ID
  roomCode: string; // 6-character unique join code (e.g. CP89X2)
  gameId: string; // e.g. 'chor-police-dakat-babu'
  gameName: string; // e.g. 'Chor Police Dakat Babu'
  engineId: string; // e.g. 'chor-police-dakat-babu'
  hostId: string; // Firebase Auth UID of room host
  players: RoomPlayer[];
  playerCount: number;
  minPlayers: number;
  maxPlayers: number;
  status: RoomStatus;
  totalRounds: RoundOption;
  createdAt: string;
  updatedAt: string;
}
