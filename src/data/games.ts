import { Game } from '../types/game';

export const INITIAL_GAMES: Game[] = [
  {
    id: 'chakranto',
    name: 'CHAKRANTO',
    slug: 'chakranto',
    engineId: 'chakranto',
    tagline: 'The Authentic Bengali Strategy, Bluffing & Deception Card Game',
    description: 'Inspired by the beloved Bengali social deduction classic "Sorojontro" by DiceyMio. 3 to 6 players enter a fierce contest of wits wielding 15 character cards (Bromhodoitto, Kalu Dakat, Petukchondro, Bir Bikrom, Jiner Badsha). Claim stipends, raid purses, strike rivals, or execute secret card choices. Call bluffs to eliminate opponents or block strikes with supernatural defenses. The last surviving conspirator wins!',
    shortDescription: '3–6 player high-stakes Bengali bluffing card game with 5 iconic characters, secret roles, and intense challenge mechanics.',
    category: 'social-deduction',
    categoryLabel: 'Social Deduction',
    status: 'available',
    statusLabel: 'Playable Now',
    featured: true,
    releaseLabel: 'New Release',
    minPlayers: 3,
    maxPlayers: 6,
    estimatedDurationMinutes: 15,
    estimatedDuration: '10–20 min',
    difficulty: 'Medium',
    thumbnail: '/assets/games/chakranto/Banner.png',
    banner: '/assets/games/chakranto/Banner.png',
    coverArt: '/assets/games/chakranto/Banner.png',
    tags: ['Bengali Classic', 'Bluffing', 'Strategy', '3–6 Players', 'Card Game', 'Social Deduction'],
    origin: 'Traditional Reimagined',
    rulesOverview: [
      {
        title: 'Secret Role Cards',
        description: '15 cards total (3 copies of each of the 5 characters). Each player receives 2 confidential cards.',
      },
      {
        title: 'Action or Bluff Declaration',
        description: 'On your turn, declare an action (Roptani, Dakati, Shadbodol, Birotto Bhata, Ghar Motkano, or Hottaya). You can claim any character even if you do not hold them!',
      },
      {
        title: 'Challenges & Bluff Calling',
        description: 'Any living player can challenge your character claim. If you bluffed, you sacrifice a card. If you proved truth, the challenger sacrifices a card!',
      },
      {
        title: 'Defensive Blocks',
        description: 'Opponents can claim specific defender characters (e.g. Jiner Badsha blocks Ghar Motkano, Bir Bikrom blocks Roptani, Petukchondro/Kalu Dakat block Dakati).',
      },
      {
        title: 'Last Survivor Wins',
        description: 'Players losing both cards are eliminated. Standings and rankings are determined by survival order.',
      },
    ],
    keyFeatures: [
      '5 distinct Bengali characters: Bromhodoitto, Kalu Dakat, Petukchondro, Bir Bikrom, Jiner Badsha',
      'Dynamic 3 to 6 player real-time multiplayer room support with positions A through F',
      'Atomic challenge & block resolution engine with private hand protection',
      'Intelligent mandatory Hottaya trigger upon reaching 10+ coins',
      'Full elimination sequence tracking and podium standings calculation',
    ],
    specs: [
      { label: 'Multiplayer', value: '3 to 6 Players Online' },
      { label: 'Deck Size', value: '15 Cards (5x3)' },
      { label: 'Platform', value: 'Tekka Web Engine' },
      { label: 'Controls', value: 'Click & Tap' },
    ],
  },
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
    featured: false,
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

export const GAMES = INITIAL_GAMES;

export const CATEGORIES: { id: Game['category']; label: string; count?: number }[] = [
  { id: 'all', label: 'All Games' },
  { id: 'social-deduction', label: 'Social Deduction' },
];
