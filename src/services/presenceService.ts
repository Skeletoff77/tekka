/**
 * Privacy-Conscious Live Visitor and User Presence Service
 * 
 * Features:
 * - Differentiates anonymous visitors from authenticated users
 * - Transmits periodic heartbeats without collecting unnecessary PII
 * - Automatically purges stale presence documents
 * - Provides real-time subscriptions for authorized admin dashboard
 */

import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  getDocs,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LivePresence, PresenceLocation } from '../types/admin';

// Configuration
export const PRESENCE_HEARTBEAT_INTERVAL_MS = 25_000; // 25s
export const PRESENCE_OFFLINE_THRESHOLD_MS = 90_000;  // 90s timeout
export const PRESENCE_PURGE_THRESHOLD_MS = 5 * 60_000; // 5 min cleanup

// Generate or retrieve persistent visitor session ID
function getOrCreateSessionId(uid?: string): string {
  if (uid) {
    return `user_${uid}`;
  }
  
  try {
    const existing = sessionStorage.getItem('tekka_visitor_session_id');
    if (existing) return existing;
    
    const newId = `anon_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
    sessionStorage.setItem('tekka_visitor_session_id', newId);
    return newId;
  } catch {
    return `anon_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
  }
}

let activeHeartbeatTimer: any = null;
let currentSessionDocId: string | null = null;

/**
 * Starts sending heartbeats for the current visitor/user.
 */
export function startPresenceHeartbeat(params: {
  uid?: string;
  tekkaName?: string;
  location: PresenceLocation;
  roomId?: string;
  gameId?: string;
}): () => void {
  // Stop existing timer if any
  if (activeHeartbeatTimer) {
    clearInterval(activeHeartbeatTimer);
    activeHeartbeatTimer = null;
  }

  const sessionId = getOrCreateSessionId(params.uid);
  currentSessionDocId = sessionId;
  const isAnonymous = !params.uid;

  const sendHeartbeat = async () => {
    try {
      const presenceRef = doc(db, 'presence', sessionId);
      const payload: LivePresence = {
        sessionId,
        uid: params.uid || undefined,
        tekkaName: params.tekkaName || undefined,
        isAnonymous,
        location: params.location,
        roomId: params.roomId || undefined,
        gameId: params.gameId || undefined,
        lastHeartbeat: Date.now(),
        createdAt: new Date().toISOString(),
      };
      await setDoc(presenceRef, payload, { merge: true });
    } catch {
      // Benign network or unauthenticated presence errors are caught silently
    }
  };

  // Immediate first heartbeat
  sendHeartbeat();

  // Periodic interval
  activeHeartbeatTimer = setInterval(sendHeartbeat, PRESENCE_HEARTBEAT_INTERVAL_MS);

  // Unload handler to clean up session gracefully
  const handleUnload = () => {
    if (currentSessionDocId) {
      try {
        const presenceRef = doc(db, 'presence', currentSessionDocId);
        // Note: deleteDoc on unload is best-effort
        deleteDoc(presenceRef).catch(() => {});
      } catch {}
    }
  };

  window.addEventListener('beforeunload', handleUnload);

  // Return cleanup function
  return () => {
    if (activeHeartbeatTimer) {
      clearInterval(activeHeartbeatTimer);
      activeHeartbeatTimer = null;
    }
    window.removeEventListener('beforeunload', handleUnload);
    if (sessionId) {
      const presenceRef = doc(db, 'presence', sessionId);
      deleteDoc(presenceRef).catch(() => {});
    }
  };
}

/**
 * Subscribes an authorized admin to live presence records.
 * Filters out records older than PRESENCE_OFFLINE_THRESHOLD_MS.
 */
export function subscribeToLivePresence(
  callback: (presences: LivePresence[], breakdown: {
    totalVisitors: number;
    anonymousVisitors: number;
    authenticatedUsers: number;
    usersInRooms: number;
    usersOnGameHub: number;
    usersInGame: number;
    usersInAdmin: number;
  }) => void
): () => void {
  const presenceCol = collection(db, 'presence');
  
  const unsubscribe = onSnapshot(
    presenceCol,
    (snapshot) => {
      const now = Date.now();
      const activeList: LivePresence[] = [];

      let anonymousCount = 0;
      let authenticatedCount = 0;
      let inRoomsCount = 0;
      let onGameHubCount = 0;
      let inGameCount = 0;
      let inAdminCount = 0;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as LivePresence;
        // Check if heartbeat is within offline threshold (90s)
        if (data.lastHeartbeat && now - data.lastHeartbeat <= PRESENCE_OFFLINE_THRESHOLD_MS) {
          activeList.push(data);

          if (data.isAnonymous) {
            anonymousCount++;
          } else {
            authenticatedCount++;
          }

          if (data.location === 'in-game') inGameCount++;
          else if (data.location === 'room-lobby') inRoomsCount++;
          else if (data.location === 'admin-portal') inAdminCount++;
          else onGameHubCount++;

          if (data.roomId && data.location !== 'room-lobby' && data.location !== 'in-game') {
            inRoomsCount++;
          }
        }
      });

      callback(activeList, {
        totalVisitors: activeList.length,
        anonymousVisitors: anonymousCount,
        authenticatedUsers: authenticatedCount,
        usersInRooms: inRoomsCount,
        usersOnGameHub: onGameHubCount,
        usersInGame: inGameCount,
        usersInAdmin: inAdminCount,
      });
    },
    (err) => {
      console.warn('Presence subscription restricted or failed:', err.message);
      callback([], {
        totalVisitors: 0,
        anonymousVisitors: 0,
        authenticatedUsers: 0,
        usersInRooms: 0,
        usersOnGameHub: 0,
        usersInGame: 0,
        usersInAdmin: 0,
      });
    }
  );

  return unsubscribe;
}

/**
 * Sweeps and removes stale presence documents older than PURGE threshold.
 */
export async function purgeStalePresenceRecords(): Promise<number> {
  try {
    const presenceCol = collection(db, 'presence');
    const snap = await getDocs(presenceCol);
    const now = Date.now();
    const batch = writeBatch(db);
    let purgedCount = 0;

    snap.forEach((docSnap) => {
      const data = docSnap.data() as LivePresence;
      if (!data.lastHeartbeat || now - data.lastHeartbeat > PRESENCE_PURGE_THRESHOLD_MS) {
        batch.delete(docSnap.ref);
        purgedCount++;
      }
    });

    if (purgedCount > 0) {
      await batch.commit();
    }
    return purgedCount;
  } catch (err) {
    console.warn('Failed to purge stale presence records:', err);
    return 0;
  }
}
