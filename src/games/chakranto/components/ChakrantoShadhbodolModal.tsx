import React, { useState } from 'react';
import { ChakrantoCardItem } from '../types';
import { ChakrantoCard } from './ChakrantoCard';
import { Sparkles, ArrowRight } from 'lucide-react';

interface ChakrantoShadhbodolModalProps {
  shadhbodolOptions: ChakrantoCardItem[];
  requiredKeepCount: number;
  onConfirmKeep: (keptCardIds: string[]) => Promise<void>;
  isSubmitting: boolean;
}

export const ChakrantoShadhbodolModal: React.FC<ChakrantoShadhbodolModalProps> = ({
  shadhbodolOptions,
  requiredKeepCount,
  onConfirmKeep,
  isSubmitting,
}) => {
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleSelectCard = (id: string) => {
    setErrorMsg(null);
    if (selectedCardIds.includes(id)) {
      setSelectedCardIds(selectedCardIds.filter((item) => item !== id));
    } else {
      if (selectedCardIds.length < requiredKeepCount) {
        setSelectedCardIds([...selectedCardIds, id]);
      } else {
        // Replace first selection if already reached limit
        setSelectedCardIds([...selectedCardIds.slice(1), id]);
      }
    }
  };

  const handleConfirm = async () => {
    if (selectedCardIds.length !== requiredKeepCount) {
      setErrorMsg(`Please select exactly ${requiredKeepCount} cards to keep.`);
      return;
    }

    try {
      setErrorMsg(null);
      await onConfirmKeep(selectedCardIds);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete Shadbodol.');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1C1205] via-[#120B02] to-[#0A0501] border-2 border-amber-500/70 shadow-2xl space-y-5 animate-in zoom-in-95">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-mono-code uppercase tracking-widest text-amber-400 font-bold block">
            SHADBODOL • PETUKCHONDRO (স্বাদবদল)
          </span>
          <h3 className="text-lg font-display font-black text-white">
            Choose {requiredKeepCount} Cards to Keep in Secret Hand
          </h3>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-900/40 text-xs font-sans text-zinc-300">
        You drew 2 cards privately from the deck. Select <strong>{requiredKeepCount}</strong> card
        {requiredKeepCount > 1 ? 's' : ''} to keep. The remaining card(s) will be shuffled back into
        the draw deck.
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-xs font-mono-code text-red-200">
          {errorMsg}
        </div>
      )}

      {/* Cards to choose from */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
        {shadhbodolOptions.map((card) => {
          const isSelected = selectedCardIds.includes(card.id);
          return (
            <div key={card.id} className="flex flex-col items-center gap-2">
              <ChakrantoCard
                character={card.character}
                isSelected={isSelected}
                onClick={() => toggleSelectCard(card.id)}
                size="md"
              />
              <button
                type="button"
                onClick={() => toggleSelectCard(card.id)}
                className={`w-full py-1.5 rounded-xl text-[10px] font-mono-code font-bold uppercase transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-black shadow font-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {isSelected ? 'KEEPING' : 'SELECT'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Button */}
      <div className="flex items-center justify-between pt-2 border-t border-amber-950/60">
        <span className="text-xs font-mono-code text-amber-300">
          Selected {selectedCardIds.length} / {requiredKeepCount}
        </span>

        <button
          type="button"
          disabled={selectedCardIds.length !== requiredKeepCount || isSubmitting}
          onClick={handleConfirm}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-display font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-950/80 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>{isSubmitting ? 'RETURNING CARDS...' : 'CONFIRM SELECTION'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
