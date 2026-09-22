import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Camera,
  Check,
  HardHat,
  Activity,
  Gauge,
  Route,
  Zap,
  ChevronRight,
  BarChart3,
  Clock,
  Users,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { OperationsMap } from '../../components/console/OperationsMap';
import { QuickTriagePanel } from '../../components/console/QuickTriagePanel';
import { adminService, AdminDashboardData } from '../../services/adminService';

/* ─── Category colour map ─────────────────────────────────── */
const CATEGORY_COLORS: Record<string, { bg: string; bar: string; text: string }> = {
  POTHOLE:              { bg: 'bg-rose-500/15',    bar: 'bg-rose-400',    text: 'text-rose-300' },
  ROAD_SURFACE_DAMAGE:  { bg: 'bg-orange-500/15',  bar: 'bg-orange-400',  text: 'text-orange-300' },
  GARBAGE_ACCUMULATION: { bg: 'bg-yellow-500/15',  bar: 'bg-yellow-400',  text: 'text-yellow-300' },
  STREETLIGHT_FAULT:    { bg: 'bg-amber-500/15',   bar: 'bg-amber-400',   text: 'text-amber-300' },
  ROAD_OBSTRUCTION:     { bg: 'bg-fuchsia-500/15', bar: 'bg-fuchsia-400', text: 'text-fuchsia-300' },
  CONSTRUCTION_CONFLICT:{ bg: 'bg-cyan-500/15',    bar: 'bg-cyan-400',    text: 'text-cyan-300' },
  DAMAGED_ASSET:        { bg: 'bg-indigo-500/15',  bar: 'bg-indigo-400',  text: 'text-indigo-300' },
};

/* ─── Arterial corridors ──────────────────────────────────── */
const CORRIDORS = [
  { label: 'Ring Road Arterial', color: 'text-sky-400 border-sky-500/40 bg-sky-500/10' },
  { label: 'Central Spine',      color: 'text-violet-400 border-violet-500/40 bg-violet-500/10' },
  { label: 'Industrial Bypass',  color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  { label: 'Residential Sectors',color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
];

/* ─── PCI Gauge ────────────────────────────────────────────── */
const PCIGauge: React.FC<{ pci: number }> = ({ pci }) => {
  // SVG semicircle gauge
  const r = 42;
  const cx = 56;
  const cy = 56;
  const circumference = Math.PI * r;
  const dashoffset = circumference * (1 - pci / 100);
  const color = pci >= 75 ? '#10b981' : pci >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex flex-col items-center">
      <svg width="112" height="64" viewBox="0 0 112 68" className="overflow-visible">
        {/* Track */}
        <path
          d={`M 14 56 A ${r} ${r} 0 0 1 98 56`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M 14 56 A ${r} ${r} 0 0 1 98 56`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
        {/* Needle dot */}
        <circle cx={cx} cy={cy} r={4} fill={color} />
      </svg>
      <div className="absolute top-8 text-center">
        <div className="text-2xl font-black font-mono" style={{ color }}>{pci}</div>
        <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">/ 100 PCI</div>
      </div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────── */
export const AdminDashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [approvedOrders, setApprovedOrders] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [activeCorridorIdx, setActiveCorridorIdx] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadData = async () => {
    try {
      const [stats, issuesRes, workOrdersRes] = await Promise.all([
        adminService.getDashboardSummary(),
        adminService.getIssues({ limit: 20 }),
        adminService.getWorkOrders(),
      ]);
      setDashboardData(stats);
      setIssues(issuesRes.issues || []);
      const verified = (workOrdersRes || []).filter(
        (w: any) => w.status === 'VERIFIED'
      );
      setApprovedOrders(verified);
      if (issuesRes.issues?.length > 0 && !selectedIssue) {
        setSelectedIssue(issuesRes.issues[0]);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const summary = dashboardData?.summary || {
    totalIssues: 0,
    openIssues: 0,
    criticalIssues: 0,
    resolvedIssues: 0,
    totalWorkOrders: 0,
    pendingVerification: 0,
    activeConflicts: 0,
    resolutionRatePercent: 0,
  };

  const maxCatCount = Math.max(...(dashboardData?.categoryStats?.map(c => c.count) || [1]), 1);

  // Derived PCI — weighted from resolution rate; purely for display
  const pciScore = Math.round(58 + (summary.resolutionRatePercent || 0) * 0.32);
  const kmMonitored = 847 + summary.totalIssues * 2; // illustrative

  const statCards = [
    {
      id: 'emergency',
      title: 'P1 Emergency Defects',
      value: summary.criticalIssues,
      icon: Flame,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      glow: 'shadow-rose-500/20',
      badge: summary.criticalIssues > 0 ? 'CRITICAL' : null,
    },
    {
      id: 'grievances',
      title: 'Open Active Grievances',
      value: summary.openIssues,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      glow: 'shadow-amber-500/20',
      badge: null,
    },
    {
      id: 'workorders',
      title: 'Active Work Orders',
      value: summary.totalWorkOrders,
      icon: Wrench,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      glow: 'shadow-sky-500/20',
      badge: null,
    },
    {
      id: 'resolved',
      title: 'Verified Repairs Closed',
      value: summary.resolvedIssues,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/20',
      badge: null,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* ═══════════════════════════════════════════════════════════
          HEADER — Urban Infrastructure & Roads (Enhanced)
      ═══════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #080d1a 0%, #0d1930 50%, #091220 100%)' }}
      >
        {/* City Skyline SVG Silhouette */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full opacity-[0.07] pointer-events-none"
          viewBox="0 0 1200 160"
          fill="white"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,160 L0,100 L30,100 L30,80 L50,80 L50,60 L70,60 L70,80 L90,80 L90,50 L100,50 L100,30 L110,30 L110,50 L120,50 L120,80 L150,80 L150,40 L160,40 L160,20 L170,20 L170,40 L180,40 L180,80 L200,80 L200,90 L220,90 L220,70 L240,70 L240,50 L250,50 L250,70 L260,70 L260,90 L300,90 L300,60 L310,60 L310,40 L320,40 L320,60 L330,60 L330,90 L380,90 L380,70 L400,70 L400,50 L410,50 L410,30 L420,30 L420,10 L430,10 L430,30 L440,30 L440,50 L450,50 L450,70 L470,70 L470,90 L500,90 L500,80 L520,80 L520,60 L540,60 L540,80 L560,80 L560,90 L580,90 L580,70 L600,70 L600,50 L610,50 L610,30 L620,30 L620,50 L630,50 L630,70 L650,70 L650,90 L700,90 L700,75 L720,75 L720,55 L730,55 L730,35 L740,35 L740,55 L750,55 L750,75 L780,75 L780,85 L800,85 L800,65 L810,65 L810,45 L820,45 L820,65 L830,65 L830,85 L870,85 L870,70 L890,70 L890,50 L900,50 L900,30 L910,30 L910,50 L920,50 L920,70 L950,70 L950,90 L1000,90 L1000,80 L1020,80 L1020,60 L1040,60 L1040,80 L1060,80 L1060,90 L1100,90 L1100,70 L1120,70 L1120,50 L1130,50 L1130,70 L1150,70 L1150,90 L1200,90 L1200,160 Z" />
        </svg>

        {/* Ambient glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-48 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-64 h-32 bg-emerald-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-8">
          {/* Top row: Badge + Refresh + Verify button */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs font-bold text-blue-400 mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                NMC Urban Infrastructure Command · Nagpur Municipal Corporation
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Urban Infrastructure & Roads
                <span className="block sm:inline text-sky-400"> — Enhanced Overview</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl">
                Real-time pavement health telemetry, algorithmic risk prioritisation, arterial corridor management and contractor dispatch for Nagpur.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-center flex-shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                <Clock className="w-3 h-3" />
                {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <button
                onClick={loadData}
                className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all"
                title="Refresh telemetry"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <Link
                to="/admin/verification"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Verify Repairs
              </Link>
            </div>
          </div>

          {/* Road Health Metrics Band */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* PCI Gauge Card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur">
              <PCIGauge pci={pciScore} />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Road Health Index</div>
                <div className="text-sm font-bold text-white">Pavement Condition</div>
                <div className={`text-xs font-semibold mt-0.5 ${pciScore >= 75 ? 'text-emerald-400' : pciScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {pciScore >= 75 ? '✓ Good Condition' : pciScore >= 50 ? '⚠ Moderate' : '✕ Poor — Urgent Attention'}
                </div>
              </div>
            </div>

            {/* Total KM Monitored */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex-shrink-0">
                <Route className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Total KM Monitored</div>
                <div className="text-2xl font-black font-mono text-white">{kmMonitored.toLocaleString()}</div>
                <div className="text-xs text-sky-300 font-semibold">km Active Road Network</div>
              </div>
            </div>

            {/* Arterial Corridor Readiness */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex-shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Arterial Corridor Readiness</div>
                <div className="text-sm font-black text-white">
                  {summary.activeConflicts === 0 ? (
                    <span className="text-emerald-400">● Optimal</span>
                  ) : (
                    <span className="text-amber-400">⚠ {summary.activeConflicts} Conflict(s)</span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {summary.resolutionRatePercent || 0}% resolution rate this cycle
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          KPI STAT CARDS
      ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`relative overflow-hidden p-4 sm:p-5 rounded-3xl backdrop-blur border ${card.border} ${card.bg} flex items-center justify-between shadow-xl ${card.glow} transition-all hover:-translate-y-0.5 hover:shadow-2xl`}
            >
              {/* Subtle bg glow */}
              <div className={`absolute inset-0 ${card.bg} opacity-50 blur-xl pointer-events-none`} />
              <div className="relative">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                  {card.title}
                </div>
                <div className={`text-3xl sm:text-4xl font-black font-mono mt-1 ${card.color}`}>
                  {isLoading ? '—' : card.value}
                </div>
                {card.badge && (
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-[9px] font-bold text-rose-300 uppercase tracking-wider animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    {card.badge}
                  </div>
                )}
              </div>
              <div className={`relative p-3.5 rounded-2xl border ${card.border} ${card.bg} ${card.color} flex-shrink-0`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          UTILITY CONFLICT ALERT
      ═══════════════════════════════════════════════════════════ */}
      {summary.activeConflicts > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {summary.activeConflicts} Spatial Utility Conflict{summary.activeConflicts > 1 ? 's' : ''} Detected
              </div>
              <div className="text-xs text-amber-300/80 mt-0.5">
                Scheduled roadworks overlap with metro or water pipe excavations. Permits held pending co-ordination sign-off.
              </div>
            </div>
          </div>
          <Link
            to="/admin/construction"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex-shrink-0 self-start sm:self-auto flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            Review Conflicts
          </Link>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          CORRIDOR QUICK FILTERS
      ═══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Corridor Quick Filters</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CORRIDORS.map((c, idx) => (
            <button
              key={c.label}
              onClick={() => setActiveCorridorIdx(idx === activeCorridorIdx ? null : idx)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${c.color} ${
                idx === activeCorridorIdx ? 'ring-2 ring-offset-2 ring-offset-[#080d1a] opacity-100' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {c.label}
            </button>
          ))}
          {activeCorridorIdx !== null && (
            <button
              onClick={() => setActiveCorridorIdx(null)}
              className="px-3 py-2 rounded-full text-xs font-semibold text-slate-400 border border-white/[0.08] hover:border-white/20 transition-all"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MAIN OPERATIONS GRID: MAP + TRIAGE + FEEDS
      ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <OperationsMap
            issues={issues}
            selectedIssueId={selectedIssue?._id || selectedIssue?.id}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
          />

          {/* Category Distribution — horizontal bar chart style */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0f172a]/80 backdrop-blur border border-white/[0.08] shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Defect Category Distribution
            </h3>
            {!dashboardData?.categoryStats?.length ? (
              <div className="text-xs text-slate-500 py-4 text-center">No category data yet.</div>
            ) : (
              <div className="space-y-2.5">
                {dashboardData.categoryStats.map((cat) => {
                  const c = CATEGORY_COLORS[cat._id] || {
                    bg: 'bg-slate-500/10',
                    bar: 'bg-slate-400',
                    text: 'text-slate-300',
                  };
                  const pct = Math.round((cat.count / maxCatCount) * 100);
                  return (
                    <div key={cat._id} className="flex items-center gap-3">
                      <div className={`text-[10px] font-bold uppercase tracking-wide w-36 truncate flex-shrink-0 ${c.text}`}>
                        {cat._id?.replace(/_/g, ' ')}
                      </div>
                      <div className="flex-1 h-2 rounded-full bg-white/[0.05] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.bar} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="font-mono text-sm font-bold text-white w-6 text-right flex-shrink-0">
                        {cat.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <QuickTriagePanel
            activeIssue={selectedIssue}
            onTriageComplete={loadData}
          />

          {/* Recent Intake Feed */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0f172a]/80 backdrop-blur border border-white/[0.08] shadow-xl space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Recent Intake Feed
              </h3>
              <Link to="/admin/issues" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                All Issues <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
              {issues.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <Users className="w-6 h-6 text-slate-600" />
                  No recent issues found.
                </div>
              ) : (
                issues.slice(0, 8).map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedIssue(item)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedIssue?._id === item._id
                        ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-400/30'
                        : 'bg-slate-950/60 border-white/[0.06] hover:border-slate-600 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400 flex-shrink-0">{item.referenceCode}</span>
                      <Badge
                        variant={
                          item.priorityLevel === 'CRITICAL'
                            ? 'danger'
                            : item.priorityLevel === 'HIGH'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {item.priorityLevel}
                      </Badge>
                    </div>
                    <div className="text-xs font-bold text-white mt-1 truncate">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-400 flex-shrink-0" />
                      {item.location?.addressText}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          APPROVED & ACKNOWLEDGED BEFORE / AFTER REPAIRS
      ═══════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden rounded-3xl border border-emerald-500/25 shadow-2xl shadow-emerald-900/20"
        style={{ background: 'linear-gradient(135deg, #050e1e 0%, #071a12 100%)' }}
      >
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-emerald-600/8 blur-3xl rounded-full pointer-events-none" />

        <div className="relative p-6 sm:p-8 space-y-6">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Approved & Acknowledged Before/After Repairs
                </h2>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300">
                  {approvedOrders.length} Verified Closures
                </div>
              </div>
              <p className="text-xs text-slate-400 pl-0 sm:pl-[52px]">
                Closed work orders with officially inspected Before &amp; After photographic evidence. Acknowledged by NMC Engineering Division.
              </p>
            </div>
            <Link
              to="/admin/verification"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/30 text-xs font-bold text-emerald-300 hover:text-emerald-200 transition-all self-start sm:self-auto flex-shrink-0"
            >
              Open Verification Workbench <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Cards */}
          {approvedOrders.length === 0 ? (
            <div className="p-10 text-center bg-white/[0.02] rounded-2xl border border-white/[0.06] space-y-3">
              <Camera className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-400">No approved repairs yet</div>
              <div className="text-xs text-slate-500 max-w-md mx-auto">
                Once contractors submit completion evidence and your engineering team verifies it, approved closures will appear here with side-by-side Before &amp; After photos.
              </div>
              <Link
                to="/admin/verification"
                className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-xs font-bold text-emerald-300 hover:bg-emerald-600/35 transition-all"
              >
                <Gauge className="w-3.5 h-3.5" />
                Inspect Pending Verifications
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {approvedOrders.slice(0, 6).map((wo) => {
                const initialPhoto =
                  wo.issueId?.evidencePhotos?.[0] ||
                  wo.issueId?.initialDetectionFrame ||
                  null;

                const repairPhoto =
                  wo.evidenceIds?.[0]?.fileUrl ||
                  wo.evidenceIds?.[0]?.mediaUrl ||
                  wo.completionEvidenceUrl ||
                  null;

                const verifierName = wo.verifiedById?.name || 'NMC Quality Engineer';
                const resolvedAt = wo.resolvedAt
                  ? new Date(wo.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Date N/A';

                return (
                  <div
                    key={wo._id}
                    className="group p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-emerald-500/35 hover:shadow-lg hover:shadow-emerald-900/20 transition-all space-y-3.5"
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-sky-400">{wo.workOrderNumber}</span>
                        <div className="text-xs font-bold text-white mt-0.5 truncate max-w-[160px]">
                          {wo.issueId?.title || 'Infrastructure Defect Repaired'}
                        </div>
                      </div>
                      <div className="flex-shrink-0 px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                        ✓ Resolved
                      </div>
                    </div>

                    {/* Location */}
                    {wo.issueId?.location?.addressText && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <MapPin className="w-3 h-3 text-sky-400 flex-shrink-0" />
                        <span className="truncate">{wo.issueId.location.addressText}</span>
                      </div>
                    )}

                    {/* Before / After Photos */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Before */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Before</span>
                        </div>
                        <div className="aspect-video rounded-xl bg-slate-900/80 border border-amber-500/20 overflow-hidden group-hover:border-amber-500/40 transition-colors">
                          {initialPhoto ? (
                            <img
                              src={initialPhoto}
                              alt="Before defect photo"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                              <Camera className="w-4 h-4 text-slate-600" />
                              <span className="text-[9px] text-slate-600">No Photo</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* After */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">After</span>
                        </div>
                        <div className="aspect-video rounded-xl bg-slate-900/80 border border-emerald-500/30 overflow-hidden ring-1 ring-emerald-500/15 group-hover:ring-emerald-500/35 transition-all">
                          {repairPhoto ? (
                            <img
                              src={repairPhoto}
                              alt="After repair photo"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                              <Camera className="w-4 h-4 text-slate-600" />
                              <span className="text-[9px] text-slate-600">No Photo</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-semibold">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{verifierName}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono">{resolvedAt}</span>
                        <Link
                          to="/admin/verification"
                          className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* View all link when more than 6 exist */}
          {approvedOrders.length > 6 && (
            <div className="text-center pt-2">
              <Link
                to="/admin/verification"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View all {approvedOrders.length} approved closures
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
