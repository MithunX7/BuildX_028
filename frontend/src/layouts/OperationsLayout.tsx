import React from 'react';
import { Outlet } from 'react-router-dom';
import { ConsoleNavbar } from '../components/navigation/ConsoleNavbar';

export const OperationsLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <ConsoleNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800/80 bg-[#070e20] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NagpurOne • Unified Urban Infrastructure & Road Maintenance Platform</span>
          <span className="text-[11px] text-slate-600">Nagpur Municipal Corporation (NMC) Innovation Project</span>
        </div>
      </footer>
    </div>
  );
};
