/**
 * CHAKRANTO - Types and State Machine Definitions
 * Based on the Bengali Strategy and Bluffing Game "Sorojontro"
 */

export type ChakrantoCharacter =
  | 'brahmodoetto'    // Brahmodoetto (ব্রহ্মদৈত্য) - Pay 3 coins, kill 1 card
  | 'kalu_dakat'      // Kalu Dakat (কালু ডাকাত) - Steal 2 coins
  | 'petukchondro'    // Petukchondro (পেটুকচন্দ্র) - Draw 2, keep same count, return rest
  | 'bir_bikrom'      // Bir Bikrom (বীর বিক্রম) - Collect 3 coins, block Roptani
  | 'ginner_badsha';  // Ginner Badsha (জিনের বাদশা) - Block Ghar Motkano

export type ChakrantoActionType =
  | 'ayy'              // Ayy action (+1 coin). Unchallengeable, Unblockable
  | 'roptani'          // Normal action (+2 coins). Blockable by Bir Bikrom
  | 'dakati'           // Kalu Dakat action (+2 coins stolen). Challengeable, Blockable by Kalu Dakat or Petukchondro
  | 'shadhbodol'       // Petukchondro action (swap cards). Challengeable, Not blockable
  | 'birbikrom_bhata'  // Bir Bikrom action (+3 coins). Challengeable, Not blockable
  | 'ghar_motkano'     // Brahmodoetto action (-3 coins, kill card). Challengeable, Blockable by Ginner Badsha
  | 'hottaya';         // Normal kill (-7 coins, kill card). Unblockable, Unchallengeable

export type ChakrantoPosition = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export const CHAKRANTO_POSITIONS: readonly ChakrantoPosition[] = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export type ChakrantoPhase =
  | 'WAITING_FOR_PLAYERS'
  | 'TURN_ACTIVE'             // Current player is choosing an action
  | 'ACTION_PENDING_RESPONSE' // Action announced, waiting for challenge, block, or pass from table
  | 'BLOCK_PENDING_RESPONSE'  // Block announced, waiting for active claimant to challenge or pass
  | 'RESOLVING_CHALLENGE'     // Challenge being calculated & revealed
  | 'SACRIFICE_SELECTION'     // A specific player must choose 1 of their cards to sacrifice
  | 'SHADHBODOL_SELECTION'    // Active player is choosing cards to keep during Shadhbodol
  | 'ACTION_COMPLETED'        // Action finished, auto-advancing turn
  | 'GAME_OVER';              // Only 1 survivor remains

export interface ChakrantoCardItem {
  id: string; // Unique card instance ID e.g. "brahmodoetto_1", "kalu_dakat_3"
  character: ChakrantoCharacter;
  drawnAtTurn?: number; // Turn number when drawn (to enforce unusable on same turn if replacement)
}

export interface ChakrantoPlayerPublic {
  id: string; // Firebase Auth UID
  name: string; // Tekka Name
  position: ChakrantoPosition; // A, B, C, D, E, F
  seatIndex: number;
  avatarUrl?: string;
  coins: number;
  activeCardCount: number; // 2, 1, or 0
  sacrificedCards: ChakrantoCharacter[]; // Revealed cards that this player has lost
  isEliminated: boolean;
  eliminatedAtOrder?: number; // 1 = first eliminated, 2 = second, etc.
  isOnline?: boolean;
}

export interface ChakrantoActionDeclaration {
  action: ChakrantoActionType;
  actorPlayerId: string;
  claimedCharacter?: ChakrantoCharacter;
  targetPlayerId?: string;
  declaredAt: string;
  isClaimVerified?: boolean;
  characterConsumedAtDeclaration?: boolean;
}

export interface ChakrantoBlockDeclaration {
  blockerPlayerId: string;
  claimedCharacter: ChakrantoCharacter;
  targetAction: ChakrantoActionType;
  declaredAt: string;
}

export interface ChakrantoChallengeDeclaration {
  challengerPlayerId: string;
  challengedPlayerId: string;
  claimedCharacter: ChakrantoCharacter;
  context: 'ACTION' | 'BLOCK';
  declaredAt: string;
}

export interface ChakrantoPendingSacrifice {
  targetPlayerId: string;
  reason: 'HOTTAYA' | 'GHAR_MOTKANO' | 'FAILED_CHALLENGE' | 'BLUFF_CAUGHT';
  requiredCount: number;
  challengeContext?: 'ACTION' | 'BLOCK';
}

export interface ChakrantoEventLog {
  id: string;
  turnNumber: number;
  timestamp: string;
  type: 'ACTION' | 'BLOCK' | 'CHALLENGE' | 'SACRIFICE' | 'ELIMINATION' | 'SYSTEM' | 'COIN_CHANGE';
  message: string;
  actorName?: string;
  targetName?: string;
  character?: ChakrantoCharacter;
}

export interface ChakrantoStanding {
  playerId: string;
  playerName: string;
  position: ChakrantoPosition;
  rank: number; // 1 = Winner, 2 = Runner up, etc.
  rankLabel: string;
  isWinner: boolean;
  sacrificedCount: number;
  finalCoins: number;
}

/**
 * Public State synchronized to all clients.
 * NO SECRET OPPONENT CARDS OR DRAW DECK ARE EXPOSED.
 */
export interface ChakrantoPublicState {
  roomId: string;
  gameId: 'chakranto';
  turnNumber: number;
  currentTurnPlayerId: string;
  currentPosition: ChakrantoPosition;
  phase: ChakrantoPhase;
  players: ChakrantoPlayerPublic[];
  
  // Current active interaction
  currentAction: ChakrantoActionDeclaration | null;
  currentBlock: ChakrantoBlockDeclaration | null;
  currentChallenge: ChakrantoChallengeDeclaration | null;
  pendingSacrifice: ChakrantoPendingSacrifice | null;
  
  // Table responses received for current action/block
  passedPlayerIds: string[]; // List of players who clicked "Pass"
  
  // Recent resolution display
  lastResolution: {
    message: string;
    revealedCard?: ChakrantoCharacter;
    challengerWon?: boolean;
  } | null;

  // Final Results
  winnerPlayerId: string | null;
  finalStandings: ChakrantoStanding[] | null;
  
  // Activity Log
  logs: ChakrantoEventLog[];
  updatedAt: string;
}

/**
 * Private Player View document located at:
 * `rooms/{roomId}/chakrantoViews/{userId}`
 * Read restricted to `request.auth.uid == userId`.
 */
export interface ChakrantoPrivateView {
  userId: string;
  roomId: string;
  activeCards: ChakrantoCardItem[]; // The player's own active secret cards
  shadhbodolOptions?: ChakrantoCardItem[]; // Temporarily drawn cards for Shadhbodol
  pendingReplacementCount?: number;
  updatedAt: string;
}

/**
 * Authoritative Backend State located at:
 * `rooms/{roomId}/chakrantoAuthoritative/state`
 * Sealed backend state containing all secret cards and the draw deck.
 */
export interface ChakrantoAuthoritativeState {
  roomId: string;
  drawDeck: ChakrantoCardItem[]; // Remaining draw deck
  discardPile: ChakrantoCardItem[]; // Spent cards
  playerHands: Record<string, ChakrantoCardItem[]>; // uid -> secret active cards
  shadhbodolActiveHand?: {
    userId: string;
    originalCards: ChakrantoCardItem[];
    drawnCards: ChakrantoCardItem[];
  } | null;
  turnNumber: number;
  updatedAt: string;
}
