import React from 'react';
import { ChakrantoPublicState, ChakrantoStanding } from '../types';
import { ChakrantoCoin } from './ChakrantoCoin';
import { Trophy, Medal, Crown, RotateCcw, Home, Skull } from 'lucide-react';

interface ChakrantoGameOverModalProps {
  publicState: ChakrantoPublicState;
  currentUserId: string;
  isHost: boolean;
  onRematch: () => void;
  onExit: () => void;
}

export const ChakrantoGameOverModal: React.FC<ChakrantoGameOverModalProps> = ({
  publicState,
  currentUserId,
  isHost,
  onRematch,
  onExit,
}) => {
  const standings = publicState.finalStandings || [];
  const champion = standings.find((s) => s.rank === 1);
  const isMeWinner = champion?.playerId === currentUserId;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#1E0E0E] via-[#120808] to-[#0A0A0A] border-2 border-[#E50914] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(229,9,20,0.4)] space-y-6 text-center animate-in zoom-in-95">
        {/* Victory Icon & Title */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-[#E50914]/20 border border-[#E50914]/40 flex items-center justify-center text-[#FF4D4D] shadow-xl">
            <Trophy className="w-9 h-9 animate-bounce" />
          </div>
          <span className="text-xs font-mono-code uppercase tracking-[0.3em] text-[#FF4D4D] font-bold">
            MATCH CONCLUSION
          </span>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-white">
            {isMeWinner ? 'VICTORY IS YOURS!' : `${champion?.playerName} WINS!`}
          </h2>
          <p className="text-xs font-sans text-zinc-400 max-w-md">
            The conspirators have fallen. One sole survivor claims absolute mastery of the Chakranto
            arena.
          </p>
        </div>

        {/* Standings Table */}
        <div className="space-y-2.5 text-left">
          <span className="text-[10px] font-mono-code uppercase text-zinc-500 font-bold block px-1">
            FINAL STANDINGS &amp; RANKINGS:
          </span>
          <div className="space-y-2">
            {standings.map((st) => {
              const isWinner = st.rank === 1;
              const isRunnerUp = st.rank === 2;
              const isUser = st.playerId === currentUserId;

              return (
                <div
                  key={st.playerId}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isWinner
                      ? 'bg-gradient-to-r from-red-950/80 to-[#2A0808] border-[#E50914] shadow-lg'
                      : isRunnerUp
                      ? 'bg-[#181818] border-zinc-700'
                      : 'bg-[#101010] border-[#222222]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono-code font-black text-xs ${
                        isWinner
                          ? 'bg-[#E50914] text-white shadow'
                          : isRunnerUp
                          ? 'bg-zinc-700 text-zinc-200'
                          : 'bg-[#222222] text-zinc-500'
                      }`}
                    >
                      {st.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-display font-black text-white">
                          {st.playerName}
                        </h4>
                        {isWinner && <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />}
                        {isUser && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono-code bg-[#E50914]/20 text-[#FF4D4D] border border-[#E50914]/40">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono-code text-zinc-400">
                        {st.rankLabel} • Position {st.position}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#F59E0B]">
                      <ChakrantoCoin size={14} />
                      <span>{st.finalCoins} coins</span>
                    </div>
                    <span className="text-[10px] font-mono-code text-zinc-500">
                      {st.sacrificedCount} sacrificed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-[#221010]">
          {isHost && (
            <button
              type="button"
              onClick={onRematch}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#E50914] hover:bg-red-600 text-white font-display font-black text-xs uppercase tracking-wider shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY REMATCH</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExit}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#181818] hover:bg-[#242424] text-zinc-300 hover:text-white font-mono-code text-xs uppercase tracking-wider border border-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>RETURN TO LOBBY</span>
          </button>
        </div>
      </div>
    </div>
  );
};
