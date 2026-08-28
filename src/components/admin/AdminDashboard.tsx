import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  Users,
  Radio,
  Layers,
  BarChart2,
  Trophy,
  Lock,
  Settings,
  LogOut,
  ArrowLeft,
  RefreshCw,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import {
  AdminOverviewStats,
  AdminAuditLog,
  GameAnalyticsData,
  ChorPoliceAnalyticsData,
  UserManagementProfile,
} from '../../types/admin';
import { TekkaRoom } from '../../types/room';
import {
  getAdminOverviewStats,
  getAllUsers,
  getAllRooms,
  getPlatformGameAnalytics,
  getChorPoliceAnalytics,
  getAdminAuditLogs,
  updateUserAccountStatus,
  recordAuditLog,
} from '../../services/adminService';

import { OverviewTab } from './tabs/OverviewTab';
import { UsersTab } from './tabs/UsersTab';
import { LivePresenceTab } from './tabs/LivePresenceTab';
import { RoomsTab } from './tabs/RoomsTab';
import { GameAnalyticsTab } from './tabs/GameAnalyticsTab';
import { ChorPoliceTab } from './tabs/ChorPoliceTab';
import { AuditLogsTab } from './tabs/AuditLogsTab';
import { SettingsTab } from './tabs/SettingsTab';

export type AdminTab =
  | 'overview'
  | 'users'
  | 'presence'
  | 'rooms'
  | 'analytics'
  | 'chor-police'
  | 'audit-logs'
  | 'settings';

interface AdminDashboardProps {
  adminUser: FirebaseUser;
  onReturnHome: () => void;
  onLoggedOut: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  onReturnHome,
  onLoggedOut,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Platform Data States
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [users, setUsers] = useState<UserManagementProfile[]>([]);
  const [rooms, setRooms] = useState<TekkaRoom[]>([]);
  const [gameAnalytics, setGameAnalytics] = useState<GameAnalyticsData[]>([]);
  const [chorPoliceData, setChorPoliceData] = useState<ChorPoliceAnalyticsData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // Load all platform data
  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, usersRes, roomsRes, gamesRes, cpRes, logsRes] = await Promise.all([
        getAdminOverviewStats(),
        getAllUsers(),
        getAllRooms(),
        getPlatformGameAnalytics(),
        getChorPoliceAnalytics(),
        getAdminAuditLogs(100),
      ]);

      setStats(statsRes);
      setUsers(usersRes);
      setRooms(roomsRes);
      setGameAnalytics(gamesRes);
      setChorPoliceData(cpRes);
      setAuditLogs(logsRes);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    // Auto-refresh snapshot every 45 seconds
    const interval = setInterval(loadAllData, 45_000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      await recordAuditLog({
        adminUid: adminUser.uid,
        adminEmail: adminUser.email || 'unknown',
        action: 'ADMIN_LOGOUT',
        targetType: 'auth',
        timestamp: Date.now(),
        result: 'SUCCESS',
      });
      await signOut(auth);
      onLoggedOut();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleUpdateUserStatus = async (
    targetUid: string,
    targetName: string,
    status: 'active' | 'suspended'
  ) => {
    await updateUserAccountStatus(adminUser, targetUid, targetName, status);
    // Reload users & audit logs
    const [updatedUsers, updatedLogs] = await Promise.all([
      getAllUsers(),
      getAdminAuditLogs(100),
    ]);
    setUsers(updatedUsers);
    setAuditLogs(updatedLogs);
  };

  const navItems = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'users' as AdminTab, label: 'Accounts & Users', icon: Users, badge: users.length },
    { id: 'presence' as AdminTab, label: 'Live Visitors', icon: Radio, isLive: true },
    { id: 'rooms' as AdminTab, label: 'Room Monitor', icon: Layers, badge: rooms.filter((r) => r.status === 'PLAYING').length },
    { id: 'analytics' as AdminTab, label: 'Game Catalog', icon: BarChart2 },
    { id: 'chor-police' as AdminTab, label: 'Chor Police Deep', icon: Trophy },
    { id: 'audit-logs' as AdminTab, label: 'Audit Trail', icon: Lock },
    { id: 'settings' as AdminTab, label: 'Security & Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row selection:bg-[#E50914] selection:text-white font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0A0A0A] border-b border-[#1E1E1E] sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#E50914]">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight">TEKKA</span>
            <span className="text-[10px] font-mono-code text-[#E50914] ml-1.5 px-1 py-0.2 rounded border border-[#E50914]/40">
              ADMIN
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-[#141414] text-zinc-300 border border-[#222]"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0A0A0A] border-r border-[#1E1E1E] flex flex-col z-50 transition-transform md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#181818] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#E50914] shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wider text-white">TEKKA</span>
                <span className="text-[9px] font-mono-code text-[#E50914] bg-[#E50914]/10 border border-[#E50914]/30 px-1 py-0.2 rounded">
                  PORTAL
                </span>
              </div>
              <span className="text-[10px] font-mono-code text-zinc-500 block mt-0.5">
                Security Kernel v2.4
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono-code transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#E50914] text-white font-semibold shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.isLive && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}

                {item.badge !== undefined && item.badge > 0 && !item.isLive && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-black/40 text-white' : 'bg-[#181818] text-zinc-400 border border-[#2A2A2A]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Account Badge & Footer Actions */}
        <div className="p-3 border-t border-[#181818] bg-[#070707] space-y-2">
          <div className="p-2.5 rounded-lg bg-[#101010] border border-[#222] text-xs">
            <div className="flex items-center justify-between text-[11px] font-mono-code mb-1">
              <span className="text-zinc-500">Authorized Admin:</span>
              <span className="text-emerald-400 font-bold">SUPER_ADMIN</span>
            </div>
            <p className="text-xs text-zinc-200 font-mono-code truncate">{adminUser.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onReturnHome}
              className="py-2 px-2 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#2A2A2A] text-zinc-300 hover:text-white text-[11px] font-mono-code flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              Game Hub
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="py-2 px-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 text-[11px] font-mono-code flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} isLoading={isLoading} onRefresh={loadAllData} />
        )}

        {activeTab === 'users' && (
          <UsersTab
            users={users}
            isLoading={isLoading}
            adminUser={adminUser}
            onUpdateStatus={handleUpdateUserStatus}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'presence' && <LivePresenceTab adminUser={adminUser} />}

        {activeTab === 'rooms' && (
          <RoomsTab
            rooms={rooms}
            isLoading={isLoading}
            adminUser={adminUser}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'analytics' && (
          <GameAnalyticsTab
            analytics={gameAnalytics}
            isLoading={isLoading}
            onSelectChorPolice={() => setActiveTab('chor-police')}
          />
        )}

        {activeTab === 'chor-police' && (
          <ChorPoliceTab data={chorPoliceData} isLoading={isLoading} />
        )}

        {activeTab === 'audit-logs' && (
          <AuditLogsTab logs={auditLogs} isLoading={isLoading} onRefresh={loadAllData} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            adminUser={adminUser}
            onRefreshAll={loadAllData}
            onReturnHome={onReturnHome}
          />
        )}
      </main>
    </div>
  );
};
