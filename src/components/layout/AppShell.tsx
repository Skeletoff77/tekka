import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ScatteredCardCanvas } from '../games/ScatteredCardCanvas';
import { GameDetails } from '../games/GameDetails';
import { UserProfileView } from '../profile/UserProfileView';
import { NotFoundView } from '../pages/NotFoundView';
import { SystemStatusModal } from '../pages/SystemStatusModal';
import { AuthModal } from '../auth/AuthModal';
import { ChooseTekkaNameModal } from '../auth/ChooseTekkaNameModal';
import { EmptyState } from '../common/EmptyState';
import { INITIAL_GAMES } from '../../data/games';
import { Game } from '../../types/game';
import { TekkaRoom } from '../../types/room';
import { getGames } from '../../services/gameService';
import { subscribeToRoom, leaveRoom } from '../../services/roomService';
import { startGameSession } from '../../services/gameSessionService';
import { useAuth } from '../../context/AuthContext';
import { ChorPoliceGameView } from '../../games/chorPoliceDakatBabu/components/ChorPoliceGameView';
import { RoomJoinModal } from '../room/RoomJoinModal';
import { RoomLobbyView } from '../room/RoomLobbyView';

export const AppShell: React.FC = () => {
  const { user, isLoading: isAuthLoading, needsTekkaNameSetup, openAuthModal } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [isGamesLoading, setIsGamesLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<'home' | 'game-detail' | 'room-lobby' | 'play-game' | 'profile' | '404'>('home');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeRoom, setActiveRoom] = useState<TekkaRoom | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);

  // Authoritative game catalog retrieval from Game Registry Service
  useEffect(() => {
    let isMounted = true;
    async function loadRegistry() {
      try {
        const catalog = await getGames();
        if (isMounted) {
          setGames(catalog);
          setIsGamesLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setGames(INITIAL_GAMES);
          setIsGamesLoading(false);
        }
      }
    }
    loadRegistry();
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen to Active Room real-time changes
  useEffect(() => {
    if (!activeRoom?.id) return;

    const unsubscribe = subscribeToRoom(activeRoom.id, (updatedRoom) => {
      if (!updatedRoom || updatedRoom.status === 'ABANDONED') {
        setActiveRoom(null);
        setCurrentView('game-detail');
        return;
      }

      setActiveRoom(updatedRoom);

      // Auto-transition to play view when status becomes PLAYING
      if (updatedRoom.status === 'PLAYING') {
        setCurrentView('play-game');
      } else if (updatedRoom.status === 'WAITING') {
        setCurrentView('room-lobby');
      }
    });

    return () => unsubscribe();
  }, [activeRoom?.id]);

  // Filter games based on search query
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return games;
    const q = searchQuery.toLowerCase().trim();
    return games.filter((game) => {
      const matchName = game.name.toLowerCase().includes(q);
      const matchTagline = (game.tagline || '').toLowerCase().includes(q);
      const matchDesc = (game.shortDescription || game.description || '').toLowerCase().includes(q);
      const matchCat = (game.categoryLabel || '').toLowerCase().includes(q);
      const matchTags = (game.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchName || matchTagline || matchDesc || matchCat || matchTags;
    });
  }, [games, searchQuery]);

  // Window scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedGame]);

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setCurrentView('game-detail');
  };

  const handleNavigate = (view: string) => {
    if (view === 'games' || view === 'about') {
      setCurrentView('home');
      return;
    }
    setCurrentView(view as any);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Launch Room Dialog
  const handlePlayGame = (game: Game) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setSelectedGame(game);
    setIsJoinModalOpen(true);
  };

  // When room is created or joined
  const handleRoomReady = (room: TekkaRoom) => {
    setActiveRoom(room);
    setIsJoinModalOpen(false);
    if (room.status === 'PLAYING') {
      setCurrentView('play-game');
    } else {
      setCurrentView('room-lobby');
    }
  };

  // Host starts the authoritative match session
  const handleHostStartGame = async () => {
    if (!activeRoom || !user) return;
    try {
      setIsStartingGame(true);
      await startGameSession(activeRoom.id, user.uid);
      setCurrentView('play-game');
    } finally {
      setIsStartingGame(false);
    }
  };

  // Leave room lobby
  const handleLeaveRoom = async () => {
    if (activeRoom && user) {
      try {
        await leaveRoom(activeRoom.id, user.uid);
      } catch (err) {
        console.error('Error leaving room:', err);
      }
    }
    setActiveRoom(null);
    setCurrentView(selectedGame ? 'game-detail' : 'home');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      {/* Top Panel: Brand Logo + Minimalist Search Input + Profile */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        allGames={games}
        onSelectGame={handleSelectGame}
      />

      {/* Main Clean Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Full-bleed subtle auth state spinner if initial connection is resolving */}
        {isAuthLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#E50914] border-t-transparent animate-spin" />
              <p className="text-xs font-mono-code text-zinc-500 uppercase tracking-wider">
                Connecting to Tekka Network...
              </p>
            </div>
          </div>
        )}

        {!isAuthLoading && (
          <>
            {/* HOME VIEW: Pure Scattered Card Game Layout */}
            {currentView === 'home' && (
              <div className="w-full">
                {searchQuery.trim() && !isGamesLoading && (
                  <div className="flex items-center justify-between px-2 pt-1 pb-3 text-xs font-mono-code text-zinc-400 border-b border-[#1A1A1A] mb-4">
                    <span>
                      FOUND <strong className="text-[#FF4D4D]">{filteredGames.length}</strong> {filteredGames.length === 1 ? 'GAME' : 'GAMES'} MATCHING &quot;<span className="text-white">{searchQuery}</span>&quot;
                    </span>
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Clear Search
                    </button>
                  </div>
                )}

                {isGamesLoading || filteredGames.length > 0 ? (
                  <ScatteredCardCanvas
                    games={filteredGames}
                    onSelectGame={handleSelectGame}
                    isLoading={isGamesLoading}
                  />
                ) : (
                  <div className="py-12">
                    <EmptyState
                      variant="search"
                      title="No Games Found"
                      description={`No game titles, tags, or categories matched "${searchQuery}". Try a different search keyword.`}
                      actionLabel="Clear Search"
                      onAction={handleClearSearch}
                    />
                  </div>
                )}
              </div>
            )}

            {/* GAME DETAILS VIEW */}
            {currentView === 'game-detail' && selectedGame && (
              <div className="py-4">
                <GameDetails
                  game={selectedGame}
                  onBack={() => setCurrentView('home')}
                  onSelectRelatedGame={handleSelectGame}
                  allGames={games}
                  onPlayGame={handlePlayGame}
                />
              </div>
            )}

            {/* REAL MULTIPLAYER ROOM LOBBY VIEW */}
            {currentView === 'room-lobby' && activeRoom && user && (
              <div className="py-2">
                <RoomLobbyView
                  room={activeRoom}
                  currentUserId={user.uid}
                  onStartGame={handleHostStartGame}
                  onLeaveRoom={handleLeaveRoom}
                  isStarting={isStartingGame}
                />
              </div>
            )}

            {/* CHOR POLICE DAKAT BABU REAL MULTIPLAYER ACTIVE MATCH */}
            {currentView === 'play-game' && activeRoom && user && (
              <div className="py-2">
                <ChorPoliceGameView
                  roomId={activeRoom.id}
                  currentUserId={user.uid}
                  currentUserName={user.tekkaName || user.displayName || 'Player'}
                  onExit={handleLeaveRoom}
                />
              </div>
            )}

            {/* USER PROFILE VIEW */}
            {currentView === 'profile' && (
              <div className="py-4">
                <UserProfileView
                  onSelectGame={handleSelectGame}
                  allGames={games}
                  onBackToHome={() => setCurrentView('home')}
                />
              </div>
            )}

            {/* 404 FALLBACK */}
            {currentView === '404' && (
              <NotFoundView
                onGoHome={() => setCurrentView('home')}
                onExploreGames={() => setCurrentView('home')}
              />
            )}
          </>
        )}
      </main>

      {/* Clean Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenStatusModal={() => setStatusModalOpen(false)}
      />

      {/* Standard Auth Modal */}
      <AuthModal />

      {/* Mandatory Tekka Player Name Setup Modal */}
      <ChooseTekkaNameModal />

      {/* Real Multiplayer Room Join / Create Modal */}
      {selectedGame && user && (
        <RoomJoinModal
          game={selectedGame}
          currentUser={{
            uid: user.uid,
            tekkaName: user.tekkaName || user.displayName || 'Player',
            photoURL: user.photoURL,
            avatarUrl: user.avatarUrl,
          }}
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onRoomReady={handleRoomReady}
        />
      )}

      {/* System Status Modal */}
      <SystemStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
      />
    </div>
  );
};
