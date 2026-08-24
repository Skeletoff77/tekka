import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const baseClasses = 'relative overflow-hidden bg-[#161616] animate-pulse';

  if (variant === 'circle') {
    return <div className={`${baseClasses} rounded-full ${className}`} />;
  }

  if (variant === 'text') {
    return <div className={`${baseClasses} h-4 rounded-md ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`rounded-2xl border border-[#222] bg-[#0E0E0E] p-4 flex flex-col gap-3 ${className}`}>
        <div className="h-48 w-full rounded-xl bg-[#1A1A1A] relative overflow-hidden animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
        <div className="h-5 w-3/4 bg-[#1F1F1F] rounded-md animate-pulse" />
        <div className="h-3 w-1/2 bg-[#1A1A1A] rounded-md animate-pulse" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 bg-[#1A1A1A] rounded-md animate-pulse" />
          <div className="h-6 w-20 bg-[#1A1A1A] rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  return <div className={`${baseClasses} rounded-xl ${className}`} />;
};

export const GameCardSkeleton: React.FC = () => <Skeleton variant="card" />;

export const GameGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
};
