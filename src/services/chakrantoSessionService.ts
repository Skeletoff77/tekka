/**
 * CHAKRANTO Multiplayer Game Session Service
 * Authoritative Firestore Transactions for Turn Actions, Challenges,
 * Blocks, Sacrifices, Shadhbodol, and Real-time Subscriptions.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  ChakrantoActionDeclaration,
  ChakrantoActionType,
  ChakrantoAuthoritativeState,
  ChakrantoCardItem,
  ChakrantoCharacter,
  ChakrantoEventLog,
  ChakrantoPlayerPublic,
  ChakrantoPrivateView,
  ChakrantoPublicState,
} from '../games/chakranto/types';
import {
  assignInitialPositions,
  calculateChakrantoStandings,
  dealInitialCards,
  drawReplacementCard,
  evaluateChallengeClaim,
  getNextAlivePosition,
  shuffleDeck,
  validateActionLegality,
} from '../games/chakranto/engine/chakrantoEngine';
import { CHAKRANTO_ACTIONS, CHAKRANTO_CHARACTERS } from '../games/chakranto/assets/chakrantoAssets';
import { TekkaRoom } from '../types/room';
import {
  trackMatchStart,
  trackChakrantoMatchFinish,
  trackChakrantoActionAttempt,
  trackChakrantoActionResolved,
  trackChakrantoChallenge,
  trackChakrantoBlock,
  trackChakrantoSacrifice,
} from './analyticsTrackingService';

function createLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Starts a new authoritative Chakranto game session (3–6 players).
 */
export async function startChakrantoGameSession(
  roomId: string,
  hostUid: string
): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error('Room does not exist.');
  }

  const room = roomSnap.data() as TekkaRoom;

  if (room.hostId !== hostUid) {
    throw new Error('Only the room host can start the match.');
  }

  const pCount = room.players.length;
  if (pCount < 3 || pCount > 6) {
    throw new Error(`CHAKRANTO requires between 3 and 6 players (currently ${pCount}).`);
  }

  if (room.status === 'PLAYING') {
    return; // Already in progress
  }

  const now = new Date().toISOString();

  // 1. Assign positions A, B, C, D, E, F
  const positionedPlayers = assignInitialPositions(room.players);
  const playerIds = positionedPlayers.map((p) => p.id);

  // 2. Deal 2 cards to each player from 15-card deck
  const { playerHands, drawDeck } = dealInitialCards(playerIds);

  // 3. Write Private Views for each player (strictly their own cards)
  for (const player of positionedPlayers) {
    const privRef = doc(db, 'rooms', roomId, 'chakrantoViews', player.id);
    const privData: ChakrantoPrivateView = {
      userId: player.id,
      roomId,
      activeCards: playerHands[player.id] || [],
      updatedAt: now,
    };
    await setDoc(privRef, privData);
  }

  // 4. Write Authoritative Secret State
  const authRef = doc(db, 'rooms', roomId, 'chakrantoAuthoritative', 'state');
  const authData: ChakrantoAuthoritativeState = {
    roomId,
    drawDeck,
    discardPile: [],
    playerHands,
    turnNumber: 1,
    updatedAt: now,
  };
  await setDoc(authRef, authData);

  // 5. Write Initial Public State
  const publicRef = doc(db, 'rooms', roomId, 'chakrantoPublic', 'state');
  const firstTurnPlayer = positionedPlayers.find((p) => p.position === 'A') || positionedPlayers[0];

  const initialLog: ChakrantoEventLog = {
    id: createLogId(),
    turnNumber: 1,
    timestamp: now,
    type: 'SYSTEM',
    message: `Match commenced with ${pCount} players! Positions assigned. It is ${firstTurnPlayer.name}'s turn (Position ${firstTurnPlayer.position}).`,
  };

  const publicData: ChakrantoPublicState = {
    roomId,
    gameId: 'chakranto',
    turnNumber: 1,
    currentTurnPlayerId: firstTurnPlayer.id,
    currentPosition: firstTurnPlayer.position,
    phase: 'TURN_ACTIVE',
    players: positionedPlayers,
    currentAction: null,
    currentBlock: null,
    currentChallenge: null,
    pendingSacrifice: null,
    passedPlayerIds: [],
    lastResolution: null,
    winnerPlayerId: null,
    finalStandings: null,
    logs: [initialLog],
    updatedAt: now,
  };
  await setDoc(publicRef, publicData);

  // 6. Update Room Document
  await updateDoc(roomRef, {
    status: 'PLAYING',
    updatedAt: now,
  });

  // 7. Authoritative Analytics Tracking
  trackMatchStart({
    roomId,
    roomCode: room.roomCode,
    gameId: room.gameId,
    gameName: room.gameName || 'Chakranto',
    players: room.players.map((p) => ({ id: p.id, tekkaName: p.tekkaName })),
  });
}

/**
 * Submits an action on a player's turn.
 */
export async function submitChakrantoAction(
  roomId: string,
  actingUid: string,
  action: ChakrantoActionType,
  targetPlayerId?: string
): Promise<void> {
  const publicRef = doc(db, 'rooms', roomId, 'chakrantoPublic', 'state');
  const authRef = doc(db, 'rooms', roomId, 'chakrantoAuthoritative', 'state');

  await runTransaction(db, async (transaction) => {
    const publicSnap = await transaction.get(publicRef);
    const authSnap = await transaction.get(authRef);

    if (!publicSnap.exists() || !authSnap.exists()) {
      throw new Error('Game session documents not found.');
    }

    const publicState = publicSnap.data() as ChakrantoPublicState;
    const now = new Date().toISOString();

    if (publicState.phase !== 'TURN_ACTIVE') {
      throw new Error(`Cannot declare action in phase ${publicState.phase}`);
    }

    if (publicState.currentTurnPlayerId !== actingUid) {
      throw new Error('It is not your turn to declare an action.');
    }

    const actor = publicState.players.find((p) => p.id === actingUid);
    if (!actor) throw new Error('Actor not found in match.');

    const target = targetPlayerId
      ? publicState.players.find((p) => p.id === targetPlayerId)
      : null;

    // Validate legality
    const legality = validateActionLegality(action, actor, target);
    if (!legality.allowed) {
      throw new Error(legality.reason || 'Illegal action.');
    }

    const actionMeta = CHAKRANTO_ACTIONS[action];
    const claimedChar = actionMeta.associatedCharacter;

    // Handle Ayy directly (Unchallengeable & Unblockable -> resolves immediately)
    if (action === 'ayy') {
      const updatedPlayers = publicState.players.map((p) => {
        if (p.id === actingUid) {
          return { ...p, coins: p.coins + 1 };
        }
        return p;
      });

      const nextPlayer = getNextAlivePosition(publicState.currentPosition, updatedPlayers);

      const log: ChakrantoEventLog = {
        id: createLogId(),
        turnNumber: publicState.turnNumber,
        timestamp: now,
        type: 'ACTION',
        message: `${actor.name} collected Ayy (+1 coin) from the treasury.`,
        actorName: actor.name,
      };

      transaction.update(publicRef, {
        phase: 'TURN_ACTIVE',
        turnNumber: publicState.turnNumber + 1,
        currentTurnPlayerId: nextPlayer.id,
        currentPosition: nextPlayer.position,
        players: updatedPlayers,
        currentAction: null,
        currentBlock: null,
        currentChallenge: null,
        pendingSacrifice: null,
        passedPlayerIds: [],
        logs: [log, ...publicState.logs].slice(0, 50),
        updatedAt: now,
      });

      trackChakrantoActionAttempt({ roomId, action: 'ayy' });
      trackChakrantoActionResolved({ roomId, action: 'ayy', coinsGenerated: 1 });
      return;
    }

    // Handle Hottaya directly (Unchallengeable & Unblockable)
    if (action === 'hottaya') {
      const updatedPlayers = publicState.players.map((p) => {
        if (p.id === actingUid) {
          return { ...p, coins: p.coins - 7 };
        }
        return p;
      });

      const log: ChakrantoEventLog = {
        id: createLogId(),
        turnNumber: publicState.turnNumber,
        timestamp: now,
        type: 'ACTION',
        message: `${actor.name} executed HOTTAYA (7 coins) against ${target!.name}! ${target!.name} must sacrifice 1 card.`,
        actorName: actor.name,
        targetName: target!.name,
      };

      transaction.update(publicRef, {
        phase: 'SACRIFICE_SELECTION',
        players: updatedPlayers,
        pendingSacrifice: {
          targetPlayerId: target!.id,
          reason: 'HOTTAYA',
          requiredCount: 1,
        },
        logs: [log, ...publicState.logs].slice(0, 50),
        updatedAt: now,
      });

      trackChakrantoActionAttempt({ roomId, action: 'hottaya' });
      trackChakrantoActionResolved({ roomId, action: 'hottaya', coinsSpent: 7 });
      return;
    }

    // Normal Declaration (waiting for challenge, block, or pass)
    const log: ChakrantoEventLog = {
      id: createLogId(),
      turnNumber: publicState.turnNumber,
      timestamp: now,
      type: 'ACTION',
      message: target
        ? `${actor.name} declared ${actionMeta.name} (${actionMeta.bengaliName}) targeting ${target.name}.`
        : `${actor.name} declared ${actionMeta.name} (${actionMeta.bengaliName}).`,
      actorName: actor.name,
    };
    if (target?.name) {
      log.targetName = target.name;
    }
    if (claimedChar) {
      log.character = claimedChar;
    }

    const currentActionPayload: ChakrantoActionDeclaration = {
      action,
      actorPlayerId: actingUid,
      declaredAt: now,
    };
    if (claimedChar) {
      currentActionPayload.claimedCharacter = claimedChar;
    }
    if (target?.id) {
      currentActionPayload.targetPlayerId = target.id;
    }

    transaction.update(publicRef, {
      phase: 'ACTION_PENDING_RESPONSE',
      currentAction: currentActionPayload,
      currentBlock: null,
      currentChallenge: null,
      passedPlayerIds: [],
      logs: [log, ...publicState.logs].slice(0, 50),
      updatedAt: now,
    });

    trackChakrantoActionAttempt({ roomId, action });
  });
}

/**
 * Submits a challenge against an action or block claim.
 */
export async function submitChakrantoChallenge(
  roomId: string,
  challengerUid: string
): Promise<void> {
  const publicRef = doc(db, 'rooms', roomId, 'chakrantoPublic', 'state');
  const authRef = doc(db, 'rooms', roomId, 'chakrantoAuthoritative', 'state');

  await runTransaction(db, async (transaction) => {
    const publicSnap = await transaction.get(publicRef);
    const authSnap = await transaction.get(authRef);

    if (!publicSnap.exists() || !authSnap.exists()) {
      throw new Error('Game session documents not found.');
    }

    const publicState = publicSnap.data() as ChakrantoPublicState;
    const authState = authSnap.data() as ChakrantoAuthoritativeState;
    const now = new Date().toISOString();

    const challenger = publicState.players.find((p) => p.id === challengerUid);
    if (!challenger || challenger.isEliminated) {
      throw new Error('Challenger must be an active living player.');
    }

    let challengedUid = '';
    let claimedCharacter: ChakrantoCharacter | undefined;
    let context: 'ACTION' | 'BLOCK' = 'ACTION';

    if (publicState.phase === 'ACTION_PENDING_RESPONSE') {
      if (publicState.currentAction?.isClaimVerified) {
        throw new Error('This action claim has already been verified and cannot be challenged again.');
      }
      if (!publicState.currentAction?.claimedCharacter) {
        throw new Error('This action has no character claim to challenge.');
      }
      if (publicState.currentAction.actorPlayerId === challengerUid) {
        throw new Error('You cannot challenge your own action.');
      }
      challengedUid = publicState.currentAction.actorPlayerId;
      claimedCharacter = publicState.currentAction.claimedCharacter;
      context = 'ACTION';
    } else if (publicState.phase === 'BLOCK_PENDING_RESPONSE') {
      if (!publicState.currentBlock) {
        throw new Error('No active block to challenge.');
      }
      // For targeted actions, only the active actor can challenge the blocker
      if (publicState.currentAction?.actorPlayerId !== challengerUid) {
        throw new Error('Only the active actor can challenge a block against their action.');
      }
      challengedUid = publicState.currentBlock.blockerPlayerId;
      claimedCharacter = publicState.currentBlock.claimedCharacter;
      context = 'BLOCK';
    } else {
      throw new Error('No challengeable action or block in current phase.');
    }

    const defender = publicState.players.find((p) => p.id === challengedUid);
    if (!defender) throw new Error('Challenged player not found.');

    const defenderHand = authState.playerHands[challengedUid] || [];
    const evaluation = evaluateChallengeClaim(defenderHand, claimedCharacter!);

    const charMeta = CHAKRANTO_CHARACTERS[claimedCharacter!];

    if (evaluation.isTruthful) {
      // DEFENDER IS TRUTHFUL!
      // Challenger loses challenge -> must sacrifice 1 card.
      // Defender consumes claimed character and draws a replacement card.
      const matchingCard = evaluation.matchingCard!;
      const remainingDefenderHand = defenderHand.filter((c) => c.id !== matchingCard.id);

      const replacement = drawReplacementCard(
        authState.drawDeck,
        [...authState.discardPile, matchingCard],
        authState.turnNumber
      );

      const newDefenderHand = [...remainingDefenderHand, replacement.card];
      const updatedHands = {
        ...authState.playerHands,
        [challengedUid]: newDefenderHand,
      };

      // Update Authoritative state with replaced card
      transaction.update(authRef, {
        playerHands: updatedHands,
        drawDeck: replacement.newDrawDeck,
        discardPile: replacement.newDiscardPile,
        updatedAt: now,
      });

      // Update Defender's private view with the new card
      const defenderPrivRef = doc(db, 'rooms', roomId, 'chakrantoViews', challengedUid);
      transaction.update(defenderPrivRef, {
        activeCards: newDefenderHand,
        updatedAt: now,
      });

      const log: ChakrantoEventLog = {
        id: createLogId(),
        turnNumber: publicState.turnNumber,
        timestamp: now,
        type: 'CHALLENGE',
        message: `${challenger.name} challenged ${defender.name}'s claim of ${charMeta.name}! ${defender.name} REVEALED ${charMeta.name} and proved truth! ${challenger.name} must sacrifice 1 card.`,
        actorName: challenger.name,
        targetName: defender.name,
        character: claimedCharacter,
      };

      const updatedAction = publicState.currentAction
        ? {
            ...publicState.currentAction,
            ...(context === 'ACTION' ? { isClaimVerified: true } : {}),
          }
        : null;

      transaction.update(publicRef, {
        phase: 'SACRIFICE_SELECTION',
        ...(updatedAction ? { currentAction: updatedAction } : {}),
        currentChallenge: {
          challengerPlayerId: challengerUid,
          challengedPlayerId: challengedUid,
          claimedCharacter,
          context,
          declaredAt: now,
        },
        pendingSacrifice: {
          targetPlayerId: challengerUid,
          reason: 'FAILED_CHALLENGE',
          requiredCount: 1,
          challengeContext: context,
        },
        lastResolution: {
          message: `${defender.name} proved they held ${charMeta.name}!`,
          revealedCard: claimedCharacter,
          challengerWon: false,
        },
        passedPlayerIds: [],
        logs: [log, ...publicState.logs].slice(0, 50),
        updatedAt: now,
      });

      trackChakrantoChallenge({ roomId, challengerWon: false });
    } else {
      // DEFENDER WAS BLUFFING!
      // Defender must sacrifice 1 card. Bluffed action or block fails.
      const log: ChakrantoEventLog = {
        id: createLogId(),
        turnNumber: publicState.turnNumber,
        timestamp: now,
        type: 'CHALLENGE',
        message: `${challenger.name} CAUGHT ${defender.name} BLUFFING ${charMeta.name}! ${defender.name} must sacrifice 1 card.`,
        actorName: challenger.name,
        targetName: defender.name,
        character: claimedCharacter,
      };

      transaction.update(publicRef, {
        phase: 'SACRIFICE_SELECTION',
        currentChallenge: {
          challengerPlayerId: challengerUid,
          challengedPlayerId: challengedUid,
          claimedCharacter,
          context,
          declaredAt: now,
        },
        pendingSacrifice: {
          targetPlayerId: challengedUid,
          reason: 'BLUFF_CAUGHT',
          requiredCount: 1,
          challengeContext: context,
        },
        lastResolution: {
          message: `${challenger.name} caught ${defender.name} bluffing!`,
          revealedCard: claimedCharacter,
          challengerWon: true,
        },
        passedPlayerIds: [],
        logs: [log, ...publicState.logs].slice(0, 50),
        updatedAt: now,
      });

      trackChakrantoChallenge({ roomId, challengerWon: true });
    }
  });
}

/**
 * Submits a block declaration.
 */
export async function submitChakrantoBlock(
  roomId: string,
  blockerUid: string,
  claimedCharacter: ChakrantoCharacter
): Promise<void> {
  const publicRef = doc(db, 'rooms', roomId, 'chakrantoPublic', 'state');

  await runTransaction(db, async (transaction) => {
    const publicSnap = await transaction.get(publicRef);
    if (!publicSnap.exists()) throw new Error('Session not found.');

    const publicState = publicSnap.data() as ChakrantoPublicState;
    const now = new Date().toISOString();

    if (publicState.phase !== 'ACTION_PENDING_RESPONSE' || !publicState.currentAction) {
      throw new Error('No action to block.');
    }

    const action = publicState.currentAction.action;
    const blocker = publicState.players.find((p) => p.id === blockerUid);
    if (!blocker || blocker.isEliminated) throw new Error('Invalid blocker.');

    // Block eligibility rules:
    // Roptani -> Blockable by Bir Bikrom (any player)
    // Dakati -> Blockable by Kalu Dakat OR Petukchondro (Target player only)
    // Ghar Motkano -> Blockable by Ginner Badsha (Target player only)
    if (action === 'roptani') {
      if (claimedCharacter !== 'bir_bikrom') {
        throw new Error('Roptani can only be blocked by claiming Bir Bikrom.');
      }
    } else if (action === 'dakati') {
      if (publicState.currentAction.targetPlayerId !== blockerUid) {
        throw new Error('Only the target of Dakati can block it.');
      }
      if (claimedCharacter !== 'kalu_dakat' && claimedCharacter !== 'petukchondro') {
        throw new Error('Dakati can only be blocked by claiming Kalu Dakat or Petukchondro.');
      }
    } else if (action === 'ghar_motkano') {
      if (publicState.currentAction.targetPlayerId !== blockerUid) {
        throw new Error('Only the target of Ghar Motkano can block it.');
      }
      if (claimedCharacter !== 'ginner_badsha') {
        throw new Error('Ghar Motkano can only be blocked by claiming Ginner Badsha.');
      }
    } else {
      throw new Error(`Action ${action} cannot be blocked.`);
    }

    const charMeta = CHAKRANTO_CHARACTERS[claimedCharacter];
    const log: ChakrantoEventLog = {
      id: createLogId(),
      turnNumber: publicState.turnNumber,
      timestamp: now,
      type: 'BLOCK',
      message: `${blocker.name} declared a BLOCK claiming ${charMeta.name} (${charMeta.bengaliName}) against ${publicState.currentAction.action.toUpperCase()}.`,
      actorName: blocker.name,
      character: claimedCharacter,
    };

    transaction.update(publicRef, {
      phase: 'BLOCK_PENDING_RESPONSE',
      currentBlock: {
        blockerPlayerId: blockerUid,
        claimedCharacter,
        targetAction: action,
        declaredAt: now,
      },
      currentChallenge: null,
      passedPlayerIds: [],
      logs: [log, ...publicState.logs].slice(0, 50),
      updatedAt: now,
    });
  });
}

/**
 * Passes on challenging or blocking. When all required passes are received,
 * the action executes or block takes effect.
 */
export async function submitChakrantoPass(
  roomId: string,
  passingUid: string
): Promise<void> {
  const publicRef = doc(db, 'rooms', roomId, 'chakrantoPublic', 'state');
  const authRef = doc(db, 'rooms', roomId, 'chakrantoAuthoritative', 'state');

  await runTransaction(db, async (transaction) => {
    const publicSnap = await transaction.get(publicRef);
    const authSnap = await transaction.get(authRef);

    if (!publicSnap.exists() || !authSnap.exists()) {
      throw new Error('Session documents not found.');
    }

    const publicState = publicSnap.data() as ChakrantoPublicState;
    const authState = authSnap.data() as ChakrantoAuthoritativeState;
    const now = new Date().toISOString();

    const passingPlayer = publicState.players.find((p) => p.id === passingUid);
    if (!passingPlayer || passingPlayer.isEliminated) return;

    if (publicState.phase === 'BLOCK_PENDING_RESPONSE') {
      // Active actor chooses not to challenge the block -> Block succeeds!
      if (publicState.currentAction?.actorPlayerId === passingUid) {
        // Advance turn
        const nextPlayer = getNextAlivePosition(publicState.currentPosition, publicState.players);
        const log: ChakrantoEventLog = {
          id: createLogId(),
          turnNumber: publicState.turnNumber,
          timestamp: now,
          type: 'BLOCK',
          message: `${passingPlayer.name} accepted the block. Turn advances to ${nextPlayer.name}.`,
          actorName: passingPlayer.name,
        };

        transaction.update(publicRef, {
          phase: 'TURN_ACTIVE',
          turnNumber: publicState.turnNumber + 1,
          currentTurnPlayerId: nextPlayer.id,
          currentPosition: nextPlayer.position,
          currentAction: null,
          currentBlock: null,
          currentChallenge: null,
          passedPlayerIds: [],
          logs: [log, ...publicState.logs].slice(0, 50),
          updatedAt: now,
        });

        trackChakrantoBlock({ roomId, successful: true });
        return;
      }
    }

    if (publicState.phase !== 'ACTION_PENDING_RESPONSE' || !publicState.currentAction) {
      return;
    }

    const currentPassed = Array.from(new Set([...publicState.passedPlayerIds, passingUid]));
    const aliveOpponents = publicState.players.filter(
      (p) => !p.isEliminated && p.id !== publicState.currentAction!.actorPlayerId
    );

    // If all alive opponents have passed (or target has passed for targeted action)
    const allPassed = aliveOpponents.every((p) => currentPassed.includes(p.id));

    if (!allPassed) {
      transaction.update(publicRef, {
        passedPlayerIds: currentPassed,
        updatedAt: now,
      });
      return;
    }

    // ALL OPPONENTS PASSED -> EXECUTE ACTION!
    const action = publicState.currentAction.action;
    const actorId = publicState.currentAction.actorPlayerId;
    const targetId = publicState.currentAction.targetPlayerId;
    const actor = publicState.players.find((p) => p.id === actorId)!;
    const target = targetId ? publicState.players.find((p) => p.id === targetId) : null;

    // 1. ROPTANI (+2 coins)
    if (action === 'roptani') {
      const updatedPlayers = publicState.players.map((p) =>
        p.id === actorId ? { ...p, coins: p.coins + 2 } : p
      );
      const nextPlayer = getNextAlivePosition(publicState.currentPosition, updatedPlayers);
      const log: ChakrantoEventLog = {
        id: createLogId(),
        turnNumber: publicState.turnNumber,
        timestamp: now,
        type: 'ACTION',
        message: `${actor.name} completed Roptani (+2 coins).`,
        actorName: actor.name,
      };

      transaction.update(publicRef, {
        phase: 'TURN_ACTIVE',
        turnNumber: publicState.turnNumber + 1,
        currentTurnPlayerId: nextPlayer.id,
        currentPosition: nextPlayer.position,
        players: updatedPlayers,
        currentAction: null,
        passedPlayerIds: [],
        logs: [log, ...publicState.logs].slice(0, 50),
        updatedAt: now,
      });

      trackChakrantoActionResolved({ roomId, action: 'roptani', coinsGenerated: 2 });
      return;
    }

    // 2. BIRBIKROM BHATA (+3 coins)
    if (action === 'birbikrom_bhata') {
      const updatedPlayers = publicState.players.map((p) =>
        p.id === actorId ? { ...p, coins: p.coins + 3 } : p
      );
      const nextPlayer = getNextAlivePosition(publicState.currentPosition, updatedPlayers);
      const log: ChakrantoEventLog = {
        id: createLogId(),
        turnNumber: publicState.turnNumber,
        timestamp: now,
        type: 'ACTION',
        message: `${actor.name} collected Biratwo Bhata (+3 coins).`,
        actorName: actor.name,
      };

      transaction.update(publicRef, {
        phase: 'TURN_ACTIVE',
        turnNumber: publicState.turnNumber + 1,
        currentTurnPlayerId: nextPlayer.id,
        currentPosition: nextPlayer.position,
        players: updatedPlayers,
        currentAction: null,
        passedPlayerIds: [],
        logs: [log, ...publicState.logs].slice(0, 50),
        updatedAt: now,
      });

      trackChakrantoActionResolved({ roomId, action: 'birbikrom_bhata', coinsGenerated: 3 });
      return;
    }

    // 3. DAKATI (+2 coins from target)
    if (action === 'dakati' && target) {
      const stealAmount = Math.min(2, target.coins);
      const updatedPlayers = publicState.players.map((p) => {
        if (p.id === actorId) return { ...p, coins: p.coins + stealAmount };
        if (p.id === target.id) return { ...p, coins: p.coins - stealAmount };
        return p;
      });
      const nextPlayer = getNextAlivePosition(publicState.currentPosition, updatedPlayers);
      const log: ChakrantoEventLog = {
        id: createLogId(),
        turnNumber: publicState.turnNumber,
        timestamp: now,
        type: 'ACTION',
        message: `${actor.name} raided ${target.name} for ${stealAmount} coins via Dakati.`,
        actorName: actor.name,
        targetName: target.name,
      };

      transaction.update(publicRef, {
        phase: 'TURN_ACTIVE',
        turnNumber: publicState.turnNumber + 1,
        currentTurnPlayerId: nextPlayer.id,
        currentPosition: nextPlayer.position,
        players: updatedPlayers,
        currentAction: null,
        passedPlayerIds: [],
        logs: [log, ...publicState.logs].slice(0, 50),
        updatedAt: now,
      });

      trackChakrantoActionResolved({ roomId, action: 'dakati', coinsStolen: stealAmount });
      return;
    }

    // 4. GHAR MOTKANO (-3 coins, target sacrifices 1 card)
    if (action === 'ghar_motkano' && target) {
      const updatedPlayers = publicState.players.map((p) =>
        p.id === actorId ? { ...p, coins: Math.max(0, p.coins - 3) } : p
      );
      const log: ChakrantoEventLog = {
        id: createLogId(),
        turnNumber: publicState.turnNumber,
        timestamp: now,
        type: 'ACTION',
        message: `${actor.name} executed Ghar Motkano against ${target.name}! ${target.name} must sacrifice 1 card.`,
        actorName: actor.name,
        targetName: target.name,
      };

      transaction.update(publicRef, {
        phase: 'SACRIFICE_SELECTION',
        players: updatedPlayers,
        pendingSacrifice: {
          targetPlayerId: target.id,
          reason: 'GHAR_MOTKANO',
          requiredCount: 1,
        },
        logs: [log, ...publicState.logs].slice(0, 50),
        updatedAt: now,
      });

      trackChakrantoActionResolved({ roomId, action: 'ghar_motkano', coinsSpent: 3 });
      return;
    }

    // 5. SHADHBODOL (Draw 2 cards, private selection)
    if (action === 'shadhbodol') {
      let deck = [...authState.drawDeck];
      let discard = [...authState.discardPile];
      if (deck.length < 2) {
        deck = [...deck, ...shuffleDeck(discard)];
        discard = [];
      }

      const drawn1 = deck.pop()!;
      const drawn2 = deck.pop()!;
      const actorHand = authState.playerHands[actorId] || [];

      // Update Authoritative state with drawn Shadhbodol hand
      transaction.update(authRef, {
        drawDeck: deck,
        discardPile: discard,
        shadhbodolActiveHand: {
          userId: actorId,
          originalCards: actorHand,
          drawnCards: [drawn1, drawn2],
        },
        updatedAt: now,
      });

      // Update Actor's private view with Shadhbodol options
      const actorPrivRef = doc(db, 'rooms', roomId, 'chakrantoViews', actorId);
      transaction.update(actorPrivRef, {
        shadhbodolOptions: [...actorHand, drawn1, drawn2],
        updatedAt: now,
      });

      const log: ChakrantoEventLog = {
        id: createLogId(),
        turnNumber: publicState.turnNumber,
        timestamp: now,
        type: 'ACTION',
        message: `${actor.name} is performing Shadbodol (selecting secret cards).`,
        actorName: actor.name,
      };

      transaction.update(publicRef, {
        phase: 'SHADHBODOL_SELECTION',
        logs: [log, ...publicState.logs].slice(0, 50),
        updatedAt: now,
      });

      trackChakrantoActionResolved({ roomId, action: 'shadhbodol' });
      return;
    }
  });
}

/**
 * Submits card sacrifice choice when a player loses a card.
 */
export async function submitChakrantoSacrifice(
  roomId: string,
  sacrificingUid: string,
  sacrificedCardId: string
): Promise<void> {
  const publicRef = doc(db, 'rooms', roomId, 'chakrantoPublic', 'state');
  const authRef = doc(db, 'rooms', roomId, 'chakrantoAuthoritative', 'state');
  const roomRef = doc(db, 'rooms', roomId);

  await runTransaction(db, async (transaction) => {
    const publicSnap = await transaction.get(publicRef);
    const authSnap = await transaction.get(authRef);

    if (!publicSnap.exists() || !authSnap.exists()) {
      throw new Error('Game session documents not found.');
    }

    const publicState = publicSnap.data() as ChakrantoPublicState;
    const authState = authSnap.data() as ChakrantoAuthoritativeState;
    const now = new Date().toISOString();

    if (
      publicState.phase !== 'SACRIFICE_SELECTION' ||
      publicState.pendingSacrifice?.targetPlayerId !== sacrificingUid
    ) {
      throw new Error('Not currently waiting for your sacrifice.');
    }

    const hand = authState.playerHands[sacrificingUid] || [];
    const cardToSacrifice = hand.find((c) => c.id === sacrificedCardId);
    if (!cardToSacrifice) {
      throw new Error('Card not found in your hand.');
    }

    const newHand = hand.filter((c) => c.id !== sacrificedCardId);
    const remainingActiveCount = newHand.length;
    const isEliminated = remainingActiveCount === 0;

    // Count how many are already eliminated to set eliminatedAtOrder
    const previouslyEliminatedCount = publicState.players.filter((p) => p.isEliminated).length;
    const eliminationOrder = isEliminated ? previouslyEliminatedCount + 1 : undefined;

    const updatedPlayers = publicState.players.map((p) => {
      if (p.id === sacrificingUid) {
        const updated: ChakrantoPlayerPublic = {
          ...p,
          activeCardCount: remainingActiveCount,
          sacrificedCards: [...p.sacrificedCards, cardToSacrifice.character],
          isEliminated,
        };
        if (isEliminated && eliminationOrder !== undefined) {
          updated.eliminatedAtOrder = eliminationOrder;
        }
        return updated;
      }
      return p;
    });

    // Update Authoritative state
    transaction.update(authRef, {
      playerHands: { ...authState.playerHands, [sacrificingUid]: newHand },
      discardPile: [...authState.discardPile, cardToSacrifice],
      updatedAt: now,
    });

    // Update Private view
    const privRef = doc(db, 'rooms', roomId, 'chakrantoViews', sacrificingUid);
    transaction.update(privRef, {
      activeCards: newHand,
      updatedAt: now,
    });

    const player = publicState.players.find((p) => p.id === sacrificingUid)!;
    const charMeta = CHAKRANTO_CHARACTERS[cardToSacrifice.character];

    const sacrificeLog: ChakrantoEventLog = {
      id: createLogId(),
      turnNumber: publicState.turnNumber,
      timestamp: now,
      type: isEliminated ? 'ELIMINATION' : 'SACRIFICE',
      message: isEliminated
        ? `${player.name} sacrificed ${charMeta.name} and has been ELIMINATED from the match!`
        : `${player.name} sacrificed ${charMeta.name}.`,
      actorName: player.name,
      character: cardToSacrifice.character,
    };

    // Check if only 1 survivor remains -> GAME OVER!
    const survivors = updatedPlayers.filter((p) => !p.isEliminated);
    if (survivors.length === 1) {
      const winner = survivors[0];
      const finalStandings = calculateChakrantoStandings(updatedPlayers);

      const winLog: ChakrantoEventLog = {
        id: createLogId(),
        turnNumber: publicState.turnNumber,
        timestamp: now,
        type: 'SYSTEM',
        message: `MATCH FINISHED! ${winner.name} is the sole survivor and CHAKRANTO CHAMPION!`,
        actorName: winner.name,
      };

      transaction.update(publicRef, {
        phase: 'GAME_OVER',
        players: updatedPlayers,
        winnerPlayerId: winner.id,
        finalStandings,
        pendingSacrifice: null,
        currentAction: null,
        currentBlock: null,
        logs: [winLog, sacrificeLog, ...publicState.logs].slice(0, 50),
        updatedAt: now,
      });

      transaction.update(roomRef, {
        status: 'FINISHED',
        updatedAt: now,
      });

      trackChakrantoSacrifice({ roomId, isElimination: true });
      trackChakrantoMatchFinish({
        roomId,
        winnerPlayerId: winner.id,
        finalStandings: finalStandings.map((s) => ({
          playerId: s.playerId,
          tekkaName: s.playerName,
          score: s.finalCoins,
          rank: s.rank,
        })),
      });
      return;
    }

    const pendingSacrifice = publicState.pendingSacrifice;
    const currentAction = publicState.currentAction;
    const currentBlock = publicState.currentBlock;
    const currentChallenge = publicState.currentChallenge;
    const reason = pendingSacrifice?.reason;
    const challengeContext = pendingSacrifice?.challengeContext || currentChallenge?.context;

    // Case 1: HOTTAYA or GHAR_MOTKANO sacrifice fulfilled
    if (reason === 'HOTTAYA' || reason === 'GHAR_MOTKANO') {
      const nextPlayer = getNextAlivePosition(publicState.currentPosition, updatedPlayers);
      transaction.update(publicRef, {
        phase: 'TURN_ACTIVE',
        turnNumber: publicState.turnNumber + 1,
        currentTurnPlayerId: nextPlayer.id,
        currentPosition: nextPlayer.position,
        players: updatedPlayers,
        pendingSacrifice: null,
        currentAction: null,
        currentBlock: null,
        currentChallenge: null,
        passedPlayerIds: [],
        logs: [sacrificeLog, ...publicState.logs].slice(0, 50),
        updatedAt: now,
      });
      trackChakrantoSacrifice({ roomId, isElimination: isEliminated });
      return;
    }

    // Case 2: BLUFF_CAUGHT
    if (reason === 'BLUFF_CAUGHT') {
      if (challengeContext === 'ACTION') {
        // Actor was caught bluffing their action -> Action fails and is cancelled!
        const nextPlayer = getNextAlivePosition(publicState.currentPosition, updatedPlayers);
        transaction.update(publicRef, {
          phase: 'TURN_ACTIVE',
          turnNumber: publicState.turnNumber + 1,
          currentTurnPlayerId: nextPlayer.id,
          currentPosition: nextPlayer.position,
          players: updatedPlayers,
          pendingSacrifice: null,
          currentAction: null,
          currentBlock: null,
          currentChallenge: null,
          passedPlayerIds: [],
          logs: [sacrificeLog, ...publicState.logs].slice(0, 50),
          updatedAt: now,
        });
        trackChakrantoSacrifice({ roomId, isElimination: isEliminated });
        return;
      }

      if (challengeContext === 'BLOCK' && currentAction) {
        // Blocker was caught bluffing their block -> Block fails, original action SUCCEEDS!
        const action = currentAction.action;
        const actorId = currentAction.actorPlayerId;
        const targetId = currentAction.targetPlayerId;
        const actor = updatedPlayers.find((p) => p.id === actorId);

        if (action === 'roptani') {
          const playersWithCoins = updatedPlayers.map((p) =>
            p.id === actorId ? { ...p, coins: p.coins + 2 } : p
          );
          const nextPlayer = getNextAlivePosition(publicState.currentPosition, playersWithCoins);
          const log: ChakrantoEventLog = {
            id: createLogId(),
            turnNumber: publicState.turnNumber,
            timestamp: now,
            type: 'ACTION',
            message: `${actor?.name || 'Actor'} completed Roptani (+2 coins) after bluffed block was defeated.`,
            actorName: actor?.name,
          };
          transaction.update(publicRef, {
            phase: 'TURN_ACTIVE',
            turnNumber: publicState.turnNumber + 1,
            currentTurnPlayerId: nextPlayer.id,
            currentPosition: nextPlayer.position,
            players: playersWithCoins,
            pendingSacrifice: null,
            currentAction: null,
            currentBlock: null,
            currentChallenge: null,
            passedPlayerIds: [],
            logs: [log, sacrificeLog, ...publicState.logs].slice(0, 50),
            updatedAt: now,
          });
          trackChakrantoSacrifice({ roomId, isElimination: isEliminated });
          trackChakrantoActionResolved({ roomId, action: 'roptani', coinsGenerated: 2 });
          return;
        }

        if (action === 'dakati' && targetId) {
          const targetPlayer = updatedPlayers.find((p) => p.id === targetId);
          const stealAmount = targetPlayer ? Math.min(2, targetPlayer.coins) : 0;
          const playersWithCoins = updatedPlayers.map((p) => {
            if (p.id === actorId) return { ...p, coins: p.coins + stealAmount };
            if (p.id === targetId) return { ...p, coins: p.coins - stealAmount };
            return p;
          });
          const nextPlayer = getNextAlivePosition(publicState.currentPosition, playersWithCoins);
          const log: ChakrantoEventLog = {
            id: createLogId(),
            turnNumber: publicState.turnNumber,
            timestamp: now,
            type: 'ACTION',
            message: `${actor?.name || 'Actor'} raided ${targetPlayer?.name || 'Target'} for ${stealAmount} coins via Dakati after bluffed block was defeated.`,
            actorName: actor?.name,
            targetName: targetPlayer?.name,
          };
          transaction.update(publicRef, {
            phase: 'TURN_ACTIVE',
            turnNumber: publicState.turnNumber + 1,
            currentTurnPlayerId: nextPlayer.id,
            currentPosition: nextPlayer.position,
            players: playersWithCoins,
            pendingSacrifice: null,
            currentAction: null,
            currentBlock: null,
            currentChallenge: null,
            passedPlayerIds: [],
            logs: [log, sacrificeLog, ...publicState.logs].slice(0, 50),
            updatedAt: now,
          });
          trackChakrantoSacrifice({ roomId, isElimination: isEliminated });
          trackChakrantoActionResolved({ roomId, action: 'dakati', coinsStolen: stealAmount });
          return;
        }

        if (action === 'ghar_motkano' && targetId) {
          const playersWithCost = updatedPlayers.map((p) =>
            p.id === actorId ? { ...p, coins: Math.max(0, p.coins - 3) } : p
          );
          const targetPlayer = playersWithCost.find((p) => p.id === targetId);

          if (targetPlayer && !targetPlayer.isEliminated) {
            // Target is still alive -> Ghar Motkano requires target to sacrifice their next card!
            const log: ChakrantoEventLog = {
              id: createLogId(),
              turnNumber: publicState.turnNumber,
              timestamp: now,
              type: 'ACTION',
              message: `${actor?.name || 'Actor'} executed Ghar Motkano against ${targetPlayer.name} after defeating their bluffed block! ${targetPlayer.name} must sacrifice 1 card.`,
              actorName: actor?.name,
              targetName: targetPlayer.name,
            };
            transaction.update(publicRef, {
              phase: 'SACRIFICE_SELECTION',
              players: playersWithCost,
              pendingSacrifice: {
                targetPlayerId: targetId,
                reason: 'GHAR_MOTKANO',
                requiredCount: 1,
              },
              currentBlock: null,
              currentChallenge: null,
              passedPlayerIds: [],
              logs: [log, sacrificeLog, ...publicState.logs].slice(0, 50),
              updatedAt: now,
            });
            trackChakrantoSacrifice({ roomId, isElimination: isEliminated });
            trackChakrantoActionResolved({ roomId, action: 'ghar_motkano', coinsSpent: 3 });
            return;
          } else {
            // Target was already eliminated by the bluff sacrifice
            const nextPlayer = getNextAlivePosition(publicState.currentPosition, playersWithCost);
            transaction.update(publicRef, {
              phase: 'TURN_ACTIVE',
              turnNumber: publicState.turnNumber + 1,
              currentTurnPlayerId: nextPlayer.id,
              currentPosition: nextPlayer.position,
              players: playersWithCost,
              pendingSacrifice: null,
              currentAction: null,
              currentBlock: null,
              currentChallenge: null,
              passedPlayerIds: [],
              logs: [sacrificeLog, ...publicState.logs].slice(0, 50),
              updatedAt: now,
            });
            trackChakrantoSacrifice({ roomId, isElimination: isEliminated });
            trackChakrantoActionResolved({ roomId, action: 'ghar_motkano', coinsSpent: 3 });
            return;
          }
        }
      }
    }

    // Case 3: FAILED_CHALLENGE
    if (reason === 'FAILED_CHALLENGE') {
      if (challengeContext === 'BLOCK') {
        // Actor challenged blocker and lost (blocker was truthful) -> Block succeeded!
        const nextPlayer = getNextAlivePosition(publicState.currentPosition, updatedPlayers);
        transaction.update(publicRef, {
          phase: 'TURN_ACTIVE',
          turnNumber: publicState.turnNumber + 1,
          currentTurnPlayerId: nextPlayer.id,
          currentPosition: nextPlayer.position,
          players: updatedPlayers,
          pendingSacrifice: null,
          currentAction: null,
          currentBlock: null,
          currentChallenge: null,
          passedPlayerIds: [],
          logs: [sacrificeLog, ...publicState.logs].slice(0, 50),
          updatedAt: now,
        });
        trackChakrantoSacrifice({ roomId, isElimination: isEliminated });
        trackChakrantoBlock({ roomId, successful: true });
        return;
      }

      if (challengeContext === 'ACTION' && currentAction) {
        // Challenger lost challenge against actor (actor was truthful)
        const action = currentAction.action;
        const actorId = currentAction.actorPlayerId;
        const targetId = currentAction.targetPlayerId;
        const actor = updatedPlayers.find((p) => p.id === actorId);

        // 1. Birbikrom Bhata: unblockable -> resolves immediately (+3 coins)
        if (action === 'birbikrom_bhata') {
          const playersWithCoins = updatedPlayers.map((p) =>
            p.id === actorId ? { ...p, coins: p.coins + 3 } : p
          );
          const nextPlayer = getNextAlivePosition(publicState.currentPosition, playersWithCoins);
          const log: ChakrantoEventLog = {
            id: createLogId(),
            turnNumber: publicState.turnNumber,
            timestamp: now,
            type: 'ACTION',
            message: `${actor?.name || 'Actor'} collected Biratwo Bhata (+3 coins) after winning challenge.`,
            actorName: actor?.name,
          };
          transaction.update(publicRef, {
            phase: 'TURN_ACTIVE',
            turnNumber: publicState.turnNumber + 1,
            currentTurnPlayerId: nextPlayer.id,
            currentPosition: nextPlayer.position,
            players: playersWithCoins,
            pendingSacrifice: null,
            currentAction: null,
            currentBlock: null,
            currentChallenge: null,
            passedPlayerIds: [],
            logs: [log, sacrificeLog, ...publicState.logs].slice(0, 50),
            updatedAt: now,
          });
          trackChakrantoSacrifice({ roomId, isElimination: isEliminated });
          trackChakrantoActionResolved({ roomId, action: 'birbikrom_bhata', coinsGenerated: 3 });
          return;
        }

        // 2. Shadhbodol: unblockable -> proceeds to Shadhbodol card selection
        if (action === 'shadhbodol') {
          let deck = [...authState.drawDeck];
          let discard = [...authState.discardPile];
          if (deck.length < 2) {
            deck = [...deck, ...shuffleDeck(discard)];
            discard = [];
          }
          const drawn1 = deck.pop()!;
          const drawn2 = deck.pop()!;
          const actorHand = authState.playerHands[actorId] || [];

          transaction.update(authRef, {
            drawDeck: deck,
            discardPile: discard,
            shadhbodolActiveHand: {
              userId: actorId,
              originalCards: actorHand,
              drawnCards: [drawn1, drawn2],
            },
            updatedAt: now,
          });

          const actorPrivRef = doc(db, 'rooms', roomId, 'chakrantoViews', actorId);
          transaction.update(actorPrivRef, {
            shadhbodolOptions: [...actorHand, drawn1, drawn2],
            updatedAt: now,
          });

          const log: ChakrantoEventLog = {
            id: createLogId(),
            turnNumber: publicState.turnNumber,
            timestamp: now,
            type: 'ACTION',
            message: `${actor?.name || 'Actor'} is performing Shadbodol after winning challenge.`,
            actorName: actor?.name,
          };

          transaction.update(publicRef, {
            phase: 'SHADHBODOL_SELECTION',
            players: updatedPlayers,
            pendingSacrifice: null,
            currentChallenge: null,
            passedPlayerIds: [],
            logs: [log, sacrificeLog, ...publicState.logs].slice(0, 50),
            updatedAt: now,
          });
          trackChakrantoSacrifice({ roomId, isElimination: isEliminated });
          trackChakrantoActionResolved({ roomId, action: 'shadhbodol' });
          return;
        }

        // 3. Blockable actions (roptani, dakati, ghar_motkano):
        // Check if target is eliminated for targeted actions
        if (targetId) {
          const targetPlayer = updatedPlayers.find((p) => p.id === targetId);
          if (targetPlayer?.isEliminated) {
            // Target is dead -> action cannot continue
            const nextPlayer = getNextAlivePosition(publicState.currentPosition, updatedPlayers);
            transaction.update(publicRef, {
              phase: 'TURN_ACTIVE',
              turnNumber: publicState.turnNumber + 1,
              currentTurnPlayerId: nextPlayer.id,
              currentPosition: nextPlayer.position,
              players: updatedPlayers,
              pendingSacrifice: null,
              currentAction: null,
              currentBlock: null,
              currentChallenge: null,
              passedPlayerIds: [],
              logs: [sacrificeLog, ...publicState.logs].slice(0, 50),
              updatedAt: now,
            });
            trackChakrantoSacrifice({ roomId, isElimination: isEliminated });
            return;
          }
        }

        // Original action remains active and pending response!
        // Target can now block or pass.
        transaction.update(publicRef, {
          phase: 'ACTION_PENDING_RESPONSE',
          players: updatedPlayers,
          currentAction: {
            ...currentAction,
            isClaimVerified: true,
          },
          currentBlock: null,
          currentChallenge: null,
          pendingSacrifice: null,
          passedPlayerIds: [],
          logs: [sacrificeLog, ...publicState.logs].slice(0, 50),
          updatedAt: now,
        });
        trackChakrantoSacrifice({ roomId, isElimination: isEliminated });
        return;
      }
    }

    // Default fallback: advance turn
    const nextPlayer = getNextAlivePosition(publicState.currentPosition, updatedPlayers);
    transaction.update(publicRef, {
      phase: 'TURN_ACTIVE',
      turnNumber: publicState.turnNumber + 1,
      currentTurnPlayerId: nextPlayer.id,
      currentPosition: nextPlayer.position,
      players: updatedPlayers,
      pendingSacrifice: null,
      currentAction: null,
      currentBlock: null,
      currentChallenge: null,
      passedPlayerIds: [],
      logs: [sacrificeLog, ...publicState.logs].slice(0, 50),
      updatedAt: now,
    });
    trackChakrantoSacrifice({ roomId, isElimination: isEliminated });
  });
}

/**
 * Submits card selection for Petukchondro's Shadhbodol action.
 */
export async function submitChakrantoShadhbodolKeep(
  roomId: string,
  actingUid: string,
  keptCardIds: string[]
): Promise<void> {
  const publicRef = doc(db, 'rooms', roomId, 'chakrantoPublic', 'state');
  const authRef = doc(db, 'rooms', roomId, 'chakrantoAuthoritative', 'state');

  await runTransaction(db, async (transaction) => {
    const publicSnap = await transaction.get(publicRef);
    const authSnap = await transaction.get(authRef);

    if (!publicSnap.exists() || !authSnap.exists()) {
      throw new Error('Game session documents not found.');
    }

    const publicState = publicSnap.data() as ChakrantoPublicState;
    const authState = authSnap.data() as ChakrantoAuthoritativeState;
    const now = new Date().toISOString();

    if (
      publicState.phase !== 'SHADHBODOL_SELECTION' ||
      publicState.currentTurnPlayerId !== actingUid ||
      !authState.shadhbodolActiveHand
    ) {
      throw new Error('Not in Shadbodol selection phase.');
    }

    const player = publicState.players.find((p) => p.id === actingUid)!;
    const requiredKeepCount = player.activeCardCount; // 2 or 1

    if (keptCardIds.length !== requiredKeepCount) {
      throw new Error(`You must select exactly ${requiredKeepCount} cards to keep.`);
    }

    const allOptions = [
      ...authState.shadhbodolActiveHand.originalCards,
      ...authState.shadhbodolActiveHand.drawnCards,
    ];

    const keptCards = allOptions.filter((c) => keptCardIds.includes(c.id));
    const returnedCards = allOptions.filter((c) => !keptCardIds.includes(c.id));

    // Return unselected cards to draw deck and shuffle
    const newDrawDeck = shuffleDeck([...authState.drawDeck, ...returnedCards]);

    transaction.update(authRef, {
      playerHands: { ...authState.playerHands, [actingUid]: keptCards },
      drawDeck: newDrawDeck,
      shadhbodolActiveHand: null,
      updatedAt: now,
    });

    const privRef = doc(db, 'rooms', roomId, 'chakrantoViews', actingUid);
    transaction.update(privRef, {
      activeCards: keptCards,
      shadhbodolOptions: [],
      updatedAt: now,
    });

    const nextPlayer = getNextAlivePosition(publicState.currentPosition, publicState.players);
    const log: ChakrantoEventLog = {
      id: createLogId(),
      turnNumber: publicState.turnNumber,
      timestamp: now,
      type: 'ACTION',
      message: `${player.name} completed Shadbodol and returned cards to the deck.`,
      actorName: player.name,
    };

    transaction.update(publicRef, {
      phase: 'TURN_ACTIVE',
      turnNumber: publicState.turnNumber + 1,
      currentTurnPlayerId: nextPlayer.id,
      currentPosition: nextPlayer.position,
      currentAction: null,
      passedPlayerIds: [],
      logs: [log, ...publicState.logs].slice(0, 50),
      updatedAt: now,
    });
  });
}

/**
 * Subscribes to real-time public game session and private player view.
 */
export function subscribeToChakrantoSession(
  roomId: string,
  userId: string,
  onPublicUpdate: (state: ChakrantoPublicState | null) => void,
  onPrivateUpdate: (view: ChakrantoPrivateView | null) => void,
  onError?: (err: Error) => void
): () => void {
  const publicRef = doc(db, 'rooms', roomId, 'chakrantoPublic', 'state');
  const privateRef = doc(db, 'rooms', roomId, 'chakrantoViews', userId);

  const unsubPublic = onSnapshot(
    publicRef,
    (snap) => {
      if (snap.exists()) {
        onPublicUpdate(snap.data() as ChakrantoPublicState);
      } else {
        onPublicUpdate(null);
      }
    },
    (err) => {
      console.error('Chakranto public listener error:', err);
      if (onError) onError(err);
    }
  );

  const unsubPrivate = onSnapshot(
    privateRef,
    (snap) => {
      if (snap.exists()) {
        onPrivateUpdate(snap.data() as ChakrantoPrivateView);
      } else {
        onPrivateUpdate(null);
      }
    },
    (err) => {
      console.error('Chakranto private listener error:', err);
      if (onError) onError(err);
    }
  );

  return () => {
    unsubPublic();
    unsubPrivate();
  };
}
