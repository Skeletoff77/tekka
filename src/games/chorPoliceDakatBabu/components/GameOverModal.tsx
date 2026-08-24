import React from 'react';
import { PlayerSeat, RoundOption } from '../types';
import { Trophy, Medal, RotateCcw, ArrowLeft, Sparkles, Flame } from 'lucide-react';

interface GameOverModalProps {
  players: PlayerSeat[];
  cumulativeScores: Record<string, number>;
  winners: string[];
  isTie: boolean;
  totalRounds: RoundOption;
  onPlayAgain: () => void;
  onExit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  players,
  cumulativeScores,
  winners,
  isTie,
  totalRounds,
  onPlayAgain,
  onExit,
}) => {
  // Sort players by final cumulative score
  const sortedPlayers = [...players].sort((a, b) => {
    const scoreA = cumulativeScores[a.id] || 0;
    const scoreB = cumulativeScores[b.id] || 0;
    return scoreB - scoreA;
  });

  const winnerNames = players
    .filter((p) => winners.includes(p.id))
    .map((p) => p.name)
    .join(' & ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0C0C0C] rounded-3xl border-2 border-amber-500/40 overflow-hidden shadow-[0_0_100px_rgba(245,158,11,0.25)] animate-in zoom-in-95 duration-400 my-auto">
        {/* Header Ribbon */}
        <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-amber-500/20 via-[#141414] to-[#0C0C0C] border-b border-amber-500/30 relative">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-[0_0_50px_rgba(245,158,11,0.5)]">
              <div className="w-full h-full rounded-[22px] bg-[#0C0C0C] flex items-center justify-center text-amber-400">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono-code font-bold uppercase tracking-[0.25em] text-amber-300">
              {totalRounds}-ROUND MATCH FINALE
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            {isTie ? 'MATCH TIED!' : 'CHAMPION DECLARED!'}
          </h2>

          <p className="text-sm sm:text-base font-mono-code text-zinc-300 mt-2">
            {isTie ? (
              <>
                Tied for 1st Place: <strong className="text-amber-400 font-bold">{winnerNames}</strong>
              </>
            ) : (
              <>
                <strong className="text-amber-400 font-bold text-lg">{winnerNames}</strong> claims the throne!
              </>
            )}
          </p>
        </div>

        {/* Final Standings Leaderboard */}
        <div className="p-6 sm:p-8 space-y-4">
          <h3 className="text-xs font-mono-code uppercase tracking-wider text-zinc-400 font-bold text-center">
            FINAL LEADERBOARD & CUMULATIVE SCORES
          </h3>

          <div className="space-y-2.5">
            {sortedPlayers.map((player, rankIndex) => {
              const score = cumulativeScores[player.id] || 0;
              const isWinner = winners.includes(player.id);

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 ${
                    isWinner
                      ? 'bg-gradient-to-r from-amber-950/40 via-[#18181B] to-[#121212] border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'bg-[#141414] border-[#222222]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono-code font-black ${
                        rankIndex === 0
                          ? 'bg-amber-500 text-black shadow-md'
                          : rankIndex === 1
                          ? 'bg-zinc-300 text-black'
                          : rankIndex === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {rankIndex + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-display font-bold text-white">
                          {player.name}
                        </span>
                        {isWinner && (
                          <span className="flex items-center gap-1 text-[9px] font-mono-code bg-amber-500 text-black px-2 py-0.5 rounded font-black uppercase">
                            <Trophy className="w-2.5 h-2.5" />
                            {isTie ? 'CO-WINNER' : 'WINNER'}
                          </span>
                        )}
                        {player.isCurrentUser && (
                          <span className="text-[9px] font-mono-code bg-[#E50914] text-white px-1.5 py-0.2 rounded font-bold uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono-code text-zinc-500">
                        Seat {player.seatIndex + 1}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-mono-code font-black text-amber-400">
                      {score.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono-code text-zinc-500 block -mt-1">
                      PTS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onPlayAgain}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#E50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-display font-bold text-sm uppercase tracking-wider shadow-xl shadow-red-950/50 hover:shadow-[0_0_25px_rgba(229,9,20,0.6)] flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY NEW MATCH</span>
            </button>

            <button
              type="button"
              onClick={onExit}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#18181B] hover:bg-[#222222] text-zinc-300 hover:text-white font-mono-code font-semibold text-xs uppercase tracking-wider border border-[#333333] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO GAME HUB</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
