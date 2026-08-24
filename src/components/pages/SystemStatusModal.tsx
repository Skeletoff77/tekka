import React from 'react';
import { CheckCircle2, Globe, Cpu, Server, Activity, Shield } from 'lucide-react';
import { Modal } from '../common/Modal';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tekka Edge Network Status"
      subtitle="Operational health across regional gaming relays"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Top summary badge */}
        <div className="p-4 rounded-2xl bg-[#0F1E14] border border-emerald-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <p className="text-sm font-display font-bold text-emerald-300">All Systems Operational</p>
              <p className="text-xs text-emerald-400/80 font-mono-code">99.98% Platform Uptime</p>
            </div>
          </div>
          <span className="text-xs font-mono-code text-zinc-400 bg-black/40 px-2.5 py-1 rounded-md">
            18ms Ping
          </span>
        </div>

        {/* Services List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111] border border-[#222]">
            <div className="flex items-center gap-3">
              <Server className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs sm:text-sm font-medium text-white">Game Registry & Metadata API</span>
            </div>
            <span className="text-[11px] font-mono-code text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Operational
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111] border border-[#222]">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs sm:text-sm font-medium text-white">Real-Time State Relays (Phase 2 Ready)</span>
            </div>
            <span className="text-[11px] font-mono-code text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Prepared
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111] border border-[#222]">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs sm:text-sm font-medium text-white">Identity & Authentication Mesh</span>
            </div>
            <span className="text-[11px] font-mono-code text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Operational
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111] border border-[#222]">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs sm:text-sm font-medium text-white">Global Edge CDN Distribution</span>
            </div>
            <span className="text-[11px] font-mono-code text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Optimal
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
