import React from 'react';
import { CardRole } from '../types';
import { CARD_ASSETS, ROLE_METADATA } from '../assets/gameAssets';
import { User, Eye } from 'lucide-react';

interface GameCardProps {
  role: CardRole | 'hidden';
  playerName?: string;
  isCurrentUser?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  showPoints?: boolean;
  isRevealed?: boolean;
  badgeLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  flipAnimation?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({
  role,
  playerName,
  isCurrentUser = false,
  isSelectable = false,
  isSelected = false,
  onSelect,
  showPoints = true,
  isRevealed = true,
  badgeLabel,
  size = 'md',
  className = '',
  flipAnimation = false,
}) => {
  const isHidden = role === 'hidden' || !role || !CARD_ASSETS[role as CardRole];
  const validRole = !isHidden && role ? (role as CardRole) : null;
  const cardSrc = isHidden || !validRole ? CARD_ASSETS.back : CARD_ASSETS[validRole];
  const roleMeta = validRole ? ROLE_METADATA[validRole] : null;

  const sizeClasses = {
    sm: 'w-[140px] h-[230px] sm:w-[160px] sm:h-[260px]',
    md: 'w-[190px] h-[310px] sm:w-[220px] sm:h-[360px] md:w-[240px] md:h-[390px]',
    lg: 'w-[240px] h-[390px] sm:w-[280px] sm:h-[450px] md:w-[320px] md:h-[510px]',
  };

  return (
    <div
      onClick={isSelectable ? onSelect : undefined}
      className={`relative group select-none transition-all duration-300 flex flex-col items-center ${
        isSelectable ? 'cursor-pointer hover:scale-105 active:scale-98' : ''
      } ${className}`}
    >
      {/* Player Header Tag */}
      {playerName && (
        <div className="mb-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141414] border border-[#262626] shadow-md z-10">
          <User className={`w-3 h-3 ${isCurrentUser ? 'text-[#E50914]' : 'text-zinc-400'}`} />
          <span
            className={`text-xs font-mono-code font-medium truncate max-w-[120px] ${
              isCurrentUser ? 'text-white font-bold' : 'text-zinc-300'
            }`}
          >
            {playerName}
          </span>
          {isCurrentUser && (
            <span className="text-[9px] px-1 py-0.2 rounded bg-[#E50914] text-white font-bold uppercase">
              YOU
            </span>
          )}
        </div>
      )}

      {/* Main Card Shell */}
      <div
        className={`relative ${sizeClasses[size]} rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 shadow-2xl ${
          isSelected
            ? 'ring-4 ring-[#E50914] shadow-[0_0_30px_rgba(229,9,20,0.6)] -translate-y-2'
            : isSelectable
            ? 'hover:ring-2 hover:ring-amber-400/80 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]'
            : 'border border-[#262626]'
        } ${flipAnimation ? 'animate-in zoom-in-95 duration-500' : ''}`}
      >
        {/* Glow halo behind card */}
        {roleMeta && !isHidden && (
          <div
            className="absolute inset-0 opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
            style={{ backgroundColor: roleMeta.glowColor }}
          />
        )}

        {/* Card Visual Artwork — Always render exact physical PNG asset without fallback illustration */}
        <div className="w-full h-full relative bg-[#0A0A0A] flex items-center justify-center p-1">
          <img
            src={cardSrc}
            alt={isHidden ? 'Hidden Card Chit' : roleMeta?.title || role}
            draggable={false}
            onLoad={() => {
              if (isHidden) {
                console.log('CARD BACK LOADED:', '/assets/games/chor-police-dakat-babu/card_back.png');
              }
            }}
            onError={(e) => {
              if (isHidden) {
                console.error('CARD BACK FAILED TO LOAD:', '/assets/games/chor-police-dakat-babu/card_back.png', e);
              } else {
                console.error(`FAILED TO LOAD CARD ARTWORK for ${role}:`, cardSrc, e);
              }
            }}
            className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-102 select-none"
            loading="eager"
          />
        </div>

        {/* Top Badges / Indicators */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20">
          {badgeLabel ? (
            <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono-code font-bold text-white uppercase tracking-wider shadow-lg">
              {badgeLabel}
            </span>
          ) : !isHidden && roleMeta ? (
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono-code font-bold uppercase tracking-wider backdrop-blur-md border shadow-lg ${roleMeta.badgeColor}`}
            >
              {roleMeta.title}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-black/70 text-zinc-400 border border-white/10 text-[10px] font-mono-code uppercase tracking-wider">
              HIDDEN
            </span>
          )}

          {isCurrentUser && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#E50914]/90 text-white text-[9px] font-mono-code font-bold shadow">
              <Eye className="w-2.5 h-2.5" />
              OWN
            </span>
          )}
        </div>

        {/* Selection Indicator Badge */}
        {isSelected && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none z-20">
            <span className="px-3 py-1 rounded-full bg-[#E50914] text-white text-xs font-mono-code font-bold uppercase tracking-wider shadow-lg animate-pulse">
              SELECTED SUSPECT
            </span>
          </div>
        )}
      </div>

      {/* Role Points & Title Footer Caption */}
      {!isHidden && roleMeta && showPoints && (
        <div className="mt-2 text-center">
          <span className="text-xs font-display font-bold text-white tracking-wide block">
            {roleMeta.title}
          </span>
          <span className="text-[11px] font-mono-code text-amber-400 font-semibold">
            +{roleMeta.points} PTS
          </span>
        </div>
      )}

      {isHidden && (
        <div className="mt-2 text-center">
          <span className="text-xs font-mono-code text-zinc-500 uppercase tracking-wider block">
            Hidden Chit
          </span>
          <span className="text-[10px] font-mono-code text-zinc-600">
            Chor or Dakat
          </span>
        </div>
      )}
    </div>
  );
};
