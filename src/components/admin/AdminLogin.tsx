import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { Shield, ArrowLeft, AlertTriangle, Lock } from 'lucide-react';
import { getFirebaseAuthErrorMessage } from '../../utils/authErrors';

interface AdminLoginProps {
  onReturnHome: () => void;
  onSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onReturnHome, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await signInWithPopup(auth, googleProvider);
      onSuccess();
    } catch (err: any) {
      console.error('Admin Google sign-in failed:', err);
      setErrorMessage(getFirebaseAuthErrorMessage(err?.code || err?.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 selection:bg-[#E50914] selection:text-white">
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(229,9,20,0.08)_0%,_transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0A0A0A] border border-[#222] rounded-xl p-8 relative z-10 shadow-2xl">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#E50914] mb-3 shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            TEKKA <span className="text-[#E50914] text-xs font-mono-code px-2 py-0.5 rounded border border-[#E50914]/40 bg-[#E50914]/10">ADMIN PORTAL</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 font-mono-code">
            Authoritative Google Sign-In Verification
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Security Notice */}
        <div className="mb-6 p-3.5 rounded-lg bg-[#111] border border-[#222] text-xs text-zinc-400 font-mono-code space-y-2">
          <div className="flex items-center gap-2 text-zinc-300 font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Strict Access Control Enforced
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            This administrative portal is restricted to authorized account (<code className="text-zinc-200">jibeshsarkar77@gmail.com</code>). All other accounts are strictly denied by Firestore security rules.
          </p>
        </div>

        {/* Primary Action: Google Account Sign-In */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-lg bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-[0.99]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {isLoading ? 'Verifying Credentials with Google...' : 'Sign in with Google Account'}
        </button>

        {/* Return to Public Hub */}
        <div className="mt-6 pt-5 border-t border-[#181818] flex justify-center">
          <button
            type="button"
            onClick={onReturnHome}
            className="text-xs font-mono-code text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Tekka Game Hub
          </button>
        </div>
      </div>
    </div>
  );
};
