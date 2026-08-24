import React from 'react';
import { Gamepad2, Search, Bookmark, LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'search' | 'games' | 'wishlist' | 'generic';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: CustomIcon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'generic',
}) => {
  let Icon = CustomIcon;
  if (!Icon) {
    if (variant === 'search') Icon = Search;
    else if (variant === 'wishlist') Icon = Bookmark;
    else Icon = Gamepad2;
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 my-6 rounded-2xl border border-dashed border-[#262626] bg-[#0A0A0A]/50 max-w-xl mx-auto">
      {/* Icon Frame */}
      <div className="w-14 h-14 rounded-2xl bg-[#141414] border border-[#2B2B2B] flex items-center justify-center text-[#E50914] mb-4 shadow-inner">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-lg sm:text-xl font-display font-bold text-white tracking-wide">{title}</h3>
      <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-md leading-relaxed">{description}</p>

      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
