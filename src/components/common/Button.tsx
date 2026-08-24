import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'relative inline-flex items-center justify-center font-display font-semibold transition-all duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const sizeStyles = {
      sm: 'text-xs tracking-wider px-3.5 py-2 rounded-lg gap-2',
      md: 'text-sm tracking-wider px-5 py-2.5 rounded-xl gap-2.5',
      lg: 'text-base tracking-wider px-6 py-3.5 rounded-xl gap-3',
      xl: 'text-lg tracking-widest px-8 py-4 rounded-xl gap-3.5 font-bold',
    };

    const variantStyles = {
      primary:
        'bg-[#E50914] text-white hover:bg-[#FF1A24] active:bg-[#CC0812] shadow-lg shadow-[#E50914]/20 border border-[#FF3841]/30',
      secondary:
        'bg-[#121212] text-white border border-[#262626] hover:border-[#404040] hover:bg-[#1A1A1A] active:bg-[#0F0F0F]',
      outline:
        'bg-transparent text-white border border-[#2E2E2E] hover:border-[#E50914] hover:bg-[#E50914]/5 active:bg-[#E50914]/10',
      ghost:
        'bg-transparent text-zinc-300 hover:text-white hover:bg-white/5 active:bg-white/10',
      danger:
        'bg-[#E50914]/10 text-[#FF4D4D] border border-[#E50914]/30 hover:bg-[#E50914]/20 active:bg-[#E50914]/30',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
