import React from 'react';
import { ALL_CHARACTERS } from '../engine/chakrantoEngine';
import { CHAKRANTO_ACTIONS, CHAKRANTO_CHARACTERS } from '../assets/chakrantoAssets';
import { ChakrantoCard } from './ChakrantoCard';
import { X, BookOpen, Shield, Swords, Sparkles, AlertCircle } from 'lucide-react';

interface ChakrantoRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChakrantoRulesModal: React.FC<ChakrantoRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0D0D0D] border-2 border-[#2B1212] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left my-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono-code uppercase tracking-widest text-[#FF4D4D] font-bold block">
                COMPREHENSIVE RULEBOOK
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white">
                CHAKRANTO (চক্রান্ত) Strategy Guide
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#1A1A1A] hover:bg-[#282828] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview */}
        <div className="p-4 rounded-2xl bg-[#140808] border border-red-950/80 space-y-2 text-xs font-sans text-zinc-300">
          <p>
            <strong>Core Concept:</strong> CHAKRANTO is a fast-paced Bengali bluffing game for 3 to 6
            players. The deck contains <strong>15 cards</strong> (3 copies of 5 unique Bengali
            characters). Each player starts with <strong>2 secret cards</strong> and 0 coins.
          </p>
          <p>
            You can claim to hold any character to use their ability — even if you don't actually hold
            them! Opponents can challenge your claim. If you were bluffing, you lose 1 card; if you
            proved truthful, the challenger loses 1 card. The last surviving player wins!
          </p>
        </div>

        {/* 5 Characters */}
        <div className="space-y-3">
          <h3 className="text-sm font-display font-black text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            THE 5 CHARACTERS (3 COPIES EACH)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_CHARACTERS.map((char) => {
              const meta = CHAKRANTO_CHARACTERS[char];
              return (
                <div
                  key={char}
                  className={`p-4 rounded-2xl border ${meta.borderColor} bg-[#111111] space-y-2`}
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      <ChakrantoCard
                        character={char}
                        size="sm"
                        className="!w-12 !rounded-lg shadow-md"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono-code text-zinc-400 block">
                        {meta.bengaliName}
                      </span>
                      <h4 className="text-sm font-display font-bold text-white leading-tight">
                        {meta.name}
                      </h4>
                      <span className="text-[9px] font-mono-code text-zinc-500">
                        {meta.roleSubtitle}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] font-sans text-zinc-300 space-y-1 pt-1 border-t border-white/5">
                    <p>
                      <strong className="text-white">Active:</strong> {meta.activeAbilityName} —{' '}
                      {meta.activeAbilityDescription}
                    </p>
                    {meta.passiveAbilityDescription && (
                      <p>
                        <strong className="text-emerald-400">Block:</strong>{' '}
                        {meta.passiveAbilityName} — {meta.passiveAbilityDescription}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Turn Actions Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-display font-black text-white flex items-center gap-2">
            <Swords className="w-4 h-4 text-red-500" />
            ACTIONS, COSTS &amp; BLOCKS
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans text-zinc-300 border-collapse">
              <thead>
                <tr className="border-b border-[#262626] text-[10px] font-mono-code uppercase text-zinc-400 bg-[#121212]">
                  <th className="p-2.5">Action</th>
                  <th className="p-2.5">Claim</th>
                  <th className="p-2.5">Cost/Gain</th>
                  <th className="p-2.5">Challenge?</th>
                  <th className="p-2.5">Blocked By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1C]">
                <tr>
                  <td className="p-2.5 font-bold text-white">Ayy</td>
                  <td className="p-2.5 text-zinc-400">None</td>
                  <td className="p-2.5 text-amber-400 font-mono-code">+1 Coin</td>
                  <td className="p-2.5 text-zinc-500">No</td>
                  <td className="p-2.5 text-zinc-500 font-bold">Unblockable</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Roptani</td>
                  <td className="p-2.5 text-zinc-400">None</td>
                  <td className="p-2.5 text-emerald-400 font-mono-code">+2 Coins</td>
                  <td className="p-2.5 text-zinc-500">No</td>
                  <td className="p-2.5 text-blue-400">Bir Bikrom</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Dakati</td>
                  <td className="p-2.5 text-red-400">Kalu Dakat</td>
                  <td className="p-2.5 text-red-400 font-mono-code">Raid 2</td>
                  <td className="p-2.5 text-amber-400">Yes</td>
                  <td className="p-2.5 text-red-300">Kalu Dakat / Petukchondro</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Shadbodol</td>
                  <td className="p-2.5 text-amber-400">Petukchondro</td>
                  <td className="p-2.5 text-zinc-400 font-mono-code">Select cards</td>
                  <td className="p-2.5 text-amber-400">Yes</td>
                  <td className="p-2.5 text-zinc-500">Unblockable</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Biratwo Bhata</td>
                  <td className="p-2.5 text-blue-400">Bir Bikrom</td>
                  <td className="p-2.5 text-blue-400 font-mono-code">+3 Coins</td>
                  <td className="p-2.5 text-amber-400">Yes</td>
                  <td className="p-2.5 text-zinc-500">Unblockable</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Ghar Motkano</td>
                  <td className="p-2.5 text-purple-400">Bromhodoitto</td>
                  <td className="p-2.5 text-purple-400 font-mono-code">Cost 3</td>
                  <td className="p-2.5 text-amber-400">Yes</td>
                  <td className="p-2.5 text-emerald-400">Jiner Badsha</td>
                </tr>
                <tr className="bg-red-950/20">
                  <td className="p-2.5 font-bold text-red-400">Hottaya</td>
                  <td className="p-2.5 text-zinc-400">None</td>
                  <td className="p-2.5 text-red-500 font-mono-code">Cost 7</td>
                  <td className="p-2.5 text-zinc-500">No</td>
                  <td className="p-2.5 text-zinc-500 font-bold">Unblockable</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 10 Coin Rule Warning */}
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex items-start gap-2.5 text-xs font-mono-code text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>10+ Coins Rule:</strong> If you start your turn holding 10 or more coins, you ARE
            REQUIRED to pay 7 coins to execute Hottaya. You cannot take any other action.
          </span>
        </div>

        {/* Close button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono-code text-white uppercase font-bold cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
