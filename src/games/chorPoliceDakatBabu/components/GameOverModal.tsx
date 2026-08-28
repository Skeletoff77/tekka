import React from 'react';
import { PlayerFinalStanding, RoundOption } from '../types';
import { calculateFinalStandings } from '../engine/chorPoliceEngine';
import { Trophy, Medal, RotateCcw, Home, Sparkles, Crown, Award, Users } from 'lucide-react';

interface GameOverModalProps {
  players: { id: string; name: string; seatIndex?: number; isCurrentUser?: boolean }[];
  cumulativeScores: Record<string, number>;
  winners: string[];
  isTie: boolean;
  finalStandings?: PlayerFinalStanding[] | null;
  totalRounds: RoundOption;
  isHost?: boolean;
  onPlayAgain?: () => void;
  onExit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  players,
  cumulativeScores,
  winners,
  isTie,
  finalStandings: serverStandings,
  totalRounds,
  isHost = false,
  onPlayAgain,
  onExit,
}) => {
  // Use authoritative server standings if provided, otherwise compute deterministically
  const standings = React.useMemo(() => {
    if (serverStandings && serverStandings.length > 0) {
      return serverStandings;
    }
    return calculateFinalStandings(
      players.map((p) => ({ id: p.id, name: p.name })),
      cumulativeScores
    );
  }, [serverStandings, players, cumulativeScores]);

  // Identify winner names for top greeting
  const winningStandings = standings.filter((s) => s.isWinner);
  const winnerNames = winningStandings.map((s) => s.playerName).join(' & ');

  // Get podium icon and styling based on rank
  const getRankBadge = (rank: number, isWinner: boolean) => {
    if (rank === 1) {
      return {
        icon: <Trophy className="w-5 h-5 text-yellow-400" />,
        badgeText: isTie ? '🏆 1st Place (Tied)' : '🏆 1st Place — Winner',
        rankNumberBg: 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]',
        cardBorder: 'border-amber-500/60 bg-gradient-to-r from-amber-950/40 via-[#18181B] to-[#121212] shadow-[0_0_25px_rgba(245,158,11,0.15)]',
        scoreColor: 'text-amber-400',
      };
    }
    if (rank === 2) {
      return {
        icon: <Medal className="w-5 h-5 text-slate-300" />,
        badgeText: '🥈 2nd Place',
        rankNumberBg: 'bg-gradient-to-tr from-slate-400 to-slate-200 text-black shadow-md',
        cardBorder: 'border-slate-400/40 bg-[#141414]',
        scoreColor: 'text-slate-200',
      };
    }
    if (rank === 3) {
      return {
        icon: <Medal className="w-5 h-5 text-amber-700" />,
        badgeText: '🥉 3rd Place',
        rankNumberBg: 'bg-gradient-to-tr from-amber-700 to-amber-600 text-white shadow-md',
        cardBorder: 'border-amber-800/40 bg-[#141414]',
        scoreColor: 'text-amber-500',
      };
    }
    return {
      icon: <Award className="w-5 h-5 text-zinc-500" />,
      badgeText: `${rank}th Place`,
      rankNumberBg: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
      cardBorder: 'border-[#222222] bg-[#121212]',
      scoreColor: 'text-zinc-300',
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0C0C0C] rounded-3xl border-2 border-amber-500/40 overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.25)] animate-in zoom-in-95 duration-300 my-auto">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-amber-500/20 via-[#141414] to-[#0C0C0C] border-b border-amber-500/30 relative">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 p-0.5 shadow-[0_0_50px_rgba(245,158,11,0.5)]">
              <div className="w-full h-full rounded-[22px] bg-[#0C0C0C] flex items-center justify-center text-amber-400">
                <Crown className="w-10 h-10 animate-bounce text-amber-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono-code font-bold uppercase tracking-[0.25em] text-amber-300">
              {totalRounds}-ROUND MATCH RESULTS
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
            {isTie ? 'MATCH TIED FOR 1ST PLACE!' : 'CHAMPION DECLARED!'}
          </h2>

          <p className="text-sm sm:text-base font-mono-code text-zinc-300 mt-2">
            {isTie ? (
              <>
                Tied for 1st Place:{' '}
                <strong className="text-amber-400 font-bold">{winnerNames}</strong>
              </>
            ) : (
              <>
                <strong className="text-amber-400 font-bold text-lg">{winnerNames}</strong> claims the victory!
              </>
            )}
          </p>
        </div>

        {/* Final Standings Leaderboard */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono-code uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>FINAL STANDINGS & CUMULATIVE SCORES</span>
            </h3>
            <span className="text-[11px] font-mono-code text-zinc-500">
              {standings.length} Players
            </span>
          </div>

          <div className="space-y-3">
            {standings.map((standing) => {
              const matchedPlayer = players.find((p) => p.id === standing.playerId);
              const isCurrentUser = matchedPlayer?.isCurrentUser || false;
              const badge = getRankBadge(standing.rank, standing.isWinner);

              return (
                <div
                  key={standing.playerId}
                  className={`flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border transition-all duration-300 ${badge.cardBorder}`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Rank Circle */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-mono-code font-black ${badge.rankNumberBg}`}
                    >
                      {standing.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-display font-bold text-white">
                          {standing.playerName}
                        </span>

                        {/* Rank Badge Tag */}
                        <span className="text-[11px] font-mono-code px-2 py-0.5 rounded-md font-bold uppercase bg-zinc-800/80 text-zinc-200 border border-zinc-700/60">
                          {badge.badgeText}
                        </span>

                        {isCurrentUser && (
                          <span className="text-[9px] font-mono-code bg-[#E50914] text-white px-2 py-0.5 rounded font-black uppercase">
                            YOU
                          </span>
                        )}
                      </div>

                      {typeof matchedPlayer?.seatIndex === 'number' && (
                        <span className="text-xs font-mono-code text-zinc-500 block mt-0.5">
                          Seat {matchedPlayer.seatIndex + 1}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right pl-4">
                    <span className={`text-xl sm:text-2xl font-mono-code font-black ${badge.scoreColor}`}>
                      {standing.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono-code text-zinc-500 block -mt-1 font-bold">
                      PTS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onPlayAgain && (
              <button
                type="button"
                onClick={onPlayAgain}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#E50914] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-display font-bold text-sm uppercase tracking-wider shadow-xl shadow-red-950/50 hover:shadow-[0_0_25px_rgba(229,9,20,0.6)] flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isHost ? 'PLAY AGAIN (HOST)' : 'PLAY AGAIN'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onExit}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#18181B] hover:bg-[#222222] text-zinc-300 hover:text-white font-display font-bold text-sm uppercase tracking-wider border border-[#333333] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4 text-zinc-400" />
              <span>RETURN HOME</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
