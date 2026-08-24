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
  AlertCircle,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { Game } from '../../types/game';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { GameCard } from '../../games/chorPoliceDakatBabu/components/GameCard';
import { ROLE_METADATA } from '../../games/chorPoliceDakatBabu/assets/gameAssets';
import { CardRole } from '../../games/chorPoliceDakatBabu/types';
import { BannerIllustration } from '../../games/chorPoliceDakatBabu/assets/BannerIllustration';

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

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      success('Link Copied to Clipboard', `Share ${game.name} with your squad.`);
    } else {
      info('Share Link', window.location.href);
    }
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@')) {
      return;
    }
    setNotifySubmitted(true);
    setTimeout(() => {
      setNotifyModalOpen(false);
      setNotifySubmitted(false);
      success('Notification Registered', `We will alert ${notifyEmail} the moment ${game.name} enters early access.`);
    }, 1200);
  };

  // Find related games in same category or featured
  const relatedGames = allGames
    .filter((g) => g.id !== game.id)
    .slice(0, 3);

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-300">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono-code uppercase tracking-wider text-zinc-400 hover:text-white transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#E50914] transition-transform group-hover:-translate-x-1" />
          <span>Back to Game Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141414] border border-[#262626] text-xs font-mono-code text-zinc-300 hover:text-white hover:border-[#404040] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="relative w-full rounded-3xl border border-[#262626] bg-[#0A0A0A] overflow-hidden shadow-2xl">
        {/* Banner Artwork Container */}
        <div className="relative h-[340px] sm:h-[420px] md:h-[480px] w-full overflow-hidden">
          {!imageError ? (
            <img
              src={game.banner}
              alt={game.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center scale-100 transition-transform duration-1000"
            />
          ) : (
            <BannerIllustration className="w-full h-full object-cover" />
          )}

          {/* Cinematic Black Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-black/30" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/80 pointer-events-none" />

          {/* Top Edge Red Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E50914] to-transparent" />

          {/* Floating Content inside Banner */}
          <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                {game.featured && (
                  <Badge variant="featured">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    FEATURED TITLE
                  </Badge>
                )}
                <Badge status={game.status}>{game.statusLabel}</Badge>
                <Badge variant="category">{game.categoryLabel}</Badge>
                {game.origin && (
                  <span className="text-xs font-mono-code text-zinc-300 bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                    {game.origin}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tight leading-none">
                {game.name}
              </h1>

              <p className="text-sm sm:text-lg text-[#FF4D4D] font-mono-code font-medium mt-3">
                {game.tagline}
              </p>
            </div>

            {/* Banner Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {game.id === 'chor-police-dakat-babu' && onPlayGame && (
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Sparkles className="w-5 h-5 fill-current" />}
                  onClick={() => onPlayGame(game)}
                  className="bg-gradient-to-r from-[#E50914] to-red-600 hover:from-red-600 hover:to-red-700 shadow-xl shadow-red-950/60 animate-pulse font-black"
                >
                  PLAY NOW
                </Button>
              )}

              {game.id !== 'chor-police-dakat-babu' && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setNotifyModalOpen(true)}
                >
                  NOTIFY WHEN LIVE
                </Button>
              )}

              <Button
                variant={isTracked ? 'danger' : 'secondary'}
                size="lg"
                leftIcon={<Bookmark className={`w-4 h-4 ${isTracked ? 'fill-current' : ''}`} />}
                onClick={() => toggleWishlistGame(game.id)}
              >
                {isTracked ? 'TRACKED' : 'WISHLIST'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Game Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D0D] border border-[#222222] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#1A0A0A] border border-red-950 flex items-center justify-center text-[#E50914] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-400 block">
              Player Count
            </span>
            <span className="text-sm sm:text-base font-display font-bold text-white">
              {game.minPlayers === game.maxPlayers ? `${game.minPlayers} Players` : `${game.minPlayers} to ${game.maxPlayers} Players`}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D0D] border border-[#222222] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#1A0A0A] border border-red-950 flex items-center justify-center text-[#E50914] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-400 block">
              Session Time
            </span>
            <span className="text-sm sm:text-base font-display font-bold text-white">
              {game.estimatedDuration}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D0D] border border-[#222222] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#1A0A0A] border border-red-950 flex items-center justify-center text-[#E50914] shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-400 block">
              Complexity
            </span>
            <span className="text-sm sm:text-base font-display font-bold text-white">
              {game.difficulty} Tier
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D0D] border border-[#222222] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#1A0A0A] border border-red-950 flex items-center justify-center text-[#E50914] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-400 block">
              Target Release
            </span>
            <span className="text-sm sm:text-base font-display font-bold text-white">
              {game.releaseQuarter || 'Coming Soon'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Overview & Rules */}
        <div className="lg:col-span-8 space-y-8">
          {/* Deep Overview Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0A0A] border border-[#222222] space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E50914]" />
              <h3 className="text-xs font-mono-code uppercase tracking-[0.2em] text-zinc-400 font-bold">
                GAME OVERVIEW & CONCEPT
              </h3>
            </div>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              {game.description}
            </p>

            {/* Tags strip */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-[#1C1C1C]">
              {game.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-lg bg-[#141414] text-zinc-400 border border-[#262626]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Rules & Mechanics Section */}
          {game.rulesOverview && game.rulesOverview.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0A0A] border border-[#222222] space-y-6">
              <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                  <h3 className="text-xs font-mono-code uppercase tracking-[0.2em] text-zinc-400 font-bold">
                    CORE RULES & ROUND FLOW
                  </h3>
                </div>
                <span className="text-xs font-mono-code text-[#FF4D4D]">
                  PHASE 1 BLUEPRINT
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {game.rulesOverview.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#0F0F0F] border border-[#222222] space-y-2 hover:border-[#E50914]/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs font-mono-code text-[#E50914]">
                      <span className="font-bold">0{idx + 1}.</span>
                      <span className="text-white font-display font-bold tracking-wide">
                        {rule.title}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official 4 Cards Artwork Gallery for Chor Police Dakat Babu */}
          {game.id === 'chor-police-dakat-babu' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0A0A] border border-[#222222] space-y-6">
              <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                  <h3 className="text-xs font-mono-code uppercase tracking-[0.2em] text-zinc-400 font-bold">
                    OFFICIAL 4-CARD ARSENAL
                  </h3>
                </div>
                <span className="text-xs font-mono-code text-amber-400 font-bold">
                  AUTHENTIC ARTWORK
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
                {(['babu', 'police', 'dakat', 'chor'] as CardRole[]).map((role) => (
                  <div key={role} className="flex flex-col items-center">
                    <GameCard
                      role={role}
                      size="sm"
                      showPoints={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Platform Features */}
          {game.keyFeatures && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0A0A0A] border border-[#222222] space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                <h3 className="text-xs font-mono-code uppercase tracking-[0.2em] text-zinc-400 font-bold">
                  PLANNED DIGITAL CAPABILITIES
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {game.keyFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#121212] border border-[#202020]">
                    <CheckCircle2 className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-zinc-300 font-medium leading-tight">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Platform Readiness & Specs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Phase 1 Status Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#161616] to-[#0A0A0A] border border-[#2B2B2B] space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono-code text-[#FF4D4D]">
              <AlertCircle className="w-4 h-4" />
              <span>PHASE 1 EARLY ACCESS</span>
            </div>

            <h4 className="text-lg font-display font-bold text-white">
              Under Platform Development
            </h4>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Matchmaking, digital game rooms, and multiplayer real-time engines for {game.name} will unlock in Phase 2. Register your account to receive test priority.
            </p>

            <Button
              variant="primary"
              fullWidth
              size="md"
              onClick={() => setNotifyModalOpen(true)}
            >
              REGISTER FOR ALPHA INVITE
            </Button>
          </div>

          {/* Technical Specs Card */}
          <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-[#222222] space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#E50914]" />
              <h4 className="text-xs font-mono-code uppercase tracking-wider text-zinc-400 font-bold">
                ENGINE SPECIFICATIONS
              </h4>
            </div>

            <div className="divide-y divide-[#1C1C1C]">
              {game.specs?.map((spec, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono-code">{spec.label}</span>
                  <span className="text-white font-medium">{spec.value}</span>
                </div>
              ))}
              <div className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono-code">Cross-Device</span>
                <span className="text-white font-medium">Desktop, Tablet, Mobile</span>
              </div>
              <div className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono-code">Multiplayer Type</span>
                <span className="text-white font-medium">Authoritative WebSocket</span>
              </div>
            </div>
          </div>

          {/* Need Assistance / Feedback */}
          <div className="p-5 rounded-2xl bg-[#0F0F0F] border border-[#222] flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-white">Have feedback or rule suggestions?</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Join our Discord community or contact the Tekka game architect council.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Games Carousel / Strip */}
      <div className="pt-8 border-t border-[#1C1C1C] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-bold text-white tracking-tight">
              MORE TEKKA TITLES
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Explore other games curated for the platform
            </p>
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
              <p className="text-xs text-zinc-500 line-clamp-1 mt-1">
                {related.shortDescription}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Modal */}
      <Modal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        title="Notify Me When Live"
        subtitle={`Be the first to join closed testing for ${game.name}.`}
      >
        <form onSubmit={handleNotifySubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] flex items-center gap-3">
            <img
              src={game.thumbnail}
              alt={game.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <p className="text-sm font-display font-bold text-white">{game.name}</p>
              <p className="text-xs font-mono-code text-zinc-400">{game.releaseLabel}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Email Address
            </label>
            <input
              type="email"
              required
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full rounded-xl bg-[#111111] border border-[#262626] px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
            <p className="text-[11px] text-zinc-500">
              We respect your privacy. Zero spam, strictly game release updates.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setNotifyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={notifySubmitted}
            >
              REGISTER ALERT
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
