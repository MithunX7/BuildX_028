import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  TrendingUp,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  Gauge,
  Route,
  Car,
  ShieldAlert,
  Users,
  Building2,
  Wrench,
} from 'lucide-react';
import {
  maintenanceService,
  RoadData,
  MaintenanceDashboard,
  ScoreBreakdown,
} from '../../services/maintenanceService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<string, { badge: string; dot: string; row: string }> = {
  CRITICAL: { badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',    dot: 'bg-rose-400',   row: 'border-l-4 border-l-rose-500' },
  HIGH:     { badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', dot: 'bg-orange-400', row: 'border-l-4 border-l-orange-400' },
  MEDIUM:   { badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', dot: 'bg-yellow-400', row: 'border-l-4 border-l-yellow-400' },
  LOW:      { badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',   dot: 'bg-slate-400',  row: 'border-l-4 border-l-slate-600' },
};

const densityLabel = (v: string) => v.charAt(0) + v.slice(1).toLowerCase();

// ─── Budget Card ──────────────────────────────────────────────────────────────

const BudgetCard: React.FC<{ budget: MaintenanceDashboard['budget'] }> = ({ budget }) => {
  const usedPct = budget.availableBudget > 0
    ? Math.min((budget.usedBudget / budget.availableBudget) * 100, 100)
    : 0;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#0f172a]/90 border border-white/[0.08] shadow-xl space-y-5">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <IndianRupee className="w-4 h-4 text-emerald-400" />
        Budget Overview
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Original Budget',  value: `₹${budget.originalBudget}L`,    sub: 'Full allocation',        color: 'text-white' },
          { label: 'Budget Cut',       value: `-${budget.reductionPercentage}%`, sub: 'Fiscal constraint',      color: 'text-rose-400' },
          { label: 'Available',        value: `₹${budget.availableBudget}L`,    sub: '60% of original',        color: 'text-sky-400' },
          { label: 'Remaining',        value: `₹${Math.max(budget.remainingBudget, 0).toFixed(1)}L`, sub: 'After recommended repairs', color: 'text-emerald-400' },
        ].map((item) => (
          <div key={item.label} className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</div>
            <div className={`text-xl font-black font-mono ${item.color}`}>{item.value}</div>
            <div className="text-[10px] text-slate-600">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Used budget progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold">Budget Used</span>
          <span className="font-mono font-bold text-white">₹{budget.usedBudget}L / ₹{budget.availableBudget}L</span>
        </div>
        <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-700"
            style={{ width: `${usedPct}%` }}
          />
        </div>
        <div className="text-[10px] text-slate-500">{usedPct.toFixed(1)}% of available budget committed to repairs</div>
      </div>
    </div>
  );
};

// ─── Priority Summary Cards ───────────────────────────────────────────────────

const PrioritySummaryCards: React.FC<{ summary: MaintenanceDashboard['prioritySummary'] }> = ({ summary }) => {
  const cards = [
    { label: 'Critical',     value: summary.critical,     icon: Flame,         color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/30' },
    { label: 'High',         value: summary.high,         icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
    { label: 'Medium',       value: summary.medium,       icon: TrendingUp,    color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    { label: 'Low',          value: summary.low,          icon: Route,         color: 'text-slate-400',  bg: 'bg-slate-500/10 border-slate-500/30' },
    { label: 'Recommended',  value: summary.recommended,  icon: CheckCircle2,  color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { label: 'Deferred',     value: summary.deferred,     icon: XCircle,       color: 'text-slate-400',  bg: 'bg-slate-700/30 border-slate-600/30' },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className={`p-3.5 rounded-2xl border ${bg} flex flex-col items-center gap-1.5 text-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
          <div className={`text-2xl font-black font-mono ${color}`}>{value}</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Road Row (table row for recommended/deferred) ────────────────────────────

const RoadRow: React.FC<{ road: RoadData; onClick: () => void }> = ({ road, onClick }) => {
  const pc = PRIORITY_COLOR[road.priorityLevel] || PRIORITY_COLOR.LOW;
  const isRecommended = road.maintenanceDecision === 'RECOMMENDED';

  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer transition-colors hover:bg-white/[0.04] ${pc.row}`}
    >
      <td className="px-4 py-3">
        <div className="font-semibold text-white text-sm">{road.roadName}</div>
        <div className="text-[11px] text-slate-400">{road.location}</div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${pc.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
          {road.priorityLevel}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="font-mono font-bold text-white text-sm">{road.priorityScore}</span>
        <span className="text-slate-500 text-xs">/110</span>
      </td>
      <td className="px-4 py-3 text-right font-mono font-semibold text-sky-300 text-sm">
        ₹{road.estimatedRepairCost}L
      </td>
      <td className="px-4 py-3 text-right">
        {isRecommended ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Repair
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-700/40 border border-slate-600/30 text-[11px] font-bold text-slate-400">
            <XCircle className="w-3 h-3" /> Deferred
          </span>
        )}
      </td>
    </tr>
  );
};

// ─── Road Detail Modal ────────────────────────────────────────────────────────

const RoadDetailModal: React.FC<{
  road: RoadData;
  breakdown: ScoreBreakdown | null;
  onClose: () => void;
}> = ({ road, breakdown, onClose }) => {
  const pc = PRIORITY_COLOR[road.priorityLevel] || PRIORITY_COLOR.LOW;
  const isRecommended = road.maintenanceDecision === 'RECOMMENDED';

  const rows = [
    { label: 'Traffic',           value: densityLabel(road.trafficDensity),     icon: Car,        score: breakdown?.trafficScore },
    { label: 'Accident History',  value: densityLabel(road.accidentHistory),     icon: ShieldAlert,score: breakdown?.accidentScore },
    { label: 'Public Complaints', value: `${road.complaintCount} complaints`,    icon: Users,      score: breakdown?.complaintScore },
    { label: 'Economic Importance',value: densityLabel(road.economicImportance), icon: Building2,  score: breakdown?.economicScore },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-[#0d1526] border border-white/[0.12] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 border-b border-white/[0.08] flex items-start justify-between gap-3 ${isRecommended ? 'bg-emerald-900/20' : 'bg-slate-900/50'}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Route className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Road Details</span>
            </div>
            <h2 className="text-lg font-black text-white">{road.roadName}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{road.location}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Score summary */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/60 border border-white/[0.08]">
            <div className="text-center">
              <div className={`text-4xl font-black font-mono ${pc.badge.includes('rose') ? 'text-rose-400' : pc.badge.includes('orange') ? 'text-orange-400' : pc.badge.includes('yellow') ? 'text-yellow-400' : 'text-slate-400'}`}>
                {road.priorityScore}
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">/ 110</div>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    road.priorityLevel === 'CRITICAL' ? 'bg-rose-500' :
                    road.priorityLevel === 'HIGH' ? 'bg-orange-400' :
                    road.priorityLevel === 'MEDIUM' ? 'bg-yellow-400' : 'bg-slate-500'
                  }`}
                  style={{ width: `${(road.priorityScore / 110) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${pc.badge}`}>
                  {road.priorityLevel}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  isRecommended
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-700/40 border-slate-600/30 text-slate-400'
                }`}>
                  {isRecommended ? '✓ RECOMMENDED FOR REPAIR' : '✗ DEFERRED'}
                </span>
              </div>
            </div>
          </div>

          {/* Factor breakdown */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              Why this road is {road.priorityLevel === 'CRITICAL' || road.priorityLevel === 'HIGH' ? 'HIGH PRIORITY' : 'lower priority'}
            </div>

            {rows.map(({ label, value, icon: Icon, score }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-white/[0.06]">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 flex-shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-slate-500 font-semibold">{label}</div>
                  <div className="text-sm font-bold text-white">{value}</div>
                </div>
                {score !== undefined && (
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs font-mono font-bold text-sky-400">+{score}</div>
                    <div className="text-[10px] text-slate-600">pts</div>
                  </div>
                )}
              </div>
            ))}

            {/* Reasoning bullet list from service */}
            {breakdown?.reasons && (
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/[0.06] space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Score Breakdown</div>
                {breakdown.reasons.map((r, i) => (
                  <div key={i} className={`text-xs font-semibold flex items-start gap-2 ${r.startsWith('✓') ? 'text-emerald-300' : 'text-slate-400'}`}>
                    <span className="flex-shrink-0 mt-0.5">{r.slice(0, 1)}</span>
                    <span>{r.slice(2)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Priority Score</span>
                  <span className="font-mono font-black text-sky-400 text-sm">{road.priorityScore} / 110</span>
                </div>
              </div>
            )}
          </div>

          {/* Additional details */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Damage Severity',   value: densityLabel(road.damageSeverity) },
              { label: 'Estimated Cost',    value: `₹${road.estimatedRepairCost}L` },
              { label: 'Road Status',       value: densityLabel(road.status.replace('_', ' ')) },
              { label: 'Decision Reason',   value: road.decisionReason || '—', wide: true },
            ].map(({ label, value, wide }) => (
              <div key={label} className={`p-3 rounded-xl bg-slate-950/50 border border-white/[0.06] ${wide ? 'col-span-2' : ''}`}>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</div>
                <div className="text-xs font-semibold text-white mt-0.5">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const AdminSmartMaintenancePage: React.FC = () => {
  const [dashboard, setDashboard] = useState<MaintenanceDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedRoad, setSelectedRoad] = useState<RoadData | null>(null);
  const [selectedBreakdown, setSelectedBreakdown] = useState<ScoreBreakdown | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editBudget, setEditBudget] = useState(false);
  const [newBudget, setNewBudget] = useState(100);
  const [showDeferred, setShowDeferred] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await maintenanceService.getDashboard();
      setDashboard(data);
      setNewBudget(data.budget?.originalBudget ?? 100);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to load maintenance dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCalculate = async () => {
    setIsCalculating(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await maintenanceService.calculatePlan();
      setSuccessMsg(res.message || 'Maintenance plan updated successfully.');
      await load();
    } catch (e: any) {
      setErrorMsg(e.message || 'Calculation failed');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleBudgetUpdate = async () => {
    try {
      await maintenanceService.updateBudget(newBudget);
      setSuccessMsg('Budget updated. Click Recalculate to apply.');
      setEditBudget(false);
      await load();
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  const openRoadDetail = async (road: RoadData) => {
    setSelectedRoad(road);
    setSelectedBreakdown(null);
    setModalLoading(true);
    try {
      const res = await maintenanceService.getRoadDetail(road._id);
      setSelectedBreakdown(res.scoreBreakdown);
    } catch {
      /* show modal without breakdown */
    } finally {
      setModalLoading(false);
    }
  };

  const recommended = (dashboard?.roads || []).filter((r) => r.maintenanceDecision === 'RECOMMENDED');
  const deferred = (dashboard?.roads || []).filter((r) => r.maintenanceDecision === 'DEFERRED');

  const tableHead = (cols: string[]) => (
    <thead>
      <tr className="border-b border-white/[0.08]">
        {cols.map((c) => (
          <th
            key={c}
            className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest"
          >
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm font-semibold">Loading Smart Maintenance data…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-bold text-amber-400 mb-2">
            <Gauge className="w-3.5 h-3.5" />
            Budget-Constrained Priority Planning
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Smart Maintenance
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            40% budget reduction applied. System ranks roads by traffic, accident history, complaints, and economic importance — then selects repairs within available budget.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center flex-shrink-0">
          <button
            onClick={load}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2"
          >
            {isCalculating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Wrench className="w-4 h-4" />
            )}
            {isCalculating ? 'Calculating…' : 'Recalculate Maintenance Plan'}
          </button>
        </div>
      </div>

      {/* ── Status Messages ── */}
      {successMsg && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-sm font-semibold text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          {successMsg}
          <button onClick={() => setSuccessMsg(null)} className="ml-auto text-emerald-500 hover:text-emerald-300"><X className="w-4 h-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-sm font-semibold text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          {errorMsg}
          <button onClick={() => setErrorMsg(null)} className="ml-auto text-rose-500 hover:text-rose-300"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ── Algorithm Explainer Banner ── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-900/20 to-orange-900/10 border border-amber-500/20 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-amber-400 flex-shrink-0">
          <Info className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">How It Works</span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          {[
            { icon: Car,        label: 'Traffic',   formula: 'Low=10 / Med=20 / High=30' },
            { icon: ShieldAlert,label: 'Accidents', formula: 'Low=10 / Med=20 / High=30' },
            { icon: Users,      label: 'Complaints',formula: '0-5=5 / 6-15=10 / 16-30=20 / 31+=25' },
            { icon: Building2,  label: 'Economic',  formula: 'Low=10 / Med=20 / High=25' },
          ].map(({ icon: Icon, label, formula }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <Icon className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300 font-bold">{label}:</span>
              <span className="text-slate-400 font-mono">{formula}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
            <span className="text-amber-300 font-bold">Max Score = 110 → Budget selection greedy sort</span>
          </div>
        </div>
      </div>

      {/* ── Budget Section ── */}
      {dashboard?.budget && (
        <div className="space-y-3">
          <BudgetCard budget={dashboard.budget} />

          {/* Budget editor */}
          <div className="flex items-center gap-3">
            {!editBudget ? (
              <button
                onClick={() => setEditBudget(true)}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
              >
                Change original budget
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-semibold">Budget (₹L):</label>
                <input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.12] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  min={1}
                />
                <button
                  onClick={handleBudgetUpdate}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditBudget(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            {dashboard.liveComplaintCount > 0 && (
              <span className="text-xs text-slate-500 font-semibold">
                · {dashboard.liveComplaintCount} live citizen complaints synced from Issue tracker
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Priority Summary ── */}
      {dashboard?.prioritySummary && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            Priority Summary
          </div>
          <PrioritySummaryCards summary={dashboard.prioritySummary} />
        </div>
      )}

      {/* ── RECOMMENDED Table ── */}
      <div className="rounded-3xl bg-[#0f172a]/90 border border-emerald-500/25 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-black text-white">Recommended for Repair</h2>
              <p className="text-[11px] text-slate-500">Roads selected within ₹{dashboard?.budget?.availableBudget}L available budget</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300">
            {recommended.length} roads
          </span>
        </div>

        {recommended.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No roads recommended yet. Click <strong className="text-amber-400">Recalculate Maintenance Plan</strong> to run the algorithm.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {tableHead(['Road / Location', 'Priority', 'Score', 'Repair Cost', 'Decision'])}
              <tbody className="divide-y divide-white/[0.04]">
                {recommended.map((road) => (
                  <RoadRow key={road._id} road={road} onClick={() => openRoadDetail(road)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DEFERRED Table ── */}
      <div className="rounded-3xl bg-[#0f172a]/90 border border-white/[0.08] shadow-xl overflow-hidden">
        <button
          className="w-full px-5 py-4 border-b border-white/[0.08] flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
          onClick={() => setShowDeferred(!showDeferred)}
        >
          <div className="flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-slate-400" />
            <div className="text-left">
              <h2 className="text-sm font-black text-white">Deferred Repairs</h2>
              <p className="text-[11px] text-slate-500">Roads not funded in this budget cycle</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-slate-700/40 border border-slate-600/30 text-xs font-bold text-slate-400">
              {deferred.length} roads
            </span>
            {showDeferred ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>

        {showDeferred && (
          deferred.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No deferred roads.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                {tableHead(['Road / Location', 'Priority', 'Score', 'Repair Cost', 'Reason'])}
                <tbody className="divide-y divide-white/[0.04]">
                  {deferred.map((road) => (
                    <tr
                      key={road._id}
                      onClick={() => openRoadDetail(road)}
                      className={`cursor-pointer transition-colors hover:bg-white/[0.04] ${PRIORITY_COLOR[road.priorityLevel]?.row ?? ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white text-sm">{road.roadName}</div>
                        <div className="text-[11px] text-slate-400">{road.location}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${PRIORITY_COLOR[road.priorityLevel]?.badge ?? ''}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_COLOR[road.priorityLevel]?.dot ?? ''}`} />
                          {road.priorityLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono font-bold text-white text-sm">{road.priorityScore}</span>
                        <span className="text-slate-500 text-xs">/110</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-sky-300 text-sm">
                        ₹{road.estimatedRepairCost}L
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="text-[11px] text-slate-400 truncate">{road.decisionReason || 'Budget exhausted'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* ── Road Detail Modal ── */}
      {selectedRoad && (
        <RoadDetailModal
          road={selectedRoad}
          breakdown={modalLoading ? null : selectedBreakdown}
          onClose={() => { setSelectedRoad(null); setSelectedBreakdown(null); }}
        />
      )}
    </div>
  );
};
