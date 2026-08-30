import React from 'react';
import {
  Gamepad2,
  Trophy,
  Activity,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { GameAnalyticsData } from '../../../types/admin';

interface GameAnalyticsTabProps {
  analytics: GameAnalyticsData[];
  isLoading: boolean;
  onSelectChorPolice: () => void;
  onSelectChakranto?: () => void;
}

export const GameAnalyticsTab: React.FC<GameAnalyticsTabProps> = ({
  analytics,
  isLoading,
  onSelectChorPolice,
  onSelectChakranto,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E1E1E]">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
            Platform Game Catalog Performance
          </h2>
          <p className="text-xs text-zinc-400 font-mono-code">
            Authoritative match throughput, real completion rates, and average session times
          </p>
        </div>
      </div>

      {/* Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analytics.map((game) => (
          <div
            key={game.gameId}
            className="p-5 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E] hover:border-[#333] transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#141414] border border-[#222] text-zinc-400 uppercase">
                  Flagship Title
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{game.gameName}</h3>
                <p className="text-xs text-zinc-500 font-mono-code">ID: {game.gameId}</p>
              </div>

              {game.gameId.includes('chor-police') && (
                <button
                  type="button"
                  onClick={onSelectChorPolice}
                  className="px-3 py-1.5 rounded-lg bg-[#E50914] hover:bg-[#ff1f2d] text-white text-xs font-mono-code font-bold transition-colors cursor-pointer"
                >
                  Deep Analytics →
                </button>
              )}

              {game.gameId.includes('chakranto') && onSelectChakranto && (
                <button
                  type="button"
                  onClick={onSelectChakranto}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono-code font-bold transition-colors cursor-pointer"
                >
                  Deep Analytics →
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-[10px] font-mono-code text-zinc-500 block">Total Started</span>
                <span className="text-sm font-bold text-white mt-0.5 block">{game.totalStarted}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-[10px] font-mono-code text-zinc-500 block">Completed</span>
                <span className="text-sm font-bold text-emerald-400 mt-0.5 block">{game.totalCompleted}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-[10px] font-mono-code text-zinc-500 block">Running Now</span>
                <span className="text-sm font-bold text-[#FF4D4D] mt-0.5 block">{game.currentlyRunning}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-[10px] font-mono-code text-zinc-500 block">Completion %</span>
                <span className="text-sm font-bold text-cyan-400 mt-0.5 block">{game.completionRate}%</span>
              </div>
            </div>

            {/* Time windows */}
            <div className="p-3 rounded-lg bg-[#121212] border border-[#222] text-xs font-mono-code space-y-1.5">
              <div className="flex justify-between text-zinc-400">
                <span>Matches Today (IST):</span>
                <span className="text-white font-bold">{game.playedToday}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Matches This Week (IST):</span>
                <span className="text-white font-bold">{game.playedThisWeek}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Matches This Month (IST):</span>
                <span className="text-white font-bold">{game.playedThisMonth}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
