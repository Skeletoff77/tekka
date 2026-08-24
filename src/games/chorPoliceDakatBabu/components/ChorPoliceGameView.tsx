import React, { useState, useEffect, useCallback } from 'react';
import { BabuTargetChoice, CardRole } from '../types';
import { TekkaRoom, RoomPlayer } from '../../../types/room';
import { PrivatePlayerView, PublicGameSessionState } from '../../../types/gameSession';
import { subscribeToRoom } from '../../../services/roomService';
import {
  subscribeToGameSession,
  submitBabuTargetAction,
  submitPoliceGuessAction,
  advanceToNextRoundAction,
  startGameSession,
} from '../../../services/gameSessionService';
import { GameCard } from './GameCard';
import { GameBanner } from './GameBanner';
import { ScoreBoard } from './ScoreBoard';
import { BabuControls } from './BabuControls';
import { PoliceControls } from './PoliceControls';
import { RoundResultOverlay } from './RoundResultOverlay';
import { GameOverModal } from './GameOverModal';
import { ROLE_METADATA } from '../assets/gameAssets';
import {
  Crown,
  ShieldAlert,
  HelpCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  LogOut,
  Info,
} from 'lucide-react';

interface ChorPoliceGameViewProps {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  onExit: () => void;
}

export const ChorPoliceGameView: React.FC<ChorPoliceGameViewProps> = ({
  roomId,
  currentUserId,
  currentUserName,
  onExit,
}) => {
  const [room, setRoom] = useState<TekkaRoom | null>(null);
  const [publicState, setPublicState] = useState<PublicGameSessionState | null>(null);
  const [privateView, setPrivateView] = useState<PrivatePlayerView | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);

  // 1. Subscribe to Room document
  useEffect(() => {
    const unsubRoom = subscribeToRoom(
      roomId,
      (updatedRoom) => {
        setRoom(updatedRoom);
      },
      (err) => {
        console.error('Room subscription error:', err);
        setActionError(err.message || 'Failed to connect to room.');
      }
    );

    return () => unsubRoom();
  }, [roomId]);

  // 2. Subscribe to Real-Time Game Session & Private Player View
  useEffect(() => {
    if (!currentUserId || !roomId) return;

    const unsubGame = subscribeToGameSession(
      roomId,
      currentUserId,
      (pubState) => {
        setPublicState(pubState);
        setLoading(false);
      },
      (privView) => {
        setPrivateView(privView);
      },
      (err) => {
        console.error('Game session error:', err);
        setActionError(err.message || 'Failed to subscribe to game session.');
        setLoading(false);
      }
    );

    return () => unsubGame();
  }, [roomId, currentUserId]);

  // Handle Babu target selection ('find-chor' | 'find-dakat')
  const handleBabuChoice = async (target: BabuTargetChoice) => {
    if (isSubmitting || !publicState || publicState.babuPlayerId !== currentUserId) return;
    try {
      setIsSubmitting(true);
      setActionError(null);
      await submitBabuTargetAction(roomId, currentUserId, target);
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit Babu choice');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Police accusation
  const handlePoliceGuess = async (accusedPlayerId: string) => {
    if (isSubmitting || !publicState || publicState.policePlayerId !== currentUserId) return;
    try {
      setIsSubmitting(true);
      setActionError(null);
      await submitPoliceGuessAction(roomId, currentUserId, accusedPlayerId);
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit Police accusation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle advance round
  const handleNextRound = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      setActionError(null);
      await advanceToNextRoundAction(roomId, currentUserId);
    } catch (err: any) {
      setActionError(err.message || 'Failed to advance round');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Rematch (if Host)
  const handlePlayAgain = async () => {
    if (!room || room.hostId !== currentUserId) {
      onExit();
      return;
    }
    try {
      setIsSubmitting(true);
      await startGameSession(roomId, currentUserId);
    } catch (err: any) {
      setActionError(err.message || 'Failed to restart match');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !room || !publicState) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#E50914] animate-spin" />
        <p className="text-sm font-mono-code text-zinc-400">
          Connecting to Authoritative Game Session...
        </p>
      </div>
    );
  }

  const currentRound = publicState.currentRound;
  const totalRounds = publicState.totalRounds;
  const phase = publicState.phase;

  const babuPlayer = room.players.find((p) => p.id === publicState.babuPlayerId);
  const policePlayer = room.players.find((p) => p.id === publicState.policePlayerId);

  const isCurrentUserBabu = publicState.babuPlayerId === currentUserId;
  const isCurrentUserPolice = publicState.policePlayerId === currentUserId;

  const hiddenPlayers = room.players.filter(
    (p) => p.id !== publicState.babuPlayerId && p.id !== publicState.policePlayerId
  );

  // Format players for scoreboard & components
  const formattedPlayers = room.players.map((p) => ({
    id: p.id,
    name: p.tekkaName,
    isHuman: true,
    isCurrentUser: p.id === currentUserId,
  }));

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col font-sans select-none pb-12">
      {/* Top Game Bar */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#1F1F1F] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] shadow-[0_0_10px_#E50914] animate-pulse" />
          <h1 className="text-base sm:text-lg font-display font-black tracking-tight text-white flex items-center gap-2">
            <span>CHOR POLICE DAKAT BABU</span>
            <span className="text-[10px] font-mono-code bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/40 px-2 py-0.5 rounded-full uppercase">
              ROOM: {room.roomCode}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-[#2B2B2B] text-xs font-mono-code text-zinc-300 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-xs font-mono-code text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* Main Game Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Game Banner Header */}
        <GameBanner />

        {/* Action Error Alert */}
        {actionError && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-center gap-3 text-red-200 text-xs font-mono-code">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Phase Status Notification Bar */}
        <div className="p-4 rounded-2xl bg-[#0F0F0F] border border-[#262626] flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-950/40 border border-red-900/50 flex items-center justify-center text-[#E50914]">
              {phase === 'BABU_TURN' ? (
                <Crown className="w-5 h-5 text-amber-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-code uppercase text-[#E50914] font-bold">
                  PHASE: {phase.replace('_', ' ')}
                </span>
                {isSubmitting && (
                  <span className="text-[10px] font-mono-code text-amber-400 animate-pulse">
                    (Syncing with Server...)
                  </span>
                )}
              </div>
              <p className="text-sm font-display font-bold text-white">
                {phase === 'BABU_TURN' && `${babuPlayer?.tekkaName || 'Babu'} is making the official decree.`}
                {phase === 'POLICE_TURN' && `${policePlayer?.tekkaName || 'Police'} is interrogating suspects.`}
                {phase === 'REVEAL_RESULT' && 'Round complete! All cards revealed.'}
                {phase === 'GAME_OVER' && 'Match Complete! Check the final champions.'}
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#141414] border border-[#222222] text-xs font-mono-code">
            <span className="text-zinc-400">Round </span>
            <span className="text-amber-400 font-bold">{currentRound}</span>
            <span className="text-zinc-600"> / </span>
            <span className="text-white font-bold">{totalRounds}</span>
          </div>
        </div>

        {/* 4 Player Table View & Scoreboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main 4-Seat Card Arena */}
          <div className="lg:col-span-3 rounded-3xl bg-gradient-to-b from-[#111111] to-[#0A0A0A] border-2 border-[#222222] p-4 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[520px]">
            {/* Center Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <div className="w-[450px] h-[450px] rounded-full border-8 border-red-600 flex items-center justify-center">
                <span className="text-7xl font-display font-black text-white">TEKKA</span>
              </div>
            </div>

            {/* 4 Player Seats Grid */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 justify-items-center my-auto">
              {room.players.map((player) => {
                const isCurrentUser = player.id === currentUserId;
                const isBabu = player.id === publicState.babuPlayerId;
                const isPolice = player.id === publicState.policePlayerId;

                // Determine which role to show on this seat card:
                // If phase is REVEAL_RESULT or GAME_OVER, show the published revealed assignment
                // Else, show from privateView.publicRoles (which masks other secret chits)
                let cardRole: CardRole | 'hidden' = 'hidden';
                if (publicState.revealedAssignments && publicState.revealedAssignments[player.id]) {
                  cardRole = publicState.revealedAssignments[player.id];
                } else if (privateView?.publicRoles && privateView.publicRoles[player.id]) {
                  cardRole = privateView.publicRoles[player.id];
                }

                let badgeLabel: string | undefined = undefined;
                if (isBabu) badgeLabel = 'BABU (1200)';
                else if (isPolice) badgeLabel = 'POLICE (900)';

                return (
                  <div key={player.id} className="flex flex-col items-center">
                    <GameCard
                      role={cardRole}
                      playerName={player.tekkaName}
                      isCurrentUser={isCurrentUser}
                      badgeLabel={badgeLabel}
                      showPoints={true}
                      size="md"
                    />
                  </div>
                );
              })}
            </div>

            {/* In-Game Action Controls Dock */}
            <div className="mt-8 relative z-20">
              {phase === 'BABU_TURN' && babuPlayer && (
                <BabuControls
                  isBabu={isCurrentUserBabu}
                  babuPlayerName={babuPlayer.tekkaName}
                  onSelectTarget={handleBabuChoice}
                  disabled={!isCurrentUserBabu || isSubmitting}
                />
              )}

              {phase === 'POLICE_TURN' && policePlayer && publicState.babuTarget && (
                <PoliceControls
                  isPolice={isCurrentUserPolice}
                  policePlayerName={policePlayer.tekkaName}
                  babuTarget={publicState.babuTarget}
                  hiddenPlayers={hiddenPlayers.map((p) => ({
                    id: p.id,
                    name: p.tekkaName,
                    isHuman: true,
                    isCurrentUser: p.id === currentUserId,
                  }))}
                  onAccusePlayer={handlePoliceGuess}
                  disabled={!isCurrentUserPolice || isSubmitting}
                />
              )}
            </div>
          </div>

          {/* Right Column: Scoreboard & Points Reference */}
          <div className="space-y-6">
            <ScoreBoard
              players={formattedPlayers}
              cumulativeScores={publicState.cumulativeScores}
              currentRound={currentRound}
              totalRounds={totalRounds}
              lastPointsEarned={publicState.lastRoundResult?.pointsEarned}
            />

            {/* Role Points Cheat Sheet */}
            <div className="p-4 rounded-2xl bg-[#0E0E0E] border border-[#222222] space-y-3">
              <h4 className="text-xs font-mono-code uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-zinc-400" />
                CARD VALUES & REWARDS
              </h4>

              <div className="space-y-2">
                {Object.values(ROLE_METADATA).map((meta) => (
                  <div
                    key={meta.role}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#141414] border border-[#1E1E1E] text-xs"
                  >
                    <span className={`px-2 py-0.5 rounded font-mono-code font-bold uppercase ${meta.badgeColor}`}>
                      {meta.title}
                    </span>
                    <span className="font-mono-code font-black text-white">
                      +{meta.points} PTS
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Round Reveal Result Modal */}
      {phase === 'REVEAL_RESULT' && publicState.lastRoundResult && babuPlayer && policePlayer && (
        <RoundResultOverlay
          isCorrect={publicState.lastRoundResult.isCorrect}
          targetRole={publicState.lastRoundResult.targetRole}
          accusedPlayer={
            formattedPlayers.find((p) => p.id === publicState.policeAccusedPlayerId) || formattedPlayers[0]
          }
          actualTargetPlayer={
            formattedPlayers.find((p) => p.id === publicState.lastRoundResult?.actualTargetPlayerId) ||
            formattedPlayers[0]
          }
          policePlayer={{
            id: policePlayer.id,
            name: policePlayer.tekkaName,
            isHuman: true,
          }}
          babuPlayer={{
            id: babuPlayer.id,
            name: babuPlayer.tekkaName,
            isHuman: true,
          }}
          players={formattedPlayers}
          cardAssignments={publicState.revealedAssignments || {}}
          pointsEarned={publicState.lastRoundResult.pointsEarned}
          cumulativeScores={publicState.cumulativeScores}
          currentRound={currentRound}
          totalRounds={totalRounds}
          onNextRound={handleNextRound}
        />
      )}

      {/* Game Over Modal */}
      {phase === 'GAME_OVER' && (
        <GameOverModal
          players={formattedPlayers}
          cumulativeScores={publicState.cumulativeScores}
          winners={publicState.winners || []}
          isTie={publicState.isTie}
          totalRounds={totalRounds}
          onPlayAgain={handlePlayAgain}
          onExit={onExit}
        />
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0F0F0F] rounded-3xl border-2 border-[#262626] p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
              <h3 className="text-xl font-display font-black text-white">
                Official Rules: Chor Police Dakat Babu
              </h3>
              <button
                type="button"
                onClick={() => setShowRules(false)}
                className="text-zinc-400 hover:text-white font-mono-code text-xs px-2 py-1 bg-[#18181B] rounded-lg cursor-pointer"
              >
                CLOSE
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans max-h-[60vh] overflow-y-auto pr-2">
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                <h5 className="font-bold text-amber-400 mb-1">1. Exact 4 Roles & Points</h5>
                <ul className="list-disc list-inside space-y-1 font-mono-code">
                  <li><strong>Babu:</strong> 1200 Points (Always collects 1200)</li>
                  <li><strong>Police:</strong> 900 Points (Collects 900 if guess correct; 0 if wrong)</li>
                  <li><strong>Dakat:</strong> 600 Points (Bandit with Talwar; always collects 600)</li>
                  <li><strong>Chor:</strong> 400 Points (Thief with sack; receives 400 if Police fails guess, 0 if caught)</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-[#141414] border border-[#262626]">
                <h5 className="font-bold text-white mb-1">2. Round Progression</h5>
                <p>
                  Every round, the 4 cards are shuffled and dealt randomly. Babu and Police are revealed publicly, while Chor and Dakat remain secret chits.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#141414] border border-[#262626]">
                <h5 className="font-bold text-white mb-1">3. The Babu's Command & Police Deduction</h5>
                <p>
                  Babu commands Police to FIND CHOR or FIND DAKAT. Police must accuse one of the 2 hidden players.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30">
                <h5 className="font-bold text-[#E50914] mb-1">4. Match Length & Ties</h5>
                <p>
                  Tournament matches run for exactly 5, 10, 15, or 20 rounds. The player with highest cumulative score wins. Ties are declared cleanly with joint winners.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRules(false)}
                className="px-6 py-2.5 rounded-xl bg-[#E50914] text-white font-display font-bold text-xs uppercase cursor-pointer"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
