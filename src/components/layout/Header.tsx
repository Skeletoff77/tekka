import React, { useState, useEffect, useRef } from 'react';
import { 
  User as UserIcon, 
  Bookmark, 
  LogOut, 
  ChevronDown,
  Search,
  X
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { Game } from '../../types/game';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allGames?: Game[];
  onSelectGame?: (game: Game) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
  allGames = [],
  onSelectGame,
}) => {
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global keyboard shortcut to focus search (⌘K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        if (!['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      } else if (e.key === 'Escape' && isSearchFocused) {
        searchInputRef.current?.blur();
        setIsSearchFocused(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused]);

  // Handle outside clicks to close quick suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (view: string) => {
    onNavigate(view);
    setUserDropdownOpen(false);
    setIsSearchFocused(false);
  };

  const handleSearchInput = (val: string) => {
    onSearchChange(val);
    if (currentView !== 'home' && val.trim().length > 0) {
      onNavigate('home');
    }
  };

  const handleClearSearch = () => {
    onSearchChange('');
    searchInputRef.current?.focus();
  };

  // Instant quick suggestions when typing in search
  const quickSuggestions = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allGames
      .filter((g) => 
        g.name.toLowerCase().includes(q) || 
        g.categoryLabel.toLowerCase().includes(q) ||
        g.tags.some(t => t.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [allGames, searchQuery]);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050505]/95 backdrop-blur-md border-b border-[#1C1C1C] py-2.5 sm:py-3 shadow-xl'
          : 'bg-[#050505]/80 backdrop-blur-sm border-b border-transparent py-3 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo */}
        <Logo
          size="md"
          showTagline={false}
          onClick={() => {
            onSearchChange('');
            handleNav('home');
          }}
        />

        {/* Center: Minimalist Search Input */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md mx-2 sm:mx-4">
          <div
            className={`
              relative flex items-center w-full rounded-xl bg-[#0F0F0F] border transition-all duration-200
              ${
                isSearchFocused || searchQuery.trim().length > 0
                  ? 'border-[#E50914] ring-1 ring-[#E50914]/40 bg-[#141414] shadow-lg shadow-black/60'
                  : 'border-[#222222] hover:border-[#333333]'
              }
            `}
          >
            <Search className={`w-3.5 h-3.5 ml-3 transition-colors shrink-0 ${
              isSearchFocused ? 'text-[#E50914]' : 'text-zinc-500'
            }`} />

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search games by title, genre, tag..."
              className="w-full bg-transparent px-2.5 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none font-sans"
            />

            {/* Clear Button or Keyboard Shortcut */}
            <div className="flex items-center pr-2 shrink-0">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-[#181818] border border-[#2B2B2B] text-zinc-400 select-none pointer-events-none">
                  <span className="text-[9px]">⌘</span>K
                </kbd>
              )}
            </div>
          </div>

          {/* Quick Dropdown Results Overlay when focused and typing */}
          {isSearchFocused && searchQuery.trim().length > 0 && quickSuggestions.length > 0 && onSelectGame && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0C0C0C] border border-[#262626] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="px-3 py-1.5 border-b border-[#1A1A1A] flex items-center justify-between text-[10px] font-mono-code text-zinc-400">
                <span className="uppercase text-[#FF4D4D] font-semibold">QUICK JUMP</span>
                <span>{quickSuggestions.length} RESULTS</span>
              </div>
              <div className="p-1 max-h-64 overflow-y-auto">
                {quickSuggestions.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => {
                      onSelectGame(game);
                      setIsSearchFocused(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#181818] transition-colors text-left group cursor-pointer"
                  >
                    <img
                      src={game.thumbnail || game.banner}
                      alt={game.name}
                      className="w-9 h-9 rounded-md object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-display font-bold text-white group-hover:text-[#FF4D4D] truncate transition-colors">
                        {game.name}
                      </p>
                      <p className="text-[10px] font-mono-code text-zinc-400 truncate">
                        {game.categoryLabel} • {game.minPlayers === game.maxPlayers ? `${game.minPlayers}P` : `${game.minPlayers}–${game.maxPlayers}P`} • {game.estimatedDuration}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Clean Profile Section */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 sm:pr-3 rounded-xl border transition-all cursor-pointer ${
                  currentView === 'profile'
                    ? 'bg-[#181818] border-[#E50914] text-white shadow-lg shadow-red-950/40'
                    : 'bg-[#121212] border-[#262626] hover:border-[#3E3E3E] text-white'
                }`}
              >
                <img
                  src={user.avatarUrl}
                  alt={user.tekkaName || user.username}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/10"
                />
                <span className="hidden sm:inline text-xs font-display font-bold text-white max-w-[120px] truncate">
                  {user.tekkaName || user.username}
                </span>
                <ChevronDown className="hidden sm:inline w-3.5 h-3.5 text-zinc-500" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0D0D0D] border border-[#262626] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 border-b border-[#1C1C1C] mb-1">
                    <p className="text-xs font-display font-bold text-white truncate">{user.tekkaName || user.username}</p>
                    <p className="text-[10px] font-mono-code text-[#FF4D4D] truncate">{user.memberTier}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNav('profile')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-[#1A1A1A] transition-colors text-left cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#E50914]" />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNav('profile')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-[#1A1A1A] transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bookmark className="w-3.5 h-3.5 text-[#E50914]" />
                      <span>Tracked Titles</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1F1F1F] font-mono-code">
                      {user.wishlistedGameIds.length}
                    </span>
                  </button>

                  <div className="my-1 border-t border-[#1C1C1C]" />

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#FF4D4D] hover:bg-[#1A0A0A] transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleNav('profile')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentView === 'profile'
                  ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30 border border-[#FF3841]/40'
                  : 'bg-[#121212] hover:bg-[#1A1A1A] text-zinc-300 hover:text-white border border-[#262626]'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-[#E50914]" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
