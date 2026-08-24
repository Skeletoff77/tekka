import React, { useState } from 'react';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { Input, PasswordInput } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

interface SignUpViewProps {
  onSwitchToLogin: () => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({ onSwitchToLogin }) => {
  const { signup, loginWithGoogle } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Please choose a platform username.');
      return;
    }
    if (username.length < 3) {
      setError('Username must contain at least 3 characters.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!acceptTerms) {
      setError('You must accept the platform terms to continue.');
      return;
    }

    setIsLoading(true);
    const result = await signup(username, email, password);
    setIsLoading(false);

    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setIsGoogleLoading(true);
    const result = await loginWithGoogle();
    setIsGoogleLoading(false);
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-xs text-[#FF6666]">
            {error}
          </div>
        )}

        <Input
          label="Gamer Handle / Username"
          type="text"
          required
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftIcon={<User className="w-4 h-4 text-zinc-500" />}
          helperText="Unique name displayed on tables & leaderboards"
        />

        <Input
          label="Email Address"
          type="email"
          required
          autoComplete="email"
          placeholder="player@tekka.play"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4 text-zinc-500" />}
        />

        <PasswordInput
          label="Create Password"
          required
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4 text-zinc-500" />}
        />

        <PasswordInput
          label="Confirm Password"
          required
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4 text-zinc-500" />}
        />

        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="terms-check"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 rounded bg-[#1A1A1A] border-[#333] text-[#E50914] focus:ring-[#E50914] accent-[#E50914] cursor-pointer"
          />
          <label htmlFor="terms-check" className="text-xs text-zinc-400 leading-tight cursor-pointer">
            I agree to the TEKKA Early Access Terms of Service and Privacy Policy.
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isLoading}
        >
          CREATE TEKKA ID
        </Button>
      </form>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#222222] w-full" />
        <span className="bg-[#0C0C0C] px-3 text-[11px] font-mono-code text-zinc-400 uppercase">
          Or Quick Access
        </span>
      </div>

      {/* Google Auth Button */}
      <Button
        variant="secondary"
        fullWidth
        size="md"
        isLoading={isGoogleLoading}
        onClick={handleGoogleSignup}
        leftIcon={
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        }
      >
        Sign up with Google
      </Button>

      {/* Switch to Login */}
      <div className="text-center pt-2 border-t border-[#1C1C1C]">
        <p className="text-xs text-zinc-400">
          Already registered on Tekka?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#FF4D4D] hover:underline cursor-pointer"
          >
            Log in here
          </button>
        </p>
      </div>
    </div>
  );
};
