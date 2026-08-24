export type GameStatus = 'available' | 'coming-soon' | 'maintenance' | 'hidden' | 'alpha';

export type GameCategory = 
  | 'all'
  | 'social-deduction'
  | 'strategy'
  | 'card-board'
  | 'tactical'
  | 'casual';

export interface GameRule {
  title: string;
  description: string;
  icon?: string;
}

export interface GameRequirement {
  label: string;
  value: string;
}

/**
 * Authoritative Game Metadata Entity.
 * Represents independent game catalog records stored in Firestore `games/{gameId}`.
 */
export interface Game {
  id: string; // Canonical Firestore document ID
  name: string; // Human-readable game name
  slug: string; // URL and application-safe unique identifier
  shortDescription: string; // Short summary for cards and discovery
  description: string; // Full in-depth description for game detail view
  thumbnail: string; // Artwork URL for card thumbnails
  banner: string; // Artwork URL for banners and hero backdrops
  logo?: string; // Optional logo asset URL
  logoText?: string; // Optional logo text fallback
  minPlayers: number; // Game rule: minimum players required
  maxPlayers: number; // Game rule: maximum players allowed
  estimatedDurationMinutes: number; // Structured numeric minutes for sorting/filtering
  estimatedDuration: string; // Formatted duration string e.g. "10–15 min"
  status: GameStatus; // Controlled lifecycle status
  featured: boolean; // Flag for featured platform promotion
  engineId?: string; // Optional stable engine identifier for future execution binding
  createdAt?: string | any; // Firestore server timestamp or ISO string
  updatedAt?: string | any; // Firestore server timestamp or ISO string

  // UI and discovery metadata
  tagline?: string;
  category?: GameCategory;
  categoryLabel?: string;
  statusLabel?: string;
  releaseLabel?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Tactical';
  coverArt?: string;
  tags?: string[];
  rulesOverview?: GameRule[];
  keyFeatures?: string[];
  specs?: GameRequirement[];
  origin?: 'Traditional Reimagined' | 'Tekka Original' | 'Licensed Classic';
  releaseQuarter?: string;
  trailerPlaceholderUrl?: string;
}

export interface GameFilterState {
  search: string;
  category: GameCategory;
  status: GameStatus | 'all';
  minPlayers: number | null;
  sortBy: 'featured' | 'name' | 'duration' | 'players';
  viewMode: 'scattered' | 'grid' | 'list';
}
