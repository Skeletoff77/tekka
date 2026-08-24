import React, { useState, useEffect, useCallback } from 'react';
import {
  BabuTargetChoice,
  ChorPoliceGameState,
  RoundOption,
} from '../types';
import {
  createInitialGameState,
  startRoundDealing,
  submitBabuAction,
  submitPoliceAction,
  advanceToNextRound,
  sanitizeStateForPlayer,
} from '../engine/chorPoliceEngine';
import { generateDefaultSeats, getBotBabuChoice, getBotPoliceGuess } from '../engine/aiBots';
import { runAllChorPoliceTests } from '../engine/__tests__/chorPoliceEngine.test';
import { GameCard } from './GameCard';
import { ScoreBoard } from './ScoreBoard';
import { BabuControls } from './BabuControls';
import { PoliceControls } from './PoliceControls';
import { RoundResultOverlay } from './RoundResultOverlay';
import { GameOverModal } from './GameOverModal';
import { ROLE_METADATA } from '../assets/gameAssets';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';

interface SoloDevSandboxProps {
  onClose: () => void;
}

/**
 * Isolated Solo Developer Sandbox.
 * Intended strictly for local development, offline debugging, and automated engine validation.
 * NOT part of the production multiplayer game flow.
 */
export const SoloDevSandbox: React.FC<SoloDevSandboxProps> = ({ onClose }) => {
  const currentUserId = 'seat-0';
  const [gameState, setGameState] = useState<ChorPoliceGameState>(() => {
    const defaultSeats = generateDefaultSeats('Solo Dev Tester');
    return startRoundDealing(createInitialGameState('sandbox-match', defaultSeats, 5));
  });

  const [testResults, setTestResults] = useState<any>(null);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);

  const clientView = sanitizeStateForPlayer(gameState, currentUserId);
  const babuPlayer = gameState.players.find((p) => p.id === gameState.babuPlayerId);
  const policePlayer = gameState.players.find((p) => p.id === gameState.policePlayerId);

  const isCurrentUserBabu = gameState.babuPlayerId === currentUserId;
  const isCurrentUserPolice = gameState.policePlayerId === currentUserId;

  const hiddenPlayers = gameState.players.filter(
    (p) => p.id !== gameState.babuPlayerId && p.id !== gameState.policePlayerId
  );

  const handleBabuChoice = useCallback((target: BabuTargetChoice) => {
    if (!gameState.babuPlayerId) return;
    setGameState((prev) => submitBabuAction(prev, prev.babuPlayerId!, target));
  }, [gameState.babuPlayerId]);

  const handlePoliceGuess = useCallback((accusedPlayerId: string) => {
    if (!gameState.policePlayerId) return;
    setGameState((prev) => submitPoliceAction(prev, prev.policePlayerId!, accusedPlayerId));
  }, [gameState.policePlayerId]);

  const handleNextRound = () => {
    setGameState((prev) => advanceToNextRound(prev));
  };

  const handlePlayAgain = () => {
    const newGame = createInitialGameState(`sandbox-${Date.now()}`, gameState.players, 5);
    setGameState(startRoundDealing(newGame));
  };

  // Bot Turn Automation in sandbox
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.phase === 'BABU_TURN' && babuPlayer && !babuPlayer.isHuman) {
      setIsBotThinking(true);
      timer = setTimeout(() => {
        const choice = getBotBabuChoice();
        handleBabuChoice(choice);
        setIsBotThinking(false);
      }, 1000);
    } else if (gameState.phase === 'POLICE_TURN' && policePlayer && !policePlayer.isHuman) {
      setIsBotThinking(true);
      timer = setTimeout(() => {
        const guess = getBotPoliceGuess(gameState);
        handlePoliceGuess(guess);
        setIsBotThinking(false);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [gameState.phase, babuPlayer, policePlayer, gameState, handleBabuChoice, handlePoliceGuess]);

  const handleRunTests = () => {
    const res = runAllChorPoliceTests();
    setTestResults(res);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070707] text-white p-4 sm:p-8 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono-code text-xs uppercase font-bold">
            DEVELOPMENT SANDBOX ONLY
          </span>
          <h2 className="text-lg font-display font-black text-white">
            Chor Police Engine Test Harness
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRunTests}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-[#2B2B2B] text-xs font-mono-code text-zinc-300 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
            <span>Run 24 Unit Tests</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1A1A1A] hover:bg-[#262626] text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Test Suite Summary */}
      {testResults && (
        <div className="p-4 rounded-2xl bg-[#0E0E0E] border border-[#262626] space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-code text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {testResults.passed} Tests Passed
            </span>
            {testResults.failed > 0 && (
              <span className="text-xs font-mono-code text-red-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {testResults.failed} Failed
              </span>
            )}
          </div>
        </div>
      )}

      {/* 4 Seat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
        {gameState.players.map((player) => {
          const role = clientView.publicRoles[player.id];
          const isCurrentUser = player.id === currentUserId;
          const isBabu = player.id === gameState.babuPlayerId;
          const isPolice = player.id === gameState.policePlayerId;

          let badgeLabel: string | undefined = undefined;
          if (isBabu) badgeLabel = 'BABU (1200)';
          else if (isPolice) badgeLabel = 'POLICE (900)';

          return (
            <GameCard
              key={player.id}
              role={role}
              playerName={player.name}
              isCurrentUser={isCurrentUser}
              badgeLabel={badgeLabel}
              showPoints={true}
              size="md"
            />
          );
        })}
      </div>

      {/* Babu / Police Controls */}
      <div className="max-w-2xl mx-auto">
        {gameState.phase === 'BABU_TURN' && babuPlayer && (
          <BabuControls
            isBabu={isCurrentUserBabu}
            babuPlayerName={babuPlayer.name}
            onSelectTarget={handleBabuChoice}
            disabled={!isCurrentUserBabu || isBotThinking}
          />
        )}

        {gameState.phase === 'POLICE_TURN' && policePlayer && gameState.babuTarget && (
          <PoliceControls
            isPolice={isCurrentUserPolice}
            policePlayerName={policePlayer.name}
            babuTarget={gameState.babuTarget}
            hiddenPlayers={hiddenPlayers}
            onAccusePlayer={handlePoliceGuess}
            disabled={!isCurrentUserPolice || isBotThinking}
          />
        )}
      </div>

      {/* Round Overlay */}
      {gameState.phase === 'REVEAL_RESULT' && gameState.lastRoundResult && babuPlayer && policePlayer && (
        <RoundResultOverlay
          isCorrect={gameState.lastRoundResult.isCorrect}
          targetRole={gameState.lastRoundResult.targetRole}
          accusedPlayer={
            gameState.players.find((p) => p.id === gameState.policeAccusedPlayerId) || gameState.players[0]
          }
          actualTargetPlayer={
            gameState.players.find((p) => p.id === gameState.lastRoundResult?.actualTargetPlayerId) ||
            gameState.players[0]
          }
          policePlayer={policePlayer}
          babuPlayer={babuPlayer}
          players={gameState.players}
          cardAssignments={gameState.cardAssignments}
          pointsEarned={gameState.lastRoundResult.pointsEarned}
          cumulativeScores={gameState.cumulativeScores}
          currentRound={gameState.currentRound}
          totalRounds={gameState.totalRounds}
          onNextRound={handleNextRound}
        />
      )}
    </div>
  );
};
