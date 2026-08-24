import React, { useState } from 'react';
import { TekkaRoom, RoomPlayer } from '../../types/room';
import { RoundOption, VALID_ROUND_COUNTS } from '../../games/chorPoliceDakatBabu/types';
import { updateRoomRounds } from '../../services/roomService';
import {
  Users,
  Copy,
  Check,
  Crown,
  Play,
  LogOut,
  Clock,
  Sparkles,
  Shield,
  AlertCircle,
} from 'lucide-react';

interface RoomLobbyViewProps {
  room: TekkaRoom;
  currentUserId: string;
  onStartGame: () => Promise<void>;
  onLeaveRoom: () => Promise<void>;
  isStarting?: boolean;
}

export const RoomLobbyView: React.FC<RoomLobbyViewProps> = ({
  room,
  currentUserId,
  onStartGame,
  onLeaveRoom,
  isStarting = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isHost = room.hostId === currentUserId;
  const isFull = room.players.length === 4;
  const neededPlayers = 4 - room.players.length;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRoundsChange = async (rounds: RoundOption) => {
    if (!isHost) return;
    try {
      await updateRoomRounds(room.id, currentUserId, rounds);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update round count');
    }
  };

  const handleStart = async () => {
    if (!isHost || !isFull) return;
    try {
      setErrorMsg(null);
      await onStartGame();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start game');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#141414] to-[#0A0A0A] border-2 border-[#262626] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse" />
              <span className="text-[10px] font-mono-code uppercase tracking-[0.25em] text-[#E50914] font-bold">
                REAL MULTIPLAYER ROOM
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
              {room.gameName}
            </h2>
            <p className="text-xs font-mono-code text-zinc-400">
              Share the Room Code with 3 friends to start an official 4-player match.
            </p>
          </div>

          {/* Room Code Box */}
          <div className="p-4 rounded-2xl bg-[#070707] border border-[#2B2B2B] flex items-center justify-between sm:justify-start gap-4">
            <div>
              <span className="text-[10px] font-mono-code uppercase tracking-wider text-zinc-500 block">
                ROOM CODE
              </span>
              <span className="text-2xl sm:text-3xl font-mono-code font-black text-[#E50914] tracking-widest">
                {room.roomCode}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="p-3 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] text-zinc-300 hover:text-white border border-[#333333] transition-colors cursor-pointer"
              title="Copy Room Code"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5 text-zinc-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-center gap-3 text-red-200 text-xs font-mono-code">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Round Configuration (5, 10, 15, 20) */}
      <div className="p-6 rounded-3xl bg-[#0E0E0E] border border-[#222222] space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono-code uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E50914]" />
            MATCH LENGTH: {room.totalRounds || 5} ROUNDS
          </label>
          {!isHost && (
            <span className="text-[10px] font-mono-code text-zinc-500">
              (Configured by Host)
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {VALID_ROUND_COUNTS.map((count) => {
            const isSelected = (room.totalRounds || 5) === count;
            return (
              <button
                key={count}
                type="button"
                disabled={!isHost}
                onClick={() => handleRoundsChange(count)}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-b from-red-950/60 to-[#141414] border-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]'
                    : 'bg-[#141414] border-[#262626] text-zinc-400'
                } ${isHost ? 'cursor-pointer hover:border-zinc-500' : 'cursor-default opacity-80'}`}
              >
                <span className="text-2xl font-mono-code font-black">{count}</span>
                <span className="text-[10px] font-mono-code uppercase tracking-wider mt-0.5">
                  ROUNDS
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Table Seats Grid */}
      <div className="p-6 rounded-3xl bg-[#0E0E0E] border border-[#222222] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#E50914]" />
            <h3 className="text-xs font-mono-code uppercase tracking-wider text-zinc-300 font-bold">
              TABLE SEATS ({room.players.length} / 4 REAL PLAYERS)
            </h3>
          </div>
          <span
            className={`text-xs font-mono-code font-bold ${
              isFull ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {isFull ? 'TABLE FULL (READY)' : `WAITING FOR ${neededPlayers} MORE`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((slotIndex) => {
            const player: RoomPlayer | undefined = room.players[slotIndex];

            if (player) {
              const isCurrent = player.id === currentUserId;
              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-r from-red-950/40 to-[#141414] border-red-800/60 shadow-lg'
                      : 'bg-[#141414] border-[#262626]'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono-code font-black text-sm ${
                      player.isHost
                        ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                        : isCurrent
                        ? 'bg-[#E50914] text-white'
                        : 'bg-[#222222] text-zinc-300'
                    }`}
                  >
                    {player.isHost ? (
                      <Crown className="w-5 h-5 fill-current" />
                    ) : (
                      `P${slotIndex + 1}`
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-display font-bold text-white truncate">
                        {player.tekkaName}
                      </span>
                      {player.isHost && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-code uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          HOST
                        </span>
                      )}
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-code uppercase bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/30">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono-code text-zinc-500">
                      Authenticated Player Seat
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                    <span className="text-[10px] font-mono-code text-emerald-400">Ready</span>
                  </div>
                </div>
              );
            }

            // Empty Slot
            return (
              <div
                key={`empty-slot-${slotIndex}`}
                className="p-4 rounded-2xl border-2 border-dashed border-[#222222] bg-[#0A0A0A]/50 flex items-center gap-3.5 opacity-60"
              >
                <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-center font-mono-code font-bold text-xs text-zinc-600">
                  P{slotIndex + 1}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-mono-code text-zinc-500 block">
                    Seat Open
                  </span>
                  <span className="text-[10px] font-mono-code text-zinc-600">
                    Waiting for player to enter code...
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onLeaveRoom}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#141414] hover:bg-[#1E1E1E] border border-[#2B2B2B] text-xs font-mono-code text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>LEAVE ROOM</span>
        </button>

        {isHost ? (
          <button
            type="button"
            disabled={!isFull || isStarting}
            onClick={handleStart}
            className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
              isFull && !isStarting
                ? 'bg-gradient-to-r from-[#E50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-950/60 hover:shadow-[0_0_30px_rgba(229,9,20,0.6)] cursor-pointer'
                : 'bg-[#1F1F1F] text-zinc-600 border border-[#2A2A2A] cursor-not-allowed'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>
              {isStarting
                ? 'INITIALIZING MATCH...'
                : isFull
                ? `START ${room.totalRounds || 5}-ROUND MATCH`
                : `NEED 4 PLAYERS (${room.players.length}/4)`}
            </span>
          </button>
        ) : (
          <div className="p-3.5 rounded-2xl bg-[#141414] border border-[#262626] text-xs font-mono-code text-amber-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Waiting for Room Host to start match...</span>
          </div>
        )}
      </div>
    </div>
  );
};
