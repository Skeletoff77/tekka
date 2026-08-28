import React, { useState } from 'react';
import {
  Layers,
  Search,
  Eye,
  Trash2,
  Clock,
  Users,
  Gamepad2,
  AlertTriangle,
  X,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { TekkaRoom, RoomStatus } from '../../../types/room';
import { RoomInspectionData } from '../../../types/admin';
import { inspectRoomDetails } from '../../../services/adminService';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { recordAuditLog } from '../../../services/adminService';

interface RoomsTabProps {
  rooms: TekkaRoom[];
  isLoading: boolean;
  adminUser: FirebaseUser;
  onRefresh: () => void;
}

export const RoomsTab: React.FC<RoomsTabProps> = ({
  rooms,
  isLoading,
  adminUser,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RoomStatus>('ALL');
  const [inspectingData, setInspectingData] = useState<RoomInspectionData | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [terminatingRoom, setTerminatingRoom] = useState<TekkaRoom | null>(null);
  const [isTerminating, setIsTerminating] = useState(false);

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        r.roomCode.toLowerCase().includes(q) ||
        (r.gameName || '').toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.hostId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleInspect = async (roomId: string) => {
    try {
      setIsInspecting(true);
      const data = await inspectRoomDetails(adminUser, roomId);
      setInspectingData(data);
    } catch (err) {
      console.error('Error inspecting room:', err);
    } finally {
      setIsInspecting(false);
    }
  };

  const handleTerminateRoom = async () => {
    if (!terminatingRoom) return;
    try {
      setIsTerminating(true);
      const roomRef = doc(db, 'rooms', terminatingRoom.id);
      await updateDoc(roomRef, {
        status: 'ABANDONED',
        updatedAt: new Date().toISOString(),
      });

      await recordAuditLog({
        adminUid: adminUser.uid,
        adminEmail: adminUser.email || 'unknown',
        action: 'ROOM_TERMINATED',
        targetType: 'room',
        targetId: terminatingRoom.id,
        targetName: `Room ${terminatingRoom.roomCode}`,
        timestamp: Date.now(),
        result: 'SUCCESS',
        details: { previousStatus: terminatingRoom.status },
      });

      setTerminatingRoom(null);
      if (inspectingData && inspectingData.room.id === terminatingRoom.id) {
        setInspectingData(null);
      }
      onRefresh();
    } catch (err) {
      console.error('Error terminating room:', err);
    } finally {
      setIsTerminating(false);
    }
  };

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'PLAYING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-[#E50914]/20 text-[#FF4D4D] border border-[#E50914]/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" /> Playing
          </span>
        );
      case 'WAITING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-amber-950/40 text-amber-400 border border-amber-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Lobby Waiting
          </span>
        );
      case 'FINISHED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-emerald-950/40 text-emerald-400 border border-emerald-800">
            Completed
          </span>
        );
      case 'ABANDONED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-zinc-900 text-zinc-500 border border-zinc-800">
            Abandoned
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-zinc-900 text-zinc-400 border border-zinc-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E1E1E]">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            Multiplayer Room Monitor
          </h2>
          <p className="text-xs text-zinc-400 font-mono-code">
            Total {rooms.length} rooms tracked · {rooms.filter((r) => r.status === 'PLAYING').length} matches actively running
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'WAITING', 'PLAYING', 'FINISHED', 'ABANDONED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-mono-code transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#E50914] text-white font-semibold'
                  : 'bg-[#141414] hover:bg-[#1E1E1E] text-zinc-400 border border-[#222]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by Room Code, Game Name, Host UID, or Room ID..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0C0C0C] border border-[#222] text-xs font-mono-code text-white placeholder-zinc-500 focus:outline-none focus:border-[#E50914] transition-colors"
        />
      </div>

      {/* Rooms Table */}
      <div className="bg-[#0C0C0C] border border-[#1E1E1E] rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-code">
            <thead className="bg-[#121212] border-b border-[#222] text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Room Code</th>
                <th className="py-3 px-4">Game Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Players</th>
                <th className="py-3 px-4">Rounds</th>
                <th className="py-3 px-4">Created Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Loading Room Diagnostics...
                  </td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No multiplayer rooms found for selected criteria.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-[#121212] transition-colors">
                    <td className="py-3.5 px-4 font-mono-code font-bold text-white">
                      <span className="bg-[#141414] px-2 py-1 rounded border border-[#2A2A2A] text-[#FF4D4D]">
                        {room.roomCode}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-sans font-medium text-zinc-200">
                      {room.gameName || 'Chor Police Dakat Babu'}
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(room.status)}</td>

                    <td className="py-3.5 px-4 text-zinc-300">
                      <span className="font-bold text-white">{room.playerCount}</span>
                      <span className="text-zinc-500">/{room.maxPlayers}</span>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400">
                      {room.currentRound ? `${room.currentRound}/${room.totalRounds || 5}` : `${room.totalRounds || 5} Total`}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                      {room.createdAt ? new Date(room.createdAt).toLocaleTimeString() : 'N/A'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInspect(room.id)}
                          className="p-1.5 rounded bg-[#141414] hover:bg-[#222] border border-[#2A2A2A] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Inspect Room Telemetry"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {(room.status === 'WAITING' || room.status === 'PLAYING') && (
                          <button
                            type="button"
                            onClick={() => setTerminatingRoom(room)}
                            className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-400 transition-colors cursor-pointer"
                            title="Terminate/Abandon Match"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room Diagnostic Inspection Modal */}
      {inspectingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0C0C0C] border border-[#2A2A2A] rounded-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setInspectingData(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#141414] text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#141414] border border-[#222] text-zinc-400 uppercase">
                  Room Telemetry Diagnostics
                </span>
                <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                  <span>Room: {inspectingData.room.roomCode}</span>
                  {getStatusBadge(inspectingData.room.status)}
                </h3>
                <p className="text-xs font-mono-code text-zinc-400 mt-0.5">
                  ID: <span className="text-zinc-300 select-all">{inspectingData.room.id}</span>
                </p>
              </div>
            </div>

            {/* Privacy Compliance Banner */}
            <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/60 text-blue-300 text-xs font-mono-code flex items-start gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>Player Privacy Enforced:</strong> Card assignments remain encrypted and inaccessible to administrative inspectors during active gameplay.
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-[10px] font-mono-code text-zinc-500 block">Game</span>
                <span className="text-xs font-bold text-white truncate block">
                  {inspectingData.room.gameName || 'Chor Police'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-[10px] font-mono-code text-zinc-500 block">Connected Players</span>
                <span className="text-sm font-bold text-emerald-400">
                  {inspectingData.room.playerCount} / {inspectingData.room.maxPlayers}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-[10px] font-mono-code text-zinc-500 block">Current Phase</span>
                <span className="text-xs font-bold text-amber-400 uppercase">
                  {inspectingData.publicState?.phase || inspectingData.room.status}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-[10px] font-mono-code text-zinc-500 block">Round Progress</span>
                <span className="text-xs font-bold text-white">
                  {inspectingData.publicState?.roundNumber || inspectingData.room.currentRound || 1} / {inspectingData.room.totalRounds || 5}
                </span>
              </div>
            </div>

            {/* Players in Room */}
            <div className="mb-5">
              <h4 className="text-xs font-mono-code text-zinc-400 uppercase tracking-wider mb-2">
                Participants in Session
              </h4>
              <div className="space-y-2">
                {inspectingData.room.players?.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg bg-[#141414] border border-[#222] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#222] flex items-center justify-center text-[10px] text-zinc-400 font-mono-code">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-white">{p.tekkaName}</span>
                      {p.id === inspectingData.room.hostId && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono-code">
                          HOST
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono-code text-zinc-500">
                      Score: <strong className="text-white">{p.cumulativeScore ?? 0} pts</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {(inspectingData.room.status === 'WAITING' || inspectingData.room.status === 'PLAYING') && (
                <button
                  type="button"
                  onClick={() => setTerminatingRoom(inspectingData.room)}
                  className="px-4 py-2 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-mono-code font-bold cursor-pointer"
                >
                  Terminate Room
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Termination */}
      {terminatingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0C0C0C] border border-red-900/60 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Confirm Room Termination</h3>
            </div>
            <p className="text-xs text-zinc-300 mb-4">
              Are you sure you want to forcibly terminate room{' '}
              <strong className="text-white">{terminatingRoom.roomCode}</strong>? Connected players will be notified that the match was closed by administration.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isTerminating}
                onClick={() => setTerminatingRoom(null)}
                className="px-4 py-2 rounded-lg bg-[#181818] hover:bg-[#222] text-xs font-mono-code text-zinc-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isTerminating}
                onClick={handleTerminateRoom}
                className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-xs font-mono-code font-bold text-white cursor-pointer"
              >
                {isTerminating ? 'Terminating...' : 'Terminate Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
