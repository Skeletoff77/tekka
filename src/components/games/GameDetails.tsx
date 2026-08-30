import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  Bookmark, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  HelpCircle,
  Cpu,
  AlertTriangle
} from 'lucide-react';
import { Game } from '../../types/game';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { GameCard as ChorPoliceGameCard } from '../../games/chorPoliceDakatBabu/components/GameCard';
import { ROLE_METADATA as CHOR_POLICE_ROLE_METADATA } from '../../games/chorPoliceDakatBabu/assets/gameAssets';
import { CardRole } from '../../games/chorPoliceDakatBabu/types';
import { BannerIllustration as ChorPoliceBannerIllustration } from '../../games/chorPoliceDakatBabu/assets/BannerIllustration';
import { ChakrantoCard } from '../../games/chakranto/components/ChakrantoCard';
import { CHAKRANTO_CHARACTERS } from '../../games/chakranto/assets/chakrantoAssets';
import { ChakrantoCharacter } from '../../games/chakranto/types';

interface GameDetailsProps {
  game: Game;
  onBack: () => void;
  onSelectRelatedGame: (game: Game) => void;
  allGames: Game[];
  onPlayGame?: (game: Game) => void;
}

export const GameDetails: React.FC<GameDetailsProps> = ({
  game,
  onBack,
  onSelectRelatedGame,
  allGames,
  onPlayGame,
}) => {
  const { user, toggleWishlistGame, openAuthModal } = useAuth();
  const { success, info } = useToast();
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(user?.email || '');
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isTracked = user?.wishlistedGameIds.includes(game.id) || false;

  const handleTrackToggle = () => {
    if (!user) {
      openAuthModal('signup');
      return;
    }
    toggleWishlistGame(game.id);
    if (!isTracked) {
      success('Game Saved', `${game.name} added to your profile collection.`);
    } else {
      info('Game Removed', `${game.name} removed from saved list.`);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Play ${game.name} on Tekka`,
        text: game.shortDescription,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Link Copied', 'Game link copied to clipboard.');
    }
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setNotifySubmitted(true);
    setTimeout(() => {
      setNotifyModalOpen(false);
      setNotifySubmitted(false);
      success('Registered', 'You will receive priority notification for game updates.');
    }, 1200);
  };

  const relatedGames = allGames.filter(g => g.id !== game.id).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono-code uppercase tracking-wider text-zinc-400 hover:text-white transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>BACK TO LOBBY</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl border border-[#2B2B2B] bg-[#111111] text-zinc-400 hover:text-white hover:border-zinc-500 transition-all cursor-pointer"
            title="Share Game"
          >
            <Share2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleTrackToggle}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isTracked 
                ? 'border-[#E50914] bg-[#E50914]/10 text-[#FF4D4D]' 
                : 'border-[#2B2B2B] bg-[#111111] text-zinc-400 hover:text-white hover:border-zinc-500'
            }`}
            title={isTracked ? 'Game Saved' : 'Save Game'}
          >
            <Bookmark className={`w-4 h-4 ${isTracked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
        <div className="relative aspect-[21/9] min-h-[320px] sm:min-h-[420px] w-full overflow-hidden bg-black">
          {!imageError ? (
            <img
              src={game.banner}
              alt={game.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
              onError={() => setImageError(true)}
            />
          ) : game.id === 'chakranto' ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#1A0A0A] border border-red-900/60 text-center">
              <AlertTriangle className="w-10 h-10 text-red-500 mb-2" />
              <span className="text-sm font-mono-code font-bold text-red-400 uppercase">
                CHAKRANTO ASSET LOAD ERROR
              </span>
              <span className="text-xs font-mono-code text-zinc-500 mt-1 break-all">
                {game.banner}
              </span>
            </div>
          ) : game.id === 'chor-police-dakat-babu' ? (
            <ChorPoliceBannerIllustration title={game.name} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#181818] to-[#0A0A0A] p-6 text-center">
              <span className="text-xs font-mono-code uppercase tracking-widest text-[#FF4D4D] font-bold">
                TEKKA ORIGINAL
              </span>
              <span className="text-2xl font-display font-bold text-white mt-1">
                {game.name}
              </span>
            </div>
          )}

          {/* Dark Dramatic Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />

          {/* Hero Content Overlay */}
          <div className="absolute inset-0 p-6 sm:p-10 lg:p-14 flex flex-col justify-end">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge status={game.status} size="md">
                  {game.statusLabel}
                </Badge>
                <span className="text-xs font-mono-code text-zinc-400 tracking-wider">
                  ORIGIN: <strong className="text-zinc-200">{game.origin}</strong>
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white uppercase drop-shadow-md">
                {game.name}
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed max-w-2xl">
                {game.tagline}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                {onPlayGame && (
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Sparkles className="w-5 h-5 fill-current" />}
                    onClick={() => onPlayGame(game)}
                    className="shadow-lg shadow-[#E50914]/20 hover:shadow-[#E50914]/40"
                  >
                    PLAY ONLINE NOW
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<Bookmark className={`w-4 h-4 ${isTracked ? 'fill-current' : ''}`} />}
                  onClick={handleTrackToggle}
                >
                  {isTracked ? 'SAVED TO PROFILE' : 'SAVE GAME'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Specs Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-[#1F1F1F] bg-[#111111]/80 backdrop-blur-sm divide-x divide-[#1F1F1F]">
          <div className="p-4 sm:p-5 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-black border border-[#262626] text-[#E50914]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-400 block">
                Players Required
              </span>
              <span className="text-sm sm:text-base font-display font-bold text-white">
                {game.minPlayers === game.maxPlayers ? `${game.minPlayers} Players` : `${game.minPlayers}–${game.maxPlayers} Players`}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-black border border-[#262626] text-[#E50914]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-400 block">
                Avg Duration
              </span>
              <span className="text-sm sm:text-base font-display font-bold text-white">
                {game.estimatedDuration}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-black border border-[#262626] text-[#E50914]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-400 block">
                Skill Level
              </span>
              <span className="text-sm sm:text-base font-display font-bold text-white">
                {game.difficulty}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-black border border-[#262626] text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-400 block">
                Availability
              </span>
              <span className="text-sm sm:text-base font-display font-bold text-emerald-400">
                {game.statusLabel || 'Playable Now'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Game Lore, Authentic Cards, & Rules */}
        <div className="lg:col-span-8 space-y-8">
          {/* Overview / Story */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0A0A] border border-[#222222] space-y-4">
            <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E50914]" />
              Game Overview & Context
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-sans">
              {game.description}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {game.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-mono-code bg-[#141414] text-zinc-400 border border-[#262626]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Authentic Role / Character Cards Showcase */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0A0A] border border-[#222222] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1C1C1C] pb-4">
              <div>
                <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                  {game.id === 'chakranto' ? 'The 5 Strategic Character Cards' : 'The 4 Secret Chits & Roles'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {game.id === 'chakranto'
                    ? '15-card deck with 3 copies per character, dealt secretly to all players'
                    : 'Authentic deck illustrations dealt at random to all four players'}
                </p>
              </div>
            </div>

            {game.id === 'chakranto' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {(['brahmodoetto', 'kalu_dakat', 'petukchondro', 'bir_bikrom', 'ginner_badsha'] as ChakrantoCharacter[]).map((char) => {
                  const meta = CHAKRANTO_CHARACTERS[char];
                  return (
                    <div key={char} className="flex flex-col items-center gap-2">
                      <ChakrantoCard
                        character={char}
                        size="sm"
                        showDetails={false}
                        className="shadow-xl"
                      />
                      <div className="text-center">
                        <p className="text-xs font-display font-bold text-white uppercase">{meta.name}</p>
                        <p className="text-[10px] font-mono-code text-zinc-400">{meta.bengaliName}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : game.id === 'chor-police-dakat-babu' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(['babu', 'police', 'dakat', 'chor'] as CardRole[]).map((role) => {
                  const meta = CHOR_POLICE_ROLE_METADATA[role];
                  return (
                    <div key={role} className="flex flex-col items-center gap-2.5">
                      <ChorPoliceGameCard
                        role={role}
                        isRevealed={true}
                        size="md"
                        className="shadow-xl"
                      />
                      <div className="text-center">
                        <p className="text-xs font-display font-bold text-white uppercase">{meta.bengaliTitle}</p>
                        <p className="text-[10px] font-mono-code text-[#E50914] font-semibold">{meta.points} PTS</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Rules & Flow */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0A0A] border border-[#222222] space-y-6">
            <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E50914]" />
              Rules & Round Phases
            </h3>

            <div className="space-y-4">
              {game.rulesOverview.map((rule, idx) => (
                <div
                  key={rule.title}
                  className="p-4 rounded-2xl bg-[#111111] border border-[#1F1F1F] flex items-start gap-4"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] flex items-center justify-center text-xs font-mono-code font-bold shrink-0 mt-0.5">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-display font-bold text-white mb-1">
                      {rule.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0A0A] border border-[#222222] space-y-4">
            <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E50914]" />
              Platform Features & Mechanics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {game.keyFeatures.map((feat) => (
                <div key={feat} className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Platform Readiness & Specs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Play Info Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#181818] to-[#0A0A0A] border border-[#2B2B2B] space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-mono-code text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>LIVE MULTIPLAYER</span>
            </div>

            <h4 className="text-lg font-display font-bold text-white">
              Instant Online Rooms
            </h4>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Create a custom 4-player game room or join with a 6-character room code to play with friends anywhere.
            </p>

            {onPlayGame && (
              <Button
                variant="primary"
                fullWidth
                size="md"
                leftIcon={<Sparkles className="w-4 h-4 fill-current" />}
                onClick={() => onPlayGame(game)}
                className="bg-gradient-to-r from-[#E50914] to-red-600 font-bold cursor-pointer"
              >
                START / JOIN ROOM
              </Button>
            )}
          </div>

          {/* Technical Specs Card */}
          <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-[#222222] space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono-code text-zinc-400">
              <Cpu className="w-4 h-4 text-[#E50914]" />
              <span>SYSTEM SPECIFICATIONS</span>
            </div>

            <div className="divide-y divide-[#1C1C1C]">
              {game.specs.map((spec) => (
                <div key={spec.label} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono-code">{spec.label}</span>
                  <span className="text-white font-medium">{spec.value}</span>
                </div>
              ))}
              <div className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono-code">Multiplayer Type</span>
                <span className="text-white font-medium">Real-time Room Sync</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F0F0F] border border-[#222] flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-white">How to play?</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {game.id === 'chakranto'
                  ? 'Join a room with 3–6 players. Declare actions, bluff character powers, call challenges, and survive elimination!'
                  : 'Join a room with 4 players. Roles are secretly dealt: Babu reveals, Police deduces the Chor!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Games Strip (Only if multiple games exist) */}
      {relatedGames.length > 0 && (
        <div className="pt-8 border-t border-[#1C1C1C] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-display font-bold text-white tracking-tight">
                MORE TEKKA TITLES
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedGames.map((related) => (
              <div
                key={related.id}
                onClick={() => onSelectRelatedGame(related)}
                className="group relative rounded-2xl border border-[#222] bg-[#0A0A0A] p-4 hover:border-[#E50914]/50 cursor-pointer transition-all"
              >
                <div className="h-32 w-full rounded-xl overflow-hidden bg-[#141414] mb-3">
                  <img
                    src={related.thumbnail}
                    alt={related.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <Badge status={related.status} size="sm">{related.statusLabel}</Badge>
                  <span className="text-[10px] font-mono-code text-zinc-500">{related.estimatedDuration}</span>
                </div>
                <h4 className="text-sm font-display font-bold text-white group-hover:text-[#FF3841] transition-colors truncate">
                  {related.name}
                </h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <Modal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        title={`Stay Updated: ${game.name}`}
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Enter your email to receive early testing invites, patch notes, and tournament updates.
          </p>

          <form onSubmit={handleNotifySubmit} className="space-y-3">
            <input
              type="email"
              required
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="md"
              disabled={notifySubmitted}
            >
              {notifySubmitted ? 'Submitting...' : 'Confirm Registration'}
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  );
};
