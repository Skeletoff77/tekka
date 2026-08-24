import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  limit,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Game } from '../types/game';
import { INITIAL_GAMES } from '../data/games';

// In-memory cache layer to prevent duplicate queries and optimize performance
interface GameCache {
  games: Game[];
  timestamp: number;
}

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes cache validity
let memoryCache: GameCache | null = null;

/**
 * Normalizes a raw Firestore game document data into a strongly-typed Game entity.
 */
function formatGameDocument(id: string, data: any): Game {
  return {
    id,
    name: data.name || '',
    slug: (data.slug || id).toLowerCase(),
    engineId: data.engineId || undefined,
    tagline: data.tagline || '',
    description: data.description || '',
    shortDescription: data.shortDescription || '',
    category: data.category || 'all',
    categoryLabel: data.categoryLabel || 'General',
    status: data.status || 'coming-soon',
    statusLabel: data.statusLabel || 'Coming Soon',
    featured: Boolean(data.featured),
    releaseLabel: data.releaseLabel || 'Upcoming',
    minPlayers: typeof data.minPlayers === 'number' ? data.minPlayers : 2,
    maxPlayers: typeof data.maxPlayers === 'number' ? data.maxPlayers : 4,
    estimatedDurationMinutes: typeof data.estimatedDurationMinutes === 'number' ? data.estimatedDurationMinutes : 15,
    estimatedDuration: data.estimatedDuration || `${data.estimatedDurationMinutes || 15} min`,
    difficulty: data.difficulty || 'Medium',
    thumbnail: data.thumbnail || (id === 'chor-police-dakat-babu' ? '/assets/games/chor-police-dakat-babu/Banner.png' : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'),
    banner: data.banner || (id === 'chor-police-dakat-babu' ? '/assets/games/chor-police-dakat-babu/Banner.png' : 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1600&auto=format&fit=crop'),
    coverArt: data.coverArt || (id === 'chor-police-dakat-babu' ? '/assets/games/chor-police-dakat-babu/Banner.png' : undefined),
    logo: data.logo || undefined,
    logoText: data.logoText || undefined,
    tags: Array.isArray(data.tags) ? data.tags : [],
    origin: data.origin || 'Tekka Original',
    releaseQuarter: data.releaseQuarter || undefined,
    rulesOverview: Array.isArray(data.rulesOverview) ? data.rulesOverview : undefined,
    keyFeatures: Array.isArray(data.keyFeatures) ? data.keyFeatures : undefined,
    specs: Array.isArray(data.specs) ? data.specs : undefined,
    trailerPlaceholderUrl: data.trailerPlaceholderUrl || undefined,
    createdAt: data.createdAt ? (typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : String(data.createdAt)) : undefined,
    updatedAt: data.updatedAt ? (typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate().toISOString() : String(data.updatedAt)) : undefined,
  };
}

/**
 * Retrieves all registered games from Firestore.
 * Automatically excludes 'hidden' games unless `includeHidden: true`.
 * Implements transparent cache for optimal roundtrip efficiency.
 */
export async function getGames(options?: { 
  includeHidden?: boolean; 
  forceRefresh?: boolean;
}): Promise<Game[]> {
  const includeHidden = options?.includeHidden ?? false;
  const forceRefresh = options?.forceRefresh ?? false;
  const now = Date.now();

  // Return from cache if fresh
  if (!forceRefresh && memoryCache && (now - memoryCache.timestamp < CACHE_TTL_MS)) {
    if (includeHidden) return memoryCache.games;
    return memoryCache.games.filter(g => g.status !== 'hidden');
  }

  try {
    const gamesCollection = collection(db, 'games');
    const snapshot = await getDocs(gamesCollection);

    if (!snapshot.empty) {
      const fetchedGames: Game[] = snapshot.docs.map(docSnap => 
        formatGameDocument(docSnap.id, docSnap.data())
      );

      // Sort: Featured first, then alphabetically by name
      fetchedGames.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      });

      // Update cache
      memoryCache = {
        games: fetchedGames,
        timestamp: now,
      };

      if (includeHidden) return fetchedGames;
      return fetchedGames.filter(g => g.status !== 'hidden');
    }

    // If Firestore collection is not yet populated, return local INITIAL_GAMES fallback
    const fallbackList = [...INITIAL_GAMES];
    memoryCache = {
      games: fallbackList,
      timestamp: now,
    };

    if (includeHidden) return fallbackList;
    return fallbackList.filter(g => g.status !== 'hidden');
  } catch (error: any) {
    console.warn('GameService: Falling back to local initial games catalog due to network/read error:', error?.message);
    const fallbackList = [...INITIAL_GAMES];
    if (includeHidden) return fallbackList;
    return fallbackList.filter(g => g.status !== 'hidden');
  }
}

/**
 * Retrieves a single Game by its canonical Firestore document ID.
 */
export async function getGameById(gameId: string): Promise<Game | null> {
  if (!gameId || typeof gameId !== 'string') return null;

  // Check cache first
  if (memoryCache && (Date.now() - memoryCache.timestamp < CACHE_TTL_MS)) {
    const found = memoryCache.games.find(g => g.id === gameId);
    if (found) return found;
  }

  try {
    const gameDocRef = doc(db, 'games', gameId);
    const snap = await getDoc(gameDocRef);

    if (snap.exists()) {
      return formatGameDocument(snap.id, snap.data());
    }

    // Fallback search in local static data
    const localMatch = INITIAL_GAMES.find(g => g.id === gameId);
    return localMatch || null;
  } catch (error: any) {
    console.warn(`GameService: Error fetching game by id ${gameId}:`, error?.message);
    const localMatch = INITIAL_GAMES.find(g => g.id === gameId);
    return localMatch || null;
  }
}

/**
 * Retrieves a single Game by its unique URL slug.
 */
export async function getGameBySlug(slug: string): Promise<Game | null> {
  if (!slug || typeof slug !== 'string') return null;
  const normalizedSlug = slug.toLowerCase().trim();

  // Check cache first
  if (memoryCache && (Date.now() - memoryCache.timestamp < CACHE_TTL_MS)) {
    const found = memoryCache.games.find(g => g.slug === normalizedSlug);
    if (found) return found;
  }

  try {
    const gamesCollection = collection(db, 'games');
    const slugQuery = query(gamesCollection, where('slug', '==', normalizedSlug), limit(1));
    const snapshot = await getDocs(slugQuery);

    if (!snapshot.empty) {
      const firstDoc = snapshot.docs[0];
      return formatGameDocument(firstDoc.id, firstDoc.data());
    }

    // Fallback search in local static data
    const localMatch = INITIAL_GAMES.find(g => g.slug === normalizedSlug);
    return localMatch || null;
  } catch (error: any) {
    console.warn(`GameService: Error fetching game by slug ${slug}:`, error?.message);
    const localMatch = INITIAL_GAMES.find(g => g.slug === normalizedSlug);
    return localMatch || null;
  }
}

/**
 * Retrieves all featured games for platform showcases.
 */
export async function getFeaturedGames(): Promise<Game[]> {
  const allGames = await getGames();
  return allGames.filter(g => g.featured && g.status !== 'hidden');
}

/**
 * Retrieves all currently playable games (status: 'available').
 */
export async function getAvailableGames(): Promise<Game[]> {
  const allGames = await getGames();
  return allGames.filter(g => g.status === 'available');
}

/**
 * Verifies if a given game slug is unique and available.
 */
export async function checkGameSlugAvailability(slug: string, excludeGameId?: string): Promise<boolean> {
  if (!slug || typeof slug !== 'string') return false;
  const normalizedSlug = slug.toLowerCase().trim();

  try {
    const gamesCollection = collection(db, 'games');
    const slugQuery = query(gamesCollection, where('slug', '==', normalizedSlug), limit(2));
    const snapshot = await getDocs(slugQuery);

    if (snapshot.empty) return true;

    if (excludeGameId && snapshot.docs.length === 1 && snapshot.docs[0].id === excludeGameId) {
      return true;
    }

    return false;
  } catch (error) {
    console.warn('GameService: Error checking slug availability:', error);
    return false;
  }
}

/**
 * Clears the in-memory games cache.
 */
export function clearGamesCache(): void {
  memoryCache = null;
}
