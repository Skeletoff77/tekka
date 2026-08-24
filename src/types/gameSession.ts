import {
  BabuTargetChoice,
  CardRole,
  GamePhase,
  RoundOption,
  RoundResult,
} from '../games/chorPoliceDakatBabu/types';

/**
 * Publicly broadcast game state.
 * Contains phase, round info, public Babu/Police roles, scores, and revealed results.
 * DOES NOT expose unrevealed secret chits (Chor / Dakat) to clients during action phases.
 */
export interface PublicGameSessionState {
  roomId: string;
  gameId: string;
  phase: GamePhase;
  currentRound: number;
  totalRounds: RoundOption;
  babuPlayerId: string | null;
  policePlayerId: string | null;
  babuTarget: BabuTargetChoice | null;
  policeAccusedPlayerId: string | null;
  cumulativeScores: Record<string, number>;
  revealedAssignments: Record<string, CardRole> | null; // Only present in REVEAL_RESULT or GAME_OVER
  lastRoundResult: RoundResult | null;
  winners: string[] | null;
  isTie: boolean;
  updatedAt: string;
}

/**
 * Private Player View document located at:
 * `rooms/{roomId}/playerViews/{userId}`
 * Read restricted to `request.auth.uid == userId`.
 */
export interface PrivatePlayerView {
  userId: string;
  roomId: string;
  round: number;
  assignedRole: CardRole; // The viewing player's OWN secret role
  publicRoles: Record<string, CardRole | 'hidden'>; // Other secret roles masked as 'hidden'
  updatedAt: string;
}

/**
 * Authoritative Secret Game State document located at:
 * `rooms/{roomId}/authoritative/state`
 * Sealed backend state containing raw card assignments and verification tokens.
 */
export interface AuthoritativeSecretState {
  roomId: string;
  round: number;
  cardAssignments: Record<string, CardRole>;
  babuPlayerId: string;
  policePlayerId: string;
  dakatPlayerId: string;
  chorPlayerId: string;
  updatedAt: string;
}
