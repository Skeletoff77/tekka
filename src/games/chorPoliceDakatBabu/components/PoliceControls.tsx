import React, { useState } from 'react';
import { BabuTargetChoice, PlayerSeat } from '../types';
import { ShieldCheck, UserCheck, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

interface PoliceControlsProps {
  isPolice: boolean;
  policePlayerName: string;
  babuTarget: BabuTargetChoice;
  hiddenPlayers: PlayerSeat[];
  onAccusePlayer: (accusedPlayerId: string) => void;
  disabled?: boolean;
}

export const PoliceControls: React.FC<PoliceControlsProps> = ({
  isPolice,
  policePlayerName,
  babuTarget,
  hiddenPlayers,
  onAccusePlayer,
  disabled = false,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const targetRoleTitle = babuTarget === 'find-chor' ? 'CHOR' : 'DAKAT';
  const targetColor = babuTarget === 'find-chor' ? 'text-blue-400' : 'text-rose-400';

  const handleConfirmGuess = () => {
    if (selectedPlayerId) {
      onAccusePlayer(selectedPlayerId);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0F0F0F] border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.15)] animate-in zoom-in-95 duration-300">
      {/* Police Status Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-code uppercase tracking-wider text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                POLICE INVESTIGATION PHASE
              </span>
              {isPolice && (
                <span className="text-[10px] font-mono-code bg-[#E50914] text-white px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                  YOU ARE POLICE
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-display font-black text-white mt-0.5">
              {isPolice ? `Deduce who holds the ${targetRoleTitle}` : `${policePlayerName} is Investigating`}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono-code text-zinc-400 block">Command Bounty</span>
          <span className="text-base font-mono-code font-bold text-emerald-400">+900 PTS IF CORRECT</span>
        </div>
      </div>

      {isPolice ? (
        <div className="space-y-5">
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-xs font-mono-code text-zinc-200">
              Babu has commanded: <strong className={targetColor}>FIND {targetRoleTitle}</strong>. Select the hidden player you believe holds this card.
            </p>
          </div>

          {/* 2 Hidden Player Suspect Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hiddenPlayers.map((player) => {
              const isSelected = selectedPlayerId === player.id;
              return (
                <button
                  key={player.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedPlayerId(player.id)}
                  className={`group relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 transform active:scale-98 cursor-pointer disabled:opacity-50 ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#1C1917] to-[#0C0A09] border-[#E50914] shadow-[0_0_25px_rgba(229,9,20,0.5)] -translate-y-1'
                      : 'bg-gradient-to-b from-[#18181B] to-[#09090B] border-[#333333] hover:border-emerald-400/80 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                      isSelected
                        ? 'bg-[#E50914]/20 border border-[#E50914] text-white'
                        : 'bg-[#222222] border border-[#333333] text-zinc-300'
                    }`}
                  >
                    <UserCheck className="w-6 h-6" />
                  </div>

                  <span className="text-xs font-mono-code uppercase tracking-wider text-zinc-400 mb-1">
                    SUSPECT {player.seatIndex + 1}
                  </span>

                  <span className="text-base sm:text-lg font-display font-black text-white group-hover:text-emerald-300 truncate max-w-[200px]">
                    {player.name}
                  </span>

                  <span className={`text-xs font-mono-code font-bold mt-2 px-2.5 py-1 rounded-md border ${
                    isSelected ? 'bg-[#E50914] text-white border-red-500' : 'bg-black/50 text-zinc-300 border-white/10'
                  }`}>
                    {player.name} IS {targetRoleTitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Confirm Button */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              disabled={!selectedPlayerId || disabled}
              onClick={handleConfirmGuess}
              className={`px-8 py-3.5 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-xl cursor-pointer ${
                selectedPlayerId && !disabled
                  ? 'bg-gradient-to-r from-[#E50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-950/60 hover:shadow-[0_0_25px_rgba(229,9,20,0.6)] transform hover:-translate-y-0.5'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
              }`}
            >
              LOCK IN OFFICIAL GUESS
            </button>
          </div>
        </div>
      ) : (
        /* Non-Police Waiting Indicator */
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-sm font-mono-code text-zinc-300">
            Officer <strong className="text-emerald-400">{policePlayerName}</strong> is interrogating suspects...
          </p>
          <p className="text-xs text-zinc-500">
            Searching for who holds the <strong className={targetColor}>{targetRoleTitle}</strong>.
          </p>
        </div>
      )}
    </div>
  );
};
