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
  ShieldCheck,
  Camera,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { OperationsMap } from '../../components/console/OperationsMap';
import { QuickTriagePanel } from '../../components/console/QuickTriagePanel';
import { adminService, AdminDashboardData } from '../../services/adminService';

export const AdminDashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [approvedOrders, setApprovedOrders] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        (w: any) => w.status === 'VERIFIED' || w.status === 'RESOLVED'
      );
      setApprovedOrders(verified);
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            NMC Municipal Command & Operations Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Central Command & Spatial Triage
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time civic defect telemetry, algorithmic risk prioritization, and contractor dispatch for Nagpur.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] hover:bg-slate-800 text-slate-300 hover:text-white transition-all shadow-sm"
            title="Refresh dashboard telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/admin/verification"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            Verify Repairs ({approvedOrders.length} Closed)
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-3xl bg-[#0f172a]/80 backdrop-blur border border-white/[0.08] flex items-center justify-between shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </div>
                <div className={`text-2xl sm:text-3xl font-black font-mono mt-0.5 ${card.color}`}>
                  {card.value}
                </div>
              </div>
              <div className={`p-3 rounded-2xl border ${card.bg} ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Utility Conflict Alert Banner */}
      {summary.activeConflicts > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
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
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex-shrink-0 self-start sm:self-auto"
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
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0f172a]/80 backdrop-blur border border-white/[0.08] shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" /> Defect Category Distribution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {dashboardData?.categoryStats?.map((cat) => (
                <div key={cat._id} className="p-3 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-1">
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
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0f172a]/80 backdrop-blur border border-white/[0.08] shadow-xl space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
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
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedIssue?._id === item._id
                        ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-400/30'
                        : 'bg-slate-950/60 border-white/[0.06] hover:border-slate-700'
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

      {/* ================= APPROVED & ACKNOWLEDGED REPAIRS SHOWCASE SECTION ================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0f172a]/80 backdrop-blur-xl border border-emerald-500/30 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg sm:text-xl font-black text-white">
                Approved & Acknowledged Before/After Repairs
              </h2>
              <Badge variant="success" size="sm">
                {approvedOrders.length} Verified Closed
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Closed work orders with officially inspected Before & After photographic evidence.
            </p>
          </div>

          <Link
            to="/admin/verification"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 self-start sm:self-auto"
          >
            Open Verification Workbench <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {approvedOrders.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-white/[0.06] space-y-2">
            <Camera className="w-8 h-8 text-slate-600 mx-auto" />
            <div>No repairs have been approved yet. Inspect pending work orders in the verification workbench.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedOrders.slice(0, 3).map((wo) => {
              const initialPhoto =
                wo.issueId?.evidencePhotos?.[0] ||
                wo.issueId?.initialDetectionFrame ||
                (Array.isArray(wo.issueId?.evidencePhotos) && wo.issueId?.evidencePhotos.length > 0
                  ? wo.issueId?.evidencePhotos[0]
                  : null);

              const repairPhoto =
                wo.evidenceIds?.[0]?.fileUrl ||
                wo.evidenceIds?.[0]?.mediaUrl ||
                (typeof wo.evidenceIds?.[0] === 'string' && wo.evidenceIds?.[0]?.startsWith('/')
                  ? wo.evidenceIds?.[0]
                  : null) ||
                wo.completionEvidenceUrl;

              const verifierName = wo.verifiedById?.name || 'Chief Quality Engineer';

              return (
                <div
                  key={wo._id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400">{wo.workOrderNumber}</span>
                      <Badge variant="success" size="sm">
                        RESOLVED
                      </Badge>
                    </div>

                    <div className="text-xs font-bold text-white truncate">{wo.issueId?.title || 'Defect Repaired'}</div>

                    {/* Side-by-Side Before/After Photo Thumbnails */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Before</div>
                        <div className="aspect-video rounded-xl bg-slate-900 border border-white/[0.08] overflow-hidden">
                          {initialPhoto ? (
                            <img src={initialPhoto} alt="Before" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600">No Photo</div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">After</div>
                        <div className="aspect-video rounded-xl bg-slate-900 border border-emerald-500/40 overflow-hidden ring-1 ring-emerald-500/20">
                          {repairPhoto ? (
                            <img src={repairPhoto} alt="After" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600">No Photo</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px]">
                    <span className="text-emerald-300 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" /> {verifierName}
                    </span>
                    <Link to="/admin/verification" className="text-blue-400 font-bold hover:underline">
                      Inspect Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
