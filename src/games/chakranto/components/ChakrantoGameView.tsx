import React, { useState, useEffect } from 'react';
import {
  ChakrantoActionType,
  ChakrantoCardItem,
  ChakrantoCharacter,
  ChakrantoPlayerPublic,
  ChakrantoPrivateView,
  ChakrantoPublicState,
} from '../types';
import {
  startChakrantoGameSession,
  submitChakrantoAction,
  submitChakrantoBlock,
  submitChakrantoChallenge,
  submitChakrantoPass,
  submitChakrantoSacrifice,
  submitChakrantoShadhbodolKeep,
  subscribeToChakrantoSession,
} from '../../../services/chakrantoSessionService';
import { ChakrantoTable } from './ChakrantoTable';
import { ChakrantoCard } from './ChakrantoCard';
import { ChakrantoActionPanel } from './ChakrantoActionPanel';
import { ChakrantoResponseModal } from './ChakrantoResponseModal';
import { ChakrantoSacrificeModal } from './ChakrantoSacrificeModal';
import { ChakrantoShadhbodolModal } from './ChakrantoShadhbodolModal';
import { ChakrantoGameOverModal } from './ChakrantoGameOverModal';
import { ChakrantoRulesModal } from './ChakrantoRulesModal';
import { CHAKRANTO_CARD_ASSETS } from '../assets/chakrantoAssets';
import { ChakrantoCoin } from './ChakrantoCoin';
import {
  BookOpen,
  LogOut,
  Sparkles,
  Swords,
  Shield,
  Clock,
  History,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TekkaRoom } from '../../../types/room';

interface ChakrantoGameViewProps {
  room: TekkaRoom;
  currentUserId: string;
  onExitGame: () => void;
}

export const ChakrantoGameView: React.FC<ChakrantoGameViewProps> = ({
  room,
  currentUserId,
  onExitGame,
}) => {
  const [publicState, setPublicState] = useState<ChakrantoPublicState | null>(null);
  const [privateView, setPrivateView] = useState<ChakrantoPrivateView | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isHost = room.hostId === currentUserId;

  // Real-time Firestore Subscription
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToChakrantoSession(
      room.id,
      currentUserId,
      (pState) => {
        setPublicState(pState);
        setLoading(false);
      },
      (pView) => {
        setPrivateView(pView);
      },
      (err) => {
        console.error('Chakranto subscription error:', err);
        setErrorMsg('Connection error. Retrying sync...');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [room.id, currentUserId]);

  // If match hasn't started yet (e.g. host hasn't called start), host triggers start
  useEffect(() => {
    if (isHost && !publicState && !loading && room.players.length >= 3 && room.players.length <= 6) {
      startChakrantoGameSession(room.id, currentUserId).catch((err) => {
        console.error('Failed to auto-start session:', err);
      });
    }
  }, [isHost, publicState, loading, room.id, currentUserId, room.players.length]);

  const me = publicState?.players.find((p) => p.id === currentUserId);
  const isMyTurn = publicState?.currentTurnPlayerId === currentUserId;
  const activeTurnPlayer = publicState?.players.find((p) => p.id === publicState.currentTurnPlayerId);

  // Handlers for user actions
  const handleDeclareAction = async (action: ChakrantoActionType, targetPlayerId?: string) => {
    setIsSubmitting(true);
    try {
      await submitChakrantoAction(room.id, currentUserId, action, targetPlayerId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChallenge = async () => {
    setIsSubmitting(true);
    try {
      await submitChakrantoChallenge(room.id, currentUserId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlock = async (char: ChakrantoCharacter) => {
    setIsSubmitting(true);
    try {
      await submitChakrantoBlock(room.id, currentUserId, char);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePass = async () => {
    setIsSubmitting(true);
    try {
      await submitChakrantoPass(room.id, currentUserId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSacrificeCard = async (cardId: string) => {
    setIsSubmitting(true);
    try {
      await submitChakrantoSacrifice(room.id, currentUserId, cardId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShadhbodolKeep = async (keptCardIds: string[]) => {
    setIsSubmitting(true);
    try {
      await submitChakrantoShadhbodolKeep(room.id, currentUserId, keptCardIds);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRematch = async () => {
    if (!isHost) return;
    setIsSubmitting(true);
    try {
      await startChakrantoGameSession(room.id, currentUserId);
    } catch (e: any) {
      console.error('Failed to rematch:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !publicState) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-14 aspect-[1536/2752] rounded-xl overflow-hidden border border-red-600/60 shadow-2xl shadow-red-950 animate-pulse">
          <img
            src={CHAKRANTO_CARD_ASSETS.cardBack}
            alt="Chakranto Card Back"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-display font-black tracking-wider">ENTERING CHAKRANTO ARENA</h3>
          <p className="text-xs font-mono-code text-zinc-500">
            Shuffling 15 cards &amp; distributing secret roles...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0707] text-white flex flex-col justify-between selection:bg-[#E50914] selection:text-white">
      {/* 1. TOP ARENA NAVBAR */}
      <header className="px-4 py-3 sm:px-6 bg-[#0E0606]/90 backdrop-blur-md border-b border-[#251010] sticky top-0 z-40 flex items-center justify-between gap-3">
        {/* Game Title & Room Code */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-red-950/80 border border-red-800/80 flex items-center justify-center font-display font-black text-red-400 text-lg shadow-lg">
            চ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-display font-black tracking-wider text-white">
                CHAKRANTO
              </h1>
              <span className="text-[10px] font-mono-code text-zinc-400 hidden sm:inline">
                চক্রান্ত
              </span>
            </div>
            <span className="text-[10px] font-mono-code text-zinc-500 block">
              Room: <strong className="text-zinc-300">{room.roomCode || room.id.slice(0, 6)}</strong>{' '}
              • Turn {publicState.turnNumber}
            </span>
          </div>
        </div>

        {/* Turn & Phase Indicator */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#140808] border border-[#2F1212]">
          <Clock className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-xs font-mono-code text-zinc-300">
            Active Turn:{' '}
            <strong className="text-white">
              {activeTurnPlayer?.name} (Pos {publicState.currentPosition})
            </strong>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="px-3 py-1.5 rounded-xl bg-[#180C0C] hover:bg-[#251212] border border-[#331515] text-xs font-mono-code text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLogDrawer(!showLogDrawer)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono-code flex items-center gap-1.5 transition-all cursor-pointer ${
              showLogDrawer
                ? 'bg-red-950/60 border-red-800/80 text-white'
                : 'bg-[#180C0C] hover:bg-[#251212] border-[#331515] text-zinc-300 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Log</span>
          </button>

          <button
            type="button"
            onClick={onExitGame}
            title="Leave Match"
            className="p-2 rounded-xl bg-[#180C0C] hover:bg-red-950/60 border border-[#331515] text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN BATTLEFIELD STAGE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Table of all 3-6 Players */}
        <ChakrantoTable
          players={publicState.players}
          currentTurnPlayerId={publicState.currentTurnPlayerId}
          currentUserId={currentUserId}
        />

        {/* Real-Time Interactive Action / Response Modals */}
        <div className="w-full max-w-4xl mx-auto space-y-4">
          {/* Action / Block Response Panel */}
          <ChakrantoResponseModal
            publicState={publicState}
            currentUserId={currentUserId}
            onChallenge={handleChallenge}
            onBlock={handleBlock}
            onPass={handlePass}
            isSubmitting={isSubmitting}
          />

          {/* Sacrifice Selection Modal */}
          {publicState.phase === 'SACRIFICE_SELECTION' && publicState.pendingSacrifice && (
            <ChakrantoSacrificeModal
              pendingSacrifice={publicState.pendingSacrifice}
              myActiveCards={privateView?.activeCards || []}
              currentUserId={currentUserId}
              onSacrificeCard={handleSacrificeCard}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Petukchondro Shadhbodol Modal */}
          {publicState.phase === 'SHADHBODOL_SELECTION' &&
            publicState.currentTurnPlayerId === currentUserId &&
            privateView?.shadhbodolOptions &&
            privateView.shadhbodolOptions.length > 0 && (
              <ChakrantoShadhbodolModal
                shadhbodolOptions={privateView.shadhbodolOptions}
                requiredKeepCount={me?.activeCardCount || 2}
                onConfirmKeep={handleShadhbodolKeep}
                isSubmitting={isSubmitting}
              />
            )}

          {/* Turn Action Selection Panel */}
          {publicState.phase === 'TURN_ACTIVE' && me && !me.isEliminated && (
            <ChakrantoActionPanel
              myPlayer={me}
              allPlayers={publicState.players}
              isMyTurn={isMyTurn}
              onDeclareAction={handleDeclareAction}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </main>

      {/* 3. MY PRIVATE CARDS DOCK (BOTTOM TRAY) */}
      <footer className="px-4 py-4 sm:px-6 bg-[#0E0606]/95 backdrop-blur-md border-t border-[#251010] sticky bottom-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* My Player Identity Info */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-mono-code font-black text-sm text-white shadow-lg">
              {me?.position || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-display font-black text-white">{me?.name || 'You'}</h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-code bg-[#E50914]/20 text-[#FF4D4D] border border-[#E50914]/40">
                  YOUR HAND
                </span>
              </div>
              <span className="text-[10px] font-mono-code text-zinc-400 block">
                Position {me?.position} • Secret information (visible only to you)
              </span>
            </div>
          </div>

          {/* My Cards Hand: Active Secret Cards + Publicly Sacrificed Cards */}
          <div className="flex items-center justify-center gap-3">
            {privateView?.activeCards && privateView.activeCards.length > 0 ? (
              privateView.activeCards.map((card) => (
                <div key={card.id} className="relative group">
                  <ChakrantoCard
                    character={card.character}
                    size="sm"
                    showDetails={false}
                    className="w-20 sm:w-24 shadow-2xl hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-mono-code bg-green-950/90 text-green-300 border border-green-700/60 px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                    ACTIVE
                  </div>
                </div>
              ))
            ) : null}

            {/* My Sacrificed Cards (Publicly Revealed) */}
            {me?.sacrificedCards && me.sacrificedCards.length > 0 ? (
              me.sacrificedCards.map((char, idx) => (
                <div key={`my-sacrificed-${idx}`} className="relative group">
                  <ChakrantoCard
                    character={char}
                    isSacrificed={true}
                    size="sm"
                    showDetails={false}
                    className="w-20 sm:w-24 shadow-2xl transition-transform"
                  />
                </div>
              ))
            ) : null}

            {me?.isEliminated && (!me.sacrificedCards || me.sacrificedCards.length === 0) && (
              <div className="px-4 py-2 rounded-2xl bg-red-950/40 border border-red-900/60 text-xs font-mono-code text-red-400">
                You have been eliminated from this match.
              </div>
            )}

            {!privateView?.activeCards && !me?.isEliminated && (
              <div className="text-xs font-mono-code text-zinc-500">Loading your cards...</div>
            )}
          </div>

          {/* My Purse Counter */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#140808] border border-[#2F1212]">
            <ChakrantoCoin size={20} />
            <span className="text-base font-mono-code font-black text-[#F59E0B]">
              {me?.coins || 0}
            </span>
            <span className="text-xs font-mono-code text-zinc-400">COINS</span>
          </div>
        </div>
      </footer>

      {/* 4. ACTIVITY LOG DRAWER */}
      {showLogDrawer && (
        <aside className="fixed bottom-24 right-4 z-40 w-80 sm:w-96 max-h-96 bg-[#0D0505]/95 border-2 border-red-900/60 rounded-3xl p-4 shadow-2xl backdrop-blur-md flex flex-col justify-between animate-in slide-in-from-right-4">
          <div className="flex items-center justify-between pb-2 border-b border-red-950/80">
            <span className="text-xs font-mono-code font-bold uppercase text-red-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              CHAKRANTO ACTION LOG
            </span>
            <button
              type="button"
              onClick={() => setShowLogDrawer(false)}
              className="text-zinc-500 hover:text-white text-xs font-mono-code"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 text-xs font-sans text-zinc-300 divide-y divide-white/5">
            {publicState.logs.map((log) => (
              <div key={log.id} className="pt-2 first:pt-0">
                <div className="flex items-center justify-between text-[9px] font-mono-code text-zinc-500 mb-0.5">
                  <span>Turn {log.turnNumber}</span>
                  <span className="uppercase text-red-400">{log.type}</span>
                </div>
                <p className="leading-snug">{log.message}</p>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* 5. MATCH FINISHED OVERLAY */}
      {publicState.phase === 'GAME_OVER' && (
        <ChakrantoGameOverModal
          publicState={publicState}
          currentUserId={currentUserId}
          isHost={isHost}
          onRematch={handleRematch}
          onExit={onExitGame}
        />
      )}

      {/* 6. RULES GUIDE MODAL */}
      <ChakrantoRulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
};
