export interface UserProfile {
  id: string;
  uid: string;
  tekkaName: string;
  tekkaNameNormalized: string;
  username: string; // Synced with tekkaName for backward compatibility
  email: string;
  googleDisplayName?: string;
  displayName: string; // Display fallback
  avatarUrl: string;
  photoURL?: string;
  createdAt: string;
  memberTier: 'Founder' | 'Pro Gamer' | 'Early Access Member';
  bio?: string;
  country?: string;
  wishlistedGameIds: string[];
  preferences: {
    emailNotifications: boolean;
    soundEffects: boolean;
    highPerformanceMode: boolean;
    streamerMode: boolean;
  };
  stats: {
    gamesTracked: number;
    hoursSimulated: number;
    platformRank: number;
    reputationScore: number;
  };
}

export type AuthModalMode = 'login' | 'signup' | 'forgot-password';

export interface NameAvailabilityCheck {
  status: 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'current';
  message: string;
  normalized?: string;
}
