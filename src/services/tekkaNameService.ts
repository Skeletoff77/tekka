import { 
  doc, 
  getDoc, 
  runTransaction, 
  serverTimestamp 
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { validateTekkaName } from '../utils/usernameValidation';
import { NameAvailabilityCheck, UserProfile } from '../types/auth';

/**
 * Checks whether a Tekka name is available in real-time.
 */
export async function checkTekkaNameAvailability(
  rawName: string, 
  currentUid?: string,
  currentTekkaNameNormalized?: string
): Promise<NameAvailabilityCheck> {
  const validation = validateTekkaName(rawName);
  
  if (!validation.valid) {
    return {
      status: 'invalid',
      message: validation.error || 'Choose a valid Tekka name',
      normalized: validation.normalized,
    };
  }

  // If user is checking their own current name
  if (currentTekkaNameNormalized && validation.normalized === currentTekkaNameNormalized) {
    return {
      status: 'current',
      message: "That's your current Tekka name.",
      normalized: validation.normalized,
    };
  }

  try {
    const nameRef = doc(db, 'tekkaNames', validation.normalized);
    const snap = await getDoc(nameRef);

    if (!snap.exists()) {
      return {
        status: 'available',
        message: '✓ Available',
        normalized: validation.normalized,
      };
    }

    const data = snap.data();
    if (currentUid && data?.uid === currentUid) {
      return {
        status: 'current',
        message: "That's your current Tekka name.",
        normalized: validation.normalized,
      };
    }

    return {
      status: 'taken',
      message: '✕ This name is already taken',
      normalized: validation.normalized,
    };
  } catch (err: any) {
    console.error('Tekka Name Check Error Diagnostic:', {
      code: err?.code,
      message: err?.message,
      normalizedName: validation.normalized,
      currentAuthUid: auth.currentUser?.uid,
    });
    return {
      status: 'invalid',
      message: 'Could not verify name availability. Please try again.',
      normalized: validation.normalized,
    };
  }
}

/**
 * Atomically claims a new Tekka name for a user in Firestore.
 */
export async function claimTekkaName(
  rawName: string,
  fbUser: FirebaseUser,
  existingProfile?: Partial<UserProfile> | null
): Promise<{ success: boolean; error?: string; profile?: Partial<UserProfile> }> {
  const validation = validateTekkaName(rawName);

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const { sanitized, normalized } = validation;
  const uid = fbUser.uid;
  const nameRef = doc(db, 'tekkaNames', normalized);
  const userRef = doc(db, 'users', uid);

  try {
    await runTransaction(db, async (transaction) => {
      // Step 1: Read all documents in transaction first
      const nameDoc = await transaction.get(nameRef);
      const userDoc = await transaction.get(userRef);

      // Check if name is taken by another user
      if (nameDoc.exists()) {
        const nameData = nameDoc.data();
        if (nameData.uid !== uid) {
          throw new Error('That Tekka name is already taken.');
        }
      }

      // Step 2: Prepare user profile updates
      const creationDate = fbUser.metadata.creationTime 
        ? new Date(fbUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'August 2026';

      const userData = userDoc.exists() ? userDoc.data() : {};

      const updatedUserData: Record<string, any> = {
        uid,
        id: uid,
        tekkaName: sanitized,
        tekkaNameNormalized: normalized,
        username: sanitized, // for backwards compatibility
        email: fbUser.email || userData.email || '',
        googleDisplayName: fbUser.displayName || userData.googleDisplayName || '',
        displayName: sanitized,
        avatarUrl: fbUser.photoURL || userData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        photoURL: fbUser.photoURL || userData.photoURL || '',
        createdAt: userData.createdAt || creationDate,
        memberTier: userData.memberTier || 'Early Access Member',
        bio: userData.bio || 'Tactical strategist on the TEKKA gaming network.',
        country: userData.country || 'Global',
        wishlistedGameIds: Array.isArray(userData.wishlistedGameIds) ? userData.wishlistedGameIds : ['tekka-chor-police-dakat-babu'],
        preferences: userData.preferences || {
          emailNotifications: true,
          soundEffects: true,
          highPerformanceMode: true,
          streamerMode: false,
        },
        stats: userData.stats || {
          gamesTracked: 1,
          hoursSimulated: 0,
          platformRank: 42,
          reputationScore: 500,
        },
        updatedAt: serverTimestamp(),
      };

      // Step 3: Atomic writes
      transaction.set(nameRef, {
        uid,
        displayName: sanitized,
        normalized,
        createdAt: nameDoc.exists() ? nameDoc.data().createdAt || serverTimestamp() : serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      transaction.set(userRef, updatedUserData, { merge: true });
    });

    return {
      success: true,
      profile: {
        tekkaName: sanitized,
        tekkaNameNormalized: normalized,
        username: sanitized,
        displayName: sanitized,
      }
    };
  } catch (err: any) {
    console.error('Error claiming Tekka name in transaction:', err);
    return {
      success: false,
      error: err?.message || 'Failed to claim Tekka name. Please try again.',
    };
  }
}

/**
 * Atomically updates a user's Tekka name, releasing their old name reservation.
 */
export async function changeTekkaName(
  rawNewName: string,
  fbUser: FirebaseUser,
  currentProfile: UserProfile
): Promise<{ success: boolean; error?: string }> {
  const validation = validateTekkaName(rawNewName);

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const { sanitized, normalized } = validation;
  const oldNormalized = currentProfile.tekkaNameNormalized || currentProfile.username.toLowerCase();

  // If unchanged
  if (normalized === oldNormalized) {
    return { success: true };
  }

  const uid = fbUser.uid;
  const newNameRef = doc(db, 'tekkaNames', normalized);
  const oldNameRef = oldNormalized ? doc(db, 'tekkaNames', oldNormalized) : null;
  const userRef = doc(db, 'users', uid);

  try {
    await runTransaction(db, async (transaction) => {
      // Step 1: Read all documents first
      const newNameDoc = await transaction.get(newNameRef);
      const oldNameDoc = oldNameRef ? await transaction.get(oldNameRef) : null;
      const userDoc = await transaction.get(userRef);

      // Check if new name is already taken by another user
      if (newNameDoc.exists()) {
        const nameData = newNameDoc.data();
        if (nameData.uid !== uid) {
          throw new Error('That Tekka name is already taken.');
        }
      }

      // Step 2: Atomic writes
      // 2a: Release old reservation if it exists and belongs to current user
      if (oldNameDoc && oldNameDoc.exists()) {
        const oldData = oldNameDoc.data();
        if (oldData.uid === uid) {
          transaction.delete(oldNameRef!);
        }
      }

      // 2b: Reserve new name
      transaction.set(newNameRef, {
        uid,
        displayName: sanitized,
        normalized,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2c: Update user profile
      transaction.set(userRef, {
        tekkaName: sanitized,
        tekkaNameNormalized: normalized,
        username: sanitized,
        displayName: sanitized,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    });

    return { success: true };
  } catch (err: any) {
    console.error('Error changing Tekka name in transaction:', err);
    return {
      success: false,
      error: err?.message || 'Failed to update Tekka name. Please try again.',
    };
  }
}
