import React, { useState } from 'react';
import { ChakrantoCardItem, ChakrantoPendingSacrifice } from '../types';
import { ChakrantoCard } from './ChakrantoCard';
import { Skull, AlertTriangle } from 'lucide-react';

interface ChakrantoSacrificeModalProps {
  pendingSacrifice: ChakrantoPendingSacrifice;
  myActiveCards: ChakrantoCardItem[];
  currentUserId: string;
  onSacrificeCard: (cardId: string) => Promise<void>;
  isSubmitting: boolean;
}

export const ChakrantoSacrificeModal: React.FC<ChakrantoSacrificeModalProps> = ({
  pendingSacrifice,
  myActiveCards,
  currentUserId,
  onSacrificeCard,
  isSubmitting,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isMySacrifice = pendingSacrifice.targetPlayerId === currentUserId;
  if (!isMySacrifice) {
    return (
      <div className="p-5 rounded-3xl bg-[#0F0F0F] border border-[#262626] text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-xs font-mono-code text-zinc-300 font-bold">
          <Skull className="w-4 h-4 text-red-500" />
          <span>Opponent is selecting a card to sacrifice...</span>
        </div>
        <span className="text-[11px] font-mono-code text-zinc-500">
          Reason: {pendingSacrifice.reason}
        </span>
      </div>
    );
  }

  const handleSacrifice = async () => {
    if (!selectedCardId) {
      setErrorMsg('Please select a card from your hand to sacrifice.');
      return;
    }

    try {
      setErrorMsg(null);
      await onSacrificeCard(selectedCardId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sacrifice card.');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-b from-[#220B0B] via-[#140606] to-[#0A0404] border-2 border-red-600 shadow-2xl space-y-5 animate-in zoom-in-95">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-400">
          <Skull className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-mono-code uppercase tracking-widest text-red-400 font-bold block">
            SACRIFICE MANDATED ({pendingSacrifice.reason})
          </span>
          <h3 className="text-lg font-display font-black text-white">
            Choose 1 Card to Discard Face-Up
          </h3>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-black/50 border border-red-900/40 text-xs font-sans text-zinc-300">
        You lost a challenge or suffered an attack. Select which card you want to sacrifice. It will
        be revealed publicly on the table.
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-xs font-mono-code text-red-200">
          {errorMsg}
        </div>
      )}

      {/* Cards to choose from */}
      <div className="flex items-center justify-center gap-4 py-2">
        {myActiveCards.map((card) => (
          <div key={card.id} className="flex flex-col items-center gap-2">
            <ChakrantoCard
              character={card.character}
              isSelected={selectedCardId === card.id}
              onClick={() => setSelectedCardId(card.id)}
              size="md"
            />
            <button
              type="button"
              onClick={() => setSelectedCardId(card.id)}
              className={`px-3 py-1 rounded-xl text-[10px] font-mono-code font-bold uppercase transition-all ${
                selectedCardId === card.id
                  ? 'bg-red-600 text-white shadow'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {selectedCardId === card.id ? 'SELECTED' : 'SELECT'}
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={!selectedCardId || isSubmitting}
          onClick={handleSacrifice}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-[#E50914] hover:from-red-500 hover:to-red-600 text-white font-display font-black text-xs uppercase tracking-wider shadow-xl shadow-red-950/80 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Skull className="w-4 h-4" />
          <span>{isSubmitting ? 'SACRIFICING...' : 'CONFIRM SACRIFICE'}</span>
        </button>
      </div>
    </div>
  );
};
