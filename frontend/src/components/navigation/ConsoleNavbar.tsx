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
    { href: '/admin', label: 'Dashboard', icon: Activity },
    { href: '/admin/issues', label: 'Issues', icon: ListTodo },
    { href: '/admin/triage', label: 'Triage', icon: Wrench },
    { href: '/admin/work-orders', label: 'Work Orders', icon: CheckCircle2 },
    { href: '/admin/verification', label: 'Verification', icon: Shield },
    { href: '/admin/construction', label: 'Conflicts', icon: HardHat },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: History },
  ];

  const citizenNavLinks = [
    { href: '/dashboard', label: 'My Dashboard', icon: Activity },
    { href: '/my-reports', label: 'My Reports', icon: Inbox },
    { href: '/report', label: 'Report Defect', icon: FilePlus },
    { href: '/issues', label: 'City Map', icon: Compass },
    { href: '/profile', label: 'My Profile', icon: UserIcon },
  ];

  const publicNavLinks = [
    { href: '/', label: 'Home', icon: Activity },
    { href: '/issues', label: 'Public Map', icon: Compass },
    { href: '/report', label: 'Report Defect', icon: FilePlus },
  ];

  const activeLinks = !isAuthenticated
    ? publicNavLinks
    : isAdmin
    ? adminNavLinks
    : citizenNavLinks;

  return (
    <header className="border-b border-slate-800 bg-[#0b1329]/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link
            to={!isAuthenticated ? '/' : isAdmin ? '/admin' : '/dashboard'}
            className="flex items-center gap-3 group"
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-white text-sm sm:text-base shadow-lg transition-transform group-hover:scale-105 flex-shrink-0 ${
              isAdmin
                ? 'bg-gradient-to-tr from-rose-700 to-amber-500 shadow-rose-500/20'
                : 'bg-gradient-to-tr from-blue-700 to-sky-500 shadow-blue-500/20'
            }`}>
              NMC
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-none truncate">
                  NagpurOne
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                  isAdmin
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                }`}>
                  {isAdmin ? 'ADMIN' : 'CITIZEN'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium hidden xs:inline block truncate">
                {isAdmin ? 'Municipal Operations Console' : 'Civic Infrastructure Grievance Portal'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 pl-4 border-l border-slate-800">
            {activeLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
              className="hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors whitespace-nowrap"
            >
              + Report Defect
            </Link>
          )}

          {/* Demo 1-Click Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-slate-600 text-xs text-slate-300"
              title="Switch demo experience"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-semibold hidden sm:inline">
                {isAdmin ? 'Admin Mode' : 'Citizen Mode'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#111c44] border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                  Switch Active Portal
                </div>
                <button
                  onClick={() => handleFastSwitch('CITIZEN')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                    !isAdmin ? 'bg-blue-600/20 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>Citizen Experience</span>
                  <span className="text-[10px] text-slate-500">/dashboard</span>
                </button>
                <button
                  onClick={() => handleFastSwitch('ADMIN')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                    isAdmin ? 'bg-rose-600/20 text-rose-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>Admin Console</span>
                  <span className="text-[10px] text-slate-500">/admin</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile / Logout Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <Link
                to={isAdmin ? '/admin/profile' : '/profile'}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5"
                title="Profile & Settings"
              >
                <UserIcon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span className="max-w-[80px] truncate hidden md:inline">{currentUser?.name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-600/20 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-b border-slate-800 bg-[#0e1738] px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
          {activeLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}

          {!isAdmin && (
            <div className="pt-2 border-t border-slate-800">
              <Link
                to="/report"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm"
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
