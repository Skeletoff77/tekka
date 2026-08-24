import React, { useMemo } from 'react';
import { Game } from '../../types/game';
import { ScatteredGameCard } from './ScatteredGameCard';
import { ScatteredCardCanvasSkeleton } from './ScatteredCardCanvasSkeleton';
import { groupGamesIntoClusters, mapGamesToDeterministicLayout } from '../../utils/cardComposition';

interface ScatteredCardCanvasProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  isLoading?: boolean;
}

export const ScatteredCardCanvas: React.FC<ScatteredCardCanvasProps> = ({
  games,
  onSelectGame,
  isLoading = false,
}) => {
  // Use deterministic cluster mapping utility
  const clusters = useMemo(() => {
    return groupGamesIntoClusters(games, 7);
  }, [games]);

  const allDeterministicCards = useMemo(() => {
    return mapGamesToDeterministicLayout(games, 7);
  }, [games]);

  if (isLoading) {
    return <ScatteredCardCanvasSkeleton cardCount={7} />;
  }

  return (
    <div className="relative w-full overflow-hidden select-none py-4">
      {/* Background Ambience / Digital Table Surface */}
      <div className="absolute inset-0 bg-[#050505] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

      {/* Atmospheric Red Ambient Centers */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#E50914]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[400px] bg-red-800/5 rounded-full blur-[120px] pointer-events-none" />

      {/* DESKTOP / TABLET SCATTERED CANVAS (md and up) */}
      <div className="hidden md:block space-y-16">
        {clusters.map((cluster) => {
          const count = cluster.games.length;

          return (
            <div
              key={`desktop-cluster-${cluster.clusterIndex}`}
              className="relative w-full transition-all"
              style={{ minHeight: cluster.canvasHeight }}
            >
              {/* Cluster Background Ambient Vignette */}
              <div className="absolute inset-0 bg-radial from-white/[0.015] to-transparent pointer-events-none" />

              {/* Adaptive layout for small single-card results */}
              {count === 1 && (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="w-full max-w-xl">
                    <ScatteredGameCard
                      game={cluster.games[0].game}
                      layout={{ rotation: -1.5, scale: 1.05, zIndex: 20 }}
                      index={cluster.games[0].index}
                      onSelect={onSelectGame}
                    />
                  </div>
                </div>
              )}

              {/* Adaptive layout for 2 cards */}
              {count === 2 && (
                <div className="relative w-full h-[520px]">
                  <div
                    className="absolute"
                    style={{ left: '4%', top: '6%', width: '48%', zIndex: 14 }}
                  >
                    <ScatteredGameCard
                      game={cluster.games[0].game}
                      layout={{ rotation: -4.5, scale: 1.02, zIndex: 14 }}
                      index={cluster.games[0].index}
                      onSelect={onSelectGame}
                    />
                  </div>
                  <div
                    className="absolute"
                    style={{ right: '4%', top: '12%', width: '48%', zIndex: 18 }}
                  >
                    <ScatteredGameCard
                      game={cluster.games[1].game}
                      layout={{ rotation: 3.5, scale: 1.04, zIndex: 18 }}
                      index={cluster.games[1].index}
                      onSelect={onSelectGame}
                    />
                  </div>
                </div>
              )}

              {/* Adaptive layout for 3 cards */}
              {count === 3 && (
                <div className="relative w-full h-[880px]">
                  <div
                    className="absolute"
                    style={{ left: '4%', top: '4%', width: '46%', zIndex: 12 }}
                  >
                    <ScatteredGameCard
                      game={cluster.games[0].game}
                      layout={{ rotation: -5.0, scale: 0.98, zIndex: 12 }}
                      index={cluster.games[0].index}
                      onSelect={onSelectGame}
                    />
                  </div>
                  <div
                    className="absolute"
                    style={{ right: '4%', top: '6%', width: '47%', zIndex: 14 }}
                  >
                    <ScatteredGameCard
                      game={cluster.games[1].game}
                      layout={{ rotation: 4.5, scale: 0.98, zIndex: 14 }}
                      index={cluster.games[1].index}
                      onSelect={onSelectGame}
                    />
                  </div>
                  <div
                    className="absolute"
                    style={{ left: '22%', top: '42%', width: '56%', zIndex: 24 }}
                  >
                    <ScatteredGameCard
                      game={cluster.games[2].game}
                      layout={{ rotation: -1.5, scale: 1.08, zIndex: 24 }}
                      index={cluster.games[2].index}
                      onSelect={onSelectGame}
                    />
                  </div>
                </div>
              )}

              {/* Adaptive layout for 4 cards */}
              {count === 4 && (
                <div className="relative w-full h-[980px]">
                  <div
                    className="absolute"
                    style={{ left: '2%', top: '2%', width: '47%', zIndex: 14 }}
                  >
                    <ScatteredGameCard
                      game={cluster.games[0].game}
                      layout={{ rotation: -5.5, scale: 1.0, zIndex: 14 }}
                      index={cluster.games[0].index}
                      onSelect={onSelectGame}
                    />
                  </div>
                  <div
                    className="absolute"
                    style={{ right: '2%', top: '4%', width: '47%', zIndex: 16 }}
                  >
                    <ScatteredGameCard
                      game={cluster.games[1].game}
                      layout={{ rotation: 4.0, scale: 0.98, zIndex: 16 }}
                      index={cluster.games[1].index}
                      onSelect={onSelectGame}
                    />
                  </div>
                  <div
                    className="absolute"
                    style={{ left: '8%', top: '48%', width: '47%', zIndex: 20 }}
                  >
                    <ScatteredGameCard
                      game={cluster.games[2].game}
                      layout={{ rotation: 3.5, scale: 1.02, zIndex: 20 }}
                      index={cluster.games[2].index}
                      onSelect={onSelectGame}
                    />
                  </div>
                  <div
                    className="absolute"
                    style={{ right: '6%', top: '50%', width: '48%', zIndex: 22 }}
                  >
                    <ScatteredGameCard
                      game={cluster.games[3].game}
                      layout={{ rotation: -4.0, scale: 1.04, zIndex: 22 }}
                      index={cluster.games[3].index}
                      onSelect={onSelectGame}
                    />
                  </div>
                </div>
              )}

              {/* Full 5–7 Item Composition using mapped deterministic properties */}
              {count >= 5 &&
                cluster.games.map((item) => {
                  const layout = item.desktop;

                  return (
                    <div
                      key={item.game.id}
                      className="absolute"
                      style={{
                        left: `${layout.leftPercent}%`,
                        top: `${layout.topPercent}%`,
                        width: `${layout.widthPercent}%`,
                        zIndex: layout.zIndex,
                      }}
                    >
                      <ScatteredGameCard
                        game={item.game}
                        layout={layout}
                        index={item.index}
                        onSelect={onSelectGame}
                      />
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>

      {/* MOBILE / TOUCH SCATTERED FLOW (Mapped deterministically for portrait screens) */}
      <div className="block md:hidden space-y-0 px-2 py-4">
        {allDeterministicCards.map((item) => {
          const { game, index, mobile } = item;
          const isEven = index % 2 === 0;
          const xOffsetClass = isEven ? '-translate-x-1' : 'translate-x-1';

          return (
            <div
              key={game.id}
              className={`relative w-full ${index > 0 ? '-mt-8' : ''} ${xOffsetClass}`}
              style={{ zIndex: mobile.zIndex }}
            >
              <ScatteredGameCard
                game={game}
                layout={mobile}
                index={index}
                onSelect={onSelectGame}
                isMobile={true}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
