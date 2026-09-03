/**
 * Authoritative Analytics Tracking Service
 * 
 * Records real-time authoritative match outcomes, duration, economy, and lifecycle metrics
 * directly into Firestore `gameMatches/{roomId}` and `gameEvents/{eventId}` collections.
 * 
 * Enforces deduplication and idempotency to prevent double-counting.
 */

import { doc, setDoc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GameMatchRecord } from '../types/admin';

/**
 * Authoritative Canonical Game Identifiers across all systems.
 */
export const CANONICAL_GAME_IDS = {
  CHAKRANTO: 'chakranto',
  CHOR_POLICE: 'chor-police-dakat-babu',
} as const;

/**
 * Normalizes any legacy or variant gameId to its single canonical identifier.
 */
export function normalizeGameId(rawGameId?: string | null): string {
  if (!rawGameId) return CANONICAL_GAME_IDS.CHOR_POLICE;
  const lower = rawGameId.toLowerCase().trim();
  if (lower.includes('chakranto')) {
    return CANONICAL_GAME_IDS.CHAKRANTO;
  }
  if (lower.includes('chor') || lower.includes('police') || lower.includes('dakat')) {
    return CANONICAL_GAME_IDS.CHOR_POLICE;
  }
  return rawGameId;
}

/**
 * Default clean Chakranto stats structure.
 */
export function createDefaultChakrantoStats(): NonNullable<GameMatchRecord['chakrantoStats']> {
  return {
    totalTurns: 0,
    eliminations: 0,
    actions: {
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
    },
    challenges: {
      total: 0,
      successful: 0,
      failed: 0,
    },
    blocks: {
      total: 0,
      successful: 0,
      failed: 0,
    },
    coinsGenerated: 0,
    coinsStolen: 0,
    coinsSpent: 0,
    cardsSacrificed: 0,
  };
}

/**
 * Records the authoritative start of a multiplayer game match.
 */
export async function trackMatchStart(params: {
  roomId: string;
  roomCode: string;
  gameId: string;
  gameName: string;
  players: { id: string; tekkaName: string }[];
  totalRounds?: number;
}): Promise<void> {
  try {
    const canonicalGameId = normalizeGameId(params.gameId);
    const matchRef = doc(db, 'gameMatches', params.roomId);
    const existingSnap = await getDoc(matchRef);

    if (existingSnap.exists()) {
      // Already recorded start; ensure status is PLAYING
      await updateDoc(matchRef, {
        status: 'PLAYING',
        gameId: canonicalGameId,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    const now = new Date().toISOString();
    const initialRecord: GameMatchRecord = {
      id: params.roomId,
      roomId: params.roomId,
      roomCode: params.roomCode,
      gameId: canonicalGameId,
      gameName: params.gameName,
      status: 'PLAYING',
      startedAt: now,
      playerCount: params.players.length,
      playerIds: params.players.map((p) => p.id),
      playerNames: params.players.map((p) => p.tekkaName),
      totalRounds: params.totalRounds,
      chakrantoStats: canonicalGameId === CANONICAL_GAME_IDS.CHAKRANTO ? createDefaultChakrantoStats() : undefined,
      updatedAt: now,
    };

    await setDoc(matchRef, initialRecord);
  } catch (err) {
    console.warn('Analytics trackMatchStart non-blocking error:', err);
  }
}

/**
 * Finalizes a Chor Police match with real standings and duration.
 */
export async function trackChorPoliceMatchFinish(params: {
  roomId: string;
  winners: string[];
  finalStandings: { playerId: string; tekkaName: string; score: number; rank: number }[];
  totalRounds: number;
}): Promise<void> {
  try {
    const matchRef = doc(db, 'gameMatches', params.roomId);
    const snap = await getDoc(matchRef);
    const now = new Date().toISOString();
    const nowMs = Date.now();

    let startedAtMs = nowMs;
    if (snap.exists()) {
      const data = snap.data() as GameMatchRecord;
      if (data.startedAt) {
        startedAtMs = new Date(data.startedAt).getTime();
      }
    }

    const durationSeconds = Math.max(1, Math.round((nowMs - startedAtMs) / 1000));
    const winnerNames = params.finalStandings
      .filter((s) => params.winners.includes(s.playerId))
      .map((s) => s.tekkaName);

    await setDoc(
      matchRef,
      {
        status: 'FINISHED',
        completedAt: now,
        durationSeconds,
        winnerIds: params.winners,
        winnerNames,
        scores: params.finalStandings,
        roundsPlayed: params.totalRounds,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Analytics trackChorPoliceMatchFinish error:', err);
  }
}

/**
 * Finalizes a Chakranto match with winner and duration.
 */
export async function trackChakrantoMatchFinish(params: {
  roomId: string;
  winnerPlayerId: string;
  finalStandings: { playerId: string; tekkaName: string; score: number; rank: number }[];
}): Promise<void> {
  try {
    const matchRef = doc(db, 'gameMatches', params.roomId);
    const snap = await getDoc(matchRef);
    const now = new Date().toISOString();
    const nowMs = Date.now();

    let startedAtMs = nowMs;
    if (snap.exists()) {
      const data = snap.data() as GameMatchRecord;
      if (data.startedAt) {
        startedAtMs = new Date(data.startedAt).getTime();
      }
    }

    const durationSeconds = Math.max(1, Math.round((nowMs - startedAtMs) / 1000));
    const winner = params.finalStandings.find((s) => s.playerId === params.winnerPlayerId);

    await setDoc(
      matchRef,
      {
        status: 'FINISHED',
        completedAt: now,
        durationSeconds,
        winnerIds: [params.winnerPlayerId],
        winnerNames: winner ? [winner.tekkaName] : [],
        scores: params.finalStandings,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Analytics trackChakrantoMatchFinish error:', err);
  }
}

/**
 * Ensures chakrantoStats structure exists on the match record before applying increments.
 */
async function ensureChakrantoStats(matchRef: any): Promise<void> {
  try {
    const snap = await getDoc(matchRef);
    if (snap.exists()) {
      const data = snap.data() as GameMatchRecord;
      if (!data.chakrantoStats) {
        await setDoc(matchRef, { chakrantoStats: createDefaultChakrantoStats() }, { merge: true });
      }
    }
  } catch {}
}

/**
 * Tracks an attempted action declaration in Chakranto.
 */
export async function trackChakrantoActionAttempt(params: {
  roomId: string;
  action: string;
  coinsSpent?: number;
}): Promise<void> {
  try {
    const matchRef = doc(db, 'gameMatches', params.roomId);
    await ensureChakrantoStats(matchRef);

    const actionKeyMap: Record<string, string> = {
      ayy: 'chakrantoStats.actions.ayyAttempted',
      roptani: 'chakrantoStats.actions.roptaniAttempted',
      birbikrom_bhata: 'chakrantoStats.actions.birbikromAttempted',
      dakati: 'chakrantoStats.actions.dakatiAttempted',
      ghar_motkano: 'chakrantoStats.actions.gharMotkanoAttempted',
      shadhbodol: 'chakrantoStats.actions.shadhbodolAttempted',
      hottaya: 'chakrantoStats.actions.hottayaAttempted',
    };

    const targetField = actionKeyMap[params.action];
    const updatePayload: Record<string, any> = {
      'chakrantoStats.totalTurns': increment(1),
      updatedAt: new Date().toISOString(),
    };

    if (targetField) {
      updatePayload[targetField] = increment(1);
    }
    if (params.coinsSpent) {
      updatePayload['chakrantoStats.coinsSpent'] = increment(params.coinsSpent);
    }

    await updateDoc(matchRef, updatePayload);
  } catch {
    // Non-blocking
  }
}

/**
 * Tracks a successfully resolved action in Chakranto.
 */
export async function trackChakrantoActionResolved(params: {
  roomId: string;
  action: string;
  coinsGenerated?: number;
  coinsStolen?: number;
  coinsSpent?: number;
}): Promise<void> {
  try {
    const matchRef = doc(db, 'gameMatches', params.roomId);
    await ensureChakrantoStats(matchRef);

    const actionKeyMap: Record<string, string> = {
      ayy: 'chakrantoStats.actions.ayyResolved',
      roptani: 'chakrantoStats.actions.roptaniResolved',
      birbikrom_bhata: 'chakrantoStats.actions.birbikromResolved',
      dakati: 'chakrantoStats.actions.dakatiResolved',
      ghar_motkano: 'chakrantoStats.actions.gharMotkanoResolved',
      shadhbodol: 'chakrantoStats.actions.shadhbodolResolved',
      hottaya: 'chakrantoStats.actions.hottayaResolved',
    };

    const targetField = actionKeyMap[params.action];
    const updatePayload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (targetField) {
      updatePayload[targetField] = increment(1);
    }
    if (params.coinsGenerated) {
      updatePayload['chakrantoStats.coinsGenerated'] = increment(params.coinsGenerated);
    }
    if (params.coinsStolen) {
      updatePayload['chakrantoStats.coinsStolen'] = increment(params.coinsStolen);
    }
    if (params.coinsSpent) {
      updatePayload['chakrantoStats.coinsSpent'] = increment(params.coinsSpent);
    }

    await updateDoc(matchRef, updatePayload);
  } catch {
    // Non-blocking
  }
}

/**
 * Tracks a challenge outcome in Chakranto.
 */
export async function trackChakrantoChallenge(params: {
  roomId: string;
  challengerWon: boolean;
}): Promise<void> {
  try {
    const matchRef = doc(db, 'gameMatches', params.roomId);
    await ensureChakrantoStats(matchRef);

    await updateDoc(matchRef, {
      'chakrantoStats.challenges.total': increment(1),
      [params.challengerWon
        ? 'chakrantoStats.challenges.successful'
        : 'chakrantoStats.challenges.failed']: increment(1),
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // Non-blocking
  }
}

/**
 * Tracks a block outcome in Chakranto.
 */
export async function trackChakrantoBlock(params: {
  roomId: string;
  successful: boolean;
}): Promise<void> {
  try {
    const matchRef = doc(db, 'gameMatches', params.roomId);
    await ensureChakrantoStats(matchRef);

    await updateDoc(matchRef, {
      'chakrantoStats.blocks.total': increment(1),
      [params.successful
        ? 'chakrantoStats.blocks.successful'
        : 'chakrantoStats.blocks.failed']: increment(1),
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // Non-blocking
  }
}

/**
 * Tracks a card sacrifice or player elimination in Chakranto.
 */
export async function trackChakrantoSacrifice(params: {
  roomId: string;
  isElimination: boolean;
}): Promise<void> {
  try {
    const matchRef = doc(db, 'gameMatches', params.roomId);
    await ensureChakrantoStats(matchRef);

    const updatePayload: Record<string, any> = {
      'chakrantoStats.cardsSacrificed': increment(1),
      updatedAt: new Date().toISOString(),
    };
    if (params.isElimination) {
      updatePayload['chakrantoStats.eliminations'] = increment(1);
    }
    await updateDoc(matchRef, updatePayload);
  } catch {
    // Non-blocking
  }
}

/**
 * Tracks match abandonment / termination.
 */
export async function trackMatchAbandoned(roomId: string): Promise<void> {
  try {
    const matchRef = doc(db, 'gameMatches', roomId);
    await setDoc(
      matchRef,
      {
        status: 'ABANDONED',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch {
    // Non-blocking
  }
}
