import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { subscribeToRoom, leaveRoom, getRoom } from '../../services/roomService';
import { startGameSession } from '../../services/gameSessionService';
import { startChakrantoGameSession } from '../../services/chakrantoSessionService';
import { useAuth } from '../../context/AuthContext';
import { ChorPoliceGameView } from '../../games/chorPoliceDakatBabu/components/ChorPoliceGameView';
import { ChakrantoGameView } from '../../games/chakranto/components/ChakrantoGameView';
import { RoomJoinModal } from '../room/RoomJoinModal';
import { RoomLobbyView } from '../room/RoomLobbyView';
import { AdminPortal } from '../admin/AdminPortal';
import { startPresenceHeartbeat } from '../../services/presenceService';
import {
  saveActiveRoomSession,
  getActiveRoomSession,
  clearActiveRoomSession,
  subscribeToActiveRoomSession,
} from '../../services/activeRoomSession';

export type AppView = 'home' | 'game-detail' | 'room-lobby' | 'play-game' | 'profile' | 'admin' | '404';

export const AppShell: React.FC = () => {
  const { user, isLoading: isAuthLoading, needsTekkaNameSetup, openAuthModal } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [isGamesLoading, setIsGamesLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<AppView>(() => {
    // Detect if initial URL points to /admin or #admin
    if (
      typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/admin') ||
        window.location.hash === '#admin' ||
        window.location.search.includes('view=admin'))
    ) {
      return 'admin';
    }
    return 'home';
  });
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeRoom, setActiveRoom] = useState<TekkaRoom | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isRestoringRoom, setIsRestoringRoom] = useState<boolean>(true);
  const hasAttemptedRestoreRef = useRef(false);

  // Synchronize browser history and popstate for /admin route
  useEffect(() => {
    const handlePopState = () => {
      if (
        window.location.pathname.startsWith('/admin') ||
        window.location.hash === '#admin' ||
        window.location.search.includes('view=admin')
      ) {
        setCurrentView('admin');
      } else if (currentView === 'admin') {
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [currentView]);

  // Global visitor and user presence heartbeat engine
  useEffect(() => {
    let location: 'game-hub' | 'room-lobby' | 'in-game' | 'admin-portal' = 'game-hub';
    if (currentView === 'admin') {
      location = 'admin-portal';
    } else if (currentView === 'play-game') {
      location = 'in-game';
    } else if (currentView === 'room-lobby') {
      location = 'room-lobby';
    }

    const stopHeartbeat = startPresenceHeartbeat({
      uid: user?.uid,
      tekkaName: user?.tekkaName || user?.displayName || undefined,
      location,
      roomId: activeRoom?.id,
      gameId: activeRoom?.gameId || selectedGame?.id,
    });

    return () => stopHeartbeat();
  }, [currentView, user?.uid, user?.tekkaName, user?.displayName, activeRoom?.id, activeRoom?.gameId, selectedGame?.id]);

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

  // Automatic Room Restoration after Browser Refresh
  useEffect(() => {
    if (isAuthLoading) return;
    if (currentView === 'admin') {
      setIsRestoringRoom(false);
      return;
    }

    if (hasAttemptedRestoreRef.current) return;
    hasAttemptedRestoreRef.current = true;

    let isCancelled = false;

    async function restoreActiveSession() {
      try {
        if (!user) {
          clearActiveRoomSession();
          if (!isCancelled) setIsRestoringRoom(false);
          return;
        }

        const savedSession = getActiveRoomSession();
        if (!savedSession) {
          if (!isCancelled) setIsRestoringRoom(false);
          return;
        }

        if (savedSession.playerId !== user.uid) {
          clearActiveRoomSession();
          if (!isCancelled) setIsRestoringRoom(false);
          return;
        }

        const roomDoc = await getRoom(savedSession.roomId);
        if (isCancelled) return;

        if (!roomDoc || roomDoc.status === 'ABANDONED') {
          clearActiveRoomSession();
          setIsRestoringRoom(false);
          return;
        }

        const isMember = roomDoc.players.some((p) => p.id === user.uid);
        if (!isMember) {
          clearActiveRoomSession();
          setIsRestoringRoom(false);
          return;
        }

        setActiveRoom(roomDoc);

        const matchingGame =
          games.find((g) => g.id === roomDoc.gameId) ||
          INITIAL_GAMES.find((g) => g.id === roomDoc.gameId) ||
          INITIAL_GAMES[0];
        setSelectedGame(matchingGame);

        if (roomDoc.status === 'PLAYING' || roomDoc.status === 'FINISHED') {
          setCurrentView('play-game');
        } else if (roomDoc.status === 'WAITING' || roomDoc.status === 'STARTING') {
          setCurrentView('room-lobby');
        }

        saveActiveRoomSession({
          roomId: roomDoc.id,
          roomCode: roomDoc.roomCode,
          gameId: roomDoc.gameId,
          playerId: user.uid,
        });
      } catch (err) {
        console.error('Failed to restore active room session after refresh:', err);
      } finally {
        if (!isCancelled) {
          setIsRestoringRoom(false);
        }
      }
    }

    restoreActiveSession();

    return () => {
      isCancelled = true;
    };
  }, [isAuthLoading, user?.uid, games, currentView]);

  // Multi-tab Storage Event Synchronization
  useEffect(() => {
    const unsub = subscribeToActiveRoomSession((session) => {
      if (!session && activeRoom) {
        setActiveRoom(null);
        setCurrentView('home');
      }
    });
    return () => unsub();
  }, [activeRoom]);

  // Listen to Active Room real-time changes
  useEffect(() => {
    if (!activeRoom?.id) return;

    const unsubscribe = subscribeToRoom(activeRoom.id, (updatedRoom) => {
      if (!updatedRoom || updatedRoom.status === 'ABANDONED') {
        clearActiveRoomSession();
        setActiveRoom(null);
        setCurrentView('game-detail');
        return;
      }

      setActiveRoom(updatedRoom);

      if (updatedRoom.status === 'PLAYING' || updatedRoom.status === 'FINISHED') {
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
    if (view === 'admin') {
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/admin');
      }
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
    if (user) {
      saveActiveRoomSession({
        roomId: room.id,
        roomCode: room.roomCode,
        gameId: room.gameId,
        playerId: user.uid,
      });
    }
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
      if (activeRoom.gameId === 'chakranto') {
        await startChakrantoGameSession(activeRoom.id, user.uid);
      } else {
        await startGameSession(activeRoom.id, user.uid);
      }
      setCurrentView('play-game');
    } finally {
      setIsStartingGame(false);
    }
  };

  // Intentional room leave
  const handleLeaveRoom = async () => {
    clearActiveRoomSession();
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

  // Handle return from admin portal
  const handleReturnFromAdmin = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
    setCurrentView('home');
  };

  // Dedicated full-page Admin Portal view
  if (currentView === 'admin') {
    return <AdminPortal onReturnHome={handleReturnFromAdmin} />;
  }

  const isInitialLoading = isAuthLoading || (isRestoringRoom && !!getActiveRoomSession());

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
        {isInitialLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#E50914] border-t-transparent animate-spin" />
              <p className="text-xs font-mono-code text-zinc-500 uppercase tracking-wider">
                Reconnecting to Tekka Arena...
              </p>
            </div>
          </div>
        )}

        {!isInitialLoading && (
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

            {/* REAL MULTIPLAYER ACTIVE MATCH */}
            {currentView === 'play-game' && activeRoom && user && (
              <div className="py-2">
                {activeRoom.gameId === 'chakranto' ? (
                  <ChakrantoGameView
                    room={activeRoom}
                    currentUserId={user.uid}
                    onExitGame={handleLeaveRoom}
                  />
                ) : (
                  <ChorPoliceGameView
                    roomId={activeRoom.id}
                    currentUserId={user.uid}
                    currentUserName={user.tekkaName || user.displayName || 'Player'}
                    onExit={handleLeaveRoom}
                  />
                )}
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

