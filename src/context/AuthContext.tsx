import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateFirebaseProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile, AuthModalMode } from '../types/auth';
import { useToast } from './ToastContext';
import { getFirebaseAuthErrorMessage } from '../utils/authErrors';
import { claimTekkaName, changeTekkaName as executeChangeTekkaName } from '../services/tekkaNameService';
import { generateSuggestedTekkaName } from '../utils/usernameValidation';
import { clearActiveRoomSession } from '../services/activeRoomSession';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsTekkaNameSetup: boolean;
  suggestedTekkaName: string;
  authModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (suggestedName: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  submitTekkaName: (chosenName: string) => Promise<{ success: boolean; error?: string }>;
  updateTekkaName: (newTekkaName: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  toggleWishlistGame: (gameId: string) => Promise<boolean>;
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [needsTekkaNameSetup, setNeedsTekkaNameSetup] = useState<boolean>(false);
  const [suggestedTekkaName, setSuggestedTekkaName] = useState<string>('');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const { success, info } = useToast();

  // Synchronize Firestore user profile and verify Tekka Name status
  const checkAndLoadUserProfile = useCallback(async (fbUser: FirebaseUser): Promise<{ profile: UserProfile | null; needsSetup: boolean; suggested: string }> => {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userDoc = await getDoc(userRef);

      const creationDate = fbUser.metadata.creationTime 
        ? new Date(fbUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'August 2026';

      if (userDoc.exists()) {
        const data = userDoc.data();
        // Check if user has a verified unique Tekka Name
        if (data.tekkaName && typeof data.tekkaName === 'string' && data.tekkaName.trim().length >= 3) {
          const profile: UserProfile = {
            id: fbUser.uid,
            uid: fbUser.uid,
            tekkaName: data.tekkaName,
            tekkaNameNormalized: data.tekkaNameNormalized || data.tekkaName.toLowerCase(),
            username: data.tekkaName,
            email: fbUser.email || data.email || '',
            googleDisplayName: fbUser.displayName || data.googleDisplayName || '',
            displayName: data.tekkaName,
            avatarUrl: fbUser.photoURL || data.avatarUrl || DEFAULT_AVATAR,
            photoURL: fbUser.photoURL || data.photoURL || '',
            createdAt: data.createdAt || creationDate,
            memberTier: data.memberTier || 'Early Access Member',
            bio: data.bio || 'Tactical strategist on the TEKKA gaming network.',
            country: data.country || 'Global',
            wishlistedGameIds: Array.isArray(data.wishlistedGameIds) ? data.wishlistedGameIds : ['tekka-chor-police-dakat-babu'],
            preferences: {
              emailNotifications: data.preferences?.emailNotifications ?? true,
              soundEffects: data.preferences?.soundEffects ?? true,
              highPerformanceMode: data.preferences?.highPerformanceMode ?? true,
              streamerMode: data.preferences?.streamerMode ?? false,
            },
            stats: {
              gamesTracked: data.stats?.gamesTracked ?? (data.wishlistedGameIds?.length || 1),
              hoursSimulated: data.stats?.hoursSimulated ?? 0,
              platformRank: data.stats?.platformRank ?? 42,
              reputationScore: data.stats?.reputationScore ?? 500,
            },
          };
          return { profile, needsSetup: false, suggested: '' };
        }
      }

      // User needs to choose their unique Tekka player name
      const suggested = generateSuggestedTekkaName(fbUser.displayName, fbUser.email);
      return { profile: null, needsSetup: true, suggested };
    } catch (err) {
      console.error('Error checking Firestore user profile:', err);
      const suggested = generateSuggestedTekkaName(fbUser.displayName, fbUser.email);
      return { profile: null, needsSetup: true, suggested };
    }
  }, []);

  // Real Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentFbUser) => {
      setFirebaseUser(currentFbUser);
      if (currentFbUser) {
        const { profile, needsSetup, suggested } = await checkAndLoadUserProfile(currentFbUser);
        setUser(profile);
        setNeedsTekkaNameSetup(needsSetup);
        setSuggestedTekkaName(suggested);
      } else {
        setUser(null);
        setNeedsTekkaNameSetup(false);
        setSuggestedTekkaName('');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [checkAndLoadUserProfile]);

  const openAuthModal = (mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  // Real Firebase Email/Password Sign In
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const { profile, needsSetup, suggested } = await checkAndLoadUserProfile(userCredential.user);
      setUser(profile);
      setNeedsTekkaNameSetup(needsSetup);
      setSuggestedTekkaName(suggested);
      closeAuthModal();

      if (!needsSetup && profile) {
        success('Welcome back to TEKKA', `Authenticated as ${profile.tekkaName}`);
      }
      return { success: true };
    } catch (err: any) {
      const friendlyMsg = getFirebaseAuthErrorMessage(err);
      return { success: false, error: friendlyMsg };
    }
  };

  // Real Firebase Email/Password Registration
  const signup = async (
    suggestedName: string,
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      const cleanSuggested = suggestedName.trim() || generateSuggestedTekkaName(null, email);
      setSuggestedTekkaName(cleanSuggested);
      setNeedsTekkaNameSetup(true);
      closeAuthModal();
      return { success: true };
    } catch (err: any) {
      const friendlyMsg = getFirebaseAuthErrorMessage(err);
      return { success: false, error: friendlyMsg };
    }
  };

  // Real Firebase Google OAuth Sign In
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const { profile, needsSetup, suggested } = await checkAndLoadUserProfile(userCredential.user);
      setUser(profile);
      setNeedsTekkaNameSetup(needsSetup);
      setSuggestedTekkaName(suggested);
      closeAuthModal();

      if (!needsSetup && profile) {
        success('Google Sign-In Successful', `Welcome, ${profile.tekkaName}!`);
      }
      return { success: true };
    } catch (err: any) {
      const friendlyMsg = getFirebaseAuthErrorMessage(err);
      return { success: false, error: friendlyMsg };
    }
  };

  // Submit and atomically claim a unique Tekka Player Name (Mandatory Onboarding Step)
  const submitTekkaName = async (chosenName: string): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseUser) {
      return { success: false, error: 'Authentication required.' };
    }

    const res = await claimTekkaName(chosenName, firebaseUser, user);
    if (res.success) {
      // Reload updated profile
      const { profile } = await checkAndLoadUserProfile(firebaseUser);
      if (profile) {
        setUser(profile);
        setNeedsTekkaNameSetup(false);
        success('Tekka Identity Confirmed', `Welcome to the arena, ${profile.tekkaName}!`);
        return { success: true };
      }
    }
    return { success: false, error: res.error || 'Failed to claim Tekka name.' };
  };

  // Update existing Tekka Name from Profile Settings (Atomic release & reservation)
  const updateTekkaName = async (newTekkaName: string): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseUser || !user) {
      return { success: false, error: 'Authentication required.' };
    }

    const res = await executeChangeTekkaName(newTekkaName, firebaseUser, user);
    if (res.success) {
      const { profile } = await checkAndLoadUserProfile(firebaseUser);
      if (profile) {
        setUser(profile);
        success('Tekka Name Updated', `Your player identity is now ${profile.tekkaName}`);
        return { success: true };
      }
    }
    return { success: false, error: res.error || 'Failed to update Tekka name.' };
  };

  // Real Firebase Password Reset Email
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      const friendlyMsg = getFirebaseAuthErrorMessage(err);
      return { success: false, error: friendlyMsg };
    }
  };

  // Real Firebase Sign Out
  const logout = async (): Promise<void> => {
    try {
      clearActiveRoomSession();
      await signOut(auth);
      setUser(null);
      setNeedsTekkaNameSetup(false);
      setSuggestedTekkaName('');
      info('Logged Out', 'You have been safely disconnected from TEKKA.');
    } catch (err) {
      console.error('Error signing out of Firebase:', err);
    }
  };

  // Update other profile preferences
  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user || !firebaseUser) return;
    const updated = { ...user, ...updates };
    setUser(updated);

    try {
      if (updates.displayName && updates.displayName !== firebaseUser.displayName) {
        await updateFirebaseProfile(firebaseUser, { displayName: updates.displayName });
      }
      if (updates.avatarUrl && updates.avatarUrl !== firebaseUser.photoURL) {
        await updateFirebaseProfile(firebaseUser, { photoURL: updates.avatarUrl });
      }
      const userRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      success('Profile Updated', 'Your platform settings have been saved.');
    } catch (err) {
      console.warn('Could not persist profile changes to Firestore:', err);
      success('Profile Updated', 'Changes applied for this session.');
    }
  };

  // Toggle wishlist game and persist
  const toggleWishlistGame = async (gameId: string): Promise<boolean> => {
    if (!user || !firebaseUser) {
      openAuthModal('signup');
      return false;
    }
    const exists = user.wishlistedGameIds.includes(gameId);
    let updatedList: string[];
    if (exists) {
      updatedList = user.wishlistedGameIds.filter((id) => id !== gameId);
      info('Removed from Tracked Games');
    } else {
      updatedList = [...user.wishlistedGameIds, gameId];
      success('Game Tracked', 'You will receive priority notification when testing begins.');
    }

    const updated = {
      ...user,
      wishlistedGameIds: updatedList,
      stats: {
        ...user.stats,
        gamesTracked: updatedList.length,
      },
    };
    setUser(updated);

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userRef, {
        wishlistedGameIds: updatedList,
        'stats.gamesTracked': updatedList.length,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.warn('Could not persist wishlist change to Firestore:', err);
    }

    return !exists;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user && !needsTekkaNameSetup,
        isLoading,
        needsTekkaNameSetup,
        suggestedTekkaName,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        login,
        signup,
        loginWithGoogle,
        submitTekkaName,
        updateTekkaName,
        resetPassword,
        logout,
        updateProfile,
        toggleWishlistGame,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
