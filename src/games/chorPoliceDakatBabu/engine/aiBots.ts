/**
 * AI Bot Behavior Simulation for Chor Police Dakat Babu
 * Provides intelligent, natural bot decisions when seats are automated.
 */

import { BabuTargetChoice, CardRole, ChorPoliceGameState, PlayerSeat } from '../types';

export const BOT_NAMES = [
  'Arif (Tactician)',
  'Tanvir (Bluffer)',
  'Rahim (Old-Timer)',
  'Nabil (Officer)',
  'Kabir (Shadow)',
  'Fahim (Strategist)',
];

export function generateDefaultSeats(currentUserName: string = 'You'): PlayerSeat[] {
  return [
    {
      id: 'seat-0',
      name: `${currentUserName} (Host)`,
      seatIndex: 0,
      isHuman: true,
      isCurrentUser: true,
    },
    {
      id: 'seat-1',
      name: 'Rahim (AI)',
      seatIndex: 1,
      isHuman: false,
    },
    {
      id: 'seat-2',
      name: 'Tanvir (AI)',
      seatIndex: 2,
      isHuman: false,
    },
    {
      id: 'seat-3',
      name: 'Arif (AI)',
      seatIndex: 3,
      isHuman: false,
    },
  ];
}

/**
 * Decides Babu target choice for an automated seat
 */
export function getBotBabuChoice(): BabuTargetChoice {
  // 50/50 randomized tactical choice
  return Math.random() < 0.5 ? 'find-chor' : 'find-dakat';
}

/**
 * Decides Police guess between the 2 hidden suspects
 */
export function getBotPoliceGuess(state: ChorPoliceGameState): string {
  if (!state.babuPlayerId || !state.policePlayerId) {
    throw new Error('Missing Babu or Police roles');
  }

  // Get the 2 hidden players
  const hiddenPlayers = state.players.filter(
    (p) => p.id !== state.babuPlayerId && p.id !== state.policePlayerId
  );

  if (hiddenPlayers.length !== 2) {
    return hiddenPlayers[0]?.id || state.players[0].id;
  }

  // 50/50 fair deduction pick
  return Math.random() < 0.5 ? hiddenPlayers[0].id : hiddenPlayers[1].id;
}
