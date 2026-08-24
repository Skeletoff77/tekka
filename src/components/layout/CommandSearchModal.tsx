import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Gamepad2, Bookmark, Sparkles } from 'lucide-react';
import { Game } from '../../types/game';
import { Badge } from '../common/Badge';

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  onSelectGame: (game: Game) => void;
}

export const CommandSearchModal: React.FC<CommandSearchModalProps> = ({
  isOpen,
  onClose,
  games,
  onSelectGame,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global ⌘K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = games.filter((g) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.tagline.toLowerCase().includes(q) ||
      g.tags.some((t) => t.toLowerCase().includes(q)) ||
      g.categoryLabel.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#0D0D0D] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header Bar */}
        <div className="relative flex items-center p-4 border-b border-[#1E1E1E]">
          <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games, mechanics, genres..."
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none font-sans"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-500 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#2B2B2B] text-zinc-500 font-mono-code">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1.5">
          {filtered.length > 0 ? (
            filtered.map((game) => (
              <div
                key={game.id}
                onClick={() => {
                  onSelectGame(game);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-[#161616] cursor-pointer transition-colors border border-transparent hover:border-[#2B2B2B]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={game.thumbnail}
                    alt={game.name}
                    className="w-11 h-11 rounded-lg object-cover shrink-0 bg-[#1A1A1A]"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-display font-bold text-white group-hover:text-[#FF3841] transition-colors truncate">
                        {game.name}
                      </h4>
                      {game.featured && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E50914] text-white font-mono-code font-bold">
                          SPOTLIGHT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {game.categoryLabel} • {game.estimatedDuration} • {game.statusLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No matching titles found for &quot;{query}&quot;.
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-[#0A0A0A] border-t border-[#191919] flex items-center justify-between text-[11px] font-mono-code text-zinc-400 px-4">
          <span>{filtered.length} TITLES ACCESSIBLE</span>
          <span>SELECT TO LAUNCH PROFILE</span>
        </div>
      </div>
    </div>
  );
};
