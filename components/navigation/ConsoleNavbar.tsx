"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Activity,
  ListTodo,
  Wrench,
  CheckCircle2,
  HardHat,
  Radio,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const DEMO_ROLES = [
  { role: "COMMANDER", label: "Cmdr. Rajesh Sharma (Commander)", email: "commander@nmc.nagpur.gov.in" },
  { role: "COORDINATOR", label: "Er. Amit Deshmukh (Coordinator)", email: "coordinator.roads@nmc.nagpur.gov.in" },
  { role: "INSPECTOR", label: "Sanjay Patel (Field Patrol/Contractor)", email: "inspector.patrol@nmc.nagpur.gov.in" },
  { role: "VERIFIER", label: "Er. Priya Kulkarni (Quality Verifier)", email: "verifier.eng@nmc.nagpur.gov.in" },
  { role: "OPERATOR", label: "Kavita Rao (Helpline Operator)", email: "operator.helpline@nmc.nagpur.gov.in" },
  { role: "CITIZEN", label: "Anand Joshi (Citizen)", email: "citizen.nagpur@gmail.com" },
  { role: "ADMIN", label: "System Administrator", email: "admin@nmc.nagpur.gov.in" },
];

export function ConsoleNavbar() {
  const pathname = usePathname();
  const [selectedRole, setSelectedRole] = useState(DEMO_ROLES[0]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const handleRoleSwitch = async (roleObj: (typeof DEMO_ROLES)[0]) => {
    setSelectedRole(roleObj);
    setIsRoleDropdownOpen(false);
    try {
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: roleObj.email, password: "nagpur123" }),
      });
    } catch {
      // ignore
    }
  };

  const navLinks = [
    { href: "/operations/dashboard", label: "Live Console", icon: Activity },
    { href: "/operations/triage", label: "Triage Queue", icon: ListTodo },
    { href: "/operations/work-orders", label: "Work Orders", icon: Wrench },
    { href: "/operations/verification", label: "Verification", icon: CheckCircle2 },
    { href: "/operations/construction", label: "Conflicts", icon: HardHat },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/operations/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              NMC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-tight leading-none">
                  NMC Civic Command
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Nagpur Infrastructure & AI Video Detection</span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Citizen Portal & Role Switcher */}
        <div className="flex items-center gap-3">
          <Link
            href="/report"
            className="hidden sm:inline-flex text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Citizen Grievance Portal
          </Link>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-200 shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="max-w-[130px] truncate">{selectedRole.role}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Switch Active Role (Demo)
                </div>
                {DEMO_ROLES.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => handleRoleSwitch(r)}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col transition-colors ${
                      selectedRole.role === r.role ? "bg-blue-600/20 text-blue-300 font-semibold" : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className="text-[10px] text-slate-500">{r.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
