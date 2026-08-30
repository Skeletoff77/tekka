import React from 'react';
import {
  Trophy,
  Shield,
  Coins,
  Swords,
  Skull,
  Activity,
  Flame,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  BarChart2,
} from 'lucide-react';
import { ChakrantoAnalyticsData } from '../../../types/admin';

interface ChakrantoTabProps {
  data: ChakrantoAnalyticsData | null;
  isLoading: boolean;
}

export const ChakrantoTab: React.FC<ChakrantoTabProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#E50914] border-t-transparent animate-spin" />
          <span className="text-xs font-mono-code text-zinc-500">
            Compiling Chakranto Tactical & Economic Telemetry...
          </span>
        </div>
      </div>
    );
  }

  const completionRate =
    data.totalMatches > 0 ? Math.round((data.completedMatches / data.totalMatches) * 100) : 0;

  const challengeTotal = data.challengeStats.totalAttempted;
  const challengeSuccessRate =
    challengeTotal > 0 ? Math.round((data.challengeStats.successful / challengeTotal) * 100) : 0;

  const blockTotal = data.blockStats.totalAttempted;
  const blockSuccessRate =
    blockTotal > 0 ? Math.round((data.blockStats.successful / blockTotal) * 100) : 0;

  const actions = [
    { key: 'roptani', name: 'Roptani (রপ্তানি)', declared: data.actionStats.roptaniAttempted, resolved: data.actionStats.roptaniResolved },
    { key: 'birbikrom', name: 'Birbikrom Bhata (বীরবিক্রম ভাতা)', declared: data.actionStats.birbikromAttempted, resolved: data.actionStats.birbikromResolved },
    { key: 'dakati', name: 'Dakati (ডাকাতি)', declared: data.actionStats.dakatiAttempted, resolved: data.actionStats.dakatiResolved },
    { key: 'ghar_motkano', name: 'Ghar Motkano (ঘাড় মটকানো)', declared: data.actionStats.gharMotkanoAttempted, resolved: data.actionStats.gharMotkanoResolved },
    { key: 'shadhbodol', name: 'Shadhbodol (স্বাদবদল)', declared: data.actionStats.shadhbodolAttempted, resolved: data.actionStats.shadhbodolResolved },
    { key: 'hottaya', name: 'Hottaya (হত্যা - 7 Coins)', declared: data.actionStats.hottayaAttempted, resolved: data.actionStats.hottayaResolved },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E1E1E]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Chakranto (চক্রান্ত)</h2>
            <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-400">
              Bluff & Deception Telemetry
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono-code mt-0.5">
            Turn actions, challenge accuracy, bluff detection ratios, coin economy, and sacrifice records
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
            {data.completedMatches} finished · {data.currentlyRunning} live
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E]">
          <span className="text-xs font-mono-code text-zinc-500 block">Bluff Detection Rate</span>
          <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
            {challengeSuccessRate}%
          </span>
          <span className="text-[11px] font-mono-code text-zinc-500 mt-1 block">
            {data.challengeStats.successful} bluffs caught of {challengeTotal}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E]">
          <span className="text-xs font-mono-code text-zinc-500 block">Coin Velocity</span>
          <span className="text-2xl font-extrabold text-amber-400 mt-1 block">
            {data.coinEconomy.totalCoinsGenerated} 🪙
          </span>
          <span className="text-[11px] font-mono-code text-zinc-500 mt-1 block">
            {data.coinEconomy.totalCoinsStolen} stolen · {data.coinEconomy.totalCoinsSpent} spent
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E]">
          <span className="text-xs font-mono-code text-zinc-500 block">Total Eliminations</span>
          <span className="text-2xl font-extrabold text-rose-400 mt-1 block">
            {data.totalEliminations} 💀
          </span>
          <span className="text-[11px] font-mono-code text-zinc-500 mt-1 block truncate">
            {data.cardSacrifices.totalCardsSacrificed} total cards sacrificed
          </span>
        </div>
      </div>

      {/* Deep-Dive Action Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Declarations & Resolution */}
        <div className="p-5 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Swords className="w-4 h-4 text-purple-400" />
              Action Frequency & Resolution Rate
            </h3>
            <span className="text-xs font-mono-code text-zinc-500">Declared vs Resolved</span>
          </div>

          <div className="space-y-3">
            {actions.map((act) => {
              const maxDecl = Math.max(...actions.map((a) => a.declared), 1);
              const barWidth = Math.round((act.declared / maxDecl) * 100);
              return (
                <div key={act.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono-code">
                    <span className="text-zinc-300 font-semibold">{act.name}</span>
                    <span className="text-zinc-400">
                      {act.declared} declared · <span className="text-emerald-400">{act.resolved} resolved</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#181818] rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.max(act.declared > 0 ? 5 : 0, barWidth)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tactical Interaction Metrics & Top Champions */}
        <div className="space-y-6">
          {/* Tactical Defense & Challenge Breakdown */}
          <div className="p-5 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Tactical Challenge & Block Accuracy
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-xs font-mono-code text-zinc-500 block">Challenges Won (Truth)</span>
                <span className="text-xl font-bold text-white">{data.challengeStats.failed}</span>
                <span className="text-[10px] font-mono-code text-zinc-500 block mt-1">Defender held claimed card</span>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-xs font-mono-code text-zinc-500 block">Bluffs Caught</span>
                <span className="text-xl font-bold text-emerald-400">{data.challengeStats.successful}</span>
                <span className="text-[10px] font-mono-code text-zinc-500 block mt-1">Challenger exposed fraud</span>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-xs font-mono-code text-zinc-500 block">Blocks Declared</span>
                <span className="text-xl font-bold text-amber-400">{data.blockStats.totalAttempted}</span>
                <span className="text-[10px] font-mono-code text-zinc-500 block mt-1">Defensive interventions</span>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-xs font-mono-code text-zinc-500 block">Blocks Accepted</span>
                <span className="text-xl font-bold text-cyan-400">{data.blockStats.successful}</span>
                <span className="text-[10px] font-mono-code text-zinc-500 block mt-1">Unchallenged defense</span>
              </div>
            </div>
          </div>

          {/* Top Winners */}
          <div className="p-5 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#FF4D4D]" />
              Chakranto Champions Leaderboard
            </h3>

            {data.topWinners.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono-code text-zinc-500">
                No completed Chakranto matches recorded yet.
              </div>
            ) : (
              <div className="space-y-2">
                {data.topWinners.slice(0, 5).map((player, idx) => (
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
    </div>
  );
};
