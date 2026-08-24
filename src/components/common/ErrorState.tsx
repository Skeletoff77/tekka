import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
  compact?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Encountered an Interruption',
  message = 'The platform was unable to synchronize this component. Please check your connection or retry.',
  onRetry,
  onBack,
  compact = false,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-2xl border border-[#E50914]/20 bg-[#110505]/40 text-white ${
        compact ? 'p-6' : 'p-10 sm:p-14 max-w-lg mx-auto my-8'
      }`}
    >
      <div className="w-12 h-12 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#FF4D4D] mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="text-lg font-display font-bold tracking-wide text-white">{title}</h3>
      <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-sm leading-relaxed">{message}</p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        {onRetry && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={onRetry}
          >
            Retry Connection
          </Button>
        )}
        {onBack && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={onBack}
          >
            Return Home
          </Button>
        )}
      </div>
    </div>
  );
};
