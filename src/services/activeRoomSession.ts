/**
 * Active Room Local Persistence Service
 * 
 * Manages client-side persistence of the active multiplayer room reference
 * so that players refreshing their browser are automatically reconnected
 * to their live room/match.
 * 
 * SECURITY & ARCHITECTURAL MANDATES:
 * 1. ONLY stores non-sensitive identification metadata:
 *    - roomId
 *    - roomCode
 *    - gameId
 *    - playerId (authenticated UID)
 *    - updatedAt
 * 2. NEVER stores secret card assignments, private roles, authoritative game state,
 *    or scores in localStorage.
 * 3. Firestore remains the authoritative source of truth for all room membership,
 *    roles, turns, rounds, and game progression.
 */

export interface ActiveRoomSession {
  roomId: string;
  roomCode: string;
  gameId: string;
  playerId: string; // Authenticated Firebase UID
  updatedAt: string; // ISO timestamp
}

export const ACTIVE_ROOM_STORAGE_KEY = 'tekka_active_room_session';
export const ACTIVE_ROOM_SYNC_EVENT = 'tekka_active_room_sync';

/**
 * Saves the active room session reference to browser storage.
 */
export function saveActiveRoomSession(session: {
  roomId: string;
  roomCode: string;
  gameId: string;
  playerId: string;
}): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  if (!session.roomId || !session.playerId) {
    clearActiveRoomSession();
    return;
  }

  const payload: ActiveRoomSession = {
    roomId: session.roomId.trim(),
    roomCode: session.roomCode ? session.roomCode.trim().toUpperCase() : '',
    gameId: session.gameId ? session.gameId.trim() : 'chor-police-dakat-babu',
    playerId: session.playerId.trim(),
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(ACTIVE_ROOM_STORAGE_KEY, JSON.stringify(payload));
    // Broadcast for same-window listeners
    window.dispatchEvent(new CustomEvent(ACTIVE_ROOM_SYNC_EVENT, { detail: payload }));
  } catch (err) {
    console.warn('Failed to persist active room session to localStorage:', err);
  }
}

/**
 * Retrieves the currently active room session reference from browser storage.
 * Returns null if no session is stored, or if stored payload is malformed.
 */
export function getActiveRoomSession(): ActiveRoomSession | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const raw = localStorage.getItem(ACTIVE_ROOM_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.roomId === 'string' &&
      parsed.roomId.length > 0 &&
      typeof parsed.playerId === 'string' &&
      parsed.playerId.length > 0
    ) {
      return {
        roomId: parsed.roomId,
        roomCode: typeof parsed.roomCode === 'string' ? parsed.roomCode : '',
        gameId: typeof parsed.gameId === 'string' ? parsed.gameId : 'chor-police-dakat-babu',
        playerId: parsed.playerId,
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
      };
    }

    // Invalid schema, clear corrupted data
    clearActiveRoomSession();
    return null;
  } catch (err) {
    clearActiveRoomSession();
    return null;
  }
}

/**
 * Clears the active room session from browser storage.
 * Called when player intentionally leaves, room finishes, or becomes abandoned.
 */
export function clearActiveRoomSession(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(ACTIVE_ROOM_SYNC_EVENT, { detail: null }));
  } catch (err) {
    console.warn('Failed to clear active room session from localStorage:', err);
  }
}

/**
 * Subscribes to cross-tab storage changes and same-window custom sync events.
 * Returns an unsubscribe callback.
 */
export function subscribeToActiveRoomSession(
  onSessionChange: (session: ActiveRoomSession | null) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === ACTIVE_ROOM_STORAGE_KEY) {
      if (!event.newValue) {
        onSessionChange(null);
      } else {
        try {
          const parsed = JSON.parse(event.newValue);
          onSessionChange(parsed);
        } catch {
          onSessionChange(null);
        }
      }
    }
  };

  const handleCustomEvent = (event: Event) => {
    const custom = event as CustomEvent<ActiveRoomSession | null>;
    onSessionChange(custom.detail || null);
  };

  window.addEventListener('storage', handleStorageEvent);
  window.addEventListener(ACTIVE_ROOM_SYNC_EVENT, handleCustomEvent);

  return () => {
    window.removeEventListener('storage', handleStorageEvent);
    window.removeEventListener(ACTIVE_ROOM_SYNC_EVENT, handleCustomEvent);
  };
}
