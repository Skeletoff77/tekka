import React from 'react';
import { PlayerSeat, RoundOption } from '../types';
import { Trophy, Medal, User, TrendingUp } from 'lucide-react';

interface ScoreBoardProps {
  players: PlayerSeat[];
  cumulativeScores: Record<string, number>;
  currentRound: number;
  totalRounds: RoundOption;
  lastPointsEarned?: Record<string, number> | null;
  className?: string;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  cumulativeScores,
  currentRound,
  totalRounds,
  lastPointsEarned,
  className = '',
}) => {
  // Sort players by highest cumulative score
  const sortedPlayers = [...players].sort((a, b) => {
    const scoreA = cumulativeScores[a.id] || 0;
    const scoreB = cumulativeScores[b.id] || 0;
    return scoreB - scoreA;
  });

  return (
    <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#0D0D0D] border border-[#262626] shadow-xl ${className}`}>
      {/* Scoreboard Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#1F1F1F]">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-mono-code font-bold uppercase tracking-wider text-zinc-300">
            CUMULATIVE SCORE TABLE
          </h3>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18181B] border border-[#333333]">
          <span className="text-[10px] font-mono-code text-zinc-400">ROUND</span>
          <span className="text-xs font-mono-code font-bold text-[#E50914]">
            {Math.min(currentRound, totalRounds)}
          </span>
          <span className="text-[10px] font-mono-code text-zinc-500">/</span>
          <span className="text-xs font-mono-code font-bold text-white">
            {totalRounds}
          </span>
        </div>
      </div>

      {/* Players Leaderboard Rows */}
      <div className="space-y-2">
        {sortedPlayers.map((player, rankIndex) => {
          const score = cumulativeScores[player.id] || 0;
          const delta = lastPointsEarned ? lastPointsEarned[player.id] : null;

          const isLeader = rankIndex === 0 && score > 0;

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition-all duration-300 ${
                player.isCurrentUser
                  ? 'bg-gradient-to-r from-red-950/30 to-[#141414] border border-red-900/40 shadow-sm'
                  : 'bg-[#141414] border border-[#222222]'
              }`}
            >
              {/* Rank & Player Info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono-code font-bold shrink-0 ${
                    rankIndex === 0
                      ? 'bg-amber-500 text-black shadow-md'
                      : rankIndex === 1
                      ? 'bg-zinc-300 text-black'
                      : rankIndex === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {rankIndex + 1}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs sm:text-sm font-display font-bold truncate ${
                      player.isCurrentUser ? 'text-white' : 'text-zinc-300'
                    }`}>
                      {player.name}
                    </span>
                    {player.isCurrentUser && (
                      <span className="text-[8px] font-mono-code bg-[#E50914] text-white px-1 py-0.2 rounded font-bold uppercase">
                        YOU
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Score & Points Delta */}
              <div className="flex items-center gap-3 shrink-0">
                {delta !== null && delta !== undefined && (
                  <span
                    className={`text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded ${
                      delta > 0
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                        : 'bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    +{delta}
                  </span>
                )}

                <div className="text-right min-w-[65px]">
                  <span className="text-sm sm:text-base font-mono-code font-black text-amber-400">
                    {score.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-mono-code text-zinc-500 block -mt-1">
                    PTS
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
