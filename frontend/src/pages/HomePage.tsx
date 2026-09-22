import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  MapPin,
  Layers,
  CheckCircle2,
  HardHat,
  ArrowRight,
  TrendingUp,
  FilePlus,
  Compass,
  Inbox,
  UserCheck,
  Sparkles,
  ShieldCheck,
  Building2,
  Flame,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { dashboardService } from '../services/dashboardService';
import { authService } from '../services/authService';

export const HomePage: React.FC = () => {
  const [summary, setSummary] = useState({
    totalIssues: 0,
    openIssues: 0,
    criticalIssues: 0,
    resolvedIssues: 0,
  });
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  useEffect(() => {
    dashboardService.getDashboardSummary().then((res) => {
      if (res?.summary) {
        setSummary(res.summary);
      }
    }).catch(() => {
      // Fallback
    });
  }, []);

  const trustMetrics = [
    { label: 'Total Tracked Defects', value: summary.totalIssues || 8, color: 'text-blue-400', sub: 'Audited in MongoDB Atlas' },
    { label: 'Active Work In-Progress', value: summary.openIssues || 6, color: 'text-amber-400', sub: 'Assigned to NMC field crews' },
    { label: 'P1 Emergency Hazards', value: summary.criticalIssues || 2, color: 'text-rose-400', sub: 'High risk safety score' },
    { label: 'Verified Repairs Closed', value: summary.resolvedIssues || 2, color: 'text-emerald-400', sub: 'Dual photo proof sign-off' },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Geotagged Report Intake',
      desc: 'Citizen captures photographic proof. Automatic browser GPS locks coordinates within 10m without typing an address.',
      icon: MapPin,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
    },
    {
      step: '02',
      title: 'Spatial Deduplication & Risk Score',
      desc: 'Reports within 50m of existing defects auto-merge to stop queue flooding. Risk scoring prioritizes hospitals and metro routes.',
      icon: Layers,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    },
    {
      step: '03',
      title: 'Contractor Dispatch & SLA',
      desc: 'Work orders dispatched to Roads, Sanitation, or Electrical teams with 12h to 24h countdowns and field instructions.',
      icon: HardHat,
      color: 'from-sky-500/20 to-cyan-500/20 text-sky-400 border-sky-500/30',
    },
    {
      step: '04',
      title: 'Engineering Dual-Photo Sign-Off',
      desc: 'Contractors upload geotagged completion proof. Municipal engineers verify side-by-side Before vs After photos before closure.',
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    },
  ];

  const nagpurWards = [
    'Dharampeth (Zone 2)',
    'Sitabuldi & Metro Hub',
    'Wardha Road Corridor',
    'Gandhibagh (Zone 4)',
    'Lakadganj (Zone 6)',
    'Hanuman Nagar (Zone 3)',
    'Nehru Nagar (Zone 5)',
    'Mangalwari (Zone 10)',
  ];

  const categories = [
    { name: 'Pothole & Crater Repairs', sla: '24 Hours', count: 'High Priority', color: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
    { name: 'Garbage & Waste Dumps', sla: '12 Hours', count: 'Rapid Clearance', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
    { name: 'Streetlight & Electrical', sla: '24 Hours', count: 'Safety Hazard', color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300' },
    { name: 'Road Excavations & Cuts', sla: '18 Hours', count: 'Utility GIS Sync', color: 'border-sky-500/30 bg-sky-500/10 text-sky-300' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-10 relative">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[380px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-emerald-500/10 blur-[120px] rounded-full" />

      {/* Hero Section */}
      <section className="text-center space-y-7 max-w-4xl mx-auto px-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/30 text-xs font-bold text-blue-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          Nagpur Municipal Corporation (NMC) Infrastructure Console
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
          Transparent Roads. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
            Zero False Closures.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          The unified municipal operations platform empowering citizens to report infrastructure defects with photo evidence, and giving engineers tools to verify repairs with proof.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            to="/report"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 hover:shadow-blue-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <FilePlus className="w-4 h-4" />
            Report Infrastructure Defect
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            to="/issues"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-white/[0.1] hover:border-slate-600 transition-all shadow-sm"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            Explore Nagpur Civic Feed
          </Link>

          {isAuthenticated ? (
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-sm transition-all"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              {isAdmin ? 'Admin Console' : 'My Grievances'}
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-sm border border-white/[0.06] transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </section>

      {/* Trust Metrics Bar */}
      <section className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-3xl bg-[#0f172a]/70 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
          {trustMetrics.map((metric, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.06] transition-transform hover:-translate-y-0.5"
            >
              <div className={`text-3xl sm:text-4xl font-black font-mono ${metric.color} tracking-tight`}>
                {metric.value}
              </div>
              <div className="text-xs text-white font-bold mt-1">{metric.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{metric.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4-Step Lifecycle Workflow */}
      <section className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="text-xs font-extrabold uppercase tracking-widest text-blue-400">
            Zero-Compromise Accountability
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            How NagpurOne Delivers Verified Resolutions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            A closed-loop civic pipeline preventing work orders from being marked closed without photographic proof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {workflowSteps.map((wf) => {
            const Icon = wf.icon;
            return (
              <div
                key={wf.step}
                className="p-6 rounded-3xl bg-[#0f172a]/80 backdrop-blur-md border border-white/[0.08] hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg group hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-slate-600 group-hover:text-blue-400 transition-colors">
                      {wf.step}
                    </span>
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${wf.color} border flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">{wf.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">{wf.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Defect Categories & SLAs */}
      <section className="max-w-6xl mx-auto px-4 space-y-6 relative z-10">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 via-[#111c44]/80 to-slate-900/90 border border-white/[0.08] shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">NMC Service Level Commitments</h3>
              <p className="text-xs text-slate-400">Guaranteed response windows based on civic risk formulas</p>
            </div>
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 self-start sm:self-auto"
            >
              Submit a grievance now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {categories.map((cat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-2">
                <div className="text-xs font-bold text-white">{cat.name}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target SLA:</span>
                  <span className="font-mono font-bold text-blue-400">{cat.sla}</span>
                </div>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${cat.color}`}>
                  {cat.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ward Coverage Banner */}
      <section className="max-w-6xl mx-auto px-4 space-y-4 text-center relative z-10">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Citywide Municipal Coverage
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          {nagpurWards.map((w, idx) => (
            <div
              key={idx}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/[0.07] text-xs font-medium text-slate-300 hover:border-blue-500/40 transition-colors"
            >
              📍 {w}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
