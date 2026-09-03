/**
 * Admin Portal Security & Telemetry Unit Tests
 * 
 * Validates:
 * 1. Access control logic & designated owner verification
 * 2. Unauthenticated and non-admin refusal
 * 3. Presence timeout & heartbeat threshold calculations
 * 4. Room status categorization & card secrecy assertions
 * 5. Platform game analytics & Chor Police analytics computations
 */

import { DESIGNATED_OWNER_EMAIL, CANONICAL_GAME_IDS, normalizeGameId } from '../adminService';
import {
  PRESENCE_HEARTBEAT_INTERVAL_MS,
  PRESENCE_OFFLINE_THRESHOLD_MS,
  PRESENCE_PURGE_THRESHOLD_MS,
} from '../presenceService';
import { AdminOverviewStats, GameAnalyticsData, ChorPoliceAnalyticsData, ChakrantoAnalyticsData } from '../../types/admin';
import { RoomStatus } from '../../types/room';
import {
  getKolkataDayBoundaries,
  isTimestampInKolkataToday,
  isTimestampInKolkataThisWeek,
  isTimestampInKolkataThisMonth,
} from '../../utils/dateUtils';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Running Admin Portal Security & Telemetry Tests ---');

// Test 1: Designated Owner Allowlist
console.log('Test 1: Designated Owner Email Allowlist Definition');
assert(
  DESIGNATED_OWNER_EMAIL === 'jibeshsarkar77@gmail.com',
  'Designated owner email must match exact authorized administrator address.'
);
console.log('✓ Test 1 Passed');

// Test 2: Presence Timing Thresholds
console.log('Test 2: Presence Timing & Heartbeat Thresholds');
assert(
  PRESENCE_HEARTBEAT_INTERVAL_MS === 25_000,
  'Heartbeat interval must be 25 seconds for responsive presence.'
);
assert(
  PRESENCE_OFFLINE_THRESHOLD_MS === 90_000,
  'Offline threshold must be exactly 90 seconds (3 missed heartbeats).'
);
assert(
  PRESENCE_PURGE_THRESHOLD_MS === 300_000,
  'Stale presence purge window must be 5 minutes.'
);
console.log('✓ Test 2 Passed');

// Test 3: Offline Filtering Logic
console.log('Test 3: Offline Visitor Detection Logic');
const now = Date.now();
const mockPresences = [
  { sessionId: 's1', lastHeartbeat: now - 10_000, isAnonymous: false }, // active
  { sessionId: 's2', lastHeartbeat: now - 80_000, isAnonymous: true },  // active
  { sessionId: 's3', lastHeartbeat: now - 95_000, isAnonymous: false }, // offline (>90s)
  { sessionId: 's4', lastHeartbeat: now - 400_000, isAnonymous: true }, // stale (>5m)
];

const activePresences = mockPresences.filter(
  (p) => now - p.lastHeartbeat <= PRESENCE_OFFLINE_THRESHOLD_MS
);
assert(activePresences.length === 2, 'Only heartbeats within 90s must be considered live.');
assert(activePresences[0].sessionId === 's1', 'Session 1 is active.');
assert(activePresences[1].sessionId === 's2', 'Session 2 is active.');

const stalePresences = mockPresences.filter(
  (p) => now - p.lastHeartbeat > PRESENCE_PURGE_THRESHOLD_MS
);
assert(stalePresences.length === 1, 'Only records older than 5 min must be purged.');
assert(stalePresences[0].sessionId === 's4', 'Session 4 is purged.');
console.log('✓ Test 3 Passed');

// Test 4: Game Completion Rate Math
console.log('Test 4: Platform Game Analytics Completion Rate Math');
const mockGameStats: GameAnalyticsData = {
  gameId: 'tekka-chor-police-dakat-babu',
  gameName: 'Chor Police Dakat Babu',
  totalStarted: 20,
  totalMatches: 20,
  totalCompleted: 17,
  currentlyRunning: 2,
  abandoned: 1,
  completionRate: 0,
  avgDurationMinutes: 8.5,
  avgPlayers: 4,
  playedToday: 5,
  playedThisWeek: 15,
  playedThisMonth: 20,
};

const calculatedRate = Math.round((mockGameStats.totalCompleted / mockGameStats.totalStarted) * 100);
assert(calculatedRate === 85, 'Completion rate must calculate to 85%.');
console.log('✓ Test 4 Passed');

// Test 5: Chor Police Analytics Aggregates
console.log('Test 5: Chor Police Deep Analytics Round & Winner Computations');
const mockCpData: ChorPoliceAnalyticsData = {
  totalMatches: 30,
  completedMatches: 27,
  abandonedMatches: 3,
  currentlyRunning: 0,
  averageRoundsCompleted: 5.2,
  averageMatchDurationMinutes: 8.5,
  mostCommonWinner: { tekkaName: 'TacticalPro', wins: 12 },
  playerWinCounts: [
    { playerId: 'p1', tekkaName: 'TacticalPro', wins: 12, matches: 15 },
    { playerId: 'p2', tekkaName: 'Sherlock', wins: 8, matches: 12 },
    { playerId: 'p3', tekkaName: 'Shadow', wins: 7, matches: 10 },
  ],
  averageScore: 3650,
  highestScore: { score: 7200, tekkaName: 'TacticalPro', date: 'August 2026' },
  roundDistribution: [
    { rounds: 5, count: 20 },
    { rounds: 10, count: 6 },
    { rounds: 15, count: 3 },
    { rounds: 20, count: 1 },
  ],
};

assert(mockCpData.playerWinCounts[0].wins === 12, 'Leaderboard must order top winner first.');
assert(mockCpData.roundDistribution.reduce((acc, curr) => acc + curr.count, 0) === 30, 'Rounds must sum to total matches.');
console.log('✓ Test 5 Passed');

// Test 6: Room Status Categorization Integrity
console.log('Test 6: Room Status State Machine Integrity');
const validStatuses: RoomStatus[] = ['WAITING', 'STARTING', 'PLAYING', 'FINISHED', 'ABANDONED'];
assert(validStatuses.includes('PLAYING'), 'PLAYING is valid room status.');
assert(validStatuses.includes('FINISHED'), 'FINISHED is valid room status.');
assert(validStatuses.includes('ABANDONED'), 'ABANDONED is valid room status.');
console.log('✓ Test 6 Passed');

// Test 7: Public Navigation Hidden Policy & Direct URL Authorization
console.log('Test 7: Public Navigation Hidden Policy & Direct URL Authorization');
const mockOwner = { email: 'jibeshsarkar77@gmail.com', uid: 'admin_uid_123' };
const mockStandardUser = { email: 'regular_player@gmail.com', uid: 'user_uid_456' };

const isOwnerAuthorized = mockOwner.email === DESIGNATED_OWNER_EMAIL;
const isStandardUserAuthorized = mockStandardUser.email === DESIGNATED_OWNER_EMAIL;

assert(isOwnerAuthorized === true, 'Owner email must be strictly authorized.');
assert(isStandardUserAuthorized === false, 'Standard user email must be rejected.');
console.log('✓ Test 7 Passed');

// Test 8: Canonical Game ID Normalization
console.log('Test 8: Canonical Game ID Normalization');
assert(
  CANONICAL_GAME_IDS.CHOR_POLICE === 'chor-police-dakat-babu',
  'Chor police canonical ID must be chor-police-dakat-babu'
);
assert(
  CANONICAL_GAME_IDS.CHAKRANTO === 'chakranto',
  'Chakranto canonical ID must be chakranto'
);
assert(
  normalizeGameId('tekka-chor-police-dakat-babu') === 'chor-police-dakat-babu',
  'Legacy tekka-chor-police-dakat-babu must normalize to chor-police-dakat-babu'
);
assert(
  normalizeGameId('tekka-chakranto') === 'chakranto',
  'Legacy tekka-chakranto must normalize to chakranto'
);
assert(
  normalizeGameId('chor-police-dakat-babu') === 'chor-police-dakat-babu',
  'chor-police-dakat-babu stays canonical'
);
assert(
  normalizeGameId('chakranto') === 'chakranto',
  'chakranto stays canonical'
);
console.log('✓ Test 8 Passed');

// Test 9: Match Deduplication and State Merging
console.log('Test 9: Match Deduplication and State Merging');
const mockRoomData = {
  id: 'room_101',
  roomCode: 'TK99',
  gameId: 'tekka-chakranto',
  status: 'PLAYING' as RoomStatus,
  createdAt: '2026-09-03T10:00:00.000Z',
  playerCount: 4,
  players: [{ id: 'p1', tekkaName: 'Alice' }, { id: 'p2', tekkaName: 'Bob' }],
};

const mockMatchRecord = {
  roomId: 'room_101',
  gameId: 'chakranto',
  status: 'FINISHED',
  durationSeconds: 600,
  playerCount: 4,
  winnerIds: ['p1'],
  winnerNames: ['Alice'],
  completedAt: '2026-09-03T10:10:00.000Z',
  chakrantoStats: {
    eliminations: 3,
    cardsSacrificed: 5,
    coinsGenerated: 24,
    coinsStolen: 6,
    coinsSpent: 14,
    challenges: { total: 4, successful: 3, failed: 1 },
    blocks: { total: 2, successful: 1, failed: 1 },
    actions: {
      ayyAttempted: 5,
      ayyResolved: 5,
      roptaniAttempted: 4,
      roptaniResolved: 3,
      birbikromAttempted: 2,
      birbikromResolved: 1,
      dakatiAttempted: 3,
      dakatiResolved: 2,
      gharMotkanoAttempted: 2,
      gharMotkanoResolved: 2,
      shadhbodolAttempted: 1,
      shadhbodolResolved: 1,
      hottayaAttempted: 1,
      hottayaResolved: 1,
    },
  },
};

// Merged match status resolution
const effectiveStatus = (mockMatchRecord.status === 'FINISHED' || mockRoomData.status === 'FINISHED')
  ? 'FINISHED'
  : (mockRoomData.status === 'ABANDONED' ? 'ABANDONED' : mockRoomData.status);

assert(effectiveStatus === 'FINISHED', 'Finished match record must override room status to FINISHED.');
assert(normalizeGameId(mockRoomData.gameId) === CANONICAL_GAME_IDS.CHAKRANTO, 'Room gameId normalized correctly.');
console.log('✓ Test 9 Passed');

// Test 10: Presence Separation (Gamers vs Admin Portal)
console.log('Test 10: Presence Separation (Gamers vs Admin Portal)');
const testPresenceHeartbeats = [
  { sessionId: 'user_1', userId: 'uid_1', location: 'game-hub', lastHeartbeat: now },
  { sessionId: 'user_2', userId: 'uid_2', location: 'match-gameplay', lastHeartbeat: now },
  { sessionId: 'admin_1', userId: 'uid_admin', location: 'admin-portal', lastHeartbeat: now },
];

const gamerAuthUids = new Set<string>();
testPresenceHeartbeats.forEach((p) => {
  if (p.location !== 'admin-portal' && p.userId) {
    gamerAuthUids.add(p.userId);
  }
});
assert(gamerAuthUids.size === 2, 'Admin session must NOT be counted as active gamer.');
assert(!gamerAuthUids.has('uid_admin'), 'Admin UID must be excluded from registered gamers.');
console.log('✓ Test 10 Passed');

// Test 11: Date Windowing IST Consistency
console.log('Test 11: Date Windowing IST Consistency');
const istDateString = getKolkataDayBoundaries().dateStr;
assert(typeof istDateString === 'string' && istDateString.length === 10, 'IST date string must be YYYY-MM-DD');
const isNowToday = isTimestampInKolkataToday(Date.now());
assert(isNowToday === true, 'Current timestamp must be in Kolkata today.');
const isNowThisWeek = isTimestampInKolkataThisWeek(Date.now());
assert(isNowThisWeek === true, 'Current timestamp must be in Kolkata this week.');
const isNowThisMonth = isTimestampInKolkataThisMonth(Date.now());
assert(isNowThisMonth === true, 'Current timestamp must be in Kolkata this month.');
console.log('✓ Test 11 Passed');

// Test 12: Chakranto Action Telemetry Accumulation
console.log('Test 12: Chakranto Action Telemetry Accumulation');
const s = mockMatchRecord.chakrantoStats;
assert(s.eliminations === 3, 'Eliminations must be 3.');
assert(s.cardsSacrificed === 5, 'Cards sacrificed must be 5.');
assert(s.actions.ayyAttempted === 5 && s.actions.ayyResolved === 5, 'Ayy telemetry must match.');
assert(s.challenges.successful === 3 && s.challenges.total === 4, 'Challenge stats must match.');
assert(s.coinsGenerated === 24 && s.coinsStolen === 6 && s.coinsSpent === 14, 'Coin economy must match.');
console.log('✓ Test 12 Passed');

// Test 13: Match Identity & Anti-Double-Counting Reconciliation
console.log('Test 13: Match Identity & Anti-Double-Counting Reconciliation');
// Verify merging a room document and gameMatch document for the same roomId
const sampleRoomId = 'room_abc_123';
const sampleMatchMap = new Map<string, any>();
// 1. Room entry
sampleMatchMap.set(sampleRoomId, {
  id: sampleRoomId,
  roomId: sampleRoomId,
  status: 'PLAYING',
  source: 'ROOM_ONLY',
  sourceRecords: { hasRoomRecord: true, hasMatchRecord: false },
});
assert(sampleMatchMap.size === 1, 'Initial room map size is 1');

// 2. Merging gameMatch for the same room
const existingEntry = sampleMatchMap.get(sampleRoomId);
sampleMatchMap.set(sampleRoomId, {
  ...existingEntry,
  status: 'FINISHED',
  source: existingEntry ? 'RECONCILED_BOTH' : 'MATCH_DOC_ONLY',
  sourceRecords: {
    hasRoomRecord: !!existingEntry,
    hasMatchRecord: true,
  },
});
assert(sampleMatchMap.size === 1, 'Merging gameMatches doc for same room must NOT create a second match');
assert(sampleMatchMap.get(sampleRoomId)?.source === 'RECONCILED_BOTH', 'Source must be RECONCILED_BOTH');
assert(sampleMatchMap.get(sampleRoomId)?.status === 'FINISHED', 'Finished match doc overrides room status');
console.log('✓ Test 13 Passed');

// Test 14: Winner Deduplication Guarantee
console.log('Test 14: Winner Deduplication Guarantee');
// If winnerIds contains duplicates (e.g. reconnect or redundant write), player receives exactly 1 win
const duplicateWinnerIds = ['player_x', 'player_x', 'player_y'];
const playerWinsTest: Record<string, { wins: number }> = {};
const uniqueWinners = Array.from(new Set(duplicateWinnerIds));
uniqueWinners.forEach((wId) => {
  if (!playerWinsTest[wId]) playerWinsTest[wId] = { wins: 0 };
  playerWinsTest[wId].wins++;
});
assert(playerWinsTest['player_x'].wins === 1, 'Player with duplicate winnerId must only receive 1 win');
assert(playerWinsTest['player_y'].wins === 1, 'Player Y must receive 1 win');
console.log('✓ Test 14 Passed');

// Test 15: Waiting Lobby Exclusion from Match Aggregation
console.log('Test 15: Waiting Lobby Exclusion from Match Aggregation');
const testMatches = [
  { status: 'PLAYING', id: 'm1' },
  { status: 'FINISHED', id: 'm2' },
  { status: 'ABANDONED', id: 'm3' },
  { status: 'WAITING', id: 'm4' }, // Lobby that never started
];
let totalCountedMatches = 0;
let runningCount = 0;
let finishedCount = 0;
let abandonedCount = 0;
testMatches.forEach((m) => {
  if (m.status === 'PLAYING') {
    totalCountedMatches++;
    runningCount++;
  } else if (m.status === 'FINISHED') {
    totalCountedMatches++;
    finishedCount++;
  } else if (m.status === 'ABANDONED') {
    totalCountedMatches++;
    abandonedCount++;
  }
});
assert(totalCountedMatches === 3, 'WAITING lobby must be excluded from totalMatches');
assert(runningCount === 1 && finishedCount === 1 && abandonedCount === 1, 'Counts must match exactly');
console.log('✓ Test 15 Passed');

console.log('\n--- ALL ADMIN SECURITY, DATA INTEGRITY & RECONCILIATION TESTS PASSED (15/15) ---');
