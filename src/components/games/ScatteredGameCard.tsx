import React, { useState } from 'react';
import { Users, Clock, Bookmark, ArrowRight, Sparkles, Eye, Shield } from 'lucide-react';
import { Game } from '../../types/game';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

export interface CardLayoutConfig {
  rotation: number;      // e.g. -5.5
  scale: number;         // e.g. 1.02
  zIndex: number;        // e.g. 12
  topPercent?: number;   // for desktop absolute placement in canvas
  leftPercent?: number;  // for desktop absolute placement in canvas
  rightPercent?: number; // for desktop absolute placement in canvas
  widthPercent?: number; // width in canvas %
  aspectRatio?: string;  // e.g. '16/10' | '16/9' | '4/3'
}

interface ScatteredGameCardProps {
  game: Game;
  layout: CardLayoutConfig;
  index: number;
  onSelect: (game: Game) => void;
  isMobile?: boolean;
}

export const ScatteredGameCard: React.FC<ScatteredGameCardProps> = ({
  game,
  layout,
  index,
  onSelect,
  isMobile = false,
}) => {
  const { user, toggleWishlistGame } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isTracked = user?.wishlistedGameIds.includes(game.id) || false;
  const isActive = isHovered || isTouched;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlistGame(game.id);
  };

  const handleCardClick = () => {
    if (isMobile && !isTouched) {
      // First tap on mobile: activate/reveal details
      setIsTouched(true);
      return;
    }

    // Trigger smooth transition into game details
    setIsTransitioning(true);
    setTimeout(() => {
      onSelect(game);
    }, 220);
  };

  // Compute live transform
  // At rest: use configured rotation & scale
  // Hover / Active: dampens rotation towards 0deg (straightens slightly), scales up slightly, moves up
  const baseRotation = layout.rotation;
  const activeRotation = baseRotation * 0.25; // dampens rotation without losing character
  const baseScale = layout.scale;
  const activeScale = baseScale * 1.04;
  const currentRotation = isActive || isTransitioning ? activeRotation : baseRotation;
  const currentScale = isTransitioning ? baseScale * 1.08 : (isActive ? activeScale : baseScale);
  const currentTranslateY = isTransitioning ? -20 : (isActive ? -12 : 0);
  const currentZIndex = isTransitioning ? 60 : (isActive ? 45 : layout.zIndex);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${game.name}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsTouched(false);
      }}
      style={{
        transform: `perspective(1000px) rotate(${currentRotation}deg) scale(${currentScale}) translateY(${currentTranslateY}px)`,
        zIndex: currentZIndex,
        transformOrigin: 'center center',
      }}
      className={`
        group relative flex flex-col rounded-2xl md:rounded-3xl cursor-pointer select-none
        transition-all duration-300 ease-out will-change-transform
        ${
          isActive
            ? 'shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(229,9,20,0.25)] border-[#E50914] ring-1 ring-[#FF3841]/50'
            : 'shadow-[0_15px_40px_-10px_rgba(0,0,0,0.85)] border-[#262626] hover:border-zinc-500'
        }
        border bg-[#0C0C0C] overflow-hidden
      `}
    >
      {/* Physical Card Bevel / Top Matte Highlight */}
      <div className="absolute inset-0 rounded-2xl md:rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none z-30" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-30" />

      {/* Red Laser Corner Accent on Active */}
      <div
        className={`absolute -top-10 -right-10 w-24 h-24 bg-[#E50914]/20 rounded-full blur-xl pointer-events-none transition-opacity duration-300 z-20 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Primary Card Surface: Visual Artwork Banner */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9.5] overflow-hidden bg-[#141414]">
        {!imageError ? (
          <img
            src={game.banner || game.thumbnail}
            alt={game.name}
            loading="eager"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
              isActive ? 'scale-105 filter brightness-105 contrast-[1.03]' : 'scale-100'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#181818] to-[#0A0A0A] p-6 text-center">
            <span className="text-xs font-mono-code uppercase tracking-widest text-[#FF4D4D] font-bold">
              TEKKA VAULT
            </span>
            <span className="text-sm font-display font-bold text-white mt-1">
              {game.name}
            </span>
          </div>
        )}

        {/* Ambient Dark Gradient Vignette across Artwork */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/25 to-black/40 pointer-events-none z-10" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex flex-wrap items-center gap-2">
          {game.featured && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E50914] text-white text-[10px] font-mono-code font-bold uppercase tracking-wider shadow-lg shadow-[#E50914]/30 border border-[#FF3841]/40">
              <Sparkles className="w-3 h-3 fill-current" />
              <span>FEATURED</span>
            </div>
          )}
          <Badge status={game.status} size="sm">
            {game.statusLabel}
          </Badge>
        </div>

        {/* Quick Wishlist Bookmark Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isTracked ? `Remove ${game.name} from tracked` : `Track ${game.name}`}
          className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 sm:p-2.5 rounded-xl backdrop-blur-md transition-all duration-200 ${
            isTracked
              ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/40 border border-[#FF3841]'
              : 'bg-black/60 hover:bg-black/85 text-zinc-300 hover:text-white border border-white/10'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isTracked ? 'fill-current' : ''}`} />
        </button>

        {/* Resting Card Title Placard (Always visible when not hovering) */}
        <div
          className={`absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20 transition-all duration-300 ${
            isActive ? 'opacity-0 translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono-code text-zinc-400 uppercase tracking-widest block mb-0.5">
                {game.categoryLabel}
              </span>
              <h3 className="text-lg sm:text-2xl font-display font-black text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {game.name}
              </h3>
            </div>
            
            {/* Quick Specs Pill */}
            <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-mono-code text-zinc-300 shrink-0">
              <Users className="w-3 h-3 text-[#E50914]" />
              <span>{game.minPlayers === game.maxPlayers ? `${game.minPlayers}P` : `${game.minPlayers}–${game.maxPlayers}P`}</span>
            </div>
          </div>
        </div>

        {/* Interactive Reveal Curtain (Slides up smoothly on Hover / Focus / Tap) */}
        <div
          className={`
            absolute inset-x-0 bottom-0 z-20 p-4 sm:p-5
            bg-gradient-to-t from-[#0A0A0A] via-[#0C0C0C]/95 to-transparent
            backdrop-blur-md border-t border-[#262626]/80
            transition-all duration-300 ease-out flex flex-col justify-end
            ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}
          `}
        >
          {/* Top category & origin tags */}
          <div className="flex items-center justify-between text-[11px] font-mono-code text-zinc-400 mb-1.5">
            <span className="uppercase text-[#FF4D4D] font-bold tracking-wider">
              {game.categoryLabel}
            </span>
            <span>{game.origin || 'Tekka Original'}</span>
          </div>

          {/* Game Title */}
          <h3 className="text-lg sm:text-xl font-display font-black text-white leading-tight">
            {game.name}
          </h3>

          {/* Short Tagline / Snippet */}
          <p className="text-xs text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
            {game.shortDescription || game.tagline}
          </p>

          {/* Specs & CTA Bar */}
          <div className="mt-3.5 pt-3 border-t border-[#222222] flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs font-mono-code text-zinc-400">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-zinc-500" />
                <strong className="text-zinc-200">
                  {game.minPlayers === game.maxPlayers ? `${game.minPlayers}` : `${game.minPlayers}–${game.maxPlayers}`}
                </strong>
                <span className="text-[10px]">PLAYERS</span>
              </span>

              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-200">{game.estimatedDuration}</span>
              </span>
            </div>

            {/* Direct Launch CTA */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E50914] hover:bg-[#FF3841] text-white text-xs font-display font-bold uppercase tracking-wider shadow-md shadow-[#E50914]/30 transition-all group-hover:translate-x-0.5"
            >
              <span>VIEW GAME</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
