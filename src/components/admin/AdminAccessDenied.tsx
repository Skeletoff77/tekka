import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface AdminAccessDeniedProps {
  userEmail?: string | null;
  userUid?: string;
  onReturnHome: () => void;
  onRetry: () => void;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({
  userEmail,
  userUid,
  onReturnHome,
  onRetry,
}) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onRetry();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 selection:bg-[#E50914] selection:text-white">
      <div className="w-full max-w-lg bg-[#0A0A0A] border border-red-900/50 rounded-xl p-8 shadow-2xl relative">
        {/* Glowing Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-800/80 flex items-center justify-center text-red-500 mb-4 shadow-lg shadow-red-950/50">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="text-xs font-mono-code px-2.5 py-1 rounded bg-red-950/80 text-red-400 border border-red-800/80 uppercase tracking-wider mb-2">
            HTTP 403 • PERMISSION_DENIED
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Access Denied
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-sm">
            This account does not have authorized administrative permissions for the Tekka Portal.
          </p>
        </div>

        {/* Diagnostic info for user */}
        <div className="bg-[#121212] border border-[#222] rounded-lg p-4 mb-6 text-xs font-mono-code space-y-2">
          <div className="flex justify-between text-zinc-400">
            <span>Authenticated Account:</span>
            <span className="text-white font-semibold">{userEmail || 'Anonymous / Unregistered'}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Firebase UID:</span>
            <span className="text-zinc-300 truncate max-w-[200px]">{userUid || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Security Enforcement:</span>
            <span className="text-red-400">Server-Authoritative Allowlist</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onReturnHome}
            className="flex-1 py-2.5 px-4 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#333] text-zinc-200 text-xs font-mono-code flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Game Hub
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex-1 py-2.5 px-4 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-mono-code flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Switch Account
          </button>
        </div>
      </div>
    </div>
  );
};
