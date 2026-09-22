import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  ListTodo,
  Wrench,
  CheckCircle2,
  HardHat,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  FilePlus,
  Compass,
} from 'lucide-react';
import { authService } from '../../services/authService';

const DEMO_ROLES = [
  { role: 'COMMANDER', label: 'Cmdr. Rajesh Sharma (Commander)', email: 'commander@nmc.nagpur.gov.in' },
  { role: 'COORDINATOR', label: 'Er. Amit Deshmukh (Coordinator)', email: 'coordinator.roads@nmc.nagpur.gov.in' },
  { role: 'INSPECTOR', label: 'Sandeep Patel (Contractor / Patrol)', email: 'inspector.patrol@nmc.nagpur.gov.in' },
  { role: 'VERIFIER', label: 'Er. Priya Kulkarni (Quality Verifier)', email: 'verifier.eng@nmc.nagpur.gov.in' },
  { role: 'OPERATOR', label: 'Kavita Rao (Helpline Operator)', email: 'operator.helpline@nmc.nagpur.gov.in' },
  { role: 'CITIZEN', label: 'Ravi Joshi (Citizen)', email: 'citizen.nagpur@gmail.com' },
  { role: 'ADMIN', label: 'System Administrator', email: 'admin@nmc.nagpur.gov.in' },
];

export const ConsoleNavbar: React.FC = () => {
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState(DEMO_ROLES[0]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleRoleSwitch = async (roleObj: (typeof DEMO_ROLES)[0]) => {
    setSelectedRole(roleObj);
    setIsRoleDropdownOpen(false);
    try {
      await authService.login(roleObj.email, 'nagpur123');
    } catch {
      // Handled
    }
  };

  const navLinks = [
    { href: '/operations/dashboard', label: 'Live Console', icon: Activity },
    { href: '/operations/triage', label: 'Triage Queue', icon: ListTodo },
    { href: '/operations/work-orders', label: 'Work Orders', icon: Wrench },
    { href: '/operations/verification', label: 'Verification', icon: CheckCircle2 },
    { href: '/operations/construction', label: 'Conflicts', icon: HardHat },
    { href: '/issues', label: 'Public Map', icon: Compass },
    { href: '/report', label: 'Report Issue', icon: FilePlus },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#0b1329]/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link to="/operations/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center font-black text-white text-sm sm:text-base shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              NMC
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-none truncate">
                  NagpurOne
                </span>
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden xs:inline block truncate">
                AI Vision & Civic Infra Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 pl-4 border-l border-slate-800">
            {navLinks.map((link) => {
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
          <Link
            to="/report"
            className="hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors whitespace-nowrap"
          >
            + Report Pothole
          </Link>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-200 shadow-sm"
              title="Switch demo user role"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span className="max-w-[80px] sm:max-w-[120px] truncate text-[11px] sm:text-xs">
                {selectedRole.role}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#111c44] border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                  Switch Active Role (Demo)
                </div>
                {DEMO_ROLES.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => handleRoleSwitch(r)}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col transition-colors ${
                      selectedRole.role === r.role
                        ? 'bg-blue-600/20 text-blue-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className="text-[10px] text-slate-500">{r.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

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
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <Link
              to="/report"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold text-sm"
            >
              <FilePlus className="w-4 h-4" />
              Report Infrastructure Defect
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
