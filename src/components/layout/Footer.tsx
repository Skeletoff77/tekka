import React, { useState } from 'react';
import { ShieldCheck, Activity, ArrowUpRight, Check, Send } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useToast } from '../../context/ToastContext';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenStatusModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenStatusModal }) => {
  const { success } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSent(true);
    success('Early Access Dispatch Confirmed', 'You are on the priority roster for closed beta invitations.');
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSent(false), 4000);
  };

  return (
    <footer className="w-full bg-[#050505] border-t border-[#1C1C1C] mt-24 text-zinc-400">
      {/* Upper Footer: Brand & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <Logo size="md" showTagline={true} />
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed">
              Tekka is the next-generation digital gaming platform hosting reimagined traditional social games and original competitive tactical titles.
            </p>
            
            {/* Live Operational Status Indicator */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenStatusModal}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F0F0F] border border-[#262626] hover:border-emerald-800 text-xs font-mono-code transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-zinc-300">All Edge Relays Operational</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">18ms</span>
              </button>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono-code uppercase tracking-wider text-white font-bold">
              Platform Directory
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Games Showcase
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenStatusModal}
                  className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Network Status</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                </button>
              </li>
            </ul>
          </div>

          {/* Early Access Newsletter */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono-code uppercase tracking-wider text-white font-bold">
              Closed Beta & Title Drops
            </h4>
            <p className="text-xs text-zinc-400">
              Receive testing schedules, tournament announcements, and new title reveals.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center gap-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="developer@tekka.play"
                className="flex-1 bg-[#111] border border-[#262626] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-[#E50914] hover:bg-[#FF1A24] text-white rounded-xl text-xs font-display font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {newsletterSent ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                <span>{newsletterSent ? 'Saved' : 'Join'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Lower Legal Bar */}
        <div className="mt-14 pt-8 border-t border-[#191919] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-code text-zinc-400">
          <div>
            © {new Date().getFullYear()} TEKKA GAMING PLATFORM. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>PHASE 1 BUILD</span>
            <span>•</span>
            <span className="text-zinc-300">LOW LATENCY ENGINE</span>
            <span>•</span>
            <span>PROPRIETARY SPEC</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
