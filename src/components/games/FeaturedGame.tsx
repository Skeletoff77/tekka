import React, { useState } from 'react';
import { Sparkles, Users, Clock, ArrowRight, Bookmark, ShieldAlert } from 'lucide-react';
import { Game } from '../../types/game';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { BannerIllustration as ChorPoliceBannerIllustration } from '../../games/chorPoliceDakatBabu/assets/BannerIllustration';
import { AlertTriangle } from 'lucide-react';

interface FeaturedGameProps {
  game: Game;
  onSelect: (game: Game) => void;
}

export const FeaturedGame: React.FC<FeaturedGameProps> = ({ game, onSelect }) => {
  const { user, toggleWishlistGame } = useAuth();
  const [imageError, setImageError] = useState(false);
  const isTracked = user?.wishlistedGameIds.includes(game.id) || false;

  return (
    <div className="relative w-full rounded-3xl border border-[#262626] bg-gradient-to-b from-[#141414] to-[#0A0A0A] overflow-hidden shadow-2xl">
      {/* Top Red Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E50914] to-transparent z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[480px]">
        {/* Left / Info Column */}
        <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-between z-10">
          <div>
            {/* Header Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <Badge variant="featured">
                <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                FEATURED SPOTLIGHT
              </Badge>
              <Badge status={game.status}>{game.statusLabel}</Badge>
              <span className="text-xs font-mono-code text-zinc-400 border-l border-zinc-800 pl-2.5">
                {game.releaseLabel}
              </span>
            </div>

            {/* Title & Tagline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight leading-[1.08]">
              {game.name}
            </h2>

            <p className="text-sm sm:text-base text-[#FF4D4D] font-mono-code font-medium mt-2">
              {game.tagline}
            </p>

            <p className="text-xs sm:text-sm text-zinc-300 mt-4 leading-relaxed line-clamp-3">
              {game.description}
            </p>

            {/* Spec Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#222222]">
              <div className="rounded-xl bg-[#0F0F0F] border border-[#222] p-3">
                <span className="text-[10px] font-mono-code uppercase tracking-wider text-zinc-400 block mb-1">
                  Required Players
                </span>
                <div className="flex items-center gap-1.5 text-xs font-display font-bold text-white">
                  <Users className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>{game.minPlayers === game.maxPlayers ? `${game.minPlayers} Players` : `${game.minPlayers}–${game.maxPlayers} Players`}</span>
                </div>
              </div>

              <div className="rounded-xl bg-[#0F0F0F] border border-[#222] p-3">
                <span className="text-[10px] font-mono-code uppercase tracking-wider text-zinc-400 block mb-1">
                  Est. Session
                </span>
                <div className="flex items-center gap-1.5 text-xs font-display font-bold text-white">
                  <Clock className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>{game.estimatedDuration}</span>
                </div>
              </div>

              <div className="rounded-xl bg-[#0F0F0F] border border-[#222] p-3 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono-code uppercase tracking-wider text-zinc-400 block mb-1">
                  Game Archetype
                </span>
                <div className="flex items-center gap-1.5 text-xs font-display font-bold text-white truncate">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#E50914]" />
                  <span className="truncate">{game.categoryLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 mt-8 pt-4">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onSelect(game)}
            >
              EXPLORE GAME PROFILE
            </Button>

            <Button
              variant={isTracked ? 'danger' : 'secondary'}
              size="lg"
              leftIcon={<Bookmark className={`w-4 h-4 ${isTracked ? 'fill-current' : ''}`} />}
              onClick={() => toggleWishlistGame(game.id)}
            >
              {isTracked ? 'TRACKED IN WISHLIST' : 'TRACK RELEASE'}
            </Button>
          </div>
        </div>

        {/* Right / Artwork Column with layered visual depth */}
        <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-full overflow-hidden bg-[#0A0A0A]">
          {/* Main Background Image */}
          {!imageError ? (
            <img
              src={game.banner}
              alt={game.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 hover:scale-100"
            />
          ) : game.id === 'chakranto' ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#1A0A0A] border border-red-900/60 text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
              <span className="text-xs font-mono-code font-bold text-red-400 uppercase">
                CHAKRANTO ASSET LOAD ERROR
              </span>
              <span className="text-[10px] font-mono-code text-zinc-500 mt-1 break-all">
                {game.banner}
              </span>
            </div>
          ) : game.id === 'chor-police-dakat-babu' ? (
            <ChorPoliceBannerIllustration className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#181818] to-[#0A0A0A] p-6 text-center">
              <span className="text-xs font-mono-code uppercase tracking-widest text-[#FF4D4D] font-bold">
                TEKKA ORIGINAL
              </span>
              <span className="text-xl font-display font-bold text-white mt-1">
                {game.name}
              </span>
            </div>
          )}

          {/* Cinematic Overlays strictly Black & Red */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#141414] lg:via-transparent lg:to-black/40" />
          <div className="absolute inset-0 bg-[#E50914]/5 mix-blend-color-dodge pointer-events-none" />

          {/* Floating Game Emblem / Badge */}
          <div className="absolute bottom-6 right-6 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#E50914] flex items-center justify-center text-white font-black font-display text-base">
              TK
            </div>
            <div className="text-left">
              <span className="text-[10px] font-mono-code uppercase tracking-wider text-zinc-400 block">
                FLAGSHIP TITLE
              </span>
              <span className="text-xs font-display font-bold text-white tracking-wide">
                TEKKA ORIGINAL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
