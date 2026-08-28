import React from 'react';
import {
  Trophy,
  Activity,
  Clock,
  Award,
  Flame,
  CheckCircle2,
  XCircle,
  BarChart3,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { ChorPoliceAnalyticsData } from '../../../types/admin';

interface ChorPoliceTabProps {
  data: ChorPoliceAnalyticsData | null;
  isLoading: boolean;
}

export const ChorPoliceTab: React.FC<ChorPoliceTabProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#E50914] border-t-transparent animate-spin" />
          <span className="text-xs font-mono-code text-zinc-500">
            Compiling Chor Police Deep Match Telemetry...
          </span>
        </div>
      </div>
    );
  }

  const completionRate =
    data.totalMatches > 0 ? Math.round((data.completedMatches / data.totalMatches) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E1E1E]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Chor Police Dakat Babu</h2>
            <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-[#E50914]/20 border border-[#E50914]/40 text-[#FF4D4D]">
              Game-Specific Deep Analytics
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono-code mt-0.5">
            Round dynamics, completion throughput, win-rate hierarchies, and high-score records
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E]">
          <span className="text-xs font-mono-code text-zinc-500 block">Total Matches</span>
          <span className="text-2xl font-extrabold text-white mt-1 block">
            {data.totalMatches.toLocaleString()}
          </span>
          <span className="text-[11px] font-mono-code text-zinc-500 mt-1 block">
            {data.completedMatches} finished · {data.abandonedMatches} abandoned
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E]">
          <span className="text-xs font-mono-code text-zinc-500 block">Completion Rate</span>
          <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
            {completionRate}%
          </span>
          <span className="text-[11px] font-mono-code text-zinc-500 mt-1 block">
            Full match finish ratio
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E]">
          <span className="text-xs font-mono-code text-zinc-500 block">Avg Match Duration</span>
          <span className="text-2xl font-extrabold text-blue-400 mt-1 block">
            {data.averageMatchDurationMinutes}m
          </span>
          <span className="text-[11px] font-mono-code text-zinc-500 mt-1 block">
            ~{data.averageRoundsCompleted} rounds per match
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E]">
          <span className="text-xs font-mono-code text-zinc-500 block">All-Time High Score</span>
          <span className="text-2xl font-extrabold text-amber-400 mt-1 block">
            {data.highestScore ? `${data.highestScore.score.toLocaleString()} pts` : 'N/A'}
          </span>
          <span className="text-[11px] font-mono-code text-zinc-500 mt-1 block truncate">
            by {data.highestScore?.tekkaName || 'Champion'}
          </span>
        </div>
      </div>

      {/* Deep-Dive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Round Configuration Preference */}
        <div className="p-5 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Round Length Selection Preference
            </h3>
            <span className="text-xs font-mono-code text-zinc-500">Host Preferences</span>
          </div>

          <div className="space-y-3">
            {data.roundDistribution.map((item) => {
              const maxCount = Math.max(...data.roundDistribution.map((d) => d.count), 1);
              const percentage = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.rounds}>
                  <div className="flex justify-between text-xs font-mono-code mb-1">
                    <span className="text-zinc-300 font-semibold">{item.rounds} Rounds Match</span>
                    <span className="text-zinc-400 font-mono-code">{item.count} matches ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-[#181818] rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.max(5, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Winners Leaderboard */}
        <div className="p-5 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#FF4D4D]" />
              Top Winner Win-Rate Index
            </h3>
            <span className="text-xs font-mono-code text-zinc-500">Authoritative Tally</span>
          </div>

          {data.playerWinCounts.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono-code text-zinc-500">
              No completed match records yet.
            </div>
          ) : (
            <div className="space-y-2">
              {data.playerWinCounts.slice(0, 5).map((player, idx) => (
                <div
                  key={player.playerId}
                  className="p-2.5 rounded-lg bg-[#141414] border border-[#222] flex items-center justify-between text-xs font-mono-code"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        idx === 0
                          ? 'bg-amber-500 text-black'
                          : idx === 1
                          ? 'bg-zinc-300 text-black'
                          : idx === 2
                          ? 'bg-amber-800 text-white'
                          : 'bg-[#222] text-zinc-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-sans font-semibold text-white">{player.tekkaName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">{player.wins} Wins</span>
                    <span className="text-zinc-500 text-[11px]">({player.matches} Matches)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
