import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onBackToLogin }) => {
  const { resetPassword } = useAuth();
  const { success } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setIsLoading(true);
    const res = await resetPassword(email);
    setIsLoading(false);

    if (res.success) {
      setIsSubmitted(true);
      success('Reset Link Dispatched', `Password recovery email sent to ${email}`);
    } else {
      setError(res.error || 'Failed to dispatch password reset email.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-12 h-12 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#FF4D4D] mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-display font-bold text-white">Recovery Email Dispatched</h3>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
          If an account exists for <strong className="text-white">{email}</strong>, we have dispatched a secure password reset link to your inbox.
        </p>
        <div className="pt-2">
          <Button variant="secondary" size="md" fullWidth onClick={onBackToLogin}>
            Return to Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-zinc-400 leading-relaxed">
        Enter the email address registered with your Tekka account. We will send a secure link to reset your password.
      </p>

      {error && (
        <div className="p-3 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-xs text-[#FF6666]">
          {error}
        </div>
      )}

      <Input
        label="Account Email"
        type="email"
        required
        placeholder="player@tekka.play"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail className="w-4 h-4 text-zinc-500" />}
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="lg"
        isLoading={isLoading}
      >
        SEND RECOVERY LINK
      </Button>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 text-xs font-mono-code text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Log In</span>
        </button>
      </div>
    </form>
  );
};
