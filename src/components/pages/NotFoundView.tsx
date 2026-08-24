import React from 'react';
import { Home, Compass, AlertTriangle } from 'lucide-react';
import { Button } from '../common/Button';

interface NotFoundViewProps {
  onGoHome: () => void;
  onExploreGames: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onGoHome, onExploreGames }) => {
  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="relative max-w-xl w-full p-8 sm:p-12 rounded-3xl border border-[#262626] bg-[#0A0A0A] text-center overflow-hidden shadow-2xl">
        {/* Ambient Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E50914] to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#E50914]/15 rounded-full blur-3xl pointer-events-none" />

        {/* 404 Giant Display */}
        <div className="relative mb-6">
          <span className="text-7xl sm:text-9xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-400 to-zinc-800">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="px-3 py-1 rounded bg-[#E50914] text-white text-[11px] font-mono-code font-bold uppercase tracking-widest shadow-lg">
              SECTOR NOT FOUND
            </span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
          SIGNAL DISCONNECTED
        </h2>

        <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
          The requested coordinate or game chamber does not exist in the Tekka platform directory. It may have been relocated or is currently in development.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Home className="w-4 h-4" />}
            onClick={onGoHome}
            className="w-full sm:w-auto"
          >
            RETURN TO PLATFORM
          </Button>

          <Button
            variant="secondary"
            size="md"
            leftIcon={<Compass className="w-4 h-4" />}
            onClick={onExploreGames}
            className="w-full sm:w-auto"
          >
            EXPLORE GAMES
          </Button>
        </div>
      </div>
    </div>
  );
};
