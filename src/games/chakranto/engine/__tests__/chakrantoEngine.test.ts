/**
 * CHAKRANTO Game Engine Unit Tests
 */

import {
  generateChakrantoDeck,
  shuffleDeck,
  assignInitialPositions,
  dealInitialCards,
  getNextAlivePosition,
  validateActionLegality,
  evaluateChallengeClaim,
  drawReplacementCard,
  calculateChakrantoStandings,
  consumeAndReplaceClaimedCardIfNeeded,
  consumeAndReplaceOnActionDeclaration,
  getChakrantoPlayerInstruction,
  ALL_CHARACTERS,
  COPIES_PER_CHARACTER,
} from '../chakrantoEngine';
import { CHAKRANTO_ACTIONS } from '../../assets/chakrantoAssets';
import { ChakrantoPlayerPublic } from '../../types';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Test assertion failed: ${msg}`);
  }
}

console.log('--- Starting Chakranto Game Engine Tests ---');

// 0. Test Action Definitions & Rewards (Ayy = +1, Roptani = +2, Birbikrom Bhata = +3)
assert(CHAKRANTO_ACTIONS.ayy.coinGain === 1, `Ayy must give +1 coin, got ${CHAKRANTO_ACTIONS.ayy.coinGain}`);
assert(CHAKRANTO_ACTIONS.ayy.coinCost === 0, 'Ayy cost must be 0');
assert(CHAKRANTO_ACTIONS.ayy.isChallengeable === false, 'Ayy cannot be challenged');
assert(CHAKRANTO_ACTIONS.ayy.isBlockable === false, 'Ayy cannot be blocked');

assert(CHAKRANTO_ACTIONS.roptani.coinGain === 2, `Roptani must give +2 coins, got ${CHAKRANTO_ACTIONS.roptani.coinGain}`);
assert(CHAKRANTO_ACTIONS.roptani.coinCost === 0, 'Roptani cost must be 0');
assert(CHAKRANTO_ACTIONS.roptani.isChallengeable === false, 'Roptani cannot be challenged');
assert(CHAKRANTO_ACTIONS.roptani.isBlockable === true, 'Roptani can be blocked by Bir Bikrom');

assert(CHAKRANTO_ACTIONS.birbikrom_bhata.coinGain === 3, `Birbikrom Bhata must give +3 coins, got ${CHAKRANTO_ACTIONS.birbikrom_bhata.coinGain}`);
assert(CHAKRANTO_ACTIONS.birbikrom_bhata.coinCost === 0, 'Birbikrom Bhata cost must be 0');
assert(CHAKRANTO_ACTIONS.birbikrom_bhata.isChallengeable === true, 'Birbikrom Bhata can be challenged');
assert(CHAKRANTO_ACTIONS.birbikrom_bhata.isBlockable === false, 'Birbikrom Bhata cannot be blocked');

assert(CHAKRANTO_ACTIONS.dakati.coinGain === 2, 'Dakati steals 2 coins');
assert(CHAKRANTO_ACTIONS.ghar_motkano.coinCost === 3, 'Ghar Motkano costs 3 coins');
assert(CHAKRANTO_ACTIONS.hottaya.coinCost === 7, 'Hottaya costs 7 coins');
console.log('✓ Action definitions verified: Ayy (+1 coin), Roptani (+2 coins), Birbikrom Bhata (+3 coins), Dakati (Steal 2), Ghar Motkano (Cost 3), Hottaya (Cost 7)');

// 1. Test Deck Generation
const deck = generateChakrantoDeck();
assert(deck.length === 15, `Expected 15 cards in deck, got ${deck.length}`);
ALL_CHARACTERS.forEach((char) => {
  const count = deck.filter((c) => c.character === char).length;
  assert(count === COPIES_PER_CHARACTER, `Expected 3 copies of ${char}, got ${count}`);
});
console.log('✓ 15-card deck generated with exactly 3 copies per character');

// 2. Test Initial Dealing for 3 to 6 players
const players4 = [
  { id: 'u1', tekkaName: 'Player1' },
  { id: 'u2', tekkaName: 'Player2' },
  { id: 'u3', tekkaName: 'Player3' },
  { id: 'u4', tekkaName: 'Player4' },
];
const initialDeal = dealInitialCards(players4.map((p) => p.id));
assert(Object.keys(initialDeal.playerHands).length === 4, 'Expected 4 hands');
assert(initialDeal.drawDeck.length === 7, `Expected 15 - 8 = 7 cards remaining, got ${initialDeal.drawDeck.length}`);
Object.values(initialDeal.playerHands).forEach((hand) => {
  assert(hand.length === 2, `Expected 2 cards in hand, got ${hand.length}`);
});
console.log('✓ Initial 2-card deal verified for 4 players');

// 3. Test Positions Assignment (A, B, C, D)
const publicPositions = assignInitialPositions(players4);
assert(publicPositions.length === 4, 'Expected 4 positioned players');
const assignedPosLetters = publicPositions.map((p) => p.position);
assert(assignedPosLetters.includes('A') && assignedPosLetters.includes('B') && assignedPosLetters.includes('C') && assignedPosLetters.includes('D'), 'Positions A, B, C, D assigned');
console.log('✓ Positions A, B, C, D randomly assigned');

// 4. Test Clockwise Next Alive Position (and skipping eliminated)
const testPlayers: ChakrantoPlayerPublic[] = [
  { id: 'u1', name: 'P1', position: 'A', seatIndex: 0, coins: 2, activeCardCount: 2, sacrificedCards: [], isEliminated: false },
  { id: 'u2', name: 'P2', position: 'B', seatIndex: 1, coins: 0, activeCardCount: 0, sacrificedCards: ['brahmodoetto', 'kalu_dakat'], isEliminated: true },
  { id: 'u3', name: 'P3', position: 'C', seatIndex: 2, coins: 5, activeCardCount: 1, sacrificedCards: ['petukchondro'], isEliminated: false },
  { id: 'u4', name: 'P4', position: 'D', seatIndex: 3, coins: 1, activeCardCount: 2, sacrificedCards: [], isEliminated: false },
];

const nextFromA = getNextAlivePosition('A', testPlayers);
assert(nextFromA.position === 'C', `Expected turn to skip eliminated B and advance to C, got ${nextFromA.position}`);
const nextFromC = getNextAlivePosition('C', testPlayers);
assert(nextFromC.position === 'D', `Expected turn to advance to D, got ${nextFromC.position}`);
const nextFromD = getNextAlivePosition('D', testPlayers);
assert(nextFromD.position === 'A', `Expected turn to wrap to A, got ${nextFromD.position}`);
console.log('✓ Clockwise turn progression with elimination skip verified');

// 5. Test Action Legality (10+ coins mandatory Hottaya, Ghar Motkano >= 3 coins, Dakati target >= 2 coins)
const richPlayer: ChakrantoPlayerPublic = {
  id: 'u1', name: 'Rich', position: 'A', seatIndex: 0, coins: 10, activeCardCount: 2, sacrificedCards: [], isEliminated: false
};
const targetP: ChakrantoPlayerPublic = {
  id: 'u3', name: 'Target', position: 'C', seatIndex: 2, coins: 3, activeCardCount: 2, sacrificedCards: [], isEliminated: false
};
const poorTarget: ChakrantoPlayerPublic = {
  id: 'u4', name: 'Poor', position: 'D', seatIndex: 3, coins: 1, activeCardCount: 2, sacrificedCards: [], isEliminated: false
};

const roptaniWhen10Coins = validateActionLegality('roptani', richPlayer, targetP);
assert(!roptaniWhen10Coins.allowed, 'Roptani must be rejected when player has 10+ coins');

const hottayaWhen10Coins = validateActionLegality('hottaya', richPlayer, targetP);
assert(hottayaWhen10Coins.allowed, 'Hottaya must be allowed when player has 10+ coins');

const dakatiPoorTarget = validateActionLegality('dakati', { ...richPlayer, coins: 2 }, poorTarget);
assert(!dakatiPoorTarget.allowed, 'Dakati must be rejected against target with < 2 coins');

const dakatiRichTarget = validateActionLegality('dakati', { ...richPlayer, coins: 2 }, targetP);
assert(dakatiRichTarget.allowed, 'Dakati must be allowed against target with >= 2 coins');
console.log('✓ Action legality & 10+ coin mandatory Hottaya verified');

// 6. Test Challenge Evaluation
const handWithKalu = [
  { id: 'kalu_dakat_1', character: 'kalu_dakat' as const },
  { id: 'bir_bikrom_1', character: 'bir_bikrom' as const },
];
const truthfulResult = evaluateChallengeClaim(handWithKalu, 'kalu_dakat');
assert(truthfulResult.isTruthful === true, 'Claim of Kalu Dakat should be truthful');
assert(truthfulResult.matchingCard?.id === 'kalu_dakat_1', 'Matching card returned');

const bluffResult = evaluateChallengeClaim(handWithKalu, 'brahmodoetto');
assert(bluffResult.isTruthful === false, 'Claim of Brahmodoetto should be a bluff');
console.log('✓ Challenge evaluation for truth vs bluff verified');

// 7. Test Replacement Card Drawing & Turn Tagging
const replacement = drawReplacementCard(initialDeal.drawDeck, [], 3);
assert(replacement.card.drawnAtTurn === 3, 'Replacement card tagged with drawn turn number');
console.log('✓ Replacement card tagged with current turn number');

// 8. Test Standings Calculation
const finalPlayers: ChakrantoPlayerPublic[] = [
  { id: 'u1', name: 'Winner', position: 'A', seatIndex: 0, coins: 6, activeCardCount: 2, sacrificedCards: [], isEliminated: false },
  { id: 'u2', name: 'ThirdPlace', position: 'B', seatIndex: 1, coins: 0, activeCardCount: 0, sacrificedCards: ['brahmodoetto', 'kalu_dakat'], isEliminated: true, eliminatedAtOrder: 1 },
  { id: 'u3', name: 'RunnerUp', position: 'C', seatIndex: 2, coins: 1, activeCardCount: 0, sacrificedCards: ['petukchondro', 'bir_bikrom'], isEliminated: true, eliminatedAtOrder: 2 },
];
const standings = calculateChakrantoStandings(finalPlayers);
assert(standings[0].playerId === 'u1' && standings[0].rank === 1, 'Survivor is 1st place');
assert(standings[1].playerId === 'u3' && standings[1].rank === 2, 'Last eliminated is 2nd place');
assert(standings[2].playerId === 'u2' && standings[2].rank === 3, 'First eliminated is 3rd place');
console.log('✓ Standings (1st, 2nd, 3rd) calculated accurately based on elimination sequence');

// 9. Test Character Card Consumption & Replacement
const initialHands = {
  u1: [
    { id: 'bir_bikrom_1', character: 'bir_bikrom' as const },
    { id: 'petukchondro_1', character: 'petukchondro' as const },
  ],
  u2: [
    { id: 'kalu_dakat_1', character: 'kalu_dakat' as const },
    { id: 'brahmodoetto_1', character: 'brahmodoetto' as const },
  ],
};
const drawDeck = [
  { id: 'ginner_badsha_1', character: 'ginner_badsha' as const },
];
const discardPile: any[] = [];

// Truthful play of Bir Bikrom -> consumed and replaced
const replaceRes1 = consumeAndReplaceClaimedCardIfNeeded(
  initialHands,
  drawDeck,
  discardPile,
  'u1',
  'bir_bikrom',
  false,
  1
);
assert(replaceRes1.replaced === true, 'Bir Bikrom card must be replaced when used');
assert(replaceRes1.newActorHand.length === 2, 'Hand length stays 2');
assert(!replaceRes1.newActorHand.some((c) => c.id === 'bir_bikrom_1'), 'Old Bir Bikrom card is gone');
assert(replaceRes1.newActorHand.some((c) => c.id === 'ginner_badsha_1'), 'New card drawn into hand');
assert(replaceRes1.newDiscardPile.some((c) => c.id === 'bir_bikrom_1'), 'Old card moved to discard pile');

// Bluff play of Brahmodoetto by u1 (who doesn't hold it) -> NOT consumed or replaced
const replaceRes2 = consumeAndReplaceClaimedCardIfNeeded(
  initialHands,
  drawDeck,
  discardPile,
  'u1',
  'brahmodoetto',
  false,
  1
);
assert(replaceRes2.replaced === false, 'Bluffed card not held is not replaced');
assert(replaceRes2.newActorHand[0].id === 'bir_bikrom_1', 'Hand remains unchanged');

// Already verified claim -> NOT replaced again
const replaceRes3 = consumeAndReplaceClaimedCardIfNeeded(
  initialHands,
  drawDeck,
  discardPile,
  'u1',
  'bir_bikrom',
  true, // already verified
  1
);
assert(replaceRes3.replaced === false, 'Already verified claim is not replaced a second time');

// Test consumeAndReplaceOnActionDeclaration: Immediate consumption at declaration
const declHands = {
  u1: [
    { id: 'kalu_dakat_1', character: 'kalu_dakat' as const },
    { id: 'brahmodoetto_1', character: 'brahmodoetto' as const },
  ],
  u2: [
    { id: 'petukchondro_1', character: 'petukchondro' as const },
  ],
};
const declDeck = [{ id: 'bir_bikrom_1', character: 'bir_bikrom' as const }];
const declDiscard: any[] = [];

// Owned character declared -> immediately consumed and replaced
const declRes1 = consumeAndReplaceOnActionDeclaration(
  declHands,
  declDeck,
  declDiscard,
  'u1',
  'kalu_dakat',
  1
);
assert(declRes1.consumed === true, 'Owned Kalu Dakat must be consumed immediately at declaration');
assert(declRes1.newActorHand.length === 2, 'Hand length must remain 2');
assert(!declRes1.newActorHand.some((c) => c.id === 'kalu_dakat_1'), 'Original Kalu Dakat card must be removed');
assert(declRes1.newActorHand.some((c) => c.id === 'bir_bikrom_1'), 'Replacement card drawn immediately');
assert(declRes1.newDiscardPile.some((c) => c.id === 'kalu_dakat_1'), 'Consumed card moved to discard pile');

// Bluffed character declared -> NOT consumed or replaced
const declRes2 = consumeAndReplaceOnActionDeclaration(
  declHands,
  declDeck,
  declDiscard,
  'u1',
  'ginner_badsha',
  1
);
assert(declRes2.consumed === false, 'Bluffed character not owned must not be consumed');
assert(declRes2.newActorHand.length === 2, 'Hand length stays unchanged');
assert(declRes2.newActorHand[0].id === 'kalu_dakat_1', 'Hand contents remain unchanged');

console.log('✓ Character card consumption and replacement logic verified');

// 10. Test Player Instruction & Actionable Visibility
const mockPublicState: any = {
  phase: 'BLOCK_PENDING_RESPONSE',
  turnNumber: 1,
  currentPosition: 'A',
  currentTurnPlayerId: 'u1',
  players: [
    { id: 'u1', name: 'Alice', position: 'A', seatIndex: 0, coins: 2, activeCardCount: 2, sacrificedCards: [], isEliminated: false },
    { id: 'u2', name: 'Bob', position: 'B', seatIndex: 1, coins: 2, activeCardCount: 2, sacrificedCards: [], isEliminated: false },
    { id: 'u3', name: 'Charlie', position: 'C', seatIndex: 2, coins: 2, activeCardCount: 2, sacrificedCards: [], isEliminated: false },
  ],
  currentAction: {
    action: 'dakati',
    actorPlayerId: 'u1',
    targetPlayerId: 'u2',
    claimedCharacter: 'kalu_dakat',
    declaredAt: Date.now(),
  },
  currentBlock: {
    blockerPlayerId: 'u2',
    claimedCharacter: 'petukchondro',
    targetAction: 'dakati',
    declaredAt: Date.now(),
  },
  passedPlayerIds: [],
  logs: [],
};

const instructionForActor = getChakrantoPlayerInstruction(mockPublicState, 'u1');
assert(instructionForActor.isActor === true, 'Alice is actor');
assert(instructionForActor.canChallenge === true, 'Alice can challenge Bob block');
assert(instructionForActor.canPass === true, 'Alice can accept block');

const instructionForBlocker = getChakrantoPlayerInstruction(mockPublicState, 'u2');
assert(instructionForBlocker.isBlocker === true, 'Bob is blocker');
assert(instructionForBlocker.canChallenge === false, 'Bob cannot challenge his own block');

const instructionForThirdParty = getChakrantoPlayerInstruction(mockPublicState, 'u3');
assert(instructionForThirdParty.isActor === false, 'Charlie is third party');
assert(instructionForThirdParty.canChallenge === false, 'Charlie cannot challenge block');
console.log('✓ Player instruction and block challenge authority verified');

console.log('--- ALL CHAKRANTO ENGINE TESTS PASSED ---');
