import React from 'react';
import {
  Users,
  Radio,
  Trophy,
  Activity,
  Layers,
  Eye,
  RefreshCw,
  Clock,
  Laptop,
} from 'lucide-react';
import { AdminOverviewStats } from '../../../types/admin';
import { formatKolkataDateTime } from '../../../utils/dateUtils';

interface OverviewTabProps {
  stats: AdminOverviewStats | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ stats, isLoading, onRefresh }) => {
  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#E50914] border-t-transparent animate-spin" />
          <span className="text-xs font-mono-code text-zinc-500 uppercase tracking-wider">
            Loading Real-Time Analytics...
          </span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Registered Accounts',
      value: stats.totalUsers,
      subtext: `+${stats.newUsersToday} today (IST) · +${stats.newUsersThisWeek} this week`,
      icon: Users,
      color: 'text-blue-400',
      border: 'border-blue-500/20',
      bg: 'bg-blue-950/10',
    },
    {
      title: 'Unique Visitors Online',
      value: stats.uniqueOnlineUsers,
      subtext: `${stats.onlineSessions} active sessions · ${stats.anonymousVisitors} anon · ${stats.authenticatedOnlineUsers} registered`,
      icon: Eye,
      color: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-950/10',
      isLive: true,
    },
    {
      title: 'Active Online Sessions',
      value: stats.onlineSessions,
      subtext: `${stats.usersInGame} in match · ${stats.usersInRooms} in room · ${stats.usersOnGameHub} browsing`,
      icon: Laptop,
      color: 'text-cyan-400',
      border: 'border-cyan-500/20',
      bg: 'bg-cyan-950/10',
      isLive: true,
    },
    {
      title: 'Active Multiplayer Rooms',
      value: stats.activeRooms,
      subtext: `${stats.currentlyPlayingGames} playing now · ${stats.totalRooms} total created`,
      icon: Layers,
      color: 'text-amber-400',
      border: 'border-amber-500/20',
      bg: 'bg-amber-950/10',
    },
    {
      title: 'Matches Completed',
      value: stats.completedGames,
      subtext: `${stats.gamesPlayedToday} played today (IST) · ${stats.gamesPlayedThisWeek} this week`,
      icon: Trophy,
      color: 'text-purple-400',
      border: 'border-purple-500/20',
      bg: 'bg-purple-950/10',
    },
    {
      title: 'Unique Daily Visitors (Today)',
      value: stats.uniqueVisitorsToday,
      subtext: `${stats.uniqueVisitorsThisWeek} this week · ${stats.uniqueVisitorsThisMonth} this month (IST)`,
      icon: Activity,
      color: 'text-rose-400',
      border: 'border-rose-500/20',
      bg: 'bg-rose-950/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Summary & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E1E1E]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Platform Command Center</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Asia/Kolkata (IST)
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono-code mt-0.5">
            Authoritative Firestore Telemetry · Last updated: {formatKolkataDateTime(stats.lastUpdated)}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#2A2A2A] text-xs font-mono-code text-zinc-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Snapshot
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-xl bg-[#0C0C0C] border ${card.border} ${card.bg} transition-all hover:border-[#333] relative overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-code text-zinc-400">{card.title}</span>
                    {card.isLive && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                    {card.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-zinc-400 font-mono-code mt-2">{card.subtext}</p>
                </div>
                <div className={`p-3 rounded-xl bg-[#141414] border border-[#222] ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Breakdown Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* User Acquisition Cohorts */}
        <div className="p-5 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              User Registration Velocity (IST)
            </h3>
            <span className="text-xs font-mono-code text-zinc-500">Live DB Aggregation</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono-code mb-1">
                <span className="text-zinc-400">New Accounts Today (since 00:00 IST)</span>
                <span className="text-white font-bold">{stats.newUsersToday}</span>
              </div>
              <div className="w-full bg-[#181818] rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(5, (stats.newUsersToday / Math.max(stats.totalUsers, 1)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono-code mb-1">
                <span className="text-zinc-400">New Accounts This Week (since Monday IST)</span>
                <span className="text-white font-bold">{stats.newUsersThisWeek}</span>
              </div>
              <div className="w-full bg-[#181818] rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(8, (stats.newUsersThisWeek / Math.max(stats.totalUsers, 1)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono-code mb-1">
                <span className="text-zinc-400">New Accounts This Month (since 1st IST)</span>
                <span className="text-white font-bold">{stats.newUsersThisMonth}</span>
              </div>
              <div className="w-full bg-[#181818] rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(12, (stats.newUsersThisMonth / Math.max(stats.totalUsers, 1)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Visitor Location Distribution */}
        <div className="p-5 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              Live Presence Breakdown
            </h3>
            <span className="text-xs font-mono-code text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Real-Time
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
              <span className="text-xs font-mono-code text-zinc-500 block">Game Hub Browsing</span>
              <span className="text-xl font-bold text-white">{stats.usersOnGameHub}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
              <span className="text-xs font-mono-code text-zinc-500 block">In Room Lobbies</span>
              <span className="text-xl font-bold text-amber-400">{stats.usersInRooms}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
              <span className="text-xs font-mono-code text-zinc-500 block">Inside Active Game</span>
              <span className="text-xl font-bold text-[#FF4D4D]">{stats.usersInGame}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
              <span className="text-xs font-mono-code text-zinc-500 block">Admin Portal</span>
              <span className="text-xl font-bold text-blue-400">{stats.usersInAdmin}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
