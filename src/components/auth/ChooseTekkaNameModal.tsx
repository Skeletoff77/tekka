import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Shield, Check, X, Loader2, Sparkles, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { checkTekkaNameAvailability } from '../../services/tekkaNameService';
import { validateTekkaName } from '../../utils/usernameValidation';
import { Button } from '../common/Button';

export const ChooseTekkaNameModal: React.FC = () => {
  const { 
    needsTekkaNameSetup, 
    suggestedTekkaName, 
    submitTekkaName, 
    logout, 
    firebaseUser 
  } = useAuth();

  const [tekkaName, setTekkaName] = useState<string>('');
  const [availabilityStatus, setAvailabilityStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'current'
  >('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep input clean and empty for user to enter their chosen name
  useEffect(() => {
    if (needsTekkaNameSetup) {
      setTekkaName('');
      setAvailabilityStatus('idle');
      setStatusMessage('');
      setSubmitError(null);
    }
  }, [needsTekkaNameSetup]);

  const performCheck = useCallback(async (nameToCheck: string) => {
    const trimmed = nameToCheck.trim();
    if (!trimmed) {
      setAvailabilityStatus('idle');
      setStatusMessage('');
      return;
    }

    const val = validateTekkaName(trimmed);
    if (!val.valid) {
      setAvailabilityStatus('invalid');
      setStatusMessage(val.error || 'Choose a valid Tekka name');
      return;
    }

    setAvailabilityStatus('checking');
    setStatusMessage('Checking availability...');

    try {
      const res = await checkTekkaNameAvailability(trimmed, firebaseUser?.uid);
      setAvailabilityStatus(res.status);
      setStatusMessage(res.message);
    } catch (err) {
      setAvailabilityStatus('invalid');
      setStatusMessage('Unable to check availability right now.');
    }
  }, [firebaseUser?.uid]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTekkaName(val);
    setSubmitError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim()) {
      setAvailabilityStatus('idle');
      setStatusMessage('');
      return;
    }

    // Debounce check by 350ms
    debounceTimerRef.current = setTimeout(() => {
      performCheck(val);
    }, 350);
  };

  const handleManualCheck = (e: React.MouseEvent) => {
    e.preventDefault();
    performCheck(tekkaName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const val = validateTekkaName(tekkaName);
    if (!val.valid) {
      setAvailabilityStatus('invalid');
      setStatusMessage(val.error || 'Choose a valid Tekka name');
      return;
    }

    setIsSubmitting(true);
    const res = await submitTekkaName(tekkaName);
    setIsSubmitting(false);

    if (!res.success) {
      setSubmitError(res.error || 'Could not claim this Tekka name.');
      if (res.error?.includes('already taken')) {
        setAvailabilityStatus('taken');
        setStatusMessage('✕ This name is already taken');
      }
    }
  };

  if (!needsTekkaNameSetup) {
    return null;
  }

  const isAvailable = availabilityStatus === 'available' || availabilityStatus === 'current';
  const isChecking = availabilityStatus === 'checking';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Background ambient red glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E50914]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0C0C0C] border border-[#222222] rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Subtle top matte line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E50914] to-transparent" />

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-[#333] text-[#E50914] mb-1 shadow-[0_0_20px_rgba(229,9,20,0.2)]">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-display font-black tracking-tight text-white uppercase">
            CHOOSE YOUR TEKKA NAME
          </h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Choose a unique name that other players will see on Tekka.
          </p>
        </div>

        {/* Google / Account display note if Google name is present */}
        {firebaseUser?.displayName && (
          <div className="mb-5 p-3 rounded-xl bg-[#141414] border border-[#222] flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono-code uppercase text-zinc-500">Google Account</div>
              <div className="text-zinc-300 font-medium truncate max-w-[200px]">{firebaseUser.displayName}</div>
            </div>
            <span className="text-[10px] font-mono-code bg-[#1F1F1F] text-zinc-400 px-2 py-1 rounded border border-[#333]">
              Private
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {submitError && (
            <div className="p-3 rounded-xl bg-[#E50914]/15 border border-[#E50914]/40 text-xs text-[#FF6666] flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-mono-code uppercase tracking-wider text-zinc-300 font-semibold">
              Enter your Tekka name
            </label>

            <div className="relative flex items-center">
              <input
                type="text"
                autoFocus
                value={tekkaName}
                onChange={handleInputChange}
                placeholder="Enter your Tekka name"
                maxLength={20}
                className={`w-full bg-[#141414] text-white text-sm rounded-xl pl-4 pr-11 py-3 border font-mono-code transition-all focus:outline-none ${
                  availabilityStatus === 'available' || availabilityStatus === 'current'
                    ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                    : availabilityStatus === 'taken' || availabilityStatus === 'invalid'
                    ? 'border-[#E50914]/60 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]'
                    : 'border-[#262626] focus:border-[#E50914]'
                }`}
              />

              {/* Status Indicator Icon in Input */}
              <div className="absolute right-3.5 flex items-center pointer-events-none">
                {isChecking && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />}
                {!isChecking && (availabilityStatus === 'available' || availabilityStatus === 'current') && (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
                {!isChecking && (availabilityStatus === 'taken' || availabilityStatus === 'invalid') && (
                  <X className="w-4 h-4 text-[#FF4D4D]" />
                )}
              </div>
            </div>

            {/* Availability Status Text */}
            <div className="flex items-center justify-between min-h-[20px] px-1 text-[11px] font-mono-code">
              {statusMessage ? (
                <span
                  className={
                    availabilityStatus === 'available' || availabilityStatus === 'current'
                      ? 'text-emerald-400 flex items-center gap-1 font-medium'
                      : availabilityStatus === 'taken'
                      ? 'text-[#FF4D4D] flex items-center gap-1 font-medium'
                      : availabilityStatus === 'invalid'
                      ? 'text-[#FF7777]'
                      : 'text-zinc-400'
                  }
                >
                  {statusMessage}
                </span>
              ) : (
                <span className="text-zinc-500 text-[10px]">
                  3–20 characters • Letters, numbers & underscore only
                </span>
              )}

              <button
                type="button"
                onClick={handleManualCheck}
                disabled={isChecking || !tekkaName.trim()}
                className="text-zinc-400 hover:text-white underline text-[10px] disabled:opacity-40 cursor-pointer"
              >
                CHECK AVAILABILITY
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={!isAvailable || isChecking || isSubmitting}
              isLoading={isSubmitting}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              CONTINUE
            </Button>
          </div>
        </form>

        {/* Log Out Option */}
        <div className="mt-6 pt-4 border-t border-[#1C1C1C] flex items-center justify-center">
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-xs font-mono-code text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out / Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
