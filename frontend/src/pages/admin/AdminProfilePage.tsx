import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Mail,
  Building2,
  LogOut,
  UserCheck,
  Lock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { authService } from '../../services/authService';

export const AdminProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getStoredUser();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <div className="max-w-xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-rose-400" />
            Administrative Officer Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            NMC internal command credentials and active administrative session.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-2xl space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold text-xl">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <div>
            <div className="text-base font-bold text-white">{user?.name}</div>
            <div className="text-xs text-slate-400">{user?.email}</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="danger" size="sm">
                Role: {user?.role || 'ADMIN'}
              </Badge>
              <Badge variant="outline" size="sm">
                Administrative Session
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              Assigned Department
            </span>
            <div className="font-semibold text-slate-200">
              {user?.departmentName || 'Nagpur Municipal Corporation Central Command'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              System Access Privileges
            </span>
            <div className="text-slate-300">
              Full access to Grievance Triage, Work Orders Dispatch, Engineering Verification, User Management, and Governance Audit Logs.
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="danger"
            size="md"
            className="w-full font-bold"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Terminate Session & Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
