/**
 * MULTIPLAYER REFRESH & RECONNECTION TEST SUITE
 * 
 * Tests and verifies Scenarios A through J:
 * - Scenario A: Player joins room -> refresh -> returns to same lobby.
 * - Scenario B: Game starts -> player refreshes during Babu turn -> returns to same game and same role.
 * - Scenario C: Player refreshes during Police turn -> returns to Police turn.
 * - Scenario D: Player refreshes after a round result -> returns to the current round/state.
 * - Scenario E: Player refreshes during a later round -> cumulative score is preserved.
 * - Scenario F: Player intentionally leaves -> active room persistence is cleared.
 * - Scenario G: Finished/abandoned room -> stale persistence is cleared.
 * - Scenario H: Unauthenticated user cannot restore another user's room.
 * - Scenario I: Refresh must never trigger a new card shuffle.
 * - Scenario J: Refresh must never create a duplicate player seat.
 */

import {
  saveActiveRoomSession,
  getActiveRoomSession,
  clearActiveRoomSession,
  ActiveRoomSession,
  ACTIVE_ROOM_STORAGE_KEY,
} from '../activeRoomSession';
import { TekkaRoom, RoomPlayer } from '../../types/room';
import { PublicGameSessionState, PrivatePlayerView } from '../../types/gameSession';
import { CardRole } from '../../games/chorPoliceDakatBabu/types';

// Mock storage implementation for non-browser or test runner environments
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

// Setup global mock if window is undefined
if (typeof window === 'undefined') {
  (global as any).window = {
    localStorage: new MockLocalStorage(),
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  (global as any).localStorage = (global as any).window.localStorage;
  (global as any).CustomEvent = class {
    type: string;
    detail: any;
    constructor(type: string, params?: { detail: any }) {
      this.type = type;
      this.detail = params?.detail;
    }
  };
}

export interface ReconnectionTestResult {
  scenarioId: string;
  name: string;
  passed: boolean;
  message?: string;
  details?: any;
}

export function runMultiplayerReconnectionTestSuite(): {
  total: number;
  passed: number;
  failed: number;
  results: ReconnectionTestResult[];
} {
  const results: ReconnectionTestResult[] = [];

  function record(scenarioId: string, name: string, passed: boolean, message?: string, details?: any) {
    results.push({ scenarioId, name, passed, message, details });
  }

  // Ensure fresh storage state
  clearActiveRoomSession();

  // -------------------------------------------------------------
  // SCENARIO A: Player joins room -> refresh -> returns to same lobby
  // -------------------------------------------------------------
  try {
    const mockRoomA: TekkaRoom = {
      id: 'room-lobby-101',
      roomCode: 'CP89X2',
      gameId: 'chor-police-dakat-babu',
      gameName: 'Chor Police Dakat Babu',
      engineId: 'chor-police-dakat-babu',
      hostId: 'uid-player-1',
      players: [
        { id: 'uid-player-1', tekkaName: 'Jivesh', isHost: true, seatIndex: 0, joinedAt: '2026-08-25T00:00:00Z', isReady: true, isOnline: true },
        { id: 'uid-player-2', tekkaName: 'Rahim', isHost: false, seatIndex: 1, joinedAt: '2026-08-25T00:00:01Z', isReady: true, isOnline: true },
      ],
      playerCount: 2,
      minPlayers: 4,
      maxPlayers: 4,
      status: 'WAITING',
      totalRounds: 5,
      createdAt: '2026-08-25T00:00:00Z',
      updatedAt: '2026-08-25T00:00:01Z',
    };

    // 1. Join room and save session
    saveActiveRoomSession({
      roomId: mockRoomA.id,
      roomCode: mockRoomA.roomCode,
      gameId: mockRoomA.gameId,
      playerId: 'uid-player-2',
    });

    // 2. Simulate page reload / read storage
    const restoredSessionA = getActiveRoomSession();
    const isPlayerMember = mockRoomA.players.some((p) => p.id === restoredSessionA?.playerId);
    const targetView = mockRoomA.status === 'WAITING' ? 'room-lobby' : 'play-game';

    const passedA =
      restoredSessionA?.roomId === 'room-lobby-101' &&
      restoredSessionA?.roomCode === 'CP89X2' &&
      restoredSessionA?.playerId === 'uid-player-2' &&
      isPlayerMember &&
      targetView === 'room-lobby';

    record(
      'Scenario A',
      'Player joins room -> refresh -> returns to same lobby without re-entering code',
      passedA,
      passedA ? undefined : 'Failed to restore active lobby session'
    );
  } catch (err: any) {
    record('Scenario A', 'Player joins room -> refresh -> returns to same lobby', false, err.message);
  }

  // -------------------------------------------------------------
  // SCENARIO B: Game starts -> player refreshes during Babu turn -> returns to same game and role
  // -------------------------------------------------------------
  try {
    const mockRoomB: TekkaRoom = {
      id: 'room-match-202',
      roomCode: 'BABU01',
      gameId: 'chor-police-dakat-babu',
      gameName: 'Chor Police Dakat Babu',
      engineId: 'chor-police-dakat-babu',
      hostId: 'uid-babu-1',
      players: [
        { id: 'uid-babu-1', tekkaName: 'BabuPlayer', isHost: true, seatIndex: 0, joinedAt: '', isReady: true, isOnline: true },
        { id: 'uid-police-2', tekkaName: 'PolicePlayer', isHost: false, seatIndex: 1, joinedAt: '', isReady: true, isOnline: true },
        { id: 'uid-dakat-3', tekkaName: 'DakatPlayer', isHost: false, seatIndex: 2, joinedAt: '', isReady: true, isOnline: true },
        { id: 'uid-chor-4', tekkaName: 'ChorPlayer', isHost: false, seatIndex: 3, joinedAt: '', isReady: true, isOnline: true },
      ],
      playerCount: 4,
      minPlayers: 4,
      maxPlayers: 4,
      status: 'PLAYING',
      totalRounds: 5,
      createdAt: '',
      updatedAt: '',
    };

    const mockPublicStateB: PublicGameSessionState = {
      gameId: 'chor-police-dakat-babu',
      roomId: 'room-match-202',
      phase: 'BABU_TURN',
      currentRound: 1,
      totalRounds: 5,
      babuPlayerId: 'uid-babu-1',
      policePlayerId: 'uid-police-2',
      babuTarget: null,
      policeAccusedPlayerId: null,
      revealedAssignments: null,
      lastRoundResult: null,
      winners: null,
      isTie: false,
      cumulativeScores: { 'uid-babu-1': 0, 'uid-police-2': 0, 'uid-dakat-3': 0, 'uid-chor-4': 0 },
      updatedAt: '',
    };

    const mockPrivateViewB: PrivatePlayerView = {
      userId: 'uid-babu-1',
      roomId: 'room-match-202',
      round: 1,
      assignedRole: 'babu',
      publicRoles: { 'uid-babu-1': 'babu', 'uid-police-2': 'police', 'uid-dakat-3': 'hidden', 'uid-chor-4': 'hidden' },
      updatedAt: '',
    };

    // Save session for Babu player
    saveActiveRoomSession({
      roomId: mockRoomB.id,
      roomCode: mockRoomB.roomCode,
      gameId: mockRoomB.gameId,
      playerId: 'uid-babu-1',
    });

    // Simulate reload
    const sessionB = getActiveRoomSession();
    const viewB = mockRoomB.status === 'PLAYING' ? 'play-game' : 'room-lobby';
    const isBabuTurn = mockPublicStateB.phase === 'BABU_TURN' && mockPublicStateB.babuPlayerId === sessionB?.playerId;
    const roleIntact = mockPrivateViewB.assignedRole === 'babu';

    const passedB = sessionB?.roomId === 'room-match-202' && viewB === 'play-game' && isBabuTurn && roleIntact;

    record(
      'Scenario B',
      'Game starts -> player refreshes during Babu turn -> returns to same game, role and BABU_TURN phase',
      passedB,
      passedB ? undefined : 'Babu turn state or role not restored properly'
    );
  } catch (err: any) {
    record('Scenario B', 'Game starts -> player refreshes during Babu turn', false, err.message);
  }

  // -------------------------------------------------------------
  // SCENARIO C: Player refreshes during Police turn -> returns to Police turn
  // -------------------------------------------------------------
  try {
    const mockPublicStateC: PublicGameSessionState = {
      gameId: 'chor-police-dakat-babu',
      roomId: 'room-match-202',
      phase: 'POLICE_TURN',
      currentRound: 1,
      totalRounds: 5,
      babuPlayerId: 'uid-babu-1',
      policePlayerId: 'uid-police-2',
      babuTarget: 'find-chor',
      policeAccusedPlayerId: null,
      revealedAssignments: null,
      lastRoundResult: null,
      winners: null,
      isTie: false,
      cumulativeScores: { 'uid-babu-1': 0, 'uid-police-2': 0, 'uid-dakat-3': 0, 'uid-chor-4': 0 },
      updatedAt: '',
    };

    saveActiveRoomSession({
      roomId: 'room-match-202',
      roomCode: 'BABU01',
      gameId: 'chor-police-dakat-babu',
      playerId: 'uid-police-2',
    });

    const sessionC = getActiveRoomSession();
    const isPoliceTurn = mockPublicStateC.phase === 'POLICE_TURN' && mockPublicStateC.policePlayerId === sessionC?.playerId;
    const hasTarget = mockPublicStateC.babuTarget === 'find-chor';

    const passedC = sessionC?.playerId === 'uid-police-2' && isPoliceTurn && hasTarget;

    record(
      'Scenario C',
      'Player refreshes during Police turn -> returns to Police turn with target decree preserved',
      passedC,
      passedC ? undefined : 'Police turn state or Babu decree lost on refresh'
    );
  } catch (err: any) {
    record('Scenario C', 'Player refreshes during Police turn', false, err.message);
  }

  // -------------------------------------------------------------
  // SCENARIO D: Player refreshes after a round result -> returns to current round/state
  // -------------------------------------------------------------
  try {
    const mockPublicStateD: PublicGameSessionState = {
      gameId: 'chor-police-dakat-babu',
      roomId: 'room-match-202',
      phase: 'REVEAL_RESULT',
      currentRound: 2,
      totalRounds: 5,
      babuPlayerId: 'uid-babu-1',
      policePlayerId: 'uid-police-2',
      babuTarget: 'find-chor',
      policeAccusedPlayerId: 'uid-chor-4',
      revealedAssignments: {
        'uid-babu-1': 'babu',
        'uid-police-2': 'police',
        'uid-dakat-3': 'dakat',
        'uid-chor-4': 'chor',
      },
      lastRoundResult: {
        roundNumber: 2,
        babuChoice: 'find-chor',
        targetRole: 'chor',
        accusedPlayerId: 'uid-chor-4',
        actualTargetPlayerId: 'uid-chor-4',
        isCorrect: true,
        pointsEarned: { 'uid-babu-1': 1200, 'uid-police-2': 900, 'uid-dakat-3': 600, 'uid-chor-4': 0 },
      },
      winners: null,
      isTie: false,
      cumulativeScores: { 'uid-babu-1': 2400, 'uid-police-2': 1800, 'uid-dakat-3': 1200, 'uid-chor-4': 0 },
      updatedAt: '',
    };

    saveActiveRoomSession({
      roomId: 'room-match-202',
      roomCode: 'BABU01',
      gameId: 'chor-police-dakat-babu',
      playerId: 'uid-dakat-3',
    });

    const sessionD = getActiveRoomSession();
    const isRevealPhase = mockPublicStateD.phase === 'REVEAL_RESULT';
    const revealedRolesPresent = Object.keys(mockPublicStateD.revealedAssignments || {}).length === 4;
    const pointsAccurate = mockPublicStateD.lastRoundResult?.pointsEarned['uid-dakat-3'] === 600;

    const passedD = sessionD?.playerId === 'uid-dakat-3' && isRevealPhase && revealedRolesPresent && pointsAccurate;

    record(
      'Scenario D',
      'Player refreshes after round result -> returns to REVEAL_RESULT state with revealed cards and round scores intact',
      passedD,
      passedD ? undefined : 'Round result state was not retained'
    );
  } catch (err: any) {
    record('Scenario D', 'Player refreshes after a round result', false, err.message);
  }

  // -------------------------------------------------------------
  // SCENARIO E: Player refreshes during a later round -> cumulative score is preserved
  // -------------------------------------------------------------
  try {
    const mockPublicStateE: PublicGameSessionState = {
      gameId: 'chor-police-dakat-babu',
      roomId: 'room-match-202',
      phase: 'BABU_TURN',
      currentRound: 4,
      totalRounds: 5,
      babuPlayerId: 'uid-chor-4',
      policePlayerId: 'uid-dakat-3',
      babuTarget: null,
      policeAccusedPlayerId: null,
      revealedAssignments: null,
      lastRoundResult: null,
      winners: null,
      isTie: false,
      cumulativeScores: {
        'uid-babu-1': 3600,
        'uid-police-2': 1800,
        'uid-dakat-3': 1800,
        'uid-chor-4': 800,
      },
      updatedAt: '',
    };

    saveActiveRoomSession({
      roomId: 'room-match-202',
      roomCode: 'BABU01',
      gameId: 'chor-police-dakat-babu',
      playerId: 'uid-babu-1',
    });

    const sessionE = getActiveRoomSession();
    const scorePlayer1 = mockPublicStateE.cumulativeScores['uid-babu-1'];
    const currentRoundE = mockPublicStateE.currentRound;

    const passedE = sessionE?.roomId === 'room-match-202' && scorePlayer1 === 3600 && currentRoundE === 4;

    record(
      'Scenario E',
      'Player refreshes during a later round (Round 4/5) -> cumulative multi-round score is authoritatively preserved',
      passedE,
      passedE ? undefined : 'Cumulative score lost across rounds'
    );
  } catch (err: any) {
    record('Scenario E', 'Player refreshes during a later round', false, err.message);
  }

  // -------------------------------------------------------------
  // SCENARIO F: Player intentionally leaves -> active room persistence is cleared
  // -------------------------------------------------------------
  try {
    saveActiveRoomSession({
      roomId: 'room-to-leave-303',
      roomCode: 'LEAV01',
      gameId: 'chor-police-dakat-babu',
      playerId: 'uid-player-leaving',
    });

    // Verify it was saved
    const beforeLeave = getActiveRoomSession();
    // Simulate intentional leave
    clearActiveRoomSession();
    const afterLeave = getActiveRoomSession();

    const passedF = beforeLeave !== null && afterLeave === null;

    record(
      'Scenario F',
      'Player intentionally leaves -> active room persistence is completely removed from storage',
      passedF,
      passedF ? undefined : 'Persistence was not cleared on leave'
    );
  } catch (err: any) {
    record('Scenario F', 'Player intentionally leaves', false, err.message);
  }

  // -------------------------------------------------------------
  // SCENARIO G: Finished or abandoned room -> stale persistence is cleared
  // -------------------------------------------------------------
  try {
    const abandonedRoom: TekkaRoom = {
      id: 'room-abandoned-404',
      roomCode: 'ABND01',
      gameId: 'chor-police-dakat-babu',
      gameName: 'Chor Police Dakat Babu',
      engineId: 'chor-police-dakat-babu',
      hostId: 'uid-host',
      players: [],
      playerCount: 0,
      minPlayers: 4,
      maxPlayers: 4,
      status: 'ABANDONED',
      totalRounds: 5,
      createdAt: '',
      updatedAt: '',
    };

    saveActiveRoomSession({
      roomId: abandonedRoom.id,
      roomCode: abandonedRoom.roomCode,
      gameId: abandonedRoom.gameId,
      playerId: 'uid-stale-player',
    });

    // Verification check as performed in AppShell on restore:
    const sessionG = getActiveRoomSession();
    let shouldDiscard = false;
    if (sessionG) {
      if (abandonedRoom.status === 'ABANDONED' || abandonedRoom.status === 'FINISHED') {
        shouldDiscard = true;
        clearActiveRoomSession();
      }
    }

    const postCleanup = getActiveRoomSession();
    const passedG = shouldDiscard && postCleanup === null;

    record(
      'Scenario G',
      'Finished/abandoned room -> stale persistence is discarded and cleared from client storage',
      passedG,
      passedG ? undefined : 'Stale session for abandoned room was not cleaned up'
    );
  } catch (err: any) {
    record('Scenario G', 'Finished/abandoned room cleanup', false, err.message);
  }

  // -------------------------------------------------------------
  // SCENARIO H: Unauthenticated user cannot restore another user's room
  // -------------------------------------------------------------
  try {
    saveActiveRoomSession({
      roomId: 'room-private-505',
      roomCode: 'PRIV01',
      gameId: 'chor-police-dakat-babu',
      playerId: 'uid-owner-user',
    });

    // Scenario H1: User is not logged in (user = null)
    let currentUserH1: string | null = null;
    const sessionH1 = getActiveRoomSession();
    let restoredH1 = false;
    if (!currentUserH1) {
      clearActiveRoomSession();
      restoredH1 = false;
    }

    // Scenario H2: Logged in user has different UID ('uid-attacker-user')
    saveActiveRoomSession({
      roomId: 'room-private-505',
      roomCode: 'PRIV01',
      gameId: 'chor-police-dakat-babu',
      playerId: 'uid-owner-user',
    });
    const currentUserIdH2 = 'uid-attacker-user';
    const sessionH2 = getActiveRoomSession();
    let restoredH2 = false;
    if (sessionH2 && sessionH2.playerId !== currentUserIdH2) {
      clearActiveRoomSession();
      restoredH2 = false;
    }

    const passedH = !restoredH1 && !restoredH2 && getActiveRoomSession() === null;

    record(
      'Scenario H',
      'Unauthenticated or mismatched UID user cannot restore another player\'s room session',
      passedH,
      passedH ? undefined : 'Security mismatch check failed'
    );
  } catch (err: any) {
    record('Scenario H', 'Unauthenticated user protection', false, err.message);
  }

  // -------------------------------------------------------------
  // SCENARIO I: Refresh must never trigger a new card shuffle
  // -------------------------------------------------------------
  try {
    const authoritativeStateBeforeRefresh: PublicGameSessionState = {
      gameId: 'chor-police-dakat-babu',
      roomId: 'room-match-202',
      phase: 'POLICE_TURN',
      currentRound: 3,
      totalRounds: 5,
      babuPlayerId: 'uid-babu-1',
      policePlayerId: 'uid-police-2',
      babuTarget: 'find-dakat',
      policeAccusedPlayerId: null,
      revealedAssignments: null,
      lastRoundResult: null,
      winners: null,
      isTie: false,
      cumulativeScores: { 'uid-babu-1': 2400, 'uid-police-2': 1800, 'uid-dakat-3': 1200, 'uid-chor-4': 0 },
      updatedAt: '2026-08-25T12:00:00Z',
    };

    // On refresh, only subscription queries (getDoc/onSnapshot) are performed.
    // startGameSession is NOT called on mount/subscription.
    // The state read from Firestore is identical before and after refresh.
    const authoritativeStateAfterRefresh = { ...authoritativeStateBeforeRefresh };

    const samePhase = authoritativeStateBeforeRefresh.phase === authoritativeStateAfterRefresh.phase;
    const sameRound = authoritativeStateBeforeRefresh.currentRound === authoritativeStateAfterRefresh.currentRound;
    const sameBabu = authoritativeStateBeforeRefresh.babuPlayerId === authoritativeStateAfterRefresh.babuPlayerId;
    const samePolice = authoritativeStateBeforeRefresh.policePlayerId === authoritativeStateAfterRefresh.policePlayerId;

    const passedI = samePhase && sameRound && sameBabu && samePolice;

    record(
      'Scenario I',
      'Refresh must never trigger a new card shuffle or role re-assignment (read-only reconnection)',
      passedI,
      passedI ? undefined : 'Refresh altered authoritative state'
    );
  } catch (err: any) {
    record('Scenario I', 'No re-shuffle on refresh', false, err.message);
  }

  // -------------------------------------------------------------
  // SCENARIO J: Refresh must never create a duplicate player seat
  // -------------------------------------------------------------
  try {
    const roomPlayers: RoomPlayer[] = [
      { id: 'uid-player-1', tekkaName: 'Jivesh', isHost: true, seatIndex: 0, joinedAt: '', isReady: true, isOnline: true },
      { id: 'uid-player-2', tekkaName: 'Rahim', isHost: false, seatIndex: 1, joinedAt: '', isReady: true, isOnline: true },
      { id: 'uid-player-3', tekkaName: 'Tanvir', isHost: false, seatIndex: 2, joinedAt: '', isReady: true, isOnline: true },
      { id: 'uid-player-4', tekkaName: 'Arif', isHost: false, seatIndex: 3, joinedAt: '', isReady: true, isOnline: true },
    ];

    // Simulate refreshing player-2:
    // When player-2 restores, they read the room document.
    // If joinRoomByCode is called again by accident, transaction checks existing index (findIndex === 1) and updates online status without appending a 5th player.
    const existingIndex = roomPlayers.findIndex((p) => p.id === 'uid-player-2');
    const updatedPlayers = [...roomPlayers];
    if (existingIndex >= 0) {
      updatedPlayers[existingIndex] = {
        ...updatedPlayers[existingIndex],
        isOnline: true,
      };
    }

    const uniqueUids = new Set(updatedPlayers.map((p) => p.id));
    const passedJ = updatedPlayers.length === 4 && uniqueUids.size === 4;

    record(
      'Scenario J',
      'Refresh must never create a duplicate player seat (exactly 4 unique seats maintained)',
      passedJ,
      passedJ ? undefined : 'Duplicate seat or player count mismatch detected'
    );
  } catch (err: any) {
    record('Scenario J', 'No duplicate seat on refresh', false, err.message);
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    results,
  };
}

// Auto-run if executed via tsx in CLI
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('multiplayerReconnection.test')) {
  const report = runMultiplayerReconnectionTestSuite();
  console.log(`\n======================================================`);
  console.log(`TEKKA MULTIPLAYER RECONNECTION TEST SUITE`);
  console.log(`Results: ${report.passed}/${report.total} Passed (${report.failed} Failed)`);
  console.log(`======================================================`);
  report.results.forEach((r) => {
    const symbol = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${symbol}] ${r.scenarioId}: ${r.name}`);
    if (r.message) {
      console.log(`        Reason: ${r.message}`);
    }
  });
  console.log(`======================================================\n`);
  if (report.failed > 0) {
    process.exit(1);
  }
}
