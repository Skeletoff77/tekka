import React, { useState } from 'react';
import { GAME_ASSETS } from '../assets/gameAssets';
import { Sparkles, Trophy } from 'lucide-react';
import { BannerIllustration } from '../assets/BannerIllustration';

interface GameBannerProps {
  className?: string;
  showDetails?: boolean;
}

export const GameBanner: React.FC<GameBannerProps> = ({
  className = '',
  showDetails = true,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#262626] bg-[#0A0A0A] shadow-2xl ${className}`}
    >
      {/* Banner Container */}
      <div className="relative w-full min-h-[160px] sm:min-h-[220px] md:min-h-[280px] lg:min-h-[340px] flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
        {!imageError ? (
          <img
            src={GAME_ASSETS.banner}
            alt="Chor Police Dakat Babu Banner"
            referrerPolicy="no-referrer"
            draggable={false}
            onError={() => setImageError(true)}
            className="w-full h-auto max-h-[420px] object-contain object-center transition-transform duration-700 hover:scale-101 select-none"
            loading="eager"
          />
        ) : (
          <BannerIllustration className="w-full h-full object-contain" />
        )}

        {/* Ambient Top Glow Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#E50914] to-transparent pointer-events-none" />

        {/* Title & Stats Overlay */}
        {showDetails && (
          <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6 flex flex-wrap items-end justify-between gap-2 z-10 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E50914] text-white text-[9px] font-mono-code font-bold uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" />
                OFFICIAL
              </span>
              <span className="text-[11px] font-mono-code text-zinc-300">
                4 PLAYERS
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono-code text-zinc-300 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>1200 / 900 / 600 / 400 PTS</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
