import React from 'react';
import { ChakrantoPlayerPublic } from '../types';
import { ChakrantoCoin } from './ChakrantoCoin';
import { ChakrantoCard } from './ChakrantoCard';
import { Crown, Skull, Swords, Shield, Coins } from 'lucide-react';

interface ChakrantoTableProps {
  players: ChakrantoPlayerPublic[];
  currentTurnPlayerId: string;
  currentUserId: string;
  onSelectTargetPlayer?: (player: ChakrantoPlayerPublic) => void;
  selectedTargetId?: string | null;
  isSelectingTarget?: boolean;
}

export const ChakrantoTable: React.FC<ChakrantoTableProps> = ({
  players,
  currentTurnPlayerId,
  currentUserId,
  onSelectTargetPlayer,
  selectedTargetId,
  isSelectingTarget = false,
}) => {
  // Sort players by seat index
  const sortedPlayers = [...players].sort((a, b) => a.seatIndex - b.seatIndex);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedPlayers.map((player) => {
          const isTurn = player.id === currentTurnPlayerId;
          const isMe = player.id === currentUserId;
          const isSelected = selectedTargetId === player.id;
          const canBeTargeted = isSelectingTarget && !player.isEliminated && player.id !== currentUserId;

          return (
            <div
              key={player.id}
              onClick={() => {
                if (canBeTargeted && onSelectTargetPlayer) {
                  onSelectTargetPlayer(player);
                }
              }}
              className={`p-4 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                player.isEliminated
                  ? 'bg-[#0A0A0A]/60 border-zinc-900 opacity-60'
                  : isTurn
                  ? 'bg-gradient-to-b from-[#1E0E0E] to-[#120808] border-[#E50914] shadow-[0_0_30px_rgba(229,9,20,0.3)]'
                  : isSelected
                  ? 'bg-red-950/40 border-[#E50914] shadow-[0_0_20px_rgba(229,9,20,0.5)]'
                  : isMe
                  ? 'bg-[#141414] border-zinc-700'
                  : 'bg-[#101010] border-[#222222]'
              } ${canBeTargeted ? 'cursor-pointer hover:border-[#E50914] hover:scale-[1.02]' : ''}`}
            >
              {/* Position Indicator Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono-code font-black text-xs ${
                      isTurn
                        ? 'bg-[#E50914] text-white shadow-lg'
                        : isMe
                        ? 'bg-zinc-700 text-white'
                        : 'bg-[#222222] text-zinc-400'
                    }`}
                  >
                    {player.position}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-display font-black text-white truncate max-w-[120px]">
                        {player.name}
                      </h4>
                      {isMe && (
                        <span className="px-1 py-0.5 rounded text-[8px] font-mono-code bg-[#E50914]/20 text-[#FF4D4D] border border-[#E50914]/30">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono-code text-zinc-500 block">
                      Position {player.position} • Seat {player.seatIndex + 1}
                    </span>
                  </div>
                </div>

                {/* Coin Purse */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-[#080808] border border-[#2B2B2B]">
                  <ChakrantoCoin size={16} />
                  <span className="text-sm font-mono-code font-black text-[#F59E0B]">
                    {player.coins}
                  </span>
                  <span className="text-[9px] font-mono-code text-zinc-500">COINS</span>
                </div>
              </div>

              {/* Status Banner */}
              {player.isEliminated ? (
                <div className="my-2 py-1 px-2.5 rounded-xl bg-red-950/30 border border-red-900/40 flex items-center gap-2 text-red-400 text-xs font-mono-code">
                  <Skull className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-bold">ELIMINATED</span>
                </div>
              ) : isTurn ? (
                <div className="my-2 py-1 px-2.5 rounded-xl bg-[#E50914]/20 border border-[#E50914]/40 flex items-center gap-2 text-red-200 text-xs font-mono-code">
                  <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping shrink-0" />
                  <span className="font-bold">ACTIVE TURN</span>
                </div>
              ) : null}

              {/* Active & Sacrificed Cards Display */}
              <div className="pt-2 border-t border-[#1C1C1C] flex items-center justify-between gap-2">
                {/* Active Secret Card Backs */}
                <div>
                  <span className="text-[9px] font-mono-code uppercase text-zinc-500 block mb-1">
                    ACTIVE CARDS ({player.activeCardCount})
                  </span>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: player.activeCardCount }).map((_, idx) => (
                      <ChakrantoCard
                        key={`active-card-${player.id}-${idx}`}
                        isBack={true}
                        size="sm"
                        className="!w-8 !rounded-lg shadow"
                      />
                    ))}
                    {player.activeCardCount === 0 && (
                      <span className="text-[10px] font-mono-code text-zinc-600">0 cards</span>
                    )}
                  </div>
                </div>

                {/* Sacrificed (Revealed) Cards */}
                {player.sacrificedCards.length > 0 && (
                  <div>
                    <span className="text-[9px] font-mono-code uppercase text-zinc-500 block mb-1">
                      SACRIFICED
                    </span>
                    <div className="flex items-center gap-1.5">
                      {player.sacrificedCards.map((char, idx) => (
                        <ChakrantoCard
                          key={`sacrificed-${player.id}-${idx}`}
                          character={char}
                          isSacrificed={true}
                          size="sm"
                          className="!w-8 !rounded-lg shadow"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
