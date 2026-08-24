import React from 'react';
import { CardLayoutConfig } from './ScatteredGameCard';

interface ScatteredGameCardSkeletonProps {
  layout?: CardLayoutConfig;
  index?: number;
  isMobile?: boolean;
}

export const ScatteredGameCardSkeleton: React.FC<ScatteredGameCardSkeletonProps> = ({
  layout = { rotation: 0, scale: 1, zIndex: 10 },
  index = 0,
  isMobile = false,
}) => {
  return (
    <div
      style={{
        transform: `perspective(1000px) rotate(${layout.rotation}deg) scale(${layout.scale})`,
        zIndex: layout.zIndex,
        transformOrigin: 'center center',
      }}
      className="group relative flex flex-col rounded-2xl md:rounded-3xl select-none border border-[#222222] bg-[#0C0C0C] overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.85)]"
    >
      {/* Physical Card Bevel / Top Matte Highlight */}
      <div className="absolute inset-0 rounded-2xl md:rounded-3xl ring-1 ring-inset ring-white/5 pointer-events-none z-30" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-30" />

      {/* Primary Card Surface Skeleton */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9.5] overflow-hidden bg-[#131313]">
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent z-10" />

        {/* Ambient Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/30 to-black/50 pointer-events-none z-10" />

        {/* Top Badges Placeholders */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2">
          {index % 2 === 0 && (
            <div className="h-5 sm:h-6 w-20 rounded-full bg-[#1F1F1F] border border-white/5 animate-pulse" />
          )}
          <div className="h-5 sm:h-6 w-16 rounded-full bg-[#1C1C1C] border border-white/5 animate-pulse" />
        </div>

        {/* Top Right Wishlist Bookmark Placeholder */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/50 border border-white/10 animate-pulse" />

        {/* Bottom Card Title Placard */}
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20">
          <div className="flex items-end justify-between gap-3">
            <div className="space-y-2 w-3/5">
              {/* Category Pill Line */}
              <div className="h-2.5 sm:h-3 w-20 bg-[#242424] rounded animate-pulse" />
              {/* Title Line */}
              <div
                className="h-5 sm:h-7 bg-[#1F1F1F] rounded-lg animate-pulse"
                style={{ width: `${65 + ((index * 13) % 30)}%` }}
              />
            </div>

            {/* Quick Specs Pill */}
            <div className="h-6 sm:h-7 w-12 sm:w-14 rounded-lg bg-black/70 border border-white/10 animate-pulse shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
