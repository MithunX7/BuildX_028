import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';

export const AdminRoute: React.FC = () => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!authService.isAdmin()) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#111c44] border border-rose-500/40 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Access Denied
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            You do not have permission to access this page. This administrative console is restricted to authorized municipal officers.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Citizen Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
