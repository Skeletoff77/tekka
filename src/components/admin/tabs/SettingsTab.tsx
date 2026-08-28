import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Server,
  Lock,
  Database,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { runAdminPresenceCleanup } from '../../../services/adminService';

interface SettingsTabProps {
  adminUser: FirebaseUser;
  onRefreshAll: () => void;
  onReturnHome: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  adminUser,
  onRefreshAll,
  onReturnHome,
}) => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCleanPresence = async () => {
    try {
      setIsCleaning(true);
      const count = await runAdminPresenceCleanup(adminUser);
      setMessage(`Successfully purged ${count} expired visitor records from Firestore.`);
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setMessage('Cleanup failed.');
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#1E1E1E]">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Security Architecture & Administration Settings
        </h2>
        <p className="text-xs text-zinc-400 font-mono-code">
          System policies, active security rules, and maintenance tools
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs font-mono-code flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          {message}
        </div>
      )}

      {/* Admin Session Details */}
      <div className="p-5 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          Current Authenticated Admin Identity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-code">
          <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
            <span className="text-zinc-500 block mb-1">Admin Email:</span>
            <span className="text-white font-semibold">{adminUser.email}</span>
          </div>

          <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
            <span className="text-zinc-500 block mb-1">Firebase Auth UID:</span>
            <span className="text-zinc-300 select-all">{adminUser.uid}</span>
          </div>

          <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
            <span className="text-zinc-500 block mb-1">Access Level:</span>
            <span className="text-[#FF4D4D] font-bold">SUPER_ADMIN (Server-Authoritative)</span>
          </div>

          <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
            <span className="text-zinc-500 block mb-1">Auth Provider:</span>
            <span className="text-zinc-300 capitalize">
              {adminUser.providerData?.[0]?.providerId || 'firebase'}
            </span>
          </div>
        </div>
      </div>

      {/* Security Policies Verified */}
      <div className="p-5 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          Verified Security Policies
        </h3>

        <div className="space-y-2 text-xs font-mono-code text-zinc-300">
          <div className="p-3 rounded-lg bg-[#121212] border border-[#222] flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">No Hardcoded Passwords:</span>
              <p className="text-zinc-400 mt-0.5">
                Admin access is verified directly against Firestore <code className="text-zinc-200">/admins/{'{uid}'}</code> documents and server-authoritative token claims.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#121212] border border-[#222] flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Cryptographic Game Card Privacy:</span>
              <p className="text-zinc-400 mt-0.5">
                Secret card roles and hidden state in <code className="text-zinc-200">/playerViews</code> cannot be queried by admin tools during live matches to prevent game cheating.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#121212] border border-[#222] flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Hidden Navigation:</span>
              <p className="text-zinc-400 mt-0.5">
                No public UI buttons or links reveal the admin portal URL to standard players.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Maintenance */}
      <div className="p-5 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-400" />
          Maintenance Operations
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={isCleaning}
            onClick={handleCleanPresence}
            className="flex-1 py-2.5 px-4 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#333] text-zinc-200 text-xs font-mono-code flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
            {isCleaning ? 'Purging Stale Records...' : 'Purge Stale Presence Heartbeats'}
          </button>

          <button
            type="button"
            onClick={onRefreshAll}
            className="flex-1 py-2.5 px-4 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#333] text-zinc-200 text-xs font-mono-code flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
            Refresh All Platform Caches
          </button>
        </div>
      </div>
    </div>
  );
};
