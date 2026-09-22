import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HardHat,
  Wrench,
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { OperationsMap } from '../../components/console/OperationsMap';
import { QuickTriagePanel } from '../../components/console/QuickTriagePanel';
import { adminService, AdminDashboardData } from '../../services/adminService';

export const AdminDashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [stats, issuesRes] = await Promise.all([
        adminService.getDashboardSummary(),
        adminService.getIssues({ limit: 20 }),
      ]);
      setDashboardData(stats);
      setIssues(issuesRes.issues || []);
      if (issuesRes.issues?.length > 0 && !selectedIssue) {
        setSelectedIssue(issuesRes.issues[0]);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
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

  const statCards = [
    {
      title: 'P1 Emergency Defects',
      value: summary.criticalIssues,
      icon: Flame,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
    },
    {
      title: 'Open Active Grievances',
      value: summary.openIssues,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      title: 'Active Work Orders',
      value: summary.totalWorkOrders,
      icon: Wrench,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/30',
    },
    {
      title: 'Verified Repairs Closed',
      value: summary.resolvedIssues,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            NMC Municipal Command & Operations Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Central Administrative Operations
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/admin/triage"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
          >
            Open Triage Queue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`p-4 rounded-2xl border ${stat.bg} backdrop-blur flex items-center justify-between shadow-sm`}
            >
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</div>
                <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${stat.color} mt-0.5`}>
                  {stat.value}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 flex items-center justify-center">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Conflict Alert Banner */}
      {summary.activeConflicts > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {summary.activeConflicts} Spatial Utility Conflict(s) Detected
              </div>
              <div className="text-xs text-amber-300/80">
                Scheduled roadworks overlap with metro or water pipe excavations. Permits held until coordination plan is signed off.
              </div>
            </div>
          </div>
          <Link
            to="/admin/construction"
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex-shrink-0"
          >
            Review Conflicts
          </Link>
        </div>
      )}

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Spatial Intelligence Map & Category Breakdown */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <OperationsMap
            issues={issues}
            selectedIssueId={selectedIssue?._id || selectedIssue?.id}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
          />

          {/* Category Distribution Card */}
          <div className="p-5 rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" /> Defect Category Distribution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {dashboardData?.categoryStats?.map((cat) => (
                <div key={cat._id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold truncate">
                    {cat._id?.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xl font-extrabold text-white font-mono">{cat.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Triage & Recent Intake */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <QuickTriagePanel
            activeIssue={selectedIssue}
            onTriageComplete={loadData}
          />

          {/* Recent Grievance Intake Stream */}
          <div className="p-5 rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-xl space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Recent Intake Feed
              </h3>
              <Link to="/admin/issues" className="text-xs font-semibold text-blue-400 hover:underline">
                All Issues
              </Link>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[340px] pr-1">
              {issues.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No recent issues found.</div>
              ) : (
                issues.slice(0, 6).map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedIssue(item)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedIssue?._id === item._id
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400">{item.referenceCode}</span>
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
    </div>
  );
};
