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
  ChakrantoStanding,
} from '../types';

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
