import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Game } from '../types/game';
import { RoundOption } from '../games/chorPoliceDakatBabu/types';
import { RoomPlayer, RoomStatus, TekkaRoom } from '../types/room';

// Safe alphanumeric character set (excluding 0, O, 1, I, L to prevent confusion)
const ROOM_CODE_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generates an easily readable 6-character room code.
 */
export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * ROOM_CODE_CHARS.length);
    code += ROOM_CODE_CHARS[randomIndex];
  }
  return code;
}

/**
 * Creates a new Tekka Room for a selected game.
 */
export async function createRoom(
  hostUser: {
    uid: string;
    tekkaName: string;
    photoURL?: string;
    avatarUrl?: string;
  },
  game: Game,
  totalRounds: RoundOption = 5
): Promise<TekkaRoom> {
  if (!hostUser.uid || !hostUser.tekkaName) {
    throw new Error('Authenticated user with a registered Tekka Name is required.');
  }

  // Generate unique room code with collision prevention
  let roomCode = generateRoomCode();
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 5) {
    const q = query(
      collection(db, 'rooms'),
      where('roomCode', '==', roomCode),
      where('status', 'in', ['WAITING', 'STARTING', 'PLAYING'])
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      isUnique = true;
    } else {
      roomCode = generateRoomCode();
      attempts++;
    }
  }

  const roomRef = doc(collection(db, 'rooms'));
  const roomId = roomRef.id;
  const now = new Date().toISOString();

  const hostPlayer: RoomPlayer = {
    id: hostUser.uid,
    tekkaName: hostUser.tekkaName,
    photoURL: hostUser.photoURL,
    avatarUrl: hostUser.avatarUrl,
    isHost: true,
    seatIndex: 0,
    joinedAt: now,
    isReady: true,
    isOnline: true,
  };

  const newRoom: TekkaRoom = {
    id: roomId,
    roomCode,
    gameId: game.id,
    gameName: game.name,
    engineId: game.engineId || game.id,
    hostId: hostUser.uid,
    players: [hostPlayer],
    playerCount: 1,
    minPlayers: game.minPlayers || 4,
    maxPlayers: game.maxPlayers || 4,
    status: 'WAITING',
    totalRounds,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(roomRef, newRoom);
  return newRoom;
}

/**
 * Atomically joins an existing room by room code.
 * Enforces transaction safety and rejects if room is full.
 */
export async function joinRoomByCode(
  user: {
    uid: string;
    tekkaName: string;
    photoURL?: string;
    avatarUrl?: string;
  },
  roomCodeInput: string
): Promise<TekkaRoom> {
  if (!user.uid || !user.tekkaName) {
    throw new Error('You must be logged in with a Tekka Name to join.');
  }

  const normalizedCode = roomCodeInput.trim().toUpperCase();

  // Find active room with this code
  const q = query(
    collection(db, 'rooms'),
    where('roomCode', '==', normalizedCode),
    where('status', '==', 'WAITING')
  );
  const querySnap = await getDocs(q);

  if (querySnap.empty) {
    throw new Error('Room not found or no longer accepting players.');
  }

  const roomDocRef = querySnap.docs[0].ref;

  // Run atomic transaction to guarantee player slot reservation without race conditions
  return await runTransaction(db, async (transaction) => {
    const roomSnapshot = await transaction.get(roomDocRef);
    if (!roomSnapshot.exists()) {
      throw new Error('Room does not exist.');
    }

    const room = roomSnapshot.data() as TekkaRoom;

    if (room.status !== 'WAITING') {
      throw new Error('This room is no longer in the waiting lobby.');
    }

    // Check if user is already in the room (reconnection / refresh)
    const existingIndex = room.players.findIndex((p) => p.id === user.uid);
    if (existingIndex >= 0) {
      // User is already a participant, update their online status
      const updatedPlayers = [...room.players];
      updatedPlayers[existingIndex] = {
        ...updatedPlayers[existingIndex],
        tekkaName: user.tekkaName,
        photoURL: user.photoURL || updatedPlayers[existingIndex].photoURL,
        isOnline: true,
      };
      transaction.update(roomDocRef, {
        players: updatedPlayers,
        updatedAt: new Date().toISOString(),
      });
      return { ...room, players: updatedPlayers };
    }

    // Check capacity limit
    if (room.players.length >= room.maxPlayers || room.playerCount >= room.maxPlayers) {
      throw new Error('ROOM FULL');
    }

    const newPlayer: RoomPlayer = {
      id: user.uid,
      tekkaName: user.tekkaName,
      photoURL: user.photoURL,
      avatarUrl: user.avatarUrl,
      isHost: false,
      seatIndex: room.players.length,
      joinedAt: new Date().toISOString(),
      isReady: true,
      isOnline: true,
    };

    const updatedPlayers = [...room.players, newPlayer];
    const updatedCount = updatedPlayers.length;

    transaction.update(roomDocRef, {
      players: updatedPlayers,
      playerCount: updatedCount,
      updatedAt: new Date().toISOString(),
    });

    return {
      ...room,
      players: updatedPlayers,
      playerCount: updatedCount,
    };
  });
}

/**
 * Allows a player to leave a room lobby.
 */
export async function leaveRoom(roomId: string, uid: string): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);

  await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists()) return;

    const room = roomSnap.data() as TekkaRoom;
    if (room.status !== 'WAITING') return; // Cannot leave active match through lobby handler

    const updatedPlayers = room.players.filter((p) => p.id !== uid);

    if (updatedPlayers.length === 0) {
      transaction.update(roomRef, {
        status: 'ABANDONED',
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    // Reassign host if host left
    let newHostId = room.hostId;
    if (room.hostId === uid) {
      newHostId = updatedPlayers[0].id;
      updatedPlayers[0].isHost = true;
    }

    // Re-index seats
    const reindexedPlayers = updatedPlayers.map((p, idx) => ({
      ...p,
      seatIndex: idx,
    }));

    transaction.update(roomRef, {
      players: reindexedPlayers,
      playerCount: reindexedPlayers.length,
      hostId: newHostId,
      updatedAt: new Date().toISOString(),
    });
  });
}

/**
 * Updates room match configuration (e.g. Total Rounds 5, 10, 15, 20).
 */
export async function updateRoomRounds(
  roomId: string,
  hostUid: string,
  totalRounds: RoundOption
): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) throw new Error('Room not found');

  const room = snap.data() as TekkaRoom;
  if (room.hostId !== hostUid) {
    throw new Error('Only the host can modify match settings.');
  }

  await updateDoc(roomRef, {
    totalRounds,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Subscribes to real-time updates for a room document.
 */
export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: TekkaRoom | null) => void,
  onError?: (error: Error) => void
): () => void {
  const roomRef = doc(db, 'rooms', roomId);

  return onSnapshot(
    roomRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate({ id: snapshot.id, ...(snapshot.data() as Omit<TekkaRoom, 'id'>) });
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error('Room subscription error:', err);
      if (onError) onError(err);
    }
  );
}
