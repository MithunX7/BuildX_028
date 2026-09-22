import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  ListTodo,
  Wrench,
  CheckCircle2,
  HardHat,
  Users,
  History,
  FilePlus,
  Compass,
  Inbox,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronDown,
  Sparkles,
  Route,
  Gauge,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { isAdminRole } from '../../types/auth';

export const ConsoleNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getStoredUser();
  const isAdmin = currentUser?.role === 'ADMIN' || isAdminRole(currentUser?.role);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const handleFastSwitch = async (roleType: 'CITIZEN' | 'ADMIN') => {
    setIsRoleDropdownOpen(false);
    try {
      if (roleType === 'ADMIN') {
        await authService.login('admin@nmc.nagpur.gov.in', 'nagpur123');
        navigate('/admin');
      } else {
        await authService.login('citizen.nagpur@gmail.com', 'nagpur123');
        navigate('/dashboard');
      }
    } catch {
      // Handled
    }
  };

  // Nav links based on role
  const adminNavLinks = [
    { href: '/admin', label: 'Infrastructure', icon: Route },
    { href: '/admin/issues', label: 'All Issues', icon: ListTodo },
    { href: '/admin/triage', label: 'Risk Triage', icon: Wrench },
    { href: '/admin/work-orders', label: 'Work Orders', icon: CheckCircle2 },
    { href: '/admin/verification', label: 'Photo Verify', icon: Shield },
    { href: '/admin/maintenance', label: 'Smart Maintenance', icon: Gauge },
    { href: '/admin/construction', label: 'Utility GIS', icon: HardHat },
    { href: '/admin/users', label: 'Personnel', icon: Users },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: History },
  ];

  const citizenNavLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Activity },
    { href: '/my-reports', label: 'My Grievances', icon: Inbox },
    { href: '/report', label: 'Submit Defect', icon: FilePlus },
    { href: '/issues', label: 'Nagpur Map', icon: Compass },
    { href: '/profile', label: 'Profile', icon: UserIcon },
  ];

  const publicNavLinks = [
    { href: '/', label: 'Overview', icon: Activity },
    { href: '/issues', label: 'Public Map', icon: Compass },
    { href: '/report', label: 'Report Defect', icon: FilePlus },
  ];

  const activeLinks = !isAuthenticated
    ? publicNavLinks
    : isAdmin
    ? adminNavLinks
    : citizenNavLinks;

  return (
    <header className="border-b border-white/[0.08] bg-[#080d1a]/85 backdrop-blur-xl sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link
            to={!isAuthenticated ? '/' : isAdmin ? '/admin' : '/dashboard'}
            className="flex items-center gap-3 group"
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-lg transition-transform group-hover:scale-105 flex-shrink-0 ${
                isAdmin
                  ? 'bg-gradient-to-tr from-rose-600 via-amber-600 to-orange-500 shadow-rose-500/25 ring-1 ring-rose-400/30'
                  : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-blue-500/25 ring-1 ring-blue-400/30'
              }`}
            >
              <span className="tracking-tighter">NMC</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-tight leading-none">
                  Nagpur<span className="text-blue-400">One</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider border uppercase ${
                    isAdmin
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-sm'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-sm'
                  }`}
                >
                  {isAdmin ? 'ADMIN CONSOLE' : 'CITIZEN'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline truncate">
                  {isAdmin ? 'Municipal Operations Core' : 'Nagpur Municipal Corporation'}
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 pl-4 border-l border-white/[0.08]">
            {activeLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-inner'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Report Button for Citizens */}
          {!isAdmin && (
            <Link
              to="/report"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <FilePlus className="w-3.5 h-3.5" />
              Report Defect
            </Link>
          )}

          {/* 1-Click Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/[0.1] text-xs text-slate-200 transition-all hover:border-slate-600"
              title="Switch demo experience"
            >
              <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="text-[11px] font-semibold hidden sm:inline">
                {isAdmin ? 'Admin View' : 'Citizen View'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#0f172a]/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-white/[0.08] flex items-center justify-between">
                  <span>Switch Portal Experience</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                <button
                  onClick={() => handleFastSwitch('CITIZEN')}
                  className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                    !isAdmin
                      ? 'bg-blue-600/20 text-blue-300 font-bold border-l-2 border-blue-500'
                      : 'text-slate-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-white">Resident Citizen</div>
                    <div className="text-[10px] text-slate-400">Grievances, GPS report, tracking</div>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400">/dashboard</span>
                </button>

                <button
                  onClick={() => handleFastSwitch('ADMIN')}
                  className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                    isAdmin
                      ? 'bg-rose-600/20 text-rose-300 font-bold border-l-2 border-rose-500'
                      : 'text-slate-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-white">Municipal Officer</div>
                    <div className="text-[10px] text-slate-400">Triage, dispatch, photo verify</div>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400">/admin</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile / Logout Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <Link
                to={isAdmin ? '/admin/profile' : '/profile'}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-xs font-medium text-slate-200 flex items-center gap-2 transition-colors"
                title="Profile & Settings"
              >
                <div className="w-5 h-5 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <span className="max-w-[85px] truncate hidden md:inline font-semibold">
                  {currentUser?.name?.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-600/20 border border-white/[0.08] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-bold px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-slate-300 hover:text-white"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-b border-white/[0.08] bg-[#0c1328]/95 backdrop-blur-2xl px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
          {activeLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}

          {!isAdmin && (
            <div className="pt-2 border-t border-white/[0.08]">
              <Link
                to="/report"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md"
              >
                <FilePlus className="w-4 h-4" />
                Report Infrastructure Defect
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
