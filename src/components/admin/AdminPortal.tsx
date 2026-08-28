import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { verifyAdminStatus } from '../../services/adminService';
import { startPresenceHeartbeat } from '../../services/presenceService';
import { AdminLogin } from './AdminLogin';
import { AdminAccessDenied } from './AdminAccessDenied';
import { AdminDashboard } from './AdminDashboard';
import { Shield } from 'lucide-react';

interface AdminPortalProps {
  onReturnHome: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onReturnHome }) => {
  const { firebaseUser, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  const checkAdminPrivileges = async () => {
    if (!firebaseUser) {
      setIsAdmin(false);
      setIsVerifying(false);
      return;
    }

    try {
      setIsVerifying(true);
      const authorized = await verifyAdminStatus(firebaseUser);
      setIsAdmin(authorized);
    } catch (err) {
      console.error('Admin privilege verification failed:', err);
      setIsAdmin(false);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      checkAdminPrivileges();
    }
  }, [firebaseUser, authLoading]);

  // Record presence heartbeat when inside admin portal
  useEffect(() => {
    if (isAdmin && firebaseUser) {
      const stopHeartbeat = startPresenceHeartbeat({
        uid: firebaseUser.uid,
        tekkaName: 'Admin Portal Session',
        location: 'admin-portal',
      });
      return () => stopHeartbeat();
    }
  }, [isAdmin, firebaseUser]);

  // Loading / Cryptographic verification state
  if (authLoading || isVerifying) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0F0F0F] border border-[#222] flex items-center justify-center text-[#E50914] relative">
            <Shield className="w-7 h-7 animate-pulse" />
            <div className="absolute inset-0 rounded-2xl border-2 border-[#E50914] border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-base font-bold text-white tracking-tight">
              Verifying Cryptographic Privileges...
            </h2>
            <p className="text-xs font-mono-code text-zinc-500 mt-1">
              Authoritative Firestore Security Enforcement
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> Show secure Admin Login screen
  if (!firebaseUser) {
    return (
      <AdminLogin
        onReturnHome={onReturnHome}
        onSuccess={() => checkAdminPrivileges()}
      />
    );
  }

  // Logged in but not authorized -> Show 403 Forbidden Access Denied
  if (!isAdmin) {
    return (
      <AdminAccessDenied
        userEmail={firebaseUser.email}
        userUid={firebaseUser.uid}
        onReturnHome={onReturnHome}
        onRetry={() => checkAdminPrivileges()}
      />
    );
  }

  // Authorized -> Show full Admin Dashboard
  return (
    <AdminDashboard
      adminUser={firebaseUser}
      onReturnHome={onReturnHome}
      onLoggedOut={() => {
        setIsAdmin(false);
      }}
    />
  );
};
