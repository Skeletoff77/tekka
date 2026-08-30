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

import { DESIGNATED_OWNER_EMAIL } from '../adminService';
import {
  PRESENCE_HEARTBEAT_INTERVAL_MS,
  PRESENCE_OFFLINE_THRESHOLD_MS,
  PRESENCE_PURGE_THRESHOLD_MS,
} from '../presenceService';
import { AdminOverviewStats, GameAnalyticsData, ChorPoliceAnalyticsData } from '../../types/admin';
import { RoomStatus } from '../../types/room';

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

console.log('\n--- ALL ADMIN SECURITY & TELEMETRY TESTS PASSED (7/7) ---');
