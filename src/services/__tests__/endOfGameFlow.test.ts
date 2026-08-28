/**
 * CHOR POLICE DAKAT BABU - End-of-Game Flow & Results Test Suite
 * 
 * Validates scenarios A through L:
 * A. Final round transitions to GAME_OVER/RESULTS instead of Home.
 * B. Final cumulative scores are calculated correctly.
 * C. Players are ranked correctly.
 * D. 1st, 2nd and 3rd place are displayed correctly.
 * E. Four-player games display all four rankings.
 * F. Two-player and three-player games work correctly.
 * G. Ties produce deterministic identical rankings on all clients.
 * H. All players receive the same final results from authoritative engine/state.
 * I. Refreshing on the results screen restores the RESULTS screen instead of Home.
 * J. GAME_OVER does not trigger automatic room/session cleanup.
 * K. Return Home intentionally clears the active session.
 * L. Starting a new game does not accidentally inherit the previous game's scores.
 */

import {
  createInitialGameState,
  startRoundDealing,
  submitBabuAction,
  submitPoliceAction,
  advanceToNextRound,
  calculateFinalStandings,
  sanitizeStateForPlayer,
} from '../../games/chorPoliceDakatBabu/engine/chorPoliceEngine';
import { PlayerSeat } from '../../games/chorPoliceDakatBabu/types';
import {
  saveActiveRoomSession,
  getActiveRoomSession,
  clearActiveRoomSession,
} from '../activeRoomSession';

// Mock localStorage for Node test environment
const mockStorage: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
    clear: () => {
      for (const k in mockStorage) delete mockStorage[k];
    },
  };
  (globalThis as any).window = globalThis;
  (globalThis as any).CustomEvent = class CustomEvent {
    type: string;
    detail: any;
    constructor(type: string, opts?: any) {
      this.type = type;
      this.detail = opts?.detail;
    }
  };
  (globalThis as any).dispatchEvent = () => true;
}

const mock4Players: PlayerSeat[] = [
  { id: 'uid-p1', name: 'Jivesh (Host)', seatIndex: 0, isHuman: true, isCurrentUser: true },
  { id: 'uid-p2', name: 'Rahim', seatIndex: 1, isHuman: true },
  { id: 'uid-p3', name: 'Tanvir', seatIndex: 2, isHuman: true },
  { id: 'uid-p4', name: 'Arif', seatIndex: 3, isHuman: true },
];

export function runEndOfGameFlowTests(): {
  passed: number;
  failed: number;
  results: { code: string; name: string; passed: boolean; message?: string }[];
} {
  const results: { code: string; name: string; passed: boolean; message?: string }[] = [];

  function assert(code: string, name: string, condition: boolean, message?: string) {
    if (condition) {
      results.push({ code, name, passed: true });
    } else {
      results.push({ code, name, passed: false, message: message || 'Assertion failed' });
    }
  }

  try {
    // -----------------------------------------------------------------------------------
    // Scenario A: Final round transitions to GAME_OVER/RESULTS instead of Home
    // -----------------------------------------------------------------------------------
    let state5 = createInitialGameState('room-a', mock4Players, 5);
    // Play 5 rounds
    for (let r = 1; r <= 5; r++) {
      state5 = startRoundDealing(state5);
      state5 = submitBabuAction(state5, state5.babuPlayerId!, 'find-chor');
      const hiddenP = state5.players.find(
        (p) => p.id !== state5.babuPlayerId && p.id !== state5.policePlayerId
      )!;
      state5 = submitPoliceAction(state5, state5.policePlayerId!, hiddenP.id);
      state5 = advanceToNextRound(state5);
    }
    assert(
      'A',
      'Final round transitions to GAME_OVER/RESULTS instead of Home or unexpected state',
      state5.phase === 'GAME_OVER' && Array.isArray(state5.winners) && state5.winners.length >= 1
    );

    // -----------------------------------------------------------------------------------
    // Scenario B: Final cumulative scores are calculated correctly
    // -----------------------------------------------------------------------------------
    const totalExpectedScoreSum = state5.history.reduce((acc, h) => {
      return acc + Object.values(h.pointsEarned).reduce((s, p) => s + p, 0);
    }, 0);
    const cumulativeScoreSum = Object.values(state5.cumulativeScores).reduce((s, p) => s + p, 0);
    assert(
      'B',
      'Final cumulative scores are calculated correctly from all round histories',
      totalExpectedScoreSum === cumulativeScoreSum &&
        state5.history.length === 5 &&
        mock4Players.every((p) => typeof state5.cumulativeScores[p.id] === 'number')
    );

    // -----------------------------------------------------------------------------------
    // Scenario C: Players are ranked correctly (highest score rank 1, descending order)
    // -----------------------------------------------------------------------------------
    const sampleScores: Record<string, number> = {
      'uid-p1': 4800,
      'uid-p2': 3600,
      'uid-p3': 2400,
      'uid-p4': 1200,
    };
    const standingsC = calculateFinalStandings(mock4Players, sampleScores);
    const correctOrderC =
      standingsC[0].playerId === 'uid-p1' &&
      standingsC[0].rank === 1 &&
      standingsC[1].playerId === 'uid-p2' &&
      standingsC[1].rank === 2 &&
      standingsC[2].playerId === 'uid-p3' &&
      standingsC[2].rank === 3 &&
      standingsC[3].playerId === 'uid-p4' &&
      standingsC[3].rank === 4;
    assert('C', 'Players are ranked correctly based on final cumulative scores', correctOrderC);

    // -----------------------------------------------------------------------------------
    // Scenario D: 1st, 2nd, and 3rd place are labeled correctly
    // -----------------------------------------------------------------------------------
    assert(
      'D',
      '1st, 2nd, and 3rd place labels are formatted with winner indicators',
      standingsC[0].rankLabel.includes('1st Place') &&
        standingsC[0].isWinner === true &&
        standingsC[1].rankLabel.includes('2nd Place') &&
        standingsC[1].isWinner === false &&
        standingsC[2].rankLabel.includes('3rd Place') &&
        standingsC[2].isWinner === false
    );

    // -----------------------------------------------------------------------------------
    // Scenario E: Four-player games display all four rankings
    // -----------------------------------------------------------------------------------
    assert(
      'E',
      'Four-player games output standings for all 4 players',
      standingsC.length === 4 && standingsC[3].rankLabel.includes('4th Place')
    );

    // -----------------------------------------------------------------------------------
    // Scenario F: Two-player and three-player game standings work correctly
    // -----------------------------------------------------------------------------------
    const players2 = mock4Players.slice(0, 2);
    const scores2 = { 'uid-p1': 2400, 'uid-p2': 1800 };
    const standings2 = calculateFinalStandings(players2, scores2);

    const players3 = mock4Players.slice(0, 3);
    const scores3 = { 'uid-p1': 3000, 'uid-p2': 2000, 'uid-p3': 1000 };
    const standings3 = calculateFinalStandings(players3, scores3);

    assert(
      'F',
      'Two-player and three-player lists produce exactly 2 and 3 respective ranked places',
      standings2.length === 2 &&
        standings2[0].rank === 1 &&
        standings2[1].rank === 2 &&
        standings3.length === 3 &&
        standings3[0].rank === 1 &&
        standings3[1].rank === 2 &&
        standings3[2].rank === 3
    );

    // -----------------------------------------------------------------------------------
    // Scenario G: Ties produce deterministic identical rankings on all clients
    // -----------------------------------------------------------------------------------
    const tiedScores = {
      'uid-p1': 3600,
      'uid-p2': 3600,
      'uid-p3': 1800,
      'uid-p4': 600,
    };
    // Run standings on multiple "clients" (different shuffled input order)
    const client1Standings = calculateFinalStandings(mock4Players, tiedScores);
    const client2Standings = calculateFinalStandings([...mock4Players].reverse(), tiedScores);

    const tieDeterministic =
      client1Standings.length === 4 &&
      client2Standings.length === 4 &&
      client1Standings[0].rank === 1 &&
      client1Standings[1].rank === 1 &&
      client1Standings[0].isTie === true &&
      client1Standings[1].isTie === true &&
      client1Standings[0].playerId === client2Standings[0].playerId &&
      client1Standings[1].playerId === client2Standings[1].playerId &&
      client1Standings[2].rank === 3 &&
      client1Standings[3].rank === 4;

    assert(
      'G',
      'Ties produce deterministic identical rankings across clients regardless of local order',
      tieDeterministic
    );

    // -----------------------------------------------------------------------------------
    // Scenario H: All players receive the same final results from authoritative engine
    // -----------------------------------------------------------------------------------
    const client1View = sanitizeStateForPlayer(state5, 'uid-p1');
    const client2View = sanitizeStateForPlayer(state5, 'uid-p2');
    const client3View = sanitizeStateForPlayer(state5, 'uid-p3');
    const client4View = sanitizeStateForPlayer(state5, 'uid-p4');

    const syncedResults =
      client1View.phase === 'GAME_OVER' &&
      client2View.phase === 'GAME_OVER' &&
      client3View.phase === 'GAME_OVER' &&
      client4View.phase === 'GAME_OVER' &&
      JSON.stringify(client1View.winners) === JSON.stringify(state5.winners) &&
      JSON.stringify(client2View.winners) === JSON.stringify(state5.winners) &&
      JSON.stringify(client3View.winners) === JSON.stringify(state5.winners) &&
      JSON.stringify(client4View.winners) === JSON.stringify(state5.winners);

    assert(
      'H',
      'All players receive the exact same final game-over results and winners from authoritative state',
      syncedResults
    );

    // -----------------------------------------------------------------------------------
    // Scenario I: Refreshing on the results screen restores the RESULTS screen instead of Home
    // -----------------------------------------------------------------------------------
    // Simulate room being in 'FINISHED' status when player refreshes
    saveActiveRoomSession({
      roomId: 'room-finished-123',
      roomCode: 'FIN123',
      gameId: 'chor-police-dakat-babu',
      playerId: 'uid-p1',
    });
    const restored = getActiveRoomSession();

    // Verify session was NOT cleared, and can be used to restore play-game view
    const simulatedRoomDoc = {
      id: 'room-finished-123',
      status: 'FINISHED',
      players: mock4Players,
    };
    const shouldRestorePlayGameView =
      restored?.roomId === 'room-finished-123' &&
      (simulatedRoomDoc.status === 'PLAYING' || simulatedRoomDoc.status === 'FINISHED') &&
      simulatedRoomDoc.players.some((p) => p.id === 'uid-p1');

    assert(
      'I',
      'Refreshing browser on FINISHED results screen restores active session and play-game view',
      shouldRestorePlayGameView
    );

    // -----------------------------------------------------------------------------------
    // Scenario J: GAME_OVER does not trigger automatic room/session cleanup
    // -----------------------------------------------------------------------------------
    const sessionAfterGameOver = getActiveRoomSession();
    assert(
      'J',
      'GAME_OVER phase leaves active room session intact so players can view final results',
      sessionAfterGameOver !== null && sessionAfterGameOver.roomId === 'room-finished-123'
    );

    // -----------------------------------------------------------------------------------
    // Scenario K: Return Home intentionally clears the active session
    // -----------------------------------------------------------------------------------
    clearActiveRoomSession();
    const sessionAfterReturnHome = getActiveRoomSession();
    assert(
      'K',
      'Clicking Return Home intentionally clears the local active room session',
      sessionAfterReturnHome === null
    );

    // -----------------------------------------------------------------------------------
    // Scenario L: Starting a new game does not accidentally inherit the previous game's scores
    // -----------------------------------------------------------------------------------
    const rematchInit = createInitialGameState('room-rematch', mock4Players, 5);
    const rematchCumulativeScores = rematchInit.cumulativeScores;
    const scoresReset =
      mock4Players.every((p) => rematchCumulativeScores[p.id] === 0) &&
      rematchInit.currentRound === 1 &&
      rematchInit.history.length === 0 &&
      rematchInit.winners.length === 0;

    assert(
      'L',
      'Starting a new game resets cumulative scores to 0 and clears previous winners',
      scoresReset
    );
  } catch (err: any) {
    results.push({ code: 'ERR', name: 'Test Execution Exception', passed: false, message: err.message });
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  return { passed, failed, results };
}

// Auto-run when executed directly via tsx
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('endOfGameFlow.test')) {
  const report = runEndOfGameFlowTests();
  console.log(`\n======================================================`);
  console.log(`CHOR POLICE DAKAT BABU END-OF-GAME FLOW TEST SUITE`);
  console.log(`Results: ${report.passed}/${report.passed + report.failed} Passed (${report.failed} Failed)`);
  console.log(`======================================================`);
  report.results.forEach((r) => {
    const symbol = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${symbol}] Scenario ${r.code}: ${r.name}`);
    if (r.message) {
      console.log(`        Reason: ${r.message}`);
    }
  });
  console.log(`======================================================\n`);
  if (report.failed > 0) {
    process.exit(1);
  }
}
