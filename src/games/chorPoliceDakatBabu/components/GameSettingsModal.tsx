import React, { useState } from 'react';
import { PlayerSeat, RoundOption, VALID_ROUND_COUNTS } from '../types';
import { Play, Users, Clock, Flame, Shield, Sparkles } from 'lucide-react';

interface GameSettingsModalProps {
  initialRounds?: RoundOption;
  seats: PlayerSeat[];
  onStartMatch: (rounds: RoundOption, updatedSeats: PlayerSeat[]) => void;
  onClose?: () => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  initialRounds = 5,
  seats,
  onStartMatch,
  onClose,
}) => {
  const [selectedRounds, setSelectedRounds] = useState<RoundOption>(initialRounds);
  const [editableSeats, setEditableSeats] = useState<PlayerSeat[]>(seats);

  const handleNameChange = (index: number, newName: string) => {
    setEditableSeats((prev) =>
      prev.map((s, i) => (i === index ? { ...s, name: newName } : s))
    );
  };

  const handleStart = () => {
    onStartMatch(selectedRounds, editableSeats);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-5 sm:p-8 rounded-3xl bg-[#0F0F0F] border-2 border-[#262626] shadow-2xl space-y-6">
      {/* Title */}
      <div className="text-center pb-4 border-b border-[#222222]">
        <span className="text-[10px] font-mono-code uppercase tracking-[0.25em] text-[#E50914] font-bold">
          MATCH CONFIGURATION
        </span>
        <h2 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
          Chor Police Dakat Babu
        </h2>
        <p className="text-xs font-mono-code text-zinc-400 mt-1">
          Select tournament length and review table player seats.
        </p>
      </div>

      {/* Round Selection (5, 10, 15, 20) */}
      <div className="space-y-3">
        <label className="text-xs font-mono-code uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#E50914]" />
          TOTAL MATCH ROUNDS (MANDATORY RULE)
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {VALID_ROUND_COUNTS.map((count) => {
            const isSelected = selectedRounds === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => setSelectedRounds(count)}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-red-950/60 to-[#141414] border-[#E50914] shadow-[0_0_20px_rgba(229,9,20,0.4)] -translate-y-1'
                    : 'bg-[#141414] border-[#262626] hover:border-zinc-500 text-zinc-400'
                }`}
              >
                <span className={`text-2xl sm:text-3xl font-mono-code font-black ${
                  isSelected ? 'text-white' : 'text-zinc-300'
                }`}>
                  {count}
                </span>
                <span className={`text-[10px] font-mono-code uppercase tracking-wider mt-1 ${
                  isSelected ? 'text-[#E50914] font-bold' : 'text-zinc-500'
                }`}>
                  ROUNDS
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Table Seats */}
      <div className="space-y-3">
        <label className="text-xs font-mono-code uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-[#E50914]" />
          TABLE SEATS (EXACTLY 4 PLAYERS)
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {editableSeats.map((seat, index) => (
            <div
              key={seat.id}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                seat.isCurrentUser
                  ? 'bg-gradient-to-r from-red-950/30 to-[#141414] border-red-900/50'
                  : 'bg-[#141414] border-[#262626]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-mono-code font-black ${
                  seat.isCurrentUser ? 'bg-[#E50914] text-white' : 'bg-[#222222] text-zinc-400'
                }`}
              >
                P{index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={seat.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  maxLength={25}
                  className="w-full bg-transparent text-sm font-display font-bold text-white border-b border-transparent focus:border-[#E50914] focus:outline-none px-1 py-0.5"
                />
                <span className="text-[10px] font-mono-code text-zinc-500 px-1">
                  {seat.isCurrentUser ? 'Host (You)' : seat.isHuman ? 'Human Player' : 'AI Bot Seat'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-4 flex justify-center">
        <button
          type="button"
          onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#E50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-display font-black text-base uppercase tracking-wider shadow-xl shadow-red-950/60 hover:shadow-[0_0_30px_rgba(229,9,20,0.6)] transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>START {selectedRounds}-ROUND MATCH</span>
        </button>
      </div>
    </div>
  );
};
