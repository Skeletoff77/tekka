import React from 'react';
import { ArrowRight, Play, Shield, Globe2, Sparkles, Activity } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

interface HeroProps {
  onExploreClick: () => void;
  onViewFeaturedClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onViewFeaturedClick }) => {
  const { user, openAuthModal } = useAuth();

  return (
    <section className="relative w-full min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden py-16 sm:py-24">
      {/* Background Mesh & Atmospheric Lighting strictly Black & Red */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      
      {/* Subtle Red Ambient Glow Centers */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-[#E50914]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Red Laser Edge Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E50914]/40 to-transparent" />

      {/* Hero Content Wrapper */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Release Status Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#141414] border border-[#2B2B2B] mb-8 shadow-inner hover:border-[#E50914]/50 transition-colors">
          <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
          <span className="text-[11px] font-mono-code uppercase tracking-[0.25em] text-zinc-300">
            PHASE 1 ARCHITECTURE REVEAL
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-[11px] font-mono-code text-[#FF4D4D] font-semibold">
            EARLY ACCESS
          </span>
        </div>

        {/* Hero Slogan / Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-tight leading-[0.95] text-white">
          PLAY. CONNECT. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
            REPEAT.
          </span>
        </h1>

        {/* Supporting Description */}
        <p className="text-base sm:text-xl text-zinc-300 max-w-2xl mt-6 leading-relaxed font-normal">
          The next-generation digital gaming platform. Discover, connect, and experience reimagined social classics and original multiplayer games built for the browser.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto">
          <Button
            variant="primary"
            size="xl"
            rightIcon={<ArrowRight className="w-5 h-5" />}
            onClick={onExploreClick}
            className="w-full sm:w-auto"
          >
            EXPLORE GAMES
          </Button>

          {!user ? (
            <Button
              variant="secondary"
              size="xl"
              onClick={() => openAuthModal('signup')}
              className="w-full sm:w-auto"
            >
              CREATE ACCOUNT
            </Button>
          ) : (
            <Button
              variant="outline"
              size="xl"
              leftIcon={<Sparkles className="w-4 h-4 text-[#E50914]" />}
              onClick={onViewFeaturedClick}
              className="w-full sm:w-auto"
            >
              FEATURED TITLE
            </Button>
          )}
        </div>

        {/* Platform Metric Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mt-16 sm:mt-20 w-full max-w-4xl pt-10 border-t border-[#1C1C1C]">
          <div className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-[#0D0D0D]/60 border border-[#1F1F1F]">
            <div className="flex items-center gap-2 text-xs font-mono-code text-zinc-400 mb-1">
              <Globe2 className="w-3.5 h-3.5 text-[#E50914]" />
              <span>PLATFORM</span>
            </div>
            <span className="text-sm sm:text-base font-display font-bold text-white">
              Browser Native
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5">Zero installation</span>
          </div>

          <div className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-[#0D0D0D]/60 border border-[#1F1F1F]">
            <div className="flex items-center gap-2 text-xs font-mono-code text-zinc-400 mb-1">
              <Activity className="w-3.5 h-3.5 text-[#E50914]" />
              <span>LATENCY</span>
            </div>
            <span className="text-sm sm:text-base font-display font-bold text-white">
              Sub-20ms Engine
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5">Real-time sync</span>
          </div>

          <div className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-[#0D0D0D]/60 border border-[#1F1F1F]">
            <div className="flex items-center gap-2 text-xs font-mono-code text-zinc-400 mb-1">
              <Shield className="w-3.5 h-3.5 text-[#E50914]" />
              <span>INTEGRITY</span>
            </div>
            <span className="text-sm sm:text-base font-display font-bold text-white">
              Authoritative
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5">Server verified</span>
          </div>

          <div className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-[#0D0D0D]/60 border border-[#1F1F1F]">
            <div className="flex items-center gap-2 text-xs font-mono-code text-zinc-400 mb-1">
              <Play className="w-3.5 h-3.5 text-[#E50914]" />
              <span>MULTIPLAYER</span>
            </div>
            <span className="text-sm sm:text-base font-display font-bold text-white">
              1 to 8+ Players
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5">Cross-device ready</span>
          </div>
        </div>
      </div>
    </section>
  );
};
