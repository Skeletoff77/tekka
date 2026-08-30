import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BabuTargetChoice, CardRole, RoundOption } from '../games/chorPoliceDakatBabu/types';
import {
  dealAuthoritativeRoles,
  calculateFinalStandings,
} from '../games/chorPoliceDakatBabu/engine/chorPoliceEngine';
import {
  AuthoritativeSecretState,
  PrivatePlayerView,
  PublicGameSessionState,
} from '../types/gameSession';
import { TekkaRoom } from '../types/room';
import { trackMatchStart, trackChorPoliceMatchFinish } from './analyticsTrackingService';

/**
 * Starts a new authoritative game session for a 4-player room.
 */
export async function startGameSession(roomId: string, hostUid: string): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('Room does not exist.');
  }

  const room = roomSnap.data() as TekkaRoom;

  if (room.hostId !== hostUid) {
    throw new Error('Only the room host can start the match.');
  }

  if (room.players.length !== 4 || room.playerCount !== 4) {
    throw new Error('Chor Police Dakat Babu requires exactly 4 authenticated players.');
  }

  if (room.status === 'PLAYING') {
    return; // Already started
  }

  const playerIds = room.players.map((p) => p.id);
  const cardAssignments = dealAuthoritativeRoles(playerIds, null);

  let babuPlayerId = '';
  let policePlayerId = '';
  let dakatPlayerId = '';
  let chorPlayerId = '';

  room.players.forEach((player) => {
    const role = cardAssignments[player.id];
    if (role === 'babu') babuPlayerId = player.id;
    if (role === 'police') policePlayerId = player.id;
    if (role === 'dakat') dakatPlayerId = player.id;
    if (role === 'chor') chorPlayerId = player.id;
  });

  const now = new Date().toISOString();

  // 1. Write Private Player Views (Strip secret opponent chits)
  for (const player of room.players) {
    const playerViewRef = doc(db, 'rooms', roomId, 'playerViews', player.id);
    const assignedRole = cardAssignments[player.id];

    // Build player's authorized view of roles
    const publicRoles: Record<string, CardRole | 'hidden'> = {};
    for (const p of room.players) {
      if (p.id === player.id) {
        publicRoles[p.id] = assignedRole; // Player sees own role
      } else if (p.id === babuPlayerId) {
        publicRoles[p.id] = 'babu'; // Babu is public
      } else if (p.id === policePlayerId) {
        publicRoles[p.id] = 'police'; // Police is public
      } else {
        publicRoles[p.id] = 'hidden'; // Chor & Dakat remain secret
      }
    }

    const privateView: PrivatePlayerView = {
      userId: player.id,
      roomId,
      round: 1,
      assignedRole,
      publicRoles,
      updatedAt: now,
    };

    await setDoc(playerViewRef, privateView);
  }

  // 2. Write Authoritative Secret State
  const authStateRef = doc(db, 'rooms', roomId, 'authoritative', 'state');
  const authState: AuthoritativeSecretState = {
    roomId,
    round: 1,
    cardAssignments,
    babuPlayerId,
    policePlayerId,
    dakatPlayerId,
    chorPlayerId,
    updatedAt: now,
  };
  await setDoc(authStateRef, authState);

  // 3. Write Initial Cumulative Scores
  const cumulativeScores: Record<string, number> = {};
  room.players.forEach((p) => {
    cumulativeScores[p.id] = 0;
  });

  // 4. Write Public Session State
  const publicStateRef = doc(db, 'rooms', roomId, 'publicSession', 'state');
  const publicState: PublicGameSessionState = {
    roomId,
    gameId: room.gameId,
    phase: 'BABU_TURN',
    currentRound: 1,
    totalRounds: room.totalRounds || 5,
    babuPlayerId,
    policePlayerId,
    babuTarget: null,
    policeAccusedPlayerId: null,
    cumulativeScores,
    revealedAssignments: null,
    lastRoundResult: null,
    winners: null,
    isTie: false,
    finalStandings: null,
    updatedAt: now,
  };
  await setDoc(publicStateRef, publicState);

  // 5. Update Room Status to PLAYING
  await updateDoc(roomRef, {
    status: 'PLAYING',
    updatedAt: now,
  });

  // 6. Authoritative Analytics Tracking
  trackMatchStart({
    roomId,
    roomCode: room.roomCode,
    gameId: room.gameId,
    gameName: room.gameName || 'Chor Police Dakat Babu',
    players: room.players.map((p) => ({ id: p.id, tekkaName: p.tekkaName })),
    totalRounds: room.totalRounds || 5,
  });
}

/**
 * Submits the Babu player's target choice ('find-chor' | 'find-dakat').
 */
export async function submitBabuTargetAction(
  roomId: string,
  actingUid: string,
  target: BabuTargetChoice
): Promise<void> {
  const publicRef = doc(db, 'rooms', roomId, 'publicSession', 'state');

  await runTransaction(db, async (transaction) => {
    const publicSnap = await transaction.get(publicRef);
    if (!publicSnap.exists()) throw new Error('Game session not found.');

    const publicState = publicSnap.data() as PublicGameSessionState;

    if (publicState.phase !== 'BABU_TURN') {
      throw new Error(`Cannot submit Babu action in phase ${publicState.phase}`);
    }

    if (publicState.babuPlayerId !== actingUid) {
      throw new Error('Only the authoritative Babu player can submit this decree.');
    }

    if (target !== 'find-chor' && target !== 'find-dakat') {
      throw new Error('Invalid Babu target choice.');
    }

    transaction.update(publicRef, {
      babuTarget: target,
      phase: 'POLICE_TURN',
      updatedAt: new Date().toISOString(),
    });
  });
}

/**
 * Submits the Police player's accusation against one of the 2 hidden players.
 * Authoritatively calculates round points and reveals all roles.
 */
export async function submitPoliceGuessAction(
  roomId: string,
  actingUid: string,
  accusedPlayerId: string
): Promise<void> {
  const publicRef = doc(db, 'rooms', roomId, 'publicSession', 'state');
  const authRef = doc(db, 'rooms', roomId, 'authoritative', 'state');
  const roomRef = doc(db, 'rooms', roomId);

  await runTransaction(db, async (transaction) => {
    const publicSnap = await transaction.get(publicRef);
    const authSnap = await transaction.get(authRef);
    const roomSnap = await transaction.get(roomRef);

    if (!publicSnap.exists() || !authSnap.exists() || !roomSnap.exists()) {
      throw new Error('Game session documents not found.');
    }

    const publicState = publicSnap.data() as PublicGameSessionState;
    const authState = authSnap.data() as AuthoritativeSecretState;
    const room = roomSnap.data() as TekkaRoom;

    if (publicState.phase !== 'POLICE_TURN') {
      throw new Error(`Cannot submit Police action in phase ${publicState.phase}`);
    }

    if (publicState.policePlayerId !== actingUid) {
      throw new Error('Only the authoritative Police player can submit an accusation.');
    }

    if (
      accusedPlayerId === publicState.babuPlayerId ||
      accusedPlayerId === publicState.policePlayerId
    ) {
      throw new Error('Police must accuse one of the 2 hidden suspect players.');
    }

    if (!authState.cardAssignments[accusedPlayerId]) {
      throw new Error('Accused player does not exist in match.');
    }

    const targetRole = publicState.babuTarget === 'find-chor' ? 'chor' : 'dakat';
    const actualTargetPlayerId =
      targetRole === 'chor' ? authState.chorPlayerId : authState.dakatPlayerId;

    const isCorrect = accusedPlayerId === actualTargetPlayerId;

    // Authoritative Point Allocations:
    // Babu = +1200, Dakat = +600
    // Police = isCorrect ? 900 : 0
    // Chor = isCorrect ? 0 : 400
    const pointsEarned: Record<string, number> = {
      [authState.babuPlayerId]: 1200,
      [authState.dakatPlayerId]: 600,
      [authState.policePlayerId]: isCorrect ? 900 : 0,
      [authState.chorPlayerId]: isCorrect ? 0 : 400,
    };

    const newCumulativeScores: Record<string, number> = { ...publicState.cumulativeScores };
    for (const [pid, pts] of Object.entries(pointsEarned)) {
      newCumulativeScores[pid] = (newCumulativeScores[pid] || 0) + pts;
    }

    const now = new Date().toISOString();

    const roundResult = {
      roundNumber: publicState.currentRound,
      targetRole,
      babuChoice: publicState.babuTarget!,
      accusedPlayerId,
      actualTargetPlayerId,
      isCorrect,
      pointsEarned,
    };

    // Update public state to REVEAL_RESULT with full assignments revealed
    transaction.update(publicRef, {
      phase: 'REVEAL_RESULT',
      policeAccusedPlayerId: accusedPlayerId,
      revealedAssignments: authState.cardAssignments,
      lastRoundResult: roundResult,
      cumulativeScores: newCumulativeScores,
      updatedAt: now,
    });

    // Update each player's private view to reveal all roles
    for (const player of room.players) {
      const pViewRef = doc(db, 'rooms', roomId, 'playerViews', player.id);
      transaction.update(pViewRef, {
        publicRoles: authState.cardAssignments,
        updatedAt: now,
      });
    }
  });
}

/**
 * Advances to the next round or concludes the match (GAME_OVER).
 */
export async function advanceToNextRoundAction(
  roomId: string,
  actingUid: string
): Promise<void> {
  const publicRef = doc(db, 'rooms', roomId, 'publicSession', 'state');
  const authRef = doc(db, 'rooms', roomId, 'authoritative', 'state');
  const roomRef = doc(db, 'rooms', roomId);

  await runTransaction(db, async (transaction) => {
    const publicSnap = await transaction.get(publicRef);
    const authSnap = await transaction.get(authRef);
    const roomSnap = await transaction.get(roomRef);

    if (!publicSnap.exists() || !roomSnap.exists()) {
      throw new Error('Game session documents not found.');
    }

    const publicState = publicSnap.data() as PublicGameSessionState;
    const authState = authSnap.exists() ? (authSnap.data() as AuthoritativeSecretState) : null;
    const room = roomSnap.data() as TekkaRoom;

    if (publicState.phase !== 'REVEAL_RESULT') {
      throw new Error('Can only advance from REVEAL_RESULT phase.');
    }

    // Any match participant can trigger next round progression
    if (!room.players.some((p) => p.id === actingUid)) {
      throw new Error('Only room match players can advance the round.');
    }

    const now = new Date().toISOString();

    // Check if match is finished
    if (publicState.currentRound >= publicState.totalRounds) {
      // Calculate Authoritative Final Standings & Winners
      const playerList = room.players.map((p) => ({
        id: p.id,
        name: p.tekkaName,
      }));
      const finalStandings = calculateFinalStandings(playerList, publicState.cumulativeScores);
      const maxScore = finalStandings.length > 0 ? finalStandings[0].score : 0;
      const winners = finalStandings.filter((p) => p.score === maxScore).map((p) => p.playerId);
      const isTie = winners.length > 1;

      transaction.update(publicRef, {
        phase: 'GAME_OVER',
        winners,
        isTie,
        finalStandings,
        updatedAt: now,
      });

      transaction.update(roomRef, {
        status: 'FINISHED',
        updatedAt: now,
      });

      // Authoritative analytics recording
      trackChorPoliceMatchFinish({
        roomId,
        winners,
        finalStandings: finalStandings.map((s) => ({
          playerId: s.playerId,
          tekkaName: s.playerName,
          score: s.score,
          rank: s.rank,
        })),
        totalRounds: publicState.totalRounds,
      });
      return;
    }

    // Start Next Round with fresh derangement-based shuffle
    const nextRound = publicState.currentRound + 1;
    const playerIds = room.players.map((p) => p.id);
    const newAssignments = dealAuthoritativeRoles(playerIds, authState?.cardAssignments || null);

    let babuPlayerId = '';
    let policePlayerId = '';
    let dakatPlayerId = '';
    let chorPlayerId = '';

    room.players.forEach((player) => {
      const role = newAssignments[player.id];
      if (role === 'babu') babuPlayerId = player.id;
      if (role === 'police') policePlayerId = player.id;
      if (role === 'dakat') dakatPlayerId = player.id;
      if (role === 'chor') chorPlayerId = player.id;
    });

    // Update Authoritative Secret State
    transaction.update(authRef, {
      round: nextRound,
      cardAssignments: newAssignments,
      babuPlayerId,
      policePlayerId,
      dakatPlayerId,
      chorPlayerId,
      updatedAt: now,
    });

    // Update Public Session State
    transaction.update(publicRef, {
      phase: 'BABU_TURN',
      currentRound: nextRound,
      babuPlayerId,
      policePlayerId,
      babuTarget: null,
      policeAccusedPlayerId: null,
      revealedAssignments: null,
      lastRoundResult: null,
      updatedAt: now,
    });

    // Update each player's private view (masking secret chits)
    for (const player of room.players) {
      const pViewRef = doc(db, 'rooms', roomId, 'playerViews', player.id);
      const assignedRole = newAssignments[player.id];

      const publicRoles: Record<string, CardRole | 'hidden'> = {};
      for (const p of room.players) {
        if (p.id === player.id) {
          publicRoles[p.id] = assignedRole;
        } else if (p.id === babuPlayerId) {
          publicRoles[p.id] = 'babu';
        } else if (p.id === policePlayerId) {
          publicRoles[p.id] = 'police';
        } else {
          publicRoles[p.id] = 'hidden';
        }
      }

      transaction.update(pViewRef, {
        round: nextRound,
        assignedRole,
        publicRoles,
        updatedAt: now,
      });
    }
  });
}

/**
 * Real-time subscription to public session state and private player view.
 */
export function subscribeToGameSession(
  roomId: string,
  userId: string,
  onPublicUpdate: (state: PublicGameSessionState | null) => void,
  onPrivateUpdate: (view: PrivatePlayerView | null) => void,
  onError?: (err: Error) => void
): () => void {
  const publicRef = doc(db, 'rooms', roomId, 'publicSession', 'state');
  const privateRef = doc(db, 'rooms', roomId, 'playerViews', userId);

  const unsubPublic = onSnapshot(
    publicRef,
    (snap) => {
      if (snap.exists()) {
        onPublicUpdate(snap.data() as PublicGameSessionState);
      } else {
        onPublicUpdate(null);
      }
    },
    (err) => {
      console.error('Public state listener error:', err);
      if (onError) onError(err);
    }
  );

  const unsubPrivate = onSnapshot(
    privateRef,
    (snap) => {
      if (snap.exists()) {
        onPrivateUpdate(snap.data() as PrivatePlayerView);
      } else {
        onPrivateUpdate(null);
      }
    },
    (err) => {
      console.error('Private view listener error:', err);
      if (onError) onError(err);
    }
  );

  return () => {
    unsubPublic();
    unsubPrivate();
  };
}
