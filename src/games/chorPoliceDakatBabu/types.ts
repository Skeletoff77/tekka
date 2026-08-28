/**
 * CHOR POLICE DAKAT BABU - Types and State Machine Definitions
 * Authoritative Rule Specification
 */

export type CardRole = 'babu' | 'police' | 'dakat' | 'chor';

export type BabuTargetChoice = 'find-chor' | 'find-dakat';

export type RoundOption = 5 | 10 | 15 | 20;

export type GamePhase =
  | 'GAME_SETTINGS'         // Selecting round count (5, 10, 15, 20) and player setup
  | 'WAITING_FOR_PLAYERS'   // Readying up seats
  | 'DEALING'               // Shuffling and dealing 4 cards
  | 'REVEAL_ROLES'          // Publicly showing Babu and Police; Chor & Dakat hidden
  | 'BABU_TURN'             // Babu player selects FIND CHOR or FIND DAKAT
  | 'POLICE_TURN'           // Police player selects which hidden player is target role
  | 'REVEAL_RESULT'         // Revealing hidden cards & calculating score
  | 'ROUND_COMPLETE'        // Displaying round score delta & advancing
  | 'GAME_OVER';            // All selected rounds finished, show winners

export const ROLE_POINTS: Record<CardRole, number> = {
  babu: 1200,
  police: 900,
  dakat: 600,
  chor: 400,
};

export const VALID_ROUND_COUNTS: readonly RoundOption[] = [5, 10, 15, 20] as const;

export interface PlayerSeat {
  id: string;             // Unique player ID (e.g. Firebase Auth UID or local bot/player ID)
  name: string;           // Display Name or Tekka Handle
  seatIndex: number;      // 0, 1, 2, 3 (Fixed seat around the table)
  avatar?: string;
  isHuman: boolean;       // Local human vs automated seat
  isCurrentUser?: boolean;// True if this seat is the locally authenticated user
}

export interface RoundScoreRecord {
  roundNumber: number;
  babuPlayerId: string;
  policePlayerId: string;
  dakatPlayerId: string;
  chorPlayerId: string;
  babuTarget: BabuTargetChoice;
  policeAccusedPlayerId: string;
  isPoliceCorrect: boolean;
  pointsEarned: Record<string, number>; // playerId -> points earned this round
  cumulativeScores: Record<string, number>; // playerId -> total score after this round
}

export interface RoundResult {
  roundNumber: number;
  targetRole: 'chor' | 'dakat';
  babuChoice: BabuTargetChoice;
  accusedPlayerId: string;
  actualTargetPlayerId: string;
  isCorrect: boolean;
  pointsEarned: Record<string, number>;
}

export interface PlayerFinalStanding {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
  rankLabel: string;
  isWinner: boolean;
  isTie: boolean;
}

export interface ChorPoliceGameState {
  gameId: string;
  engineId: 'chor-police-dakat-babu';
  totalRounds: RoundOption;
  currentRound: number; // 1-indexed
  phase: GamePhase;
  players: PlayerSeat[]; // Exactly 4 players
  
  // Authoritative Round Card Assignments (playerId -> CardRole)
  // Protected on server; sanitized for client visibility
  cardAssignments: Record<string, CardRole>;
  
  // Visible public roles (playerId -> CardRole | 'hidden')
  publicRoles: Record<string, CardRole | 'hidden'>;

  // Active round action states
  babuPlayerId: string | null;
  policePlayerId: string | null;
  babuTarget: BabuTargetChoice | null;
  policeAccusedPlayerId: string | null;
  
  // Round Outcome
  lastRoundResult: {
    isCorrect: boolean;
    pointsEarned: Record<string, number>;
    targetRole: 'chor' | 'dakat';
    actualTargetPlayerId: string;
  } | null;

  // Cumulative score table (playerId -> total accumulated points)
  cumulativeScores: Record<string, number>;
  
  // Round history log
  history: RoundScoreRecord[];

  // Game Winner(s)
  winners: string[]; // Player IDs (multiple in case of tie)
  isTie: boolean;
  finalStandings?: PlayerFinalStanding[] | null;

  // Metadata
  createdAt: number;
  updatedAt: number;
}

export interface PlayerClientGameState extends Omit<ChorPoliceGameState, 'cardAssignments'> {
  // Only the calling player's own private role is present if hidden
  myPrivateRole: CardRole | null;
  mySeatIndex: number;
}
