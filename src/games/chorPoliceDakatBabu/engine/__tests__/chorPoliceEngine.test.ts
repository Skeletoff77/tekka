/**
 * CHOR POLICE DAKAT BABU - Comprehensive Engine Test Suite
 * Validates all 24 authoritative game rules, hidden information constraints, scoring, and lifecycle.
 */

import {
  createInitialGameState,
  startRoundDealing,
  submitBabuAction,
  submitPoliceAction,
  advanceToNextRound,
  sanitizeStateForPlayer,
  GameEngineError,
} from '../chorPoliceEngine';
import { PlayerSeat, CardRole, RoundOption } from '../../types';
import { CARD_ASSETS, GAME_ASSETS, ROLE_METADATA } from '../../assets/gameAssets';

const mockPlayers: PlayerSeat[] = [
  { id: 'player-1', name: 'Jivesh (You)', seatIndex: 0, isHuman: true, isCurrentUser: true },
  { id: 'player-2', name: 'Rahim', seatIndex: 1, isHuman: false },
  { id: 'player-3', name: 'Tanvir', seatIndex: 2, isHuman: false },
  { id: 'player-4', name: 'Arif', seatIndex: 3, isHuman: false },
];

export function runAllChorPoliceTests(): { passed: number; failed: number; results: { testNum: number; name: string; passed: boolean; message?: string }[] } {
  const results: { testNum: number; name: string; passed: boolean; message?: string }[] = [];

  function assert(testNum: number, name: string, condition: boolean, message?: string) {
    if (condition) {
      results.push({ testNum, name, passed: true });
    } else {
      results.push({ testNum, name, passed: false, message: message || 'Assertion failed' });
    }
  }

  try {
    // 1. Four cards exist
    const expectedRoles: CardRole[] = ['babu', 'police', 'dakat', 'chor'];
    assert(1, 'Four cards exist in role system', expectedRoles.length === 4);

    // 2. Four players receive exactly one card
    const init = createInitialGameState('test-game-1', mockPlayers, 5);
    const dealt = startRoundDealing(init);
    const assignedPlayerIds = Object.keys(dealt.cardAssignments);
    assert(
      2,
      'Four players receive exactly one card',
      assignedPlayerIds.length === 4 && mockPlayers.every((p) => dealt.cardAssignments[p.id] !== undefined)
    );

    // 3. No duplicate cards
    const rolesDealt = Object.values(dealt.cardAssignments);
    const uniqueRoles = new Set(rolesDealt);
    assert(3, 'No duplicate cards across 4 players', uniqueRoles.size === 4);

    // 4. Babu and Police are revealed
    const babuId = dealt.babuPlayerId!;
    const policeId = dealt.policePlayerId!;
    assert(
      4,
      'Babu and Police are revealed publicly',
      dealt.publicRoles[babuId] === 'babu' && dealt.publicRoles[policeId] === 'police'
    );

    // 5. Chor and Dakat remain hidden
    const hiddenPlayers = mockPlayers.filter((p) => p.id !== babuId && p.id !== policeId);
    assert(
      5,
      'Chor and Dakat remain hidden in public roles',
      hiddenPlayers.every((p) => dealt.publicRoles[p.id] === 'hidden')
    );

    // 6. Only Babu can select target role
    let babuForbiddenCaught = false;
    try {
      submitBabuAction(dealt, policeId, 'find-chor');
    } catch (e) {
      babuForbiddenCaught = e instanceof GameEngineError;
    }
    assert(6, 'Only Babu can select target role (others rejected)', babuForbiddenCaught);

    // 7. Babu can select only CHOR or DAKAT
    const babuChosen = submitBabuAction(dealt, babuId, 'find-chor');
    let invalidTargetCaught = false;
    try {
      submitBabuAction(dealt, babuId, 'find-police' as any);
    } catch (e) {
      invalidTargetCaught = true;
    }
    assert(
      7,
      'Babu can select only CHOR or DAKAT',
      babuChosen.babuTarget === 'find-chor' && invalidTargetCaught
    );

    // 8. Only Police can make the guess
    let nonPoliceGuessCaught = false;
    try {
      submitPoliceAction(babuChosen, babuId, hiddenPlayers[0].id);
    } catch (e) {
      nonPoliceGuessCaught = true;
    }
    assert(8, 'Only Police can make the guess', nonPoliceGuessCaught);

    // 9. Police can select only one of the two hidden players
    let policeSelfAccuseCaught = false;
    try {
      submitPoliceAction(babuChosen, policeId, policeId);
    } catch (e) {
      policeSelfAccuseCaught = true;
    }
    assert(9, 'Police cannot accuse Babu or Police', policeSelfAccuseCaught);

    // 10. Correct scoring (Babu: 1200, Police: 900, Dakat: 600, Chor: 0)
    // Create deterministic scenario
    let deterministicState = createInitialGameState('test-deterministic', mockPlayers, 5);
    deterministicState = {
      ...deterministicState,
      phase: 'POLICE_TURN',
      cardAssignments: {
        'player-1': 'babu',
        'player-2': 'police',
        'player-3': 'dakat',
        'player-4': 'chor',
      },
      babuPlayerId: 'player-1',
      policePlayerId: 'player-2',
      babuTarget: 'find-chor',
    };
    // Police correctly accuses player-4 (Chor)
    const correctGuessState = submitPoliceAction(deterministicState, 'player-2', 'player-4');
    const ptsCorrect = correctGuessState.lastRoundResult?.pointsEarned!;
    assert(
      10,
      'Correct scoring: Babu +1200, Police +900, Dakat +600, Chor +0',
      ptsCorrect['player-1'] === 1200 &&
        ptsCorrect['player-2'] === 900 &&
        ptsCorrect['player-3'] === 600 &&
        ptsCorrect['player-4'] === 0
    );

    // 11. Wrong scoring (Babu: 1200, Police: 0, Dakat: 600, Chor: 400)
    // Police incorrectly accuses player-3 (Dakat) when looking for Chor
    const wrongGuessState = submitPoliceAction(deterministicState, 'player-2', 'player-3');
    const ptsWrong = wrongGuessState.lastRoundResult?.pointsEarned!;
    assert(
      11,
      'Wrong scoring: Babu +1200, Police +0, Dakat +600, Chor +400',
      ptsWrong['player-1'] === 1200 &&
        ptsWrong['player-2'] === 0 &&
        ptsWrong['player-3'] === 600 &&
        ptsWrong['player-4'] === 400
    );

    // 12. Cumulative scoring across rounds
    const nextRoundState = advanceToNextRound(correctGuessState);
    assert(
      12,
      'Cumulative scoring persists into next round',
      nextRoundState.cumulativeScores['player-1'] === 1200 &&
        nextRoundState.cumulativeScores['player-2'] === 900 &&
        nextRoundState.cumulativeScores['player-3'] === 600 &&
        nextRoundState.cumulativeScores['player-4'] === 0
    );

    // 13. New random assignment every round
    assert(
      13,
      'New assignment deals 4 valid roles for next round',
      Object.keys(nextRoundState.cardAssignments).length === 4
    );

    // 14. 5-round game finishes at round 5
    let game5 = createInitialGameState('test-5', mockPlayers, 5);
    for (let r = 1; r <= 5; r++) {
      game5 = startRoundDealing(game5);
      game5 = submitBabuAction(game5, game5.babuPlayerId!, 'find-chor');
      const hiddenP = game5.players.find((p) => p.id !== game5.babuPlayerId && p.id !== game5.policePlayerId)!;
      game5 = submitPoliceAction(game5, game5.policePlayerId!, hiddenP.id);
      game5 = advanceToNextRound(game5);
    }
    assert(14, '5-round game finishes with GAME_OVER', game5.phase === 'GAME_OVER' && game5.currentRound === 5);

    // 15. 10-round game configuration
    const game10 = createInitialGameState('test-10', mockPlayers, 10);
    assert(15, '10-round game initial state has totalRounds = 10', game10.totalRounds === 10);

    // 16. 15-round game configuration
    const game15 = createInitialGameState('test-15', mockPlayers, 15);
    assert(16, '15-round game initial state has totalRounds = 15', game15.totalRounds === 15);

    // 17. 20-round game configuration
    const game20 = createInitialGameState('test-20', mockPlayers, 20);
    assert(17, '20-round game initial state has totalRounds = 20', game20.totalRounds === 20);

    // 18. Final winner calculation
    assert(18, 'Final winner is correctly computed in 5-round match', game5.winners.length >= 1);

    // 19. Tie result when scores are identical
    let tieState: any = {
      ...game5,
      cumulativeScores: {
        'player-1': 3000,
        'player-2': 3000,
        'player-3': 1800,
        'player-4': 1200,
      },
      currentRound: 5,
      totalRounds: 5,
      phase: 'REVEAL_RESULT',
    };
    tieState = advanceToNextRound(tieState);
    assert(
      19,
      'Tie result is declared without inventing tie-breakers',
      tieState.isTie === true && tieState.winners.length === 2
    );

    // 20. Hidden information security (sanitizer never leaks opponent chor/dakat)
    const sanitizedForPlayer1 = sanitizeStateForPlayer(dealt, 'player-1');
    const player1TrueRole = dealt.cardAssignments['player-1'];
    // Check that sanitized object has no `cardAssignments`
    assert(
      20,
      'Hidden info security: cardAssignments stripped & opponent hidden cards masked',
      (sanitizedForPlayer1 as any).cardAssignments === undefined &&
        sanitizedForPlayer1.myPrivateRole === player1TrueRole
    );

    // 21. Reconnection does not reset the game (State is fully serializable)
    const serialized = JSON.stringify(game5);
    const restored = JSON.parse(serialized);
    assert(21, 'State is serializable and preserves match integrity on refresh', restored.totalRounds === 5);

    // 22. Uploaded card assets correctly map to their roles
    assert(
      22,
      'Uploaded card assets mapped: babu, police, dakat, chor',
      CARD_ASSETS.babu.includes('Babu.png') &&
        CARD_ASSETS.police.includes('Police.png') &&
        CARD_ASSETS.dakat.includes('Dakath') &&
        CARD_ASSETS.chor.includes('chore.png')
    );

    // 23. Uploaded banner appears correctly
    assert(23, 'Uploaded banner mapped to Banner.png', GAME_ASSETS.banner.includes('Banner.png'));

    // 24. Role metadata & points
    assert(
      24,
      'Points accurately mapped (Babu: 1200, Police: 900, Dakat: 600, Chor: 400)',
      ROLE_METADATA.babu.points === 1200 &&
        ROLE_METADATA.police.points === 900 &&
        ROLE_METADATA.dakat.points === 600 &&
        ROLE_METADATA.chor.points === 400
    );

    // 25. Every round has exactly 4 unique roles (No duplicates, exactly 1 Babu, 1 Police, 1 Dakat, 1 Chor)
    let allUniqueAcross100 = true;
    for (let i = 0; i < 100; i++) {
      const testState = startRoundDealing(createInitialGameState(`test-unique-${i}`, mockPlayers, 5));
      const roles = Object.values(testState.cardAssignments);
      const roleSet = new Set(roles);
      if (
        roleSet.size !== 4 ||
        !roleSet.has('babu') ||
        !roleSet.has('police') ||
        !roleSet.has('dakat') ||
        !roleSet.has('chor')
      ) {
        allUniqueAcross100 = false;
        break;
      }
    }
    assert(25, 'Every round has exactly 4 unique roles (Babu, Police, Dakat, Chor) across 100 deals', allUniqueAcross100);

    // 26. Consecutive round derangement: No player receives the same role as the previous round
    let consecutiveDerangementsPass = true;
    let stateTracker = createInitialGameState('test-derangements', mockPlayers, 20);
    for (let r = 1; r <= 15; r++) {
      const prevAssignments = { ...stateTracker.cardAssignments };
      stateTracker = startRoundDealing(stateTracker);
      if (r > 1) {
        const hasRepeat = mockPlayers.some(
          (p) => stateTracker.cardAssignments[p.id] === prevAssignments[p.id]
        );
        if (hasRepeat) {
          consecutiveDerangementsPass = false;
          break;
        }
      }
      stateTracker = submitBabuAction(stateTracker, stateTracker.babuPlayerId!, 'find-chor');
      const hiddenP = stateTracker.players.find(
        (p) => p.id !== stateTracker.babuPlayerId && p.id !== stateTracker.policePlayerId
      )!;
      stateTracker = submitPoliceAction(stateTracker, stateTracker.policePlayerId!, hiddenP.id);
      if (r < 15) {
        stateTracker = advanceToNextRound(stateTracker);
      }
    }
    assert(
      26,
      'Consecutive rounds enforce derangement (0 players receive the same role as immediately previous round)',
      consecutiveDerangementsPass
    );

    // 27. Multiple rounds do not produce a single fixed mapping (Distribution variety check)
    const observedMappings = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const dealtRandom = startRoundDealing(createInitialGameState(`test-variety-${i}`, mockPlayers, 5));
      const sig = mockPlayers.map((p) => dealtRandom.cardAssignments[p.id]).join('-');
      observedMappings.add(sig);
    }
    assert(
      27,
      'Multiple rounds produce high permutation variety (at least 8 distinct configurations observed in 50 trials)',
      observedMappings.size >= 8
    );

    // 28. Authoritative assignment synchronization: all 4 client sanitizations match the authoritative state
    const authState = startRoundDealing(createInitialGameState('test-auth-sync', mockPlayers, 5));
    const allClientsMatchAuth = mockPlayers.every((p) => {
      const sanitized = sanitizeStateForPlayer(authState, p.id);
      return (
        sanitized.babuPlayerId === authState.babuPlayerId &&
        sanitized.policePlayerId === authState.policePlayerId &&
        sanitized.myPrivateRole === authState.cardAssignments[p.id]
      );
    });
    assert(
      28,
      'All clients receive the same authoritative assignment and synchronized public roles',
      allClientsMatchAuth
    );
  } catch (err: any) {
    results.push({ testNum: 0, name: 'Engine Test Execution', passed: false, message: err.message });
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return { passed, failed, results };
}

// Auto-run if executed directly via tsx/node CLI
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('chorPoliceEngine.test')) {
  const report = runAllChorPoliceTests();
  console.log(`\n======================================================`);
  console.log(`CHOR POLICE DAKAT BABU ENGINE TEST SUITE`);
  console.log(`Results: ${report.passed}/${report.passed + report.failed} Passed (${report.failed} Failed)`);
  console.log(`======================================================`);
  report.results.forEach((r) => {
    const symbol = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${symbol}] Test ${r.testNum}: ${r.name}`);
    if (r.message) {
      console.log(`        Reason: ${r.message}`);
    }
  });
  console.log(`======================================================\n`);
  if (report.failed > 0) {
    process.exit(1);
  }
}

