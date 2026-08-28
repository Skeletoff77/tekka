import React, { useState, useMemo } from 'react';
import {
  Search,
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Award,
  Gamepad2,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import { UserManagementProfile } from '../../../types/admin';
import { User as FirebaseUser } from 'firebase/auth';

interface UsersTabProps {
  users: UserManagementProfile[];
  isLoading: boolean;
  adminUser: FirebaseUser;
  onUpdateStatus: (targetUid: string, targetName: string, status: 'active' | 'suspended') => Promise<void>;
  onRefresh: () => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  isLoading,
  adminUser,
  onUpdateStatus,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'suspended' | 'online'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'lastActive' | 'points'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected user for modal inspection
  const [inspectingUser, setInspectingUser] = useState<UserManagementProfile | null>(null);

  // Status update confirmation state
  const [confirmingAction, setConfirmingAction] = useState<{
    user: UserManagementProfile;
    newStatus: 'active' | 'suspended';
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search query (Tekka name or UID or Email)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.tekkaName.toLowerCase().includes(q) ||
          u.uid.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((u) => u.status === 'active');
    } else if (statusFilter === 'suspended') {
      result = result.filter((u) => u.status === 'suspended');
    } else if (statusFilter === 'online') {
      result = result.filter((u) => u.isOnline);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'points') return b.totalPoints - a.totalPoints;
      if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sortBy === 'lastActive') return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0);
      return b.createdAt.localeCompare(a.createdAt); // newest
    });

    return result;
  }, [users, searchQuery, statusFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleExecuteStatusChange = async () => {
    if (!confirmingAction) return;
    try {
      setIsUpdating(true);
      await onUpdateStatus(
        confirmingAction.user.uid,
        confirmingAction.user.tekkaName,
        confirmingAction.newStatus
      );
      setConfirmingAction(null);
      if (inspectingUser && inspectingUser.uid === confirmingAction.user.uid) {
        setInspectingUser({
          ...inspectingUser,
          status: confirmingAction.newStatus,
        });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E1E1E]">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Registered Accounts & Identity Management
          </h2>
          <p className="text-xs text-zinc-400 font-mono-code">
            Total {users.length} registered player handles · {users.filter((u) => u.isOnline).length} online
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'online', 'active', 'suspended'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setStatusFilter(filter);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-md text-xs font-mono-code transition-colors cursor-pointer capitalize ${
                statusFilter === filter
                  ? 'bg-[#E50914] text-white font-semibold'
                  : 'bg-[#141414] hover:bg-[#1E1E1E] text-zinc-400 border border-[#222]'
              }`}
            >
              {filter === 'ALL' ? 'All Accounts' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Tekka Name, UID, or Email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0C0C0C] border border-[#222] text-xs font-mono-code text-white placeholder-zinc-500 focus:outline-none focus:border-[#E50914] transition-colors"
          />
        </div>

        <div>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-[#222] text-xs font-mono-code text-zinc-300 focus:outline-none focus:border-[#E50914]"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="lastActive">Sort: Active Status</option>
            <option value="points">Sort: Highest Reputation</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#0C0C0C] border border-[#1E1E1E] rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-code">
            <thead className="bg-[#121212] border-b border-[#222] text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Firebase UID (Admin-Only)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Games</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Location / Room</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-[#E50914] border-t-transparent animate-spin" />
                      Loading User Registry...
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-[#121212] transition-colors">
                    <td className="py-3.5 px-4 font-sans font-medium text-white flex items-center gap-2.5">
                      <img
                        src={user.avatarUrl}
                        alt={user.tekkaName}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover border border-[#2A2A2A] shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-zinc-100">{user.tekkaName}</span>
                          {user.memberTier === 'Founder' && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800">
                              PRO
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500 block font-mono-code truncate max-w-[140px]">
                          {user.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400 font-mono-code text-[11px]">
                      <span className="bg-[#141414] px-1.5 py-0.5 rounded border border-[#222] select-all">
                        {user.uid.substring(0, 10)}...
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {user.status === 'suspended' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono-code bg-red-950/60 text-red-400 border border-red-800">
                          <Ban className="w-3 h-3" /> Suspended
                        </span>
                      ) : user.isOnline ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono-code bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono-code bg-zinc-900 text-zinc-400 border border-zinc-700">
                          Offline
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400 text-[11px]">{user.createdAt}</td>

                    <td className="py-3.5 px-4 text-zinc-300">
                      <span>{user.gamesPlayed}</span>
                      <span className="text-zinc-500 text-[10px] ml-1">({user.gamesWon}W)</span>
                    </td>

                    <td className="py-3.5 px-4 text-amber-400 font-bold">{user.totalPoints}</td>

                    <td className="py-3.5 px-4 text-zinc-400">
                      {user.currentRoomId ? (
                        <span className="text-xs text-[#FF4D4D] font-mono-code">In Room</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectingUser(user)}
                          title="Inspect user profile"
                          className="p-1.5 rounded bg-[#141414] hover:bg-[#222] border border-[#2A2A2A] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {user.status === 'suspended' ? (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmingAction({ user, newStatus: 'active' })
                            }
                            title="Re-activate user"
                            className="p-1.5 rounded bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-400 transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmingAction({ user, newStatus: 'suspended' })
                            }
                            title="Suspend user account"
                            className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-400 transition-colors cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-[#1E1E1E] flex items-center justify-between text-xs font-mono-code text-zinc-400">
          <span>
            Page {currentPage} of {totalPages} ({filteredUsers.length} users)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded bg-[#141414] border border-[#222] hover:bg-[#1E1E1E] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded bg-[#141414] border border-[#222] hover:bg-[#1E1E1E] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Inspection Modal */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0C0C0C] border border-[#2A2A2A] rounded-xl p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setInspectingUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#141414] text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4 mb-5">
              <img
                src={inspectingUser.avatarUrl}
                alt={inspectingUser.tekkaName}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover border border-[#333]"
              />
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {inspectingUser.tekkaName}
                  <span className="text-xs px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#333] text-zinc-300 font-mono-code">
                    {inspectingUser.memberTier}
                  </span>
                </h3>
                <p className="text-xs font-mono-code text-zinc-400 mt-0.5">{inspectingUser.email}</p>
                <p className="text-xs font-mono-code text-zinc-500 mt-1">
                  UID: <span className="text-zinc-300 select-all">{inspectingUser.uid}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-[11px] font-mono-code text-zinc-500 block">Matches Played</span>
                <span className="text-lg font-bold text-white">{inspectingUser.gamesPlayed}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-[11px] font-mono-code text-zinc-500 block">Matches Won</span>
                <span className="text-lg font-bold text-emerald-400">{inspectingUser.gamesWon}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-[11px] font-mono-code text-zinc-500 block">Reputation Score</span>
                <span className="text-lg font-bold text-amber-400">{inspectingUser.totalPoints}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                <span className="text-[11px] font-mono-code text-zinc-500 block">Account Status</span>
                <span className={`text-sm font-bold ${inspectingUser.status === 'suspended' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {inspectingUser.status.toUpperCase()}
                </span>
              </div>
            </div>

            {inspectingUser.bio && (
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222] mb-5 text-xs text-zinc-300">
                <span className="text-[11px] font-mono-code text-zinc-500 block mb-1">Public Bio</span>
                {inspectingUser.bio}
              </div>
            )}

            <div className="flex gap-3">
              {inspectingUser.status === 'suspended' ? (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingAction({ user: inspectingUser, newStatus: 'active' });
                  }}
                  className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-mono-code font-bold transition-colors cursor-pointer"
                >
                  Re-activate Account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingAction({ user: inspectingUser, newStatus: 'suspended' });
                  }}
                  className="w-full py-2.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-mono-code font-bold transition-colors cursor-pointer"
                >
                  Suspend Account Access
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Suspension / Activation */}
      {confirmingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0C0C0C] border border-red-900/60 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">
                Confirm Account {confirmingAction.newStatus === 'suspended' ? 'Suspension' : 'Activation'}
              </h3>
            </div>
            <p className="text-xs text-zinc-300 mb-4">
              Are you sure you want to change account status for{' '}
              <strong className="text-white">{confirmingAction.user.tekkaName}</strong> to{' '}
              <strong className={confirmingAction.newStatus === 'suspended' ? 'text-red-400' : 'text-emerald-400'}>
                {confirmingAction.newStatus.toUpperCase()}
              </strong>
              ? This action will be authoritatively recorded in the Admin Audit Log.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => setConfirmingAction(null)}
                className="px-4 py-2 rounded-lg bg-[#181818] hover:bg-[#222] text-xs font-mono-code text-zinc-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleExecuteStatusChange}
                className={`px-4 py-2 rounded-lg text-xs font-mono-code font-bold text-white transition-colors cursor-pointer ${
                  confirmingAction.newStatus === 'suspended'
                    ? 'bg-red-700 hover:bg-red-600'
                    : 'bg-emerald-700 hover:bg-emerald-600'
                }`}
              >
                {isUpdating ? 'Saving Change...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
