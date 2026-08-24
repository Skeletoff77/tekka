import React from 'react';
import { Shield, Zap, Globe, Layers, ArrowRight, CheckCircle2, Cpu } from 'lucide-react';
import { Button } from '../common/Button';

interface AboutViewProps {
  onExploreGames: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onExploreGames }) => {
  return (
    <div className="w-full space-y-16 py-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative rounded-3xl border border-[#262626] bg-[#0A0A0A] p-8 sm:p-14 overflow-hidden text-center max-w-4xl mx-auto">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E50914] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E50914]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-[#2C2C2C] text-xs font-mono-code text-[#FF4D4D]">
            <span>PLATFORM ARCHITECTURE & MANIFESTO</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            THE DIGITAL GAMING ARENA REIMAGINED
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Tekka is engineered to bridge traditional social table games and original competitive digital experiences into one ultra-fast, browser-native platform.
          </p>
        </div>
      </div>

      {/* Core Platform Pillars */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0C0C0C] border border-[#222] space-y-3 hover:border-[#E50914]/50 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-[#170A0A] border border-red-950 flex items-center justify-center text-[#E50914]">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-display font-bold text-white">Browser Native</h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            No 50GB downloads, launchers, or platform lock-ins. Load any game in your desktop or mobile browser with instant link sharing.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#0C0C0C] border border-[#222] space-y-3 hover:border-[#E50914]/50 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-[#170A0A] border border-red-950 flex items-center justify-center text-[#E50914]">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-display font-bold text-white">Sub-20ms Latency</h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Distributed edge infrastructure engineered for crisp turn submission, instant card flips, and real-time social deduction.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#0C0C0C] border border-[#222] space-y-3 hover:border-[#E50914]/50 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-[#170A0A] border border-red-950 flex items-center justify-center text-[#E50914]">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-display font-bold text-white">Multi-Game Engine</h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Modular architecture designed to scale seamlessly from 1 title to dozens of authorized traditional and original creations.
          </p>
        </div>
      </div>

      {/* Product Roadmap Overview */}
      <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-[#0D0D0D] border border-[#222] space-y-8">
        <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white">Platform Phasing Roadmap</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Iterative delivery plan from foundation to full multiplayer</p>
          </div>
          <span className="text-xs font-mono-code text-[#FF4D4D] bg-[#1A0A0A] px-3 py-1 rounded-md border border-red-950">
            CURRENT: PHASE 1
          </span>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#121212] border border-[#242424]">
            <div className="w-8 h-8 rounded-xl bg-[#E50914] text-white flex items-center justify-center font-mono-code text-xs font-bold shrink-0">
              01
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-display font-bold text-white">Phase 1: Platform Foundation & Discovery (Live Now)</h4>
                <CheckCircle2 className="w-4 h-4 text-[#E50914]" />
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Brand architecture, high-performance responsive UI, configurable game catalog, game details blueprints, and gamer profile identity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#0E0E0E] border border-[#1C1C1C]">
            <div className="w-8 h-8 rounded-xl bg-[#222] text-zinc-400 flex items-center justify-center font-mono-code text-xs font-bold shrink-0">
              02
            </div>
            <div>
              <h4 className="text-sm font-display font-bold text-white">Phase 2: Flagship Titles & Room Engines</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Rollout of <em>Chor Police Dakat Babu</em> and <em>Shorojontro</em>, private room codes, voice chat channels, and live score synchronization.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#0E0E0E] border border-[#1C1C1C]">
            <div className="w-8 h-8 rounded-xl bg-[#222] text-zinc-400 flex items-center justify-center font-mono-code text-xs font-bold shrink-0">
              03
            </div>
            <div>
              <h4 className="text-sm font-display font-bold text-white">Phase 3: Ranked Ladder & Global Tournaments</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Competitive rankings, community matchmaking, custom creator rulesets, and seasonal developer SDK for third-party games.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={onExploreGames}
          >
            EXPLORE THE GAME CATALOG
          </Button>
        </div>
      </div>
    </div>
  );
};
