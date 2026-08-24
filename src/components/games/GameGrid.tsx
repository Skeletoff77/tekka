import React, { useState, useMemo } from 'react';
import { LayoutGrid, List, SlidersHorizontal, RotateCcw, Layers } from 'lucide-react';
import { Game, GameCategory, GameStatus } from '../../types/game';
import { CATEGORIES } from '../../data/games';
import { GameCard } from './GameCard';
import { ScatteredCardCanvas } from './ScatteredCardCanvas';
import { ScatteredCardCanvasSkeleton } from './ScatteredCardCanvasSkeleton';
import { GameGridSkeleton } from '../common/Skeleton';
import { SearchInput } from '../common/Input';
import { EmptyState } from '../common/EmptyState';

interface GameGridProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  initialCategory?: GameCategory;
  isLoading?: boolean;
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  onSelectGame,
  initialCategory = 'all',
  isLoading = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>(initialCategory);
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'all'>('all');
  const [playerFilter, setPlayerFilter] = useState<'all' | '1-2' | '3-4' | '5+'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'name' | 'duration' | 'players'>('featured');
  const [viewMode, setViewMode] = useState<'scattered' | 'grid' | 'list'>('scattered');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: games.length };
    games.forEach((g) => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });
    return counts;
  }, [games]);

  // Filter & Sort Logic
  const filteredGames = useMemo(() => {
    return games
      .filter((game) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesName = game.name.toLowerCase().includes(q);
          const matchesDesc = game.description.toLowerCase().includes(q);
          const matchesTags = game.tags.some((t) => t.toLowerCase().includes(q));
          const matchesCat = game.categoryLabel.toLowerCase().includes(q);
          if (!matchesName && !matchesDesc && !matchesTags && !matchesCat) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && game.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'all' && game.status !== statusFilter) {
          return false;
        }

        // Player count filter
        if (playerFilter === '1-2' && game.maxPlayers > 2) return false;
        if (playerFilter === '3-4' && (game.minPlayers > 4 || game.maxPlayers < 3)) return false;
        if (playerFilter === '5+' && game.maxPlayers < 5) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'players') {
          return b.maxPlayers - a.maxPlayers;
        }
        if (sortBy === 'duration') {
          return a.estimatedDuration.localeCompare(b.estimatedDuration);
        }
        return 0;
      });
  }, [games, search, selectedCategory, statusFilter, playerFilter, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setStatusFilter('all');
    setPlayerFilter('all');
    setSortBy('featured');
  };

  const isFiltered =
    search !== '' ||
    selectedCategory !== 'all' ||
    statusFilter !== 'all' ||
    playerFilter !== 'all';

  return (
    <section id="explore-games" className="w-full space-y-8 scroll-mt-24">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1E1E1E] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
              <span className="text-xs font-mono-code uppercase tracking-[0.2em] text-[#FF4D4D] font-bold">
                PHYSICAL DECK SHOWCASE
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
              GAME LIBRARY
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Explore Tekka&apos;s dynamic collection of games scattered across the table.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-[#121212] border border-[#262626] p-1">
              <button
                type="button"
                onClick={() => setViewMode('scattered')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono-code transition-all ${
                  viewMode === 'scattered'
                    ? 'bg-[#E50914] text-white shadow-sm shadow-[#E50914]/40 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Deck table view"
                aria-label="Deck table view"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Deck</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#E50914] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#E50914] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="List view"
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121212] border border-[#262626] text-xs font-display font-semibold text-white"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Filters {isFiltered && '•'}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-display font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-200 cursor-pointer
                  ${
                    isSelected
                      ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/20 border border-[#FF3841]/40'
                      : 'bg-[#121212] text-zinc-400 hover:text-white hover:bg-[#1A1A1A] border border-[#222222]'
                  }
                `}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-code ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#1E1E1E] text-zinc-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter & Search Bar */}
        <div
          className={`grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center p-4 rounded-2xl bg-[#0C0C0C] border border-[#1F1F1F] ${
            showMobileFilters ? 'block' : 'hidden lg:grid'
          }`}
        >
          {/* Search Box */}
          <div className="md:col-span-5">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search games by title, rules, tags..."
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as GameStatus | 'all')}
              className="w-full rounded-xl bg-[#141414] border border-[#262626] px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E50914] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="coming-soon">Coming Soon</option>
              <option value="alpha">Alpha Testing</option>
              <option value="available">Available Now</option>
            </select>
          </div>

          {/* Player Filter */}
          <div className="md:col-span-2">
            <select
              value={playerFilter}
              onChange={(e) => setPlayerFilter(e.target.value as 'all' | '1-2' | '3-4' | '5+')}
              className="w-full rounded-xl bg-[#141414] border border-[#262626] px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E50914] cursor-pointer"
            >
              <option value="all">Any Player Count</option>
              <option value="1-2">1–2 Players</option>
              <option value="3-4">3–4 Players</option>
              <option value="5+">5+ Players</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'featured' | 'name' | 'duration' | 'players')}
              className="w-full rounded-xl bg-[#141414] border border-[#262626] px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#E50914] cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="name">Name (A–Z)</option>
              <option value="players">Max Players</option>
              <option value="duration">Session Time</option>
            </select>
          </div>

          {/* Reset Action */}
          <div className="md:col-span-1 flex justify-end">
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#242424] text-zinc-400 hover:text-white text-xs font-mono-code transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="md:hidden">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between text-xs font-mono-code text-zinc-400 px-1">
          <span>
            SHOWING <strong className="text-white">{filteredGames.length}</strong> OF{' '}
            <strong className="text-white">{games.length}</strong> TITLES ON TABLE
          </span>
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="text-[#FF4D4D] hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Game Showcase Render */}
      {isLoading ? (
        viewMode === 'scattered' ? (
          <ScatteredCardCanvasSkeleton cardCount={7} />
        ) : (
          <GameGridSkeleton count={6} />
        )
      ) : filteredGames.length > 0 ? (
        viewMode === 'scattered' ? (
          <ScatteredCardCanvas
            games={filteredGames}
            onSelectGame={onSelectGame}
          />
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
            }
          >
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelect={onSelectGame}
                viewMode={viewMode}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          variant="search"
          title="No Games Matched Your Filters"
          description="We couldn't find any games in the catalog matching your current search or category settings. Try broadening your criteria."
          actionLabel="Reset All Filters"
          onAction={resetFilters}
        />
      )}
    </section>
  );
};
