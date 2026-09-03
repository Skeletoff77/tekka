import React, { useState, useEffect } from 'react';
import {
  Radio,
  Users,
  Eye,
  Trash2,
  RefreshCw,
  Layers,
  Gamepad2,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LivePresence } from '../../../types/admin';
import { subscribeToLivePresence } from '../../../services/presenceService';
import { runAdminPresenceCleanup } from '../../../services/adminService';
import { User as FirebaseUser } from 'firebase/auth';

interface LivePresenceTabProps {
  adminUser: FirebaseUser;
}

export const LivePresenceTab: React.FC<LivePresenceTabProps> = ({ adminUser }) => {
  const [presenceList, setPresenceList] = useState<LivePresence[]>([]);
  const [breakdown, setBreakdown] = useState({
    totalVisitors: 0,
    registeredGamers: 0,
    anonymousVisitors: 0,
    authenticatedUsers: 0,
    usersInRooms: 0,
    usersOnGameHub: 0,
    usersInGame: 0,
    usersInAdmin: 0,
  });
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToLivePresence((list, counts) => {
      setPresenceList(list);
      setBreakdown(counts);
    });
    return () => unsub();
  }, []);

  const handleManualCleanup = async () => {
    try {
      setIsCleaningUp(true);
      setCleanupMessage(null);
      const count = await runAdminPresenceCleanup(adminUser);
      setCleanupMessage(`Cleaned up ${count} stale presence records from Firestore.`);
      setTimeout(() => setCleanupMessage(null), 5000);
    } catch (err: any) {
      setCleanupMessage('Error cleaning up presence records.');
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E1E1E]">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            Live Visitor & Online User Presence System
          </h2>
          <p className="text-xs text-zinc-400 font-mono-code">
            Real-time privacy-preserving heartbeat engine · 90-second offline timeout window
          </p>
        </div>

        <button
          type="button"
          disabled={isCleaningUp}
          onClick={handleManualCleanup}
          className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#2A2A2A] text-xs font-mono-code text-zinc-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
          {isCleaningUp ? 'Purging Stale Records...' : 'Purge Stale Records'}
        </button>
      </div>

      {cleanupMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs font-mono-code flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          {cleanupMessage}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E]">
          <span className="text-xs font-mono-code text-zinc-500 block">Total Live Visitors</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white">{breakdown.totalVisitors}</span>
            <span className="text-[10px] font-mono-code text-emerald-400">Live</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E]">
          <span className="text-xs font-mono-code text-zinc-500 block">Authenticated Gamers</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-blue-400">{breakdown.registeredGamers}</span>
            <span className="text-[10px] font-mono-code text-zinc-500">
              {breakdown.usersInAdmin > 0 ? `+${breakdown.usersInAdmin} admin` : 'Gamers'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E]">
          <span className="text-xs font-mono-code text-zinc-500 block">Anonymous Visitors</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-zinc-300">{breakdown.anonymousVisitors}</span>
            <span className="text-[10px] font-mono-code text-zinc-500">Browsing</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E]">
          <span className="text-xs font-mono-code text-zinc-500 block">In Active Matches</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#FF4D4D]">{breakdown.usersInGame}</span>
            <span className="text-[10px] font-mono-code text-zinc-500">Playing</span>
          </div>
        </div>
      </div>

      {/* Sub-Location Status */}
      <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E]">
        <h3 className="text-xs font-mono-code text-zinc-400 uppercase tracking-wider mb-3">
          Presence Distribution by App Area
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
            <span className="text-xs font-mono-code text-zinc-400 block">Game Catalog Hub</span>
            <span className="text-lg font-bold text-white mt-1 block">{breakdown.usersOnGameHub}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
            <span className="text-xs font-mono-code text-zinc-400 block">Match Lobbies</span>
            <span className="text-lg font-bold text-amber-400 mt-1 block">{breakdown.usersInRooms}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
            <span className="text-xs font-mono-code text-zinc-400 block">Match Gameplay</span>
            <span className="text-lg font-bold text-[#FF4D4D] mt-1 block">{breakdown.usersInGame}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
            <span className="text-xs font-mono-code text-zinc-400 block">Admin Portal</span>
            <span className="text-lg font-bold text-blue-400 mt-1 block">{breakdown.usersInAdmin}</span>
          </div>
        </div>
      </div>

      {/* Active Sessions Feed */}
      <div className="bg-[#0C0C0C] border border-[#1E1E1E] rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-[#1E1E1E] flex items-center justify-between">
          <h3 className="text-xs font-mono-code text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Active Connected Sessions ({presenceList.length})
          </h3>
          <span className="text-[11px] font-mono-code text-zinc-500">Auto-refreshing via Firestore Listener</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-code">
            <thead className="bg-[#121212] border-b border-[#222] text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Session Identity</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Room / Game Context</th>
                <th className="py-3 px-4 text-right">Last Heartbeat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818]">
              {presenceList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500">
                    No active visitor heartbeats detected in the last 90 seconds.
                  </td>
                </tr>
              ) : (
                presenceList.map((p) => {
                  const secondsAgo = Math.max(0, Math.floor((Date.now() - p.lastHeartbeat) / 1000));
                  return (
                    <tr key={p.sessionId} className="hover:bg-[#121212] transition-colors">
                      <td className="py-3 px-4">
                        {p.isAnonymous ? (
                          <span className="text-zinc-400 font-mono-code text-[11px]">
                            {p.sessionId}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-semibold text-white">
                              {p.tekkaName || 'Authenticated User'}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono-code">
                              ({p.uid?.substring(0, 6)}...)
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {p.isAnonymous ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-700">
                            Anonymous Visitor
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950/60 text-blue-400 border border-blue-800">
                            Registered Member
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="capitalize text-zinc-300">
                          {p.location.replace('-', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-zinc-400">
                        {p.roomId ? (
                          <span className="text-[#FF4D4D]">Room: {p.roomId.substring(0, 8)}...</span>
                        ) : p.gameId ? (
                          <span>Game: {p.gameId}</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right text-zinc-400 font-mono-code">
                        <span className="text-emerald-400">{secondsAgo}s ago</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
