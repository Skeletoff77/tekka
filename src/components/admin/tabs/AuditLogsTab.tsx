import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  FileText,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AdminAuditLog, AdminActionType } from '../../../types/admin';

interface AuditLogsTabProps {
  logs: AdminAuditLog[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ logs, isLoading, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        log.adminEmail.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.targetName || '').toLowerCase().includes(q) ||
        (log.targetId || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getActionColor = (action: AdminActionType) => {
    if (action.includes('SUSPENDED') || action.includes('TERMINATED') || action.includes('DELETED')) {
      return 'bg-red-950/60 text-red-400 border-red-800';
    }
    if (action.includes('ACTIVATED') || action.includes('LOGIN')) {
      return 'bg-emerald-950/60 text-emerald-400 border-emerald-800';
    }
    return 'bg-blue-950/60 text-blue-400 border-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E1E1E]">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-400" />
            Immutable Admin Audit Trail
          </h2>
          <p className="text-xs text-zinc-400 font-mono-code">
            Cryptographic log of all portal activities, access verifications, and state modifications
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit logs by admin email, action, or target..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0C0C0C] border border-[#222] text-xs font-mono-code text-white placeholder-zinc-500 focus:outline-none focus:border-[#E50914] transition-colors"
          />
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0C0C0C] border border-[#222] text-xs font-mono-code text-zinc-300 focus:outline-none focus:border-[#E50914]"
          >
            <option value="ALL">All Actions</option>
            <option value="ADMIN_LOGIN">ADMIN_LOGIN</option>
            <option value="USER_SUSPENDED">USER_SUSPENDED</option>
            <option value="USER_ACTIVATED">USER_ACTIVATED</option>
            <option value="ROOM_VIEWED">ROOM_VIEWED</option>
            <option value="ROOM_TERMINATED">ROOM_TERMINATED</option>
            <option value="PRESENCE_CLEANUP">PRESENCE_CLEANUP</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0C0C0C] border border-[#1E1E1E] rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-code">
            <thead className="bg-[#121212] border-b border-[#222] text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin Email</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Loading Audit Log Registry...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No matching audit log entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-[#121212] transition-colors">
                      <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-200 font-medium">
                        {log.adminEmail}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-300">
                        {log.targetName || log.targetId || 'System'}
                      </td>

                      <td className="py-3.5 px-4">
                        {log.result === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" /> OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> FAIL
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                          className="p-1 rounded bg-[#141414] hover:bg-[#222] border border-[#222] text-zinc-400 hover:text-white cursor-pointer"
                        >
                          {expandedLogId === log.id ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {expandedLogId === log.id && (
                      <tr className="bg-[#080808]">
                        <td colSpan={6} className="p-4 border-t border-b border-[#1A1A1A]">
                          <div className="p-3 rounded-lg bg-[#101010] border border-[#222] text-[11px] font-mono-code text-zinc-300">
                            <span className="text-zinc-500 block mb-1">Payload / Details:</span>
                            <pre className="overflow-x-auto text-emerald-400">
                              {JSON.stringify(
                                {
                                  logId: log.id,
                                  adminUid: log.adminUid,
                                  details: log.details || {},
                                },
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
