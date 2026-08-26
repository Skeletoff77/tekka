import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  LogOut, 
  Bookmark, 
  Sparkles, 
  Bell, 
  Volume2, 
  Cpu, 
  Check, 
  ArrowRight, 
  Trophy, 
  Activity, 
  Edit3,
  Globe,
  Loader2,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Game } from '../../types/game';
import { Modal } from '../common/Modal';
import { validateTekkaName } from '../../utils/usernameValidation';
import { checkTekkaNameAvailability } from '../../services/tekkaNameService';

interface UserProfileViewProps {
  onSelectGame: (game: Game) => void;
  allGames: Game[];
  onBackToHome: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=400&auto=format&fit=crop',
];

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  onSelectGame,
  allGames,
  onBackToHome,
}) => {
  const { 
    user, 
    firebaseUser, 
    logout, 
    updateProfile, 
    updateTekkaName, 
    openAuthModal 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'wishlist' | 'settings'>('overview');
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [bioText, setBioText] = useState(user?.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);

  // Tekka Name Editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [newNameInput, setNewNameInput] = useState('');
  const [nameStatus, setNameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'current'
  >('idle');
  const [nameStatusMsg, setNameStatusMsg] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSaveError, setNameSaveError] = useState<string | null>(null);
  const nameDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      setBioText(user.bio || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 px-6 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#141414] border border-[#2B2B2B] flex items-center justify-center text-[#E50914] shadow-xl shadow-red-950/30">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-black text-white">PROFILE ACCESS</h2>
          <p className="text-sm text-zinc-400">
            Sign in to track games, manage your tactical profile, and customize your preferences.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => openAuthModal('login')}
          >
            LOG IN TO TEKKA
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onBackToHome}
          >
            BACK TO GAMES
          </Button>
        </div>
      </div>
    );
  }

  const wishlistedGames = allGames.filter((g) =>
    user.wishlistedGameIds.includes(g.id)
  );

  const handleStartEditingName = () => {
    setNewNameInput(user.tekkaName || user.username);
    setNameStatus('current');
    setNameStatusMsg('This is your current Tekka name');
    setNameSaveError(null);
    setIsEditingName(true);
  };

  const handleNameInputChange = (val: string) => {
    setNewNameInput(val);
    setNameSaveError(null);

    if (nameDebounceRef.current) {
      clearTimeout(nameDebounceRef.current);
    }

    const trimmed = val.trim();
    if (!trimmed) {
      setNameStatus('idle');
      setNameStatusMsg('');
      return;
    }

    const validation = validateTekkaName(trimmed);
    if (!validation.valid) {
      setNameStatus('invalid');
      setNameStatusMsg(validation.error || 'Invalid name');
      return;
    }

    if (validation.normalized === (user.tekkaNameNormalized || user.tekkaName.toLowerCase())) {
      setNameStatus('current');
      setNameStatusMsg("That's your current Tekka name.");
      return;
    }

    setNameStatus('checking');
    setNameStatusMsg('Checking availability...');

    nameDebounceRef.current = setTimeout(async () => {
      const res = await checkTekkaNameAvailability(
        trimmed, 
        firebaseUser?.uid, 
        user.tekkaNameNormalized || user.tekkaName.toLowerCase()
      );
      setNameStatus(res.status);
      setNameStatusMsg(res.message);
    }, 350);
  };

  const handleSaveName = async () => {
    setNameSaveError(null);
    const validation = validateTekkaName(newNameInput);
    if (!validation.valid) {
      setNameStatus('invalid');
      setNameStatusMsg(validation.error || 'Choose a valid Tekka name');
      return;
    }

    if (validation.normalized === (user.tekkaNameNormalized || user.tekkaName.toLowerCase())) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    const res = await updateTekkaName(newNameInput);
    setIsSavingName(false);

    if (res.success) {
      setIsEditingName(false);
    } else {
      setNameSaveError(res.error || 'Failed to update Tekka name.');
      if (res.error?.includes('already taken')) {
        setNameStatus('taken');
        setNameStatusMsg('✕ This name is already taken');
      }
    }
  };

  const handleSaveBio = () => {
    updateProfile({ bio: bioText });
    setIsEditingBio(false);
  };

  const handleTogglePreference = (
    key: keyof typeof user.preferences
  ) => {
    updateProfile({
      preferences: {
        ...user.preferences,
        [key]: !user.preferences[key],
      },
    });
  };

  const isNameAvailable = nameStatus === 'available' || nameStatus === 'current';

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Profile Header Banner */}
      <div className="relative rounded-3xl border border-[#262626] bg-[#0D0D0D] p-6 sm:p-10 overflow-hidden shadow-2xl">
        {/* Background glow strictly red/black */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E50914]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E50914] to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative group cursor-pointer" onClick={() => setAvatarModalOpen(true)}>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#333] group-hover:border-[#E50914] transition-colors bg-[#1A1A1A] shadow-xl">
                <img
                  src={user.avatarUrl}
                  alt={user.tekkaName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity text-white text-xs font-mono-code">
                <Edit3 className="w-4 h-4 mr-1" />
                Change
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-[#E50914] text-white shadow-lg">
                <Shield className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-3">
              {/* Tekka Player Name + Tier */}
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <span className="text-[10px] font-mono-code uppercase tracking-wider text-[#FF4D4D] font-semibold">
                    TEKKA PLAYER
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-0.5">
                  <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                    {user.tekkaName || user.username}
                  </h1>
                  <Badge variant="featured" size="sm">
                    {user.memberTier}
                  </Badge>
                </div>
              </div>

              {/* Account Metadata Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono-code text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  Joined {user.createdAt}
                </span>
              </div>

              {/* Gamer Bio */}
              <div className="pt-1 max-w-lg">
                {isEditingBio ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      maxLength={120}
                      className="bg-[#141414] border border-[#333] rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E50914] w-full font-sans"
                    />
                    <Button variant="primary" size="sm" onClick={handleSaveBio}>
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingBio(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <p
                    onClick={() => setIsEditingBio(true)}
                    className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer italic transition-colors"
                  >
                    &ldquo;{user.bio || 'Click to set custom gamer bio...'}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<LogOut className="w-3.5 h-3.5 text-[#E50914]" />}
              onClick={() => {
                logout();
                onBackToHome();
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-[#1F1F1F] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-1 text-xs font-display font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Overview & Identity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`pb-2 px-1 text-xs font-display font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'wishlist'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>Tracked Titles</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1C1C1C] text-zinc-400">
              {wishlistedGames.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-2 px-1 text-xs font-display font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Preferences
          </button>
        </div>
      </div>

      {/* Tab 1: Overview & Identity */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Tekka Player Identity Management Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0A0A] border border-[#222] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]">
              <div>
                <h3 className="text-base font-display font-bold text-white tracking-wide flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#E50914]" />
                  TEKKA PLAYER IDENTITY
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Your unique public player name displayed to other gamers and leaderboards across Tekka.
                </p>
              </div>

              {!isEditingName && (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Edit3 className="w-3.5 h-3.5 text-[#E50914]" />}
                  onClick={handleStartEditingName}
                >
                  CHANGE NAME
                </Button>
              )}
            </div>

            {/* Current or Editable Name View */}
            {!isEditingName ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Public Tekka Identity */}
                <div className="p-4 rounded-2xl bg-[#121212] border border-[#242424] space-y-2">
                  <div className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-400">
                    CURRENT TEKKA NAME
                  </div>
                  <div className="text-xl font-display font-black text-white">
                    {user.tekkaName || user.username}
                  </div>
                  <div className="text-[11px] font-mono-code text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Registered & Verified</span>
                  </div>
                </div>

                {/* Account / Google Identity Details */}
                <div className="p-4 rounded-2xl bg-[#121212] border border-[#242424] space-y-2">
                  <div className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-400">
                    ACCOUNT IDENTITY
                  </div>
                  <div className="text-sm font-medium text-white space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400 font-mono-code">Email:</span>
                      <span className="text-xs text-zinc-200 font-mono-code">{user.email}</span>
                    </div>
                    {user.googleDisplayName && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400 font-mono-code">Google Name:</span>
                        <span className="text-xs text-zinc-300">{user.googleDisplayName}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] font-mono-code text-zinc-500">
                    * Account details remain private. Only your Tekka Name is public.
                  </div>
                </div>
              </div>
            ) : (
              /* Inline Tekka Name Editor */
              <div className="p-5 rounded-2xl bg-[#121212] border border-[#333] space-y-4 max-w-xl">
                <div className="space-y-1">
                  <div className="text-xs font-mono-code uppercase text-[#FF4D4D] font-bold">
                    Edit Tekka Name
                  </div>
                  <p className="text-xs text-zinc-400">
                    Updating your name will atomically transfer your player identity and release your old name.
                  </p>
                </div>

                {nameSaveError && (
                  <div className="p-3 rounded-xl bg-[#E50914]/15 border border-[#E50914]/40 text-xs text-[#FF6666] flex items-center gap-2">
                    <X className="w-4 h-4 shrink-0" />
                    <span>{nameSaveError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-mono-code text-zinc-300">
                    New Tekka name
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      autoFocus
                      value={newNameInput}
                      onChange={(e) => handleNameInputChange(e.target.value)}
                      placeholder="Enter new Tekka name"
                      maxLength={20}
                      className={`w-full bg-[#0A0A0A] text-white text-sm rounded-xl pl-4 pr-11 py-2.5 border font-mono-code transition-all focus:outline-none ${
                        nameStatus === 'available' || nameStatus === 'current'
                          ? 'border-emerald-500/60 focus:border-emerald-500'
                          : nameStatus === 'taken' || nameStatus === 'invalid'
                          ? 'border-[#E50914]/60 focus:border-[#E50914]'
                          : 'border-[#333] focus:border-[#E50914]'
                      }`}
                    />
                    <div className="absolute right-3 flex items-center pointer-events-none">
                      {nameStatus === 'checking' && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />}
                      {nameStatus !== 'checking' && (nameStatus === 'available' || nameStatus === 'current') && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                      {nameStatus !== 'checking' && (nameStatus === 'taken' || nameStatus === 'invalid') && (
                        <X className="w-4 h-4 text-[#FF4D4D]" />
                      )}
                    </div>
                  </div>

                  {/* Status Helper */}
                  <div className="flex items-center justify-between text-[11px] font-mono-code min-h-[20px]">
                    <span
                      className={
                        nameStatus === 'available' || nameStatus === 'current'
                          ? 'text-emerald-400'
                          : nameStatus === 'taken'
                          ? 'text-[#FF4D4D]'
                          : nameStatus === 'invalid'
                          ? 'text-[#FF7777]'
                          : 'text-zinc-400'
                      }
                    >
                      {nameStatusMsg || '3–20 chars • Letters, numbers & underscore'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveName}
                    disabled={!isNameAvailable || nameStatus === 'checking' || isSavingName}
                    isLoading={isSavingName}
                  >
                    SAVE NAME
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingName(false)}
                    disabled={isSavingName}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#222]">
              <div className="flex items-center gap-2 text-xs font-mono-code text-zinc-500 mb-1">
                <Bookmark className="w-3.5 h-3.5 text-[#E50914]" />
                <span>TITLES SAVED</span>
              </div>
              <span className="text-2xl font-display font-black text-white">
                {user.wishlistedGameIds.length}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#222]">
              <div className="flex items-center gap-2 text-xs font-mono-code text-zinc-500 mb-1">
                <Trophy className="w-3.5 h-3.5 text-[#E50914]" />
                <span>PLAYER RANK</span>
              </div>
              <span className="text-2xl font-display font-black text-white">
                #{user.stats.platformRank}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#222]">
              <div className="flex items-center gap-2 text-xs font-mono-code text-zinc-500 mb-1">
                <Activity className="w-3.5 h-3.5 text-[#E50914]" />
                <span>REPUTATION</span>
              </div>
              <span className="text-2xl font-display font-black text-white">
                {user.stats.reputationScore} PTS
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#222]">
              <div className="flex items-center gap-2 text-xs font-mono-code text-zinc-500 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
                <span>ACCOUNT STATUS</span>
              </div>
              <span className="text-2xl font-display font-black text-white">
                VERIFIED
              </span>
            </div>
          </div>

          {/* Quick Tracked Titles Preview */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0A0A] border border-[#222] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-white tracking-wide">
                SAVED GAMES
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('wishlist')}
                className="text-xs font-mono-code text-[#FF4D4D] hover:underline cursor-pointer"
              >
                View all ({wishlistedGames.length})
              </button>
            </div>

            {wishlistedGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {wishlistedGames.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => onSelectGame(game)}
                    className="p-4 rounded-2xl bg-[#111] border border-[#262626] hover:border-[#E50914]/50 transition-all cursor-pointer flex items-center gap-4 group"
                  >
                    <img
                      src={game.thumbnail}
                      alt={game.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-display font-bold text-white group-hover:text-[#FF3841] transition-colors truncate">
                        {game.name}
                      </h4>
                      <p className="text-xs text-zinc-400 font-mono-code mt-0.5">
                        {game.statusLabel} • {game.estimatedDuration}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic py-4">
                You have not tracked any games yet. Browse the catalog to wishlist upcoming releases.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Wishlist Full */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-bold text-white">
              Tracked Game Releases
            </h3>
            <span className="text-xs font-mono-code text-zinc-400">
              {wishlistedGames.length} titles saved
            </span>
          </div>

          {wishlistedGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistedGames.map((game) => (
                <div
                  key={game.id}
                  onClick={() => onSelectGame(game)}
                  className="p-5 rounded-2xl bg-[#0A0A0A] border border-[#222] hover:border-[#E50914]/60 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#161616]">
                    <img
                      src={game.thumbnail}
                      alt={game.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <Badge status={game.status} size="sm">{game.statusLabel}</Badge>
                    <h4 className="text-base font-display font-bold text-white group-hover:text-[#FF3841] transition-colors mt-2">
                      {game.name}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {game.shortDescription}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" fullWidth>
                    VIEW GAME SPECS
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-[#262626] bg-[#0A0A0A]">
              <Bookmark className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">No Tracked Games Yet</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Track titles in the game discovery catalog to receive priority access tokens.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Settings & Preferences */}
      {activeTab === 'settings' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0A0A] border border-[#222] space-y-6 max-w-2xl">
          <h3 className="text-lg font-display font-bold text-white">Platform Preferences</h3>

          <div className="space-y-4 divide-y divide-[#1C1C1C]">
            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#E50914]" />
                <div>
                  <p className="text-sm font-medium text-white">Game Notifications</p>
                  <p className="text-xs text-zinc-400">Receive alerts when friends invite you to game rooms.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={user.preferences.emailNotifications}
                onChange={() => handleTogglePreference('emailNotifications')}
                className="w-4 h-4 accent-[#E50914] cursor-pointer"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-[#E50914]" />
                <div>
                  <p className="text-sm font-medium text-white">Platform Audio Cues</p>
                  <p className="text-xs text-zinc-400">Play subtle sound feedback on button actions.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={user.preferences.soundEffects}
                onChange={() => handleTogglePreference('soundEffects')}
                className="w-4 h-4 accent-[#E50914] cursor-pointer"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-[#E50914]" />
                <div>
                  <p className="text-sm font-medium text-white">High Performance Rendering</p>
                  <p className="text-xs text-zinc-400">Prioritize 120 FPS animation timing.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={user.preferences.highPerformanceMode}
                onChange={() => handleTogglePreference('highPerformanceMode')}
                className="w-4 h-4 accent-[#E50914] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Avatar Selection Modal */}
      <Modal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        title="Select Gamer Avatar"
        subtitle="Choose your representative profile image for Tekka."
      >
        <div className="grid grid-cols-3 gap-4 pt-2">
          {AVATAR_OPTIONS.map((url, idx) => (
            <div
              key={idx}
              onClick={() => {
                updateProfile({ avatarUrl: url });
                setAvatarModalOpen(false);
              }}
              className={`relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${
                user.avatarUrl === url ? 'border-[#E50914] ring-2 ring-[#E50914]' : 'border-[#333]'
              }`}
            >
              <img src={url} alt={`Avatar option ${idx + 1}`} className="w-full h-full object-cover" />
              {user.avatarUrl === url && (
                <div className="absolute top-2 right-2 p-1 bg-[#E50914] rounded-full text-white">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
