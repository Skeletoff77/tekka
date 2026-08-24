import React from 'react';
import { Layers } from 'lucide-react';
import { CLUSTER_PRESET_ALPHA, MOBILE_STAGGER_ROTATIONS } from '../../utils/cardComposition';
import { ScatteredGameCardSkeleton } from './ScatteredGameCardSkeleton';

interface ScatteredCardCanvasSkeletonProps {
  cardCount?: number;
}

export const ScatteredCardCanvasSkeleton: React.FC<ScatteredCardCanvasSkeletonProps> = ({
  cardCount = 7,
}) => {
  const dummyIndices = Array.from({ length: cardCount }, (_, i) => i);

  return (
    <div className="relative w-full overflow-hidden select-none py-4">
      {/* Background Ambience / Digital Table Surface */}
      <div className="absolute inset-0 bg-[#050505] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

      {/* Atmospheric Red Ambient Centers */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#E50914]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[400px] bg-red-800/5 rounded-full blur-[120px] pointer-events-none" />

      {/* DESKTOP / TABLET SCATTERED CANVAS SKELETON (md and up) */}
      <div className="hidden md:block">
        <div className="relative w-full h-[1450px]">
          {/* Cluster Background Ambient Vignette */}
          <div className="absolute inset-0 bg-radial from-white/[0.015] to-transparent pointer-events-none" />

          {dummyIndices.map((idx) => {
            const layout = CLUSTER_PRESET_ALPHA[idx % CLUSTER_PRESET_ALPHA.length];
            return (
              <div
                key={`desktop-skeleton-${idx}`}
                className="absolute"
                style={{
                  left: `${layout.leftPercent}%`,
                  top: `${layout.topPercent}%`,
                  width: `${layout.widthPercent}%`,
                  zIndex: layout.zIndex,
                }}
              >
                <ScatteredGameCardSkeleton
                  layout={layout}
                  index={idx}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* MOBILE / TOUCH SCATTERED FLOW SKELETON (Stacked portrait deck) */}
      <div className="block md:hidden space-y-0 px-2 py-4">
        {dummyIndices.map((idx) => {
          const rotation = MOBILE_STAGGER_ROTATIONS[idx % MOBILE_STAGGER_ROTATIONS.length];
          const zIndex = 20 + (idx % 10);
          const isEven = idx % 2 === 0;
          const xOffsetClass = isEven ? '-translate-x-1' : 'translate-x-1';

          return (
            <div
              key={`mobile-skeleton-${idx}`}
              className={`relative w-full ${idx > 0 ? '-mt-8' : ''} ${xOffsetClass}`}
              style={{ zIndex }}
            >
              <ScatteredGameCardSkeleton
                layout={{
                  rotation,
                  scale: 0.98,
                  zIndex,
                }}
                index={idx}
                isMobile={true}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
