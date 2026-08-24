import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  onClick,
}) => {
  const iconSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const textSizeClasses = {
    sm: 'text-lg tracking-widest',
    md: 'text-2xl tracking-[0.2em]',
    lg: 'text-3xl tracking-[0.25em]',
    xl: 'text-5xl tracking-[0.3em]',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none cursor-pointer group ${className}`}
      role="banner"
    >
      {/* Precision Geometric Tekka Icon */}
      <div className={`relative flex items-center justify-center ${iconSizeClasses[size]}`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Outer diamond frame */}
          <rect
            x="20"
            y="2"
            width="25"
            height="25"
            transform="rotate(45 20 2)"
            fill="#0A0A0A"
            stroke="#262626"
            strokeWidth="1.5"
            className="group-hover:stroke-[#E50914] transition-colors duration-300"
          />
          {/* Tekka Upper Red Wing */}
          <polygon
            points="20,8 32,18 20,24 8,18"
            fill="#E50914"
            className="group-hover:fill-[#FF1E27] transition-colors duration-200"
          />
          {/* Lower Core White Anchor */}
          <polygon
            points="20,27 27,33 20,38 13,33"
            fill="#FFFFFF"
            className="group-hover:opacity-90 transition-opacity"
          />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <span className={`font-display font-black text-white ${textSizeClasses[size]} leading-none`}>
          TEKKA
        </span>
        {showTagline && (
          <span className="text-[9px] font-mono-code uppercase tracking-[0.35em] text-zinc-400 mt-1 font-medium">
            DIGITAL GAMING
          </span>
        )}
      </div>
    </div>
  );
};
