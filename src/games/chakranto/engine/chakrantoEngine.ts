/**
 * CHAKRANTO - Pure Authoritative Game Engine
 * Implements deterministic rules, card state mutations, bluff validation,
 * challenge resolution, turn progression, and standings computation.
 */

import {
  CHAKRANTO_POSITIONS,
  ChakrantoActionType,
  ChakrantoCardItem,
  ChakrantoCharacter,
  ChakrantoPlayerPublic,
  ChakrantoPosition,
  ChakrantoPublicState,
  ChakrantoStanding,
} from '../types';
import { CHAKRANTO_ACTIONS, CHAKRANTO_CHARACTERS } from '../assets/chakrantoAssets';

export const ALL_CHARACTERS: readonly ChakrantoCharacter[] = [
  'brahmodoetto',
  'kalu_dakat',
  'petukchondro',
  'bir_bikrom',
  'ginner_badsha',
] as const;

export const COPIES_PER_CHARACTER = 3; // 5 x 3 = 15 cards total

/**
 * Creates a fresh, full 15-card deck for Chakranto.
 */
export function generateChakrantoDeck(): ChakrantoCardItem[] {
  const deck: ChakrantoCardItem[] = [];
  ALL_CHARACTERS.forEach((char) => {
    for (let i = 1; i <= COPIES_PER_CHARACTER; i++) {
      deck.push({
        id: `${char}_${i}`,
        character: char,
      });
    }
  });
  return deck;
}

/**
 * Shuffles an array of cards using Fisher-Yates.
 */
export function shuffleDeck<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Randomly assigns positions (A, B, C, D, E, F) to the room players.
 */
export function assignInitialPositions(
  roomPlayers: Array<{ id: string; tekkaName: string; avatarUrl?: string; photoURL?: string }>
): ChakrantoPlayerPublic[] {
  const shuffled = shuffleDeck(roomPlayers);
  return shuffled.map((p, idx) => {
    const player: ChakrantoPlayerPublic = {
      id: p.id,
      name: p.tekkaName,
      position: CHAKRANTO_POSITIONS[idx],
      seatIndex: idx,
      coins: 0,
      activeCardCount: 2,
      sacrificedCards: [],
      isEliminated: false,
      isOnline: true,
    };
    const avatar = p.avatarUrl || p.photoURL;
    if (avatar) {
      player.avatarUrl = avatar;
    }
    return player;
  });
}

/**
 * Deals 2 secret cards to each player from a shuffled 15-card deck.
 */
export function dealInitialCards(
  playerIds: string[],
  seedDeck?: ChakrantoCardItem[]
): {
  playerHands: Record<string, ChakrantoCardItem[]>;
  drawDeck: ChakrantoCardItem[];
} {
  const deck = seedDeck ? [...seedDeck] : shuffleDeck(generateChakrantoDeck());
  const playerHands: Record<string, ChakrantoCardItem[]> = {};

  playerIds.forEach((pid) => {
    playerHands[pid] = [deck.pop()!, deck.pop()!];
  });

  return {
    playerHands,
    drawDeck: deck,
  };
}

/**
 * Determines the clockwise next alive player position.
 */
export function getNextAlivePosition(
  currentPos: ChakrantoPosition,
  players: ChakrantoPlayerPublic[]
): ChakrantoPlayerPublic {
  const sortedPlayers = [...players].sort((a, b) => a.seatIndex - b.seatIndex);
  const currentIndex = sortedPlayers.findIndex((p) => p.position === currentPos);
  const total = sortedPlayers.length;

  for (let i = 1; i <= total; i++) {
    const nextPlayer = sortedPlayers[(currentIndex + i) % total];
    if (!nextPlayer.isEliminated && nextPlayer.activeCardCount > 0) {
      return nextPlayer;
    }
  }

  // Fallback to current if only one survivor
  return sortedPlayers[currentIndex];
}

/**
 * Validates whether a player can perform a specific turn action.
 */
export function validateActionLegality(
  action: ChakrantoActionType,
  actor: ChakrantoPlayerPublic,
  target?: ChakrantoPlayerPublic | null
): { allowed: boolean; reason?: string } {
  if (actor.isEliminated || actor.activeCardCount <= 0) {
    return { allowed: false, reason: 'Eliminated players cannot perform actions.' };
  }

  // Strict Rule: At 10+ coins, the ONLY action available is Hottaya!
  if (actor.coins >= 10 && action !== 'hottaya') {
    return {
      allowed: false,
      reason: 'Holding 10 or more coins mandates executing Hottaya (7 coins).',
    };
  }

  // Hottaya requires at least 7 coins
  if (action === 'hottaya') {
    if (actor.coins < 7) {
      return { allowed: false, reason: 'Hottaya requires at least 7 coins.' };
    }
    if (!target || target.isEliminated || target.id === actor.id) {
      return { allowed: false, reason: 'Hottaya requires targeting another living player.' };
    }
  }

  // Ghar Motkano (Brahmodoetto) requires at least 3 coins
  if (action === 'ghar_motkano') {
    if (actor.coins < 3) {
      return { allowed: false, reason: 'Ghar Motkano requires at least 3 coins.' };
    }
    if (!target || target.isEliminated || target.id === actor.id) {
      return { allowed: false, reason: 'Ghar Motkano requires targeting another living player.' };
    }
  }

  // Dakati (Kalu Dakat) requires target to have >= 2 coins
  if (action === 'dakati') {
    if (!target || target.isEliminated || target.id === actor.id) {
      return { allowed: false, reason: 'Dakati requires targeting another living player.' };
    }
    if (target.coins < 2) {
      return {
        allowed: false,
        reason: 'Target player has less than 2 coins; Dakati cannot be declared against them.',
      };
    }
  }

  return { allowed: true };
}

/**
 * Evaluates whether a challenged player actually holds the claimed character.
 */
export function evaluateChallengeClaim(
  defenderCards: ChakrantoCardItem[],
  claimedCharacter: ChakrantoCharacter
): {
  isTruthful: boolean;
  matchingCard?: ChakrantoCardItem;
} {
  const matchingCard = defenderCards.find((c) => c.character === claimedCharacter);
  return {
    isTruthful: !!matchingCard,
    matchingCard,
  };
}

/**
 * Draws a replacement card from the draw deck (or reshuffles discard pile if draw deck is empty).
 * Tags the newly drawn card with `drawnAtTurn: turnNumber` so it cannot be played during the same turn.
 */
export function drawReplacementCard(
  drawDeck: ChakrantoCardItem[],
  discardPile: ChakrantoCardItem[],
  turnNumber: number
): {
  card: ChakrantoCardItem;
  newDrawDeck: ChakrantoCardItem[];
  newDiscardPile: ChakrantoCardItem[];
} {
  let deck = [...drawDeck];
  let discard = [...discardPile];

  if (deck.length === 0) {
    if (discard.length === 0) {
      // Re-generate fresh deck if both empty
      deck = shuffleDeck(generateChakrantoDeck());
    } else {
      deck = shuffleDeck(discard);
      discard = [];
    }
  }

  const drawn = deck.pop()!;
  const cardWithTurn: ChakrantoCardItem = {
    ...drawn,
    drawnAtTurn: turnNumber,
  };

  return {
    card: cardWithTurn,
    newDrawDeck: deck,
    newDiscardPile: discard,
  };
}

/**
 * Calculates final standings and rankings (1st to 6th) upon match conclusion.
 * 1st place: Survivor.
 * 2nd place: Last player eliminated.
 * 3rd to Nth: In descending order of elimination order.
 */
export function calculateChakrantoStandings(
  players: ChakrantoPlayerPublic[]
): ChakrantoStanding[] {
  const sorted = [...players].sort((a, b) => {
    // Survivor first
    if (!a.isEliminated && b.isEliminated) return -1;
    if (a.isEliminated && !b.isEliminated) return 1;
    
    // Higher eliminatedAtOrder means eliminated later -> higher rank
    const aOrder = a.eliminatedAtOrder || 0;
    const bOrder = b.eliminatedAtOrder || 0;
    if (aOrder !== bOrder) return bOrder - aOrder;

    // Tie breaker: Coins then sacrifices
    return b.coins - a.coins;
  });

  return sorted.map((p, index) => {
    const rank = index + 1;
    let rankLabel = `${rank}th Place`;
    if (rank === 1) rankLabel = '1st Place (Champion)';
    if (rank === 2) rankLabel = '2nd Place (Runner-up)';
    if (rank === 3) rankLabel = '3rd Place';

    return {
      playerId: p.id,
      playerName: p.name,
      position: p.position,
      rank,
      rankLabel,
      isWinner: rank === 1,
      sacrificedCount: p.sacrificedCards.length,
      finalCoins: p.coins,
    };
  });
}

/**
 * Consumes and replaces a character card from player's hand IMMEDIATELY at action declaration
 * if the player actually possesses the claimed character.
 * If the player is bluffing (does not possess the card), no card is consumed or replaced.
 */
export function consumeAndReplaceOnActionDeclaration(
  playerHands: Record<string, ChakrantoCardItem[]>,
  drawDeck: ChakrantoCardItem[],
  discardPile: ChakrantoCardItem[],
  actorId: string,
  claimedCharacter?: ChakrantoCharacter,
  turnNumber?: number
): {
  newHands: Record<string, ChakrantoCardItem[]>;
  newDrawDeck: ChakrantoCardItem[];
  newDiscardPile: ChakrantoCardItem[];
  consumed: boolean;
  consumedCard?: ChakrantoCardItem;
  replacementCard?: ChakrantoCardItem;
  newActorHand: ChakrantoCardItem[];
} {
  const actorHand = playerHands[actorId] || [];
  if (!claimedCharacter) {
    return {
      newHands: playerHands,
      newDrawDeck: drawDeck,
      newDiscardPile: discardPile,
      consumed: false,
      newActorHand: actorHand,
    };
  }

  const matchingCard = actorHand.find((c) => c.character === claimedCharacter);
  if (!matchingCard) {
    // Player bluffed -> does not possess the card -> no consumption or replacement
    return {
      newHands: playerHands,
      newDrawDeck: drawDeck,
      newDiscardPile: discardPile,
      consumed: false,
      newActorHand: actorHand,
    };
  }

  // Player actually possesses the claimed character -> immediately consume and replace!
  const remainingHand = actorHand.filter((c) => c.id !== matchingCard.id);
  const replacement = drawReplacementCard(
    drawDeck,
    [...discardPile, matchingCard],
    turnNumber || 1
  );
  const newActorHand = [...remainingHand, replacement.card];

  return {
    newHands: {
      ...playerHands,
      [actorId]: newActorHand,
    },
    newDrawDeck: replacement.newDrawDeck,
    newDiscardPile: replacement.newDiscardPile,
    consumed: true,
    consumedCard: matchingCard,
    replacementCard: replacement.card,
    newActorHand,
  };
}

/**
 * Consumes and replaces a character card from player's hand when successfully used.
 * If the player was bluffing and not challenged, keeps hand intact.
 * If already verified and replaced during challenge resolution, does not replace again.
 */
export function consumeAndReplaceClaimedCardIfNeeded(
  playerHands: Record<string, ChakrantoCardItem[]>,
  drawDeck: ChakrantoCardItem[],
  discardPile: ChakrantoCardItem[],
  actorId: string,
  claimedCharacter?: ChakrantoCharacter,
  isClaimVerified?: boolean,
  turnNumber?: number
): {
  newHands: Record<string, ChakrantoCardItem[]>;
  newDrawDeck: ChakrantoCardItem[];
  newDiscardPile: ChakrantoCardItem[];
  replaced: boolean;
  newActorHand: ChakrantoCardItem[];
} {
  if (!claimedCharacter || isClaimVerified) {
    return {
      newHands: playerHands,
      newDrawDeck: drawDeck,
      newDiscardPile: discardPile,
      replaced: false,
      newActorHand: playerHands[actorId] || [],
    };
  }

  const actorHand = playerHands[actorId] || [];
  const matchingCard = actorHand.find((c) => c.character === claimedCharacter);
  if (!matchingCard) {
    // Player bluffed and was uncalled -> keep existing hand
    return {
      newHands: playerHands,
      newDrawDeck: drawDeck,
      newDiscardPile: discardPile,
      replaced: false,
      newActorHand: actorHand,
    };
  }

  const remainingHand = actorHand.filter((c) => c.id !== matchingCard.id);
  const replacement = drawReplacementCard(
    drawDeck,
    [...discardPile, matchingCard],
    turnNumber || 1
  );
  const newActorHand = [...remainingHand, replacement.card];

  return {
    newHands: {
      ...playerHands,
      [actorId]: newActorHand,
    },
    newDrawDeck: replacement.newDrawDeck,
    newDiscardPile: replacement.newDiscardPile,
    replaced: true,
    newActorHand,
  };
}

export interface ChakrantoPlayerInstructionInfo {
  headline: string;
  detail: string;
  isActor: boolean;
  isTarget: boolean;
  isBlocker: boolean;
  canBlock: boolean;
  canChallenge: boolean;
  canPass: boolean;
  availableBlockChars: ChakrantoCharacter[];
}

/**
 * Computes player-specific instruction and actionable controls based on viewer's identity.
 */
export function getChakrantoPlayerInstruction(
  publicState: ChakrantoPublicState,
  viewerUserId: string
): ChakrantoPlayerInstructionInfo {
  const me = publicState.players.find((p) => p.id === viewerUserId);
  const isActionPending = publicState.phase === 'ACTION_PENDING_RESPONSE';
  const isBlockPending = publicState.phase === 'BLOCK_PENDING_RESPONSE';
  const currentAction = publicState.currentAction;
  const currentBlock = publicState.currentBlock;

  const defaultRes: ChakrantoPlayerInstructionInfo = {
    headline: '',
    detail: '',
    isActor: false,
    isTarget: false,
    isBlocker: false,
    canBlock: false,
    canChallenge: false,
    canPass: false,
    availableBlockChars: [],
  };

  if (!me || me.isEliminated) return defaultRes;

  if (isBlockPending && currentBlock && currentAction) {
    const isActor = currentAction.actorPlayerId === viewerUserId;
    const isBlocker = currentBlock.blockerPlayerId === viewerUserId;
    const blocker = publicState.players.find((p) => p.id === currentBlock.blockerPlayerId);
    const actor = publicState.players.find((p) => p.id === currentAction.actorPlayerId);
    const blockerName = blocker ? blocker.name : 'Opponent';
    const actorName = actor ? actor.name : 'Opponent';
    const blockCharMeta = CHAKRANTO_CHARACTERS[currentBlock.claimedCharacter];

    if (isActor) {
      return {
        headline: `${blockerName} is attempting to block your ${currentBlock.targetAction.toUpperCase()} by claiming ${blockCharMeta.name}.`,
        detail: 'Do you believe them, or do you want to call their BLUFF?',
        isActor: true,
        isTarget: false,
        isBlocker: false,
        canBlock: false,
        canChallenge: true, // ONLY the action actor can challenge the block
        canPass: true,      // Actor can accept the block
        availableBlockChars: [],
      };
    }

    if (isBlocker) {
      return {
        headline: `You declared a block claiming ${blockCharMeta.name} (${blockCharMeta.bengaliName}) against ${actorName}'s ${currentBlock.targetAction.toUpperCase()}.`,
        detail: `Waiting for ${actorName} to accept or challenge your block...`,
        isActor: false,
        isTarget: true,
        isBlocker: true,
        canBlock: false,
        canChallenge: false,
        canPass: false,
        availableBlockChars: [],
      };
    }

    // Third-party viewer (C, D, E)
    return {
      headline: `${blockerName} is attempting to block ${actorName}'s ${currentBlock.targetAction.toUpperCase()} by claiming ${blockCharMeta.name}.`,
      detail: `Waiting for ${actorName} to accept or challenge the block...`,
      isActor: false,
      isTarget: false,
      isBlocker: false,
      canBlock: false,
      canChallenge: false,
      canPass: false,
      availableBlockChars: [],
    };
  }

  if (isActionPending && currentAction) {
    const isActor = currentAction.actorPlayerId === viewerUserId;
    const isTarget = currentAction.targetPlayerId === viewerUserId;
    const actor = publicState.players.find((p) => p.id === currentAction.actorPlayerId);
    const target = currentAction.targetPlayerId
      ? publicState.players.find((p) => p.id === currentAction.targetPlayerId)
      : null;
    const actorName = actor ? actor.name : 'Opponent';
    const targetName = target ? target.name : 'Opponent';
    const actionMeta = CHAKRANTO_ACTIONS[currentAction.action];

    if (isActor) {
      const headline = target
        ? `You are trying to ${actionMeta.name} on ${targetName}.`
        : `You declared ${actionMeta.name}.`;
      return {
        headline,
        detail: 'Waiting for opponents to challenge, block, or pass.',
        isActor: true,
        isTarget: false,
        isBlocker: false,
        canBlock: false,
        canChallenge: false,
        canPass: false,
        availableBlockChars: [],
      };
    }

    // Available block characters
    const availableBlockChars: ChakrantoCharacter[] = [];
    if (currentAction.action === 'roptani') {
      // Any living opponent can block Roptani with Bir Bikrom
      availableBlockChars.push('bir_bikrom');
    } else if (currentAction.action === 'dakati' && isTarget) {
      // Target only can block Dakati with Kalu Dakat or Petukchondro
      availableBlockChars.push('kalu_dakat', 'petukchondro');
    } else if (currentAction.action === 'ghar_motkano' && isTarget) {
      // Target only can block Ghar Motkano with Ginner Badsha
      availableBlockChars.push('ginner_badsha');
    }

    const canBlock = availableBlockChars.length > 0;
    const canChallenge = !currentAction.isClaimVerified && !!currentAction.claimedCharacter;
    const canPass = true;

    if (isTarget) {
      const charClaimText = currentAction.claimedCharacter
        ? ` claiming ${CHAKRANTO_CHARACTERS[currentAction.claimedCharacter].name}`
        : '';
      const headline = `${actorName} is trying to ${actionMeta.name}${charClaimText} on you!`;
      const detail = currentAction.isClaimVerified
        ? 'This character claim was challenged and proven truthful. The action is now active — you may declare a block or pass.'
        : actionMeta.description;

      return {
        headline,
        detail,
        isActor: false,
        isTarget: true,
        isBlocker: false,
        canBlock,
        canChallenge,
        canPass,
        availableBlockChars,
      };
    }

    // Third-party viewer (C, D, E)
    const charClaimText = currentAction.claimedCharacter
      ? ` claiming ${CHAKRANTO_CHARACTERS[currentAction.claimedCharacter].name}`
      : '';
    const headline = target
      ? `${actorName} is trying to ${actionMeta.name}${charClaimText} on ${targetName}.`
      : `${actorName} declared ${actionMeta.name}${charClaimText}.`;
    const detail = currentAction.isClaimVerified
      ? 'This character claim was challenged and proven truthful.'
      : actionMeta.description;

    return {
      headline,
      detail,
      isActor: false,
      isTarget: false,
      isBlocker: false,
      canBlock, // true only for Roptani
      canChallenge,
      canPass,
      availableBlockChars,
    };
  }

  return defaultRes;
}
