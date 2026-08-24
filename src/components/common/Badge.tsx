import React from 'react';
import { GameStatus } from '../../types/game';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'status' | 'category' | 'featured' | 'player' | 'neutral' | 'red';
  status?: GameStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  status,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider font-mono-code uppercase font-semibold',
    md: 'text-xs px-2.5 py-1 tracking-wider font-mono-code uppercase font-semibold',
  };

  let colorClasses = 'bg-[#181818] text-zinc-300 border border-[#2B2B2B]';

  if (variant === 'featured') {
    colorClasses = 'bg-[#E50914] text-white border border-[#FF3841] shadow-sm shadow-[#E50914]/40 font-bold';
  } else if (variant === 'red') {
    colorClasses = 'bg-[#E50914]/15 text-[#FF4D4D] border border-[#E50914]/30 font-semibold';
  } else if (variant === 'category') {
    colorClasses = 'bg-[#141414] text-zinc-200 border border-[#2B2B2B] hover:border-zinc-500';
  } else if (variant === 'player') {
    colorClasses = 'bg-[#0F0F0F] text-zinc-300 border border-[#262626]';
  } else if (variant === 'status' || status) {
    const currentStatus = status || 'coming-soon';
    switch (currentStatus) {
      case 'available':
        colorClasses = 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40';
        break;
      case 'alpha':
        colorClasses = 'bg-[#E50914]/15 text-[#FF6B6B] border border-[#E50914]/40';
        break;
      case 'maintenance':
        colorClasses = 'bg-zinc-800 text-zinc-300 border border-zinc-700';
        break;
      case 'coming-soon':
      default:
        colorClasses = 'bg-[#1A0A0A] text-red-400 border border-red-950/80';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md select-none transition-colors ${sizeClasses[size]} ${colorClasses} ${className}`}
    >
      {variant === 'featured' && (
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
      )}
      {children}
    </span>
  );
};
