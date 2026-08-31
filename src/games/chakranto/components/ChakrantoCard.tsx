import React, { useState } from 'react';
import { ChakrantoCharacter } from '../types';
import { CHAKRANTO_CHARACTERS, CHAKRANTO_CARD_ASSETS } from '../assets/chakrantoAssets';
import { Skull, Check, AlertTriangle } from 'lucide-react';

interface ChakrantoCardProps {
  character?: ChakrantoCharacter | null;
  isBack?: boolean;
  isSacrificed?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export const ChakrantoCard: React.FC<ChakrantoCardProps> = ({
  character,
  isBack = false,
  isSacrificed = false,
  isSelected = false,
  onClick,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const [backImgError, setBackImgError] = useState(false);

  const sizeClasses =
    size === 'sm'
      ? 'w-20 sm:w-24 aspect-[1536/2752]'
      : size === 'lg'
      ? 'w-52 sm:w-64 aspect-[1536/2752]'
      : 'w-36 sm:w-44 aspect-[1536/2752]';

  // 1. CARD BACK (HIDDEN / OPPONENT'S UNREVEALED CARD)
  if (isBack || !character) {
    const cardBackUrl = CHAKRANTO_CARD_ASSETS.cardBack;
    return (
      <div
        onClick={onClick}
        className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 select-none bg-[#0D0D0D] ${
          isSelected
            ? 'ring-2 ring-[#E50914] scale-105 shadow-[0_0_25px_rgba(229,9,20,0.6)]'
            : 'hover:ring-1 hover:ring-zinc-600'
        } ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''} ${sizeClasses} ${className}`}
      >
        {!backImgError ? (
          <img
            src={cardBackUrl}
            alt="Chakranto Card Back"
            referrerPolicy="no-referrer"
            onError={() => setBackImgError(true)}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-[#1A0A0A] border border-red-900/60 text-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mb-1" />
            <span className="text-[9px] font-mono-code font-bold text-red-400 leading-tight uppercase">
              CHAKRANTO ASSET LOAD ERROR
            </span>
            <span className="text-[8px] font-mono-code text-zinc-500 mt-1 break-all">
              {cardBackUrl}
            </span>
          </div>
        )}

        {/* Development Debug Indicator removed */}
      </div>
    );
  }

  // 2. CARD FACE (OFFICIAL CHAKRANTO CHARACTER PNG)
  const meta = CHAKRANTO_CHARACTERS[character];
  const cardSrc = CHAKRANTO_CARD_ASSETS[character];

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 select-none bg-[#0D0D0D] ${
        isSacrificed
          ? 'ring-2 ring-red-600/70 shadow-lg brightness-95'
          : isSelected
          ? 'ring-2 ring-[#E50914] scale-105 shadow-[0_0_30px_rgba(229,9,20,0.6)]'
          : 'shadow-2xl hover:shadow-[0_8px_30px_rgba(0,0,0,0.8)]'
      } ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''} ${sizeClasses} ${className}`}
    >
      {/* Official PNG Card Art */}
      {!imgError && cardSrc ? (
        <img
          src={cardSrc}
          alt={meta?.name || character}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center rounded-2xl"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-[#1A0A0A] border border-red-900/60 text-center">
          <AlertTriangle className="w-6 h-6 text-red-500 mb-1" />
          <span className="text-[9px] font-mono-code font-bold text-red-400 leading-tight uppercase">
            CHAKRANTO ASSET LOAD ERROR
          </span>
          <span className="text-[8px] font-mono-code text-zinc-500 mt-1 break-all">
            {cardSrc}
          </span>
        </div>
      )}

      {/* Selected Indicator Checkmark */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg animate-in zoom-in">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      {/* Sacrificed Overlay Banner */}
      {isSacrificed && (
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-1 bg-red-950/20">
          <div className="flex justify-end">
            <span className="p-0.5 rounded-full bg-red-600/90 text-white shadow">
              <Skull className="w-3 h-3 stroke-[2.5]" />
            </span>
          </div>
          <div className="w-full text-center pb-0.5">
            <span className="text-[8px] sm:text-[9px] font-mono-code font-black uppercase tracking-wider text-white bg-red-900/90 px-1 py-0.5 rounded border border-red-600/80 shadow-md block truncate">
              SACRIFICED
            </span>
          </div>
        </div>
      )}
    </div>
  );
};


