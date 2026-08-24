import { Game } from '../types/game';

export const GAMES: Game[] = [
  {
    id: 'chor-police-dakat-babu',
    name: 'Chor Police Dakat Babu',
    slug: 'chor-police-dakat-babu',
    engineId: 'chor-police-dakat-babu',
    tagline: 'The Legendary Paper Chits Social Deduction Classic Reborn',
    description: 'A modernized digital reimagining of the iconic South Asian social game. Four players receive confidential folded chits assigning roles: Babu (Landlord / 1200 pts), Police (Lawkeeper / 900 pts), Dakat (Robber / 600 pts), and Chor (Thief / 400 pts). The Police must deduce who among the remaining players is the sly thief without tipping off the table.',
    shortDescription: 'The traditional four-role deduction game digitally elevated with live multiplayer bluffing, room codes, and authentic cards.',
    category: 'social-deduction',
    categoryLabel: 'Social Deduction',
    status: 'available',
    statusLabel: 'Playable Now',
    featured: true,
    releaseLabel: 'Live Title',
    minPlayers: 4,
    maxPlayers: 4,
    estimatedDurationMinutes: 15,
    estimatedDuration: '10–15 min',
    difficulty: 'Easy',
    thumbnail: '/assets/games/chor-police-dakat-babu/Banner.png',
    banner: '/assets/games/chor-police-dakat-babu/Banner.png',
    coverArt: '/assets/games/chor-police-dakat-babu/Banner.png',
    tags: ['Social Deduction', 'Classic Reimagined', 'Bluffing', '4 Players', 'Card Game'],
    origin: 'Traditional Reimagined',
    rulesOverview: [
      {
        title: 'Secret Role Assignment',
        description: 'Chits are digitally shuffled and distributed in strict secrecy to all 4 players (Babu 1200, Police 900, Dakat 600, Chor 400).',
      },
      {
        title: 'The Babu Announcement',
        description: 'The Babu reveals their card immediately and orders the Police to find the Chor.',
      },
      {
        title: 'The Police Deduction & Guess',
        description: 'The Police must inspect the table and identify who is holding the Chor card.',
      },
      {
        title: 'Point Scored',
        description: 'A correct guess awards 900 points to the Police and 0 to the Chor. A wrong guess transfers points to the Chor!',
      },
    ],
    keyFeatures: [
      'Authentic artwork for Babu, Police, Dakat, Chor, and Deck Back',
      'Real-time 4-player online room codes with Firebase synchronization',
      'Interactive chit fold & peek animations',
      'Match score leaderboards across multi-round sets',
      'Cross-platform mobile and desktop browser compatibility',
    ],
    specs: [
      { label: 'Multiplayer', value: '4 Players Online' },
      { label: 'Match Format', value: '5 or 10 Round Sets' },
      { label: 'Platform', value: 'Tekka Web Engine' },
      { label: 'Controls', value: 'Click & Tap' },
    ],
  },
];

export const CATEGORIES: { id: Game['category']; label: string; count?: number }[] = [
  { id: 'social-deduction', label: 'Social Deduction' },
];
