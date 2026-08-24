import React from 'react';
import { CardRole, PlayerSeat, RoundOption } from '../types';
import { ROLE_METADATA } from '../assets/gameAssets';
import { CheckCircle2, XCircle, ArrowRight, Trophy, Sparkles } from 'lucide-react';

interface RoundResultOverlayProps {
  isCorrect: boolean;
  targetRole: 'chor' | 'dakat';
  accusedPlayer: PlayerSeat;
  actualTargetPlayer: PlayerSeat;
  policePlayer: PlayerSeat;
  babuPlayer: PlayerSeat;
  players: PlayerSeat[];
  cardAssignments: Record<string, CardRole>;
  pointsEarned: Record<string, number>;
  cumulativeScores: Record<string, number>;
  currentRound: number;
  totalRounds: RoundOption;
  onNextRound: () => void;
  isHost?: boolean;
}

export const RoundResultOverlay: React.FC<RoundResultOverlayProps> = ({
  isCorrect,
  targetRole,
  accusedPlayer,
  actualTargetPlayer,
  policePlayer,
  babuPlayer,
  players,
  cardAssignments,
  pointsEarned,
  cumulativeScores,
  currentRound,
  totalRounds,
  onNextRound,
  isHost = true,
}) => {
  const isFinalRound = currentRound >= totalRounds;
  const targetTitle = targetRole === 'chor' ? 'Chor (Thief)' : 'Dakat (Robber)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0F0F0F] rounded-3xl border-2 border-[#262626] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-300">
        {/* Outcome Header Banner */}
        <div
          className={`p-6 text-center relative overflow-hidden ${
            isCorrect
              ? 'bg-gradient-to-b from-emerald-950/80 to-[#0F0F0F] border-b border-emerald-500/40'
              : 'bg-gradient-to-b from-red-950/80 to-[#0F0F0F] border-b border-red-500/40'
          }`}
        >
          <div className="flex justify-center mb-3">
            {isCorrect ? (
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-3xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                <XCircle className="w-9 h-9" />
              </div>
            )}
          </div>

          <span
            className={`text-xs font-mono-code font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
              isCorrect
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-red-500/20 text-red-300 border-red-500/40'
            }`}
          >
            ROUND {currentRound} OF {totalRounds} OUTCOME
          </span>

          <h2 className="text-3xl sm:text-4xl font-display font-black text-white mt-2 tracking-tight">
            {isCorrect ? 'CORRECT GUESS!' : 'WRONG GUESS!'}
          </h2>

          <p className="text-sm font-mono-code text-zinc-300 mt-2 max-w-lg mx-auto">
            {isCorrect ? (
              <>
                <strong className="text-emerald-400">{policePlayer.name}</strong> correctly identified{' '}
                <strong className="text-white">{actualTargetPlayer.name}</strong> as the {targetTitle}!
              </>
            ) : (
              <>
                <strong className="text-red-400">{policePlayer.name}</strong> accused{' '}
                <strong className="text-zinc-400">{accusedPlayer.name}</strong>, but{' '}
                <strong className="text-white">{actualTargetPlayer.name}</strong> was the true {targetTitle}!
              </>
            )}
          </p>
        </div>

        {/* Round Points & Roles Distribution Grid */}
        <div className="p-6 space-y-4">
          <h4 className="text-xs font-mono-code uppercase tracking-wider text-zinc-400 font-semibold text-center">
            ROUND SCORE DISTRIBUTION
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {players.map((player) => {
              const role = cardAssignments[player.id];
              const roleMeta = ROLE_METADATA[role];
              const delta = pointsEarned[player.id] || 0;
              const total = cumulativeScores[player.id] || 0;

              return (
                <div
                  key={player.id}
                  className="p-3.5 rounded-2xl bg-[#141414] border border-[#262626] flex flex-col items-center text-center relative overflow-hidden"
                >
                  <span className={`text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded border mb-1.5 ${roleMeta?.badgeColor}`}>
                    {roleMeta?.title || role}
                  </span>

                  <span className="text-xs font-display font-bold text-white truncate max-w-full">
                    {player.name}
                  </span>

                  <div className="my-2">
                    <span
                      className={`text-lg font-mono-code font-black ${
                        delta > 0 ? 'text-emerald-400' : 'text-zinc-500'
                      }`}
                    >
                      +{delta}
                    </span>
                    <span className="text-[9px] font-mono-code text-zinc-500 block">PTS</span>
                  </div>

                  <div className="w-full pt-2 border-t border-[#222222] flex justify-between items-center text-[10px] font-mono-code">
                    <span className="text-zinc-500">TOTAL</span>
                    <span className="text-amber-400 font-bold">{total}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Round / Results Action */}
          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={onNextRound}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-[#E50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-display font-bold text-base uppercase tracking-wider shadow-2xl shadow-red-950/60 hover:shadow-[0_0_30px_rgba(229,9,20,0.6)] transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>{isFinalRound ? 'VIEW FINAL RESULTS' : 'PROCEED TO NEXT ROUND'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
