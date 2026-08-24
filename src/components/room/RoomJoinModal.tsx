import React, { useState } from 'react';
import { Game } from '../../types/game';
import { RoundOption, VALID_ROUND_COUNTS } from '../../games/chorPoliceDakatBabu/types';
import { createRoom, joinRoomByCode } from '../../services/roomService';
import { TekkaRoom } from '../../types/room';
import { Users, Plus, KeyRound, AlertCircle, Sparkles, X, Clock, Play } from 'lucide-react';

interface RoomJoinModalProps {
  game: Game;
  currentUser: {
    uid: string;
    tekkaName: string;
    photoURL?: string;
    avatarUrl?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onRoomReady: (room: TekkaRoom) => void;
}

export const RoomJoinModal: React.FC<RoomJoinModalProps> = ({
  game,
  currentUser,
  isOpen,
  onClose,
  onRoomReady,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [selectedRounds, setSelectedRounds] = useState<RoundOption>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateRoom = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const newRoom = await createRoom(currentUser, game, selectedRounds);
      onRoomReady(newRoom);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create room.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const joinedRoom = await joinRoomByCode(currentUser, roomCodeInput.trim());
      onRoomReady(joinedRoom);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to join room.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0F0F0F] rounded-3xl border-2 border-[#262626] shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914]" />
            <h3 className="text-xl font-display font-black text-white">
              {game.name} Lobby
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1A1A1A] hover:bg-[#262626] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#070707] border border-[#222222]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setErrorMessage(null);
            }}
            className={`py-3 rounded-xl font-mono-code text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-[#E50914] to-red-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>CREATE ROOM</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('join');
              setErrorMessage(null);
            }}
            className={`py-3 rounded-xl font-mono-code text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'join'
                ? 'bg-gradient-to-r from-[#E50914] to-red-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>JOIN WITH CODE</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-center gap-3 text-red-200 text-xs font-mono-code">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Content: CREATE ROOM */}
        {activeTab === 'create' && (
          <div className="space-y-5">
            <div className="space-y-3">
              <label className="text-xs font-mono-code uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#E50914]" />
                SELECT MATCH LENGTH
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {VALID_ROUND_COUNTS.map((rounds) => {
                  const isSelected = selectedRounds === rounds;
                  return (
                    <button
                      key={rounds}
                      type="button"
                      onClick={() => setSelectedRounds(rounds)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-red-950/60 to-[#141414] border-[#E50914] text-white shadow-[0_0_12px_rgba(229,9,20,0.3)]'
                          : 'bg-[#141414] border-[#262626] text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      <span className="text-xl font-mono-code font-black">{rounds}</span>
                      <span className="text-[9px] font-mono-code uppercase tracking-wider mt-0.5">
                        ROUNDS
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#141414] border border-[#222222] text-xs font-mono-code text-zinc-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#E50914] shrink-0" />
              <span>You will host a room for exactly 4 authenticated players.</span>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleCreateRoom}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#E50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-display font-black text-sm uppercase tracking-wider shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isLoading ? 'CREATING ROOM...' : 'CREATE ROOM & GET CODE'}</span>
            </button>
          </div>
        )}

        {/* Tab Content: JOIN ROOM */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinRoom} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono-code uppercase tracking-wider text-zinc-300 font-bold block">
                ENTER 6-CHARACTER ROOM CODE
              </label>

              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. CP89X2"
                maxLength={8}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#070707] border-2 border-[#2B2B2B] focus:border-[#E50914] focus:outline-none text-center font-mono-code text-2xl font-black tracking-widest text-white uppercase placeholder:text-zinc-700"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || roomCodeInput.trim().length < 4}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#E50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-display font-black text-sm uppercase tracking-wider shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? 'JOINING ROOM...' : 'JOIN ROOM TABLE'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
