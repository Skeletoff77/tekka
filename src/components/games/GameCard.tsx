import React, { useState } from 'react';
import { Users, Clock, Bookmark, ChevronRight, Sparkles } from 'lucide-react';
import { Game } from '../../types/game';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
  viewMode?: 'grid' | 'list';
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect, viewMode = 'grid' }) => {
  const { user, toggleWishlistGame } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isTracked = user?.wishlistedGameIds.includes(game.id) || false;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlistGame(game.id);
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onSelect(game)}
        className="group relative flex flex-col md:flex-row items-stretch rounded-2xl border border-[#222222] bg-[#0C0C0C] hover:border-[#E50914]/50 hover:bg-[#121212] transition-all duration-300 cursor-pointer overflow-hidden p-4 sm:p-5 gap-4 sm:gap-6"
      >
        {/* Left Thumbnail */}
        <div className="relative w-full md:w-64 h-44 shrink-0 rounded-xl overflow-hidden bg-[#161616]">
          {!imageError ? (
            <img
              src={game.thumbnail}
              alt={game.name}
              loading="eager"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#181818] text-zinc-600 font-mono-code text-xs">
              TEKKA ARCHIVE
            </div>
          )}

          {/* Featured Badge */}
          {game.featured && (
            <div className="absolute top-2.5 left-2.5">
              <Badge variant="featured" size="sm">FEATURED</Badge>
            </div>
          )}

          {/* Quick Track Button */}
          <button
            type="button"
            onClick={handleWishlistClick}
            className={`absolute top-2.5 right-2.5 p-2 rounded-lg backdrop-blur-md transition-all ${
              isTracked
                ? 'bg-[#E50914] text-white'
                : 'bg-black/60 text-zinc-400 hover:text-white hover:bg-black/80'
            }`}
            aria-label={isTracked ? 'Untrack game' : 'Track game'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isTracked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge status={game.status}>{game.statusLabel}</Badge>
              <Badge variant="category">{game.categoryLabel}</Badge>
              {game.origin && <span className="text-[11px] font-mono-code text-zinc-400">{game.origin}</span>}
            </div>

            <h3 className="text-xl font-display font-bold text-white group-hover:text-[#FF3841] transition-colors line-clamp-1">
              {game.name}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
              {game.shortDescription}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-[#1C1C1C]">
            <div className="flex items-center gap-4 text-xs font-mono-code text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-500" />
                {game.minPlayers === game.maxPlayers ? `${game.minPlayers} PLAYERS` : `${game.minPlayers}–${game.maxPlayers} PLAYERS`}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                {game.estimatedDuration}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs font-display font-semibold text-white group-hover:text-[#FF3841] transition-colors">
              <span>VIEW DETAILS</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid Mode (Default)
  return (
    <div
      onClick={() => onSelect(game)}
      className="group relative flex flex-col rounded-2xl border border-[#202020] bg-[#0A0A0A] hover:border-[#E50914]/60 hover:bg-[#0F0F0F] transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#E50914]/5"
    >
      {/* Top Media Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#161616]">
        {!imageError ? (
          <img
            src={game.thumbnail}
            alt={game.name}
            loading="eager"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#141414] text-zinc-600 font-mono-code text-xs">
            TEKKA SYSTEM
          </div>
        )}

        {/* Ambient Dark Gradient on Artwork */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/30 pointer-events-none" />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {game.featured && (
            <Badge variant="featured" size="sm">
              <Sparkles className="w-3 h-3 inline mr-1" />
              FEATURED
            </Badge>
          )}
          <Badge status={game.status} size="sm">
            {game.statusLabel}
          </Badge>
        </div>

        {/* Quick Wishlist Track */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
            isTracked
              ? 'bg-[#E50914] text-white shadow-md shadow-[#E50914]/30'
              : 'bg-black/60 text-zinc-400 hover:text-white hover:bg-black/80'
          }`}
          aria-label={isTracked ? 'Untrack game' : 'Track game'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isTracked ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom Specs Bar inside thumbnail */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono-code text-zinc-300">
          <span className="flex items-center gap-1.5 bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm border border-white/5">
            <Users className="w-3 h-3 text-red-500" />
            {game.minPlayers === game.maxPlayers ? `${game.minPlayers} PLAYERS` : `${game.minPlayers}–${game.maxPlayers} PLAYERS`}
          </span>
          <span className="flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm border border-white/5">
            <Clock className="w-3 h-3 text-zinc-400" />
            {game.estimatedDuration}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-mono-code uppercase tracking-wider text-zinc-500">
              {game.categoryLabel}
            </span>
            {game.releaseQuarter && (
              <span className="text-[10px] font-mono-code text-zinc-400">
                {game.releaseQuarter}
              </span>
            )}
          </div>

          <h3 className="text-lg font-display font-bold text-white group-hover:text-[#FF3841] transition-colors leading-tight">
            {game.name}
          </h3>

          <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
            {game.shortDescription}
          </p>
        </div>

        {/* Action Reveal Footer */}
        <div className="mt-5 pt-3 border-t border-[#1C1C1C] flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {game.tags.slice(0, 2).map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[#141414] text-zinc-400 border border-[#222]">
                {t}
              </span>
            ))}
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-display font-semibold text-zinc-300 group-hover:text-white transition-colors">
            <span>VIEW</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#E50914] transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </div>
  );
};
