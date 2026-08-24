import React from 'react';
import { BabuTargetChoice } from '../types';
import { Crown, Search, ShieldAlert, Sparkles, User } from 'lucide-react';

interface BabuControlsProps {
  isBabu: boolean;
  babuPlayerName: string;
  onSelectTarget: (target: BabuTargetChoice) => void;
  disabled?: boolean;
}

export const BabuControls: React.FC<BabuControlsProps> = ({
  isBabu,
  babuPlayerName,
  onSelectTarget,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0F0F0F] border-2 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.15)] animate-in zoom-in-95 duration-300">
      {/* Babu Status Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-lg">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-code uppercase tracking-wider text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                ROYAL DECREE PHASE
              </span>
              {isBabu && (
                <span className="text-[10px] font-mono-code bg-[#E50914] text-white px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                  YOU ARE BABU
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-display font-black text-white mt-0.5">
              {isBabu ? 'Choose Target for the Police' : `${babuPlayerName} is Babu`}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono-code text-zinc-400 block">Babu Bounty</span>
          <span className="text-base font-mono-code font-bold text-amber-400">+1200 PTS</span>
        </div>
      </div>

      {isBabu ? (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-zinc-300 text-center sm:text-left leading-relaxed">
            As the <strong className="text-amber-400">Babu</strong>, command the Police officer to investigate and identify either the <strong className="text-blue-400">Chor (Thief - 400 pts)</strong> or the <strong className="text-rose-400">Dakat (Robber - 600 pts)</strong> among the hidden players.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* FIND CHOR BUTTON */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelectTarget('find-chor')}
              className="group relative flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#18181B] to-[#09090B] border-2 border-blue-500/50 hover:border-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.35)] transition-all duration-300 transform active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono-code uppercase tracking-wider text-blue-400 font-semibold mb-1">
                TARGET 1
              </span>
              <span className="text-lg sm:text-xl font-display font-black text-white group-hover:text-blue-200">
                FIND CHOR
              </span>
              <span className="text-xs font-mono-code text-zinc-400 mt-1">
                Thief chit (400 PTS)
              </span>
            </button>

            {/* FIND DAKAT BUTTON */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelectTarget('find-dakat')}
              className="group relative flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#18181B] to-[#09090B] border-2 border-rose-500/50 hover:border-rose-400 hover:shadow-[0_0_30px_rgba(244,63,94,0.35)] transition-all duration-300 transform active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono-code uppercase tracking-wider text-rose-400 font-semibold mb-1">
                TARGET 2
              </span>
              <span className="text-lg sm:text-xl font-display font-black text-white group-hover:text-rose-200">
                FIND DAKAT
              </span>
              <span className="text-xs font-mono-code text-zinc-400 mt-1">
                Robber chit (600 PTS)
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Non-Babu Waiting Indicator */
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-sm font-mono-code text-zinc-300">
            Waiting for <strong className="text-amber-400">{babuPlayerName}</strong> to select the target role...
          </p>
          <p className="text-xs text-zinc-500">
            Police will be called to investigate once the decree is announced.
          </p>
        </div>
      )}
    </div>
  );
};
