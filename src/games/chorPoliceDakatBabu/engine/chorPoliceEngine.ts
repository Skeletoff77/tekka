/**
 * CHOR POLICE DAKAT BABU - Authoritative Game Engine Core
 * Implements pure state machine transitions, strict validation, privacy sanitization, and scoring.
 */

import {
  CardRole,
  BabuTargetChoice,
  ChorPoliceGameState,
  GamePhase,
  PlayerClientGameState,
  PlayerSeat,
  ROLE_POINTS,
  RoundOption,
  RoundScoreRecord,
  VALID_ROUND_COUNTS,
} from '../types';

export class GameEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameEngineError';
  }
}

/**
 * Fisher-Yates array shuffle
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Creates initial game state with configured players and round count.
 */
export function createInitialGameState(
  gameId: string,
  players: PlayerSeat[],
  totalRounds: RoundOption = 5
): ChorPoliceGameState {
  if (players.length !== 4) {
    throw new GameEngineError(`Chor Police Dakat Babu requires exactly 4 players. Provided: ${players.length}`);
  }

  if (!VALID_ROUND_COUNTS.includes(totalRounds)) {
    throw new GameEngineError(`Invalid round count: ${totalRounds}. Must be 5, 10, 15, or 20.`);
  }

  const cumulativeScores: Record<string, number> = {};
  players.forEach((p) => {
    cumulativeScores[p.id] = 0;
  });

  return {
    gameId,
    engineId: 'chor-police-dakat-babu',
    totalRounds,
    currentRound: 1,
    phase: 'GAME_SETTINGS',
    players,
    cardAssignments: {},
    publicRoles: {},
    babuPlayerId: null,
    policePlayerId: null,
    babuTarget: null,
    policeAccusedPlayerId: null,
    lastRoundResult: null,
    cumulativeScores,
    history: [],
    winners: [],
    isTie: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Shuffles all 4 cards and deals 1 to each of the 4 players.
 * Reveals Babu and Police publicly; Chor and Dakat remain hidden.
 */
export function startRoundDealing(state: ChorPoliceGameState): ChorPoliceGameState {
  if (state.players.length !== 4) {
    throw new GameEngineError('Cannot deal without exactly 4 players.');
  }

  const deck: CardRole[] = shuffleArray(['babu', 'police', 'dakat', 'chor'] as const);
  const cardAssignments: Record<string, CardRole> = {};
  const publicRoles: Record<string, CardRole | 'hidden'> = {};

  let babuPlayerId: string | null = null;
  let policePlayerId: string | null = null;

  state.players.forEach((player, index) => {
    const role = deck[index];
    cardAssignments[player.id] = role;

    if (role === 'babu') {
      babuPlayerId = player.id;
      publicRoles[player.id] = 'babu';
    } else if (role === 'police') {
      policePlayerId = player.id;
      publicRoles[player.id] = 'police';
    } else {
      // Hidden roles for Chor & Dakat
      publicRoles[player.id] = 'hidden';
    }
  });

  return {
    ...state,
    phase: 'BABU_TURN',
    cardAssignments,
    publicRoles,
    babuPlayerId,
    policePlayerId,
    babuTarget: null,
    policeAccusedPlayerId: null,
    lastRoundResult: null,
    updatedAt: Date.now(),
  };
}

/**
 * Babu player selects target role investigation (FIND CHOR or FIND DAKAT)
 */
export function submitBabuAction(
  state: ChorPoliceGameState,
  actingPlayerId: string,
  target: BabuTargetChoice
): ChorPoliceGameState {
  if (state.phase !== 'BABU_TURN') {
    throw new GameEngineError(`Cannot submit Babu action in phase: ${state.phase}`);
  }

  if (state.babuPlayerId !== actingPlayerId) {
    throw new GameEngineError(`Player ${actingPlayerId} is not assigned Babu role.`);
  }

  if (target !== 'find-chor' && target !== 'find-dakat') {
    throw new GameEngineError(`Invalid Babu choice: ${target}. Must be 'find-chor' or 'find-dakat'.`);
  }

  return {
    ...state,
    phase: 'POLICE_TURN',
    babuTarget: target,
    updatedAt: Date.now(),
  };
}

/**
 * Police player identifies suspect among the two hidden players
 */
export function submitPoliceAction(
  state: ChorPoliceGameState,
  actingPlayerId: string,
  accusedPlayerId: string
): ChorPoliceGameState {
  if (state.phase !== 'POLICE_TURN') {
    throw new GameEngineError(`Cannot submit Police guess in phase: ${state.phase}`);
  }

  if (state.policePlayerId !== actingPlayerId) {
    throw new GameEngineError(`Player ${actingPlayerId} is not assigned Police role.`);
  }

  if (!state.babuTarget) {
    throw new GameEngineError('Babu target has not been selected yet.');
  }

  // Verify accused player is one of the two hidden players (cannot be Babu or Police)
  if (accusedPlayerId === state.babuPlayerId || accusedPlayerId === state.policePlayerId) {
    throw new GameEngineError('Police cannot accuse Babu or Police.');
  }

  const isPlayerInGame = state.players.some((p) => p.id === accusedPlayerId);
  if (!isPlayerInGame) {
    throw new GameEngineError(`Accused player ${accusedPlayerId} is not in the game.`);
  }

  // Calculate Outcome and Point Allocations
  const targetRole: 'chor' | 'dakat' = state.babuTarget === 'find-chor' ? 'chor' : 'dakat';
  
  // Find actual player holding the target role
  let actualTargetPlayerId = '';
  let chorPlayerId = '';
  let dakatPlayerId = '';
  let babuPlayerId = state.babuPlayerId!;
  let policePlayerId = state.policePlayerId!;

  for (const [pId, role] of Object.entries(state.cardAssignments)) {
    if (role === targetRole) {
      actualTargetPlayerId = pId;
    }
    if (role === 'chor') chorPlayerId = pId;
    if (role === 'dakat') dakatPlayerId = pId;
  }

  const isPoliceCorrect = accusedPlayerId === actualTargetPlayerId;

  // Calculate points according to authoritative rule set:
  // Correct Guess: Babu +1200, Police +900, Dakat +600, Chor +0
  // Wrong Guess:   Babu +1200, Police +0,   Dakat +600, Chor +400
  const pointsEarned: Record<string, number> = {
    [babuPlayerId]: ROLE_POINTS.babu, // 1200
    [policePlayerId]: isPoliceCorrect ? ROLE_POINTS.police : 0, // 900 or 0
    [dakatPlayerId]: ROLE_POINTS.dakat, // 600
    [chorPlayerId]: isPoliceCorrect ? 0 : ROLE_POINTS.chor, // 0 or 400
  };

  // Update cumulative scores
  const newCumulativeScores: Record<string, number> = { ...state.cumulativeScores };
  for (const [pId, pts] of Object.entries(pointsEarned)) {
    newCumulativeScores[pId] = (newCumulativeScores[pId] || 0) + pts;
  }

  // Fully reveal all cards for the reveal phase
  const revealedPublicRoles: Record<string, CardRole> = { ...state.cardAssignments };

  // Create round history record
  const roundRecord: RoundScoreRecord = {
    roundNumber: state.currentRound,
    babuPlayerId,
    policePlayerId,
    dakatPlayerId,
    chorPlayerId,
    babuTarget: state.babuTarget,
    policeAccusedPlayerId: accusedPlayerId,
    isPoliceCorrect,
    pointsEarned,
    cumulativeScores: { ...newCumulativeScores },
  };

  return {
    ...state,
    phase: 'REVEAL_RESULT',
    policeAccusedPlayerId: accusedPlayerId,
    publicRoles: revealedPublicRoles,
    lastRoundResult: {
      isCorrect: isPoliceCorrect,
      pointsEarned,
      targetRole,
      actualTargetPlayerId,
    },
    cumulativeScores: newCumulativeScores,
    history: [...state.history, roundRecord],
    updatedAt: Date.now(),
  };
}

/**
 * Transitions from REVEAL_RESULT to next round or GAME_OVER
 */
export function advanceToNextRound(state: ChorPoliceGameState): ChorPoliceGameState {
  if (state.phase !== 'REVEAL_RESULT' && state.phase !== 'ROUND_COMPLETE') {
    throw new GameEngineError(`Cannot advance round in phase: ${state.phase}`);
  }

  // Check if final round reached
  if (state.currentRound >= state.totalRounds) {
    // Determine winner(s)
    let maxScore = -1;
    for (const score of Object.values(state.cumulativeScores)) {
      if (score > maxScore) {
        maxScore = score;
      }
    }

    const winners = Object.entries(state.cumulativeScores)
      .filter(([_, score]) => score === maxScore)
      .map(([pId]) => pId);

    const isTie = winners.length > 1;

    return {
      ...state,
      phase: 'GAME_OVER',
      winners,
      isTie,
      updatedAt: Date.now(),
    };
  }

  // Advance to next round: increment round, deal fresh cards
  const nextRoundState: ChorPoliceGameState = {
    ...state,
    currentRound: state.currentRound + 1,
    phase: 'DEALING',
    updatedAt: Date.now(),
  };

  return startRoundDealing(nextRoundState);
}

/**
 * Privacy Sanitizer: Enforces card hidden-information boundary on client
 */
export function sanitizeStateForPlayer(
  state: ChorPoliceGameState,
  viewingPlayerId: string
): PlayerClientGameState {
  const isRevealPhase = state.phase === 'REVEAL_RESULT' || state.phase === 'ROUND_COMPLETE' || state.phase === 'GAME_OVER';

  const myPrivateRole = state.cardAssignments[viewingPlayerId] || null;
  const viewingPlayerIndex = state.players.findIndex((p) => p.id === viewingPlayerId);

  const clientPublicRoles: Record<string, CardRole | 'hidden'> = {};

  state.players.forEach((p) => {
    if (isRevealPhase) {
      // All cards revealed
      clientPublicRoles[p.id] = state.cardAssignments[p.id] || 'hidden';
    } else {
      // During active round
      if (p.id === viewingPlayerId) {
        // Player can always see their own card
        clientPublicRoles[p.id] = myPrivateRole || 'hidden';
      } else {
        const trueRole = state.cardAssignments[p.id];
        if (trueRole === 'babu' || trueRole === 'police') {
          // Babu and Police are revealed publicly
          clientPublicRoles[p.id] = trueRole;
        } else {
          // Chor and Dakat are strictly hidden for opponents
          clientPublicRoles[p.id] = 'hidden';
        }
      }
    }
  });

  const { cardAssignments, ...sanitized } = state;

  return {
    ...sanitized,
    publicRoles: clientPublicRoles,
    myPrivateRole,
    mySeatIndex: viewingPlayerIndex >= 0 ? viewingPlayerIndex : 0,
  };
}
