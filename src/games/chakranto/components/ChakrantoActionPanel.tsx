import React, { useState } from 'react';
import { ChakrantoActionType, ChakrantoCharacter, ChakrantoPlayerPublic } from '../types';
import { CHAKRANTO_ACTIONS, CHAKRANTO_CHARACTERS } from '../assets/chakrantoAssets';
import { ChakrantoCoin } from './ChakrantoCoin';
import {
  Coins,
  Sparkles,
  Swords,
  Skull,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Users,
} from 'lucide-react';

interface ChakrantoActionPanelProps {
  myPlayer: ChakrantoPlayerPublic;
  allPlayers: ChakrantoPlayerPublic[];
  isMyTurn: boolean;
  onDeclareAction: (action: ChakrantoActionType, targetPlayerId?: string) => Promise<void>;
  isSubmitting: boolean;
}

export const ChakrantoActionPanel: React.FC<ChakrantoActionPanelProps> = ({
  myPlayer,
  allPlayers,
  isMyTurn,
  onDeclareAction,
  isSubmitting,
}) => {
  const [selectedAction, setSelectedAction] = useState<ChakrantoActionType | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const aliveOpponents = allPlayers.filter((p) => !p.isEliminated && p.id !== myPlayer.id);
  const isMandatoryHottaya = myPlayer.coins >= 10;

  const handleSelectAction = (action: ChakrantoActionType) => {
    setErrorMsg(null);
    setSelectedAction(action);
    setSelectedTargetId(null);
  };

  const handleExecute = async () => {
    if (!selectedAction) return;

    // Check target requirement
    if (['dakati', 'ghar_motkano', 'hottaya'].includes(selectedAction)) {
      if (!selectedTargetId) {
        setErrorMsg('Please select a target player on the table.');
        return;
      }
    }

    try {
      setErrorMsg(null);
      await onDeclareAction(selectedAction, selectedTargetId || undefined);
      setSelectedAction(null);
      setSelectedTargetId(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to declare action.');
    }
  };

  if (!isMyTurn) {
    return (
      <div className="p-5 rounded-3xl bg-[#0F0F0F] border border-[#222222] text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs font-mono-code text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Waiting for current player to declare an action...</span>
        </div>
        <p className="text-[11px] font-mono-code text-zinc-600">
          Stay alert! You can Challenge bluffs or Block certain actions when declared.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-b from-[#160E0E] via-[#100808] to-[#0A0A0A] border-2 border-[#E50914]/60 shadow-2xl space-y-5">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2B1515] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-ping" />
            <span className="text-[10px] font-mono-code uppercase tracking-[0.25em] text-[#FF4D4D] font-bold">
              YOUR TURN TO PLAY
            </span>
          </div>
          <h3 className="text-xl font-display font-black text-white">
            Choose Your Strategy or Bluff
          </h3>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#080808] border border-[#331515]">
          <ChakrantoCoin size={20} />
          <span className="text-lg font-mono-code font-black text-[#F59E0B]">
            {myPlayer.coins}
          </span>
          <span className="text-xs font-mono-code text-zinc-400">COINS</span>
        </div>
      </div>

      {/* Mandatory 10+ Coin Alert */}
      {isMandatoryHottaya && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/50 flex items-center gap-3 text-amber-200 text-xs font-mono-code animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>MANDATORY HOTTAYA:</strong> Holding 10+ coins obligates you to execute Hottaya
            (7 coins) to eliminate an opponent card!
          </span>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs font-mono-code">
          {errorMsg}
        </div>
      )}

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 0. AYY */}
        <button
          type="button"
          disabled={isMandatoryHottaya || isSubmitting}
          onClick={() => handleSelectAction('ayy')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            selectedAction === 'ayy'
              ? 'bg-gradient-to-r from-red-950/70 to-[#1F1010] border-[#E50914] shadow-lg scale-[1.02]'
              : 'bg-[#121212] border-[#262626] hover:border-zinc-500'
          } ${isMandatoryHottaya ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-start justify-between gap-1 mb-2">
            <div>
              <span className="text-[10px] font-mono-code text-zinc-500 uppercase">
                {CHAKRANTO_ACTIONS.ayy.bengaliName}
              </span>
              <h4 className="text-sm font-display font-black text-white">Ayy</h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              +1 COIN
            </span>
          </div>
          <p className="text-[11px] font-sans text-zinc-400 line-clamp-2">
            Collect 1 coin from the treasury. Cannot be challenged or blocked.
          </p>
        </button>

        {/* 1. ROPTANI */}
        <button
          type="button"
          disabled={isMandatoryHottaya || isSubmitting}
          onClick={() => handleSelectAction('roptani')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            selectedAction === 'roptani'
              ? 'bg-gradient-to-r from-red-950/70 to-[#1F1010] border-[#E50914] shadow-lg scale-[1.02]'
              : 'bg-[#121212] border-[#262626] hover:border-zinc-500'
          } ${isMandatoryHottaya ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-start justify-between gap-1 mb-2">
            <div>
              <span className="text-[10px] font-mono-code text-zinc-500 uppercase">
                {CHAKRANTO_ACTIONS.roptani.bengaliName}
              </span>
              <h4 className="text-sm font-display font-black text-white">Roptani</h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              +2 COINS
            </span>
          </div>
          <p className="text-[11px] font-sans text-zinc-400 line-clamp-2">
            Collect 2 coins from treasury. Cannot be challenged; blockable by Bir Bikrom.
          </p>
        </button>

        {/* 2. DAKATI (Kalu Dakat) */}
        <button
          type="button"
          disabled={isMandatoryHottaya || isSubmitting}
          onClick={() => handleSelectAction('dakati')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            selectedAction === 'dakati'
              ? 'bg-gradient-to-r from-red-950/70 to-[#1F1010] border-[#E50914] shadow-lg scale-[1.02]'
              : 'bg-[#121212] border-[#262626] hover:border-zinc-500'
          } ${isMandatoryHottaya ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-start justify-between gap-1 mb-2">
            <div>
              <span className="text-[10px] font-mono-code text-zinc-500 uppercase">
                {CHAKRANTO_ACTIONS.dakati.bengaliName}
              </span>
              <h4 className="text-sm font-display font-black text-white">Dakati</h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-red-500/20 text-red-300 border border-red-500/40">
              RAID 2
            </span>
          </div>
          <p className="text-[11px] font-sans text-zinc-400 line-clamp-2">
            Claim Kalu Dakat to raid 2 coins from a target holding &gt;= 2 coins.
          </p>
        </button>

        {/* 3. SHADBODOL (Petukchondro) */}
        <button
          type="button"
          disabled={isMandatoryHottaya || isSubmitting}
          onClick={() => handleSelectAction('shadhbodol')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            selectedAction === 'shadhbodol'
              ? 'bg-gradient-to-r from-red-950/70 to-[#1F1010] border-[#E50914] shadow-lg scale-[1.02]'
              : 'bg-[#121212] border-[#262626] hover:border-zinc-500'
          } ${isMandatoryHottaya ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-start justify-between gap-1 mb-2">
            <div>
              <span className="text-[10px] font-mono-code text-zinc-500 uppercase">
                {CHAKRANTO_ACTIONS.shadhbodol.bengaliName}
              </span>
              <h4 className="text-sm font-display font-black text-white">Shadbodol</h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              SELECT CARDS
            </span>
          </div>
          <p className="text-[11px] font-sans text-zinc-400 line-clamp-2">
            Claim Petukchondro to draw 2 fresh cards privately and choose which to keep.
          </p>
        </button>

        {/* 4. BIRATWO BHATA (Bir Bikrom) */}
        <button
          type="button"
          disabled={isMandatoryHottaya || isSubmitting}
          onClick={() => handleSelectAction('birbikrom_bhata')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            selectedAction === 'birbikrom_bhata'
              ? 'bg-gradient-to-r from-red-950/70 to-[#1F1010] border-[#E50914] shadow-lg scale-[1.02]'
              : 'bg-[#121212] border-[#262626] hover:border-zinc-500'
          } ${isMandatoryHottaya ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-start justify-between gap-1 mb-2">
            <div>
              <span className="text-[10px] font-mono-code text-zinc-500 uppercase">
                {CHAKRANTO_ACTIONS.birbikrom_bhata.bengaliName}
              </span>
              <h4 className="text-sm font-display font-black text-white">Birotto Bhata</h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
              +3 COINS
            </span>
          </div>
          <p className="text-[11px] font-sans text-zinc-400 line-clamp-2">
            Claim Bir Bikrom to collect 3 coins from treasury. Cannot be blocked.
          </p>
        </button>

        {/* 5. GHAR MOTKANO (Bromhodoitto - 3 coins) */}
        <button
          type="button"
          disabled={isMandatoryHottaya || myPlayer.coins < 3 || isSubmitting}
          onClick={() => handleSelectAction('ghar_motkano')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            selectedAction === 'ghar_motkano'
              ? 'bg-gradient-to-r from-red-950/70 to-[#1F1010] border-[#E50914] shadow-lg scale-[1.02]'
              : 'bg-[#121212] border-[#262626] hover:border-zinc-500'
          } ${myPlayer.coins < 3 || isMandatoryHottaya ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-start justify-between gap-1 mb-2">
            <div>
              <span className="text-[10px] font-mono-code text-zinc-500 uppercase">
                {CHAKRANTO_ACTIONS.ghar_motkano.bengaliName}
              </span>
              <h4 className="text-sm font-display font-black text-white">Ghar Motkano</h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              COST 3 COINS
            </span>
          </div>
          <p className="text-[11px] font-sans text-zinc-400 line-clamp-2">
            Claim Bromhodoitto to force 1 target card sacrifice. Blockable by Jiner Badsha.
          </p>
        </button>

        {/* 6. HOTTAYA (7 coins) */}
        <button
          type="button"
          disabled={myPlayer.coins < 7 || isSubmitting}
          onClick={() => handleSelectAction('hottaya')}
          className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
            selectedAction === 'hottaya'
              ? 'bg-gradient-to-r from-red-950 to-[#2A0808] border-[#E50914] shadow-[0_0_20px_rgba(229,9,20,0.6)] scale-[1.02]'
              : 'bg-[#180A0A] border-red-900/60 hover:border-red-500'
          } ${myPlayer.coins < 7 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-start justify-between gap-1 mb-2">
            <div>
              <span className="text-[10px] font-mono-code text-red-400 uppercase">
                {CHAKRANTO_ACTIONS.hottaya.bengaliName}
              </span>
              <h4 className="text-sm font-display font-black text-white">Hottaya</h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-red-600 text-white shadow">
              COST 7 COINS
            </span>
          </div>
          <p className="text-[11px] font-sans text-zinc-300 line-clamp-2 font-medium">
            Unblockable &amp; Unchallengeable! Target loses 1 card immediately.
          </p>
        </button>
      </div>

      {/* Target Selector if Selected Action Requires Targeting */}
      {selectedAction && ['dakati', 'ghar_motkano', 'hottaya'].includes(selectedAction) && (
        <div className="p-4 rounded-2xl bg-[#090909] border border-[#2B1515] space-y-3">
          <label className="text-xs font-mono-code uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#E50914]" />
            SELECT TARGET OPPONENT:
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {aliveOpponents.map((opp) => {
              const isSelected = selectedTargetId === opp.id;
              const isEligibleForDakati = selectedAction !== 'dakati' || opp.coins >= 2;

              return (
                <button
                  key={opp.id}
                  type="button"
                  disabled={!isEligibleForDakati}
                  onClick={() => setSelectedTargetId(opp.id)}
                  className={`p-3 rounded-xl border flex flex-col items-start transition-all ${
                    isSelected
                      ? 'bg-red-950/80 border-[#E50914] text-white shadow-md'
                      : 'bg-[#141414] border-[#222222] text-zinc-300 hover:border-zinc-500'
                  } ${!isEligibleForDakati ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <span className="w-5 h-5 rounded-lg bg-[#222] text-[10px] font-mono-code font-black flex items-center justify-center">
                      {opp.position}
                    </span>
                    <span className="text-xs font-display font-bold truncate flex-1">
                      {opp.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-code text-[#F59E0B] mt-1">
                    {opp.coins} coins • {opp.activeCardCount} cards
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation & Declaration Button */}
      {selectedAction && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setSelectedAction(null)}
            className="px-5 py-3 rounded-2xl bg-[#141414] hover:bg-[#202020] text-xs font-mono-code text-zinc-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleExecute}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#E50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-display font-black text-sm uppercase tracking-wider shadow-xl shadow-red-950/60 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Swords className="w-4 h-4 fill-current" />
            <span>
              {isSubmitting
                ? 'DECLARING...'
                : `DECLARE ${CHAKRANTO_ACTIONS[selectedAction].name.toUpperCase()}`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
