import React, { useState, useEffect } from 'react';
import { LiveVideoPlayer } from '../components/console/LiveVideoPlayer';
import { DetectionStream } from '../components/console/DetectionStream';
import { OperationsMap } from '../components/console/OperationsMap';
import { QuickTriagePanel } from '../components/console/QuickTriagePanel';
import { issueService } from '../services/issueService';
import { dashboardService } from '../services/dashboardService';
import { Flame, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [latestDetection, setLatestDetection] = useState<any | null>(null);
  const [summaryStats, setSummaryStats] = useState<any>({
    totalIssues: 0,
    openIssues: 0,
    criticalIssues: 0,
    resolvedIssues: 0,
    activeConflicts: 0,
  });

  const loadData = async () => {
    try {
      const [issueList, summaryData] = await Promise.all([
        issueService.getIssues(),
        dashboardService.getDashboardSummary(),
      ]);
      setIssues(issueList);
      if (issueList.length > 0 && !selectedIssue) {
        setSelectedIssue(issueList[0]);
      }
      if (summaryData?.summary) {
        setSummaryStats(summaryData.summary);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleNewDetection = (result: any) => {
    setLatestDetection(result);
    if (result.canonicalIssue) {
      setSelectedIssue(result.canonicalIssue);
      setIssues((prev) => {
        const id = result.canonicalIssue.id || result.canonicalIssue._id;
        const exists = prev.some((i) => (i._id || i.id) === id);
        if (exists) {
          return prev.map((i) => ((i._id || i.id) === id ? result.canonicalIssue : i));
        }
        return [result.canonicalIssue, ...prev];
      });
    }
  };

  const statCards = [
    {
      title: 'P1 Emergency Defects',
      value: summaryStats.criticalIssues,
      icon: Flame,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
    },
    {
      title: 'Open Active Issues',
      value: summaryStats.openIssues,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      title: 'Verified Repairs Closed',
      value: summaryStats.resolvedIssues,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      title: 'Resolution Rate',
      value: `${summaryStats.resolutionRatePercent || 0}%`,
      icon: Clock,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/30',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${stat.bg} backdrop-blur flex items-center justify-between shadow-sm`}
            >
              <div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-400">{stat.title}</div>
                <div className={`text-xl sm:text-2xl font-extrabold font-mono tracking-tight ${stat.color} mt-0.5`}>
                  {stat.value}
                </div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/60 flex items-center justify-center">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Command Center: Live Video Feed + Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Live Video Player (Col 7 on Desktop, Full Width on Mobile) */}
        <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-6">
          <LiveVideoPlayer onNewDetection={handleNewDetection} />
          <OperationsMap
            issues={issues}
            selectedIssueId={selectedIssue?._id || selectedIssue?.id}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
          />
        </div>

        {/* Right Column: Real-Time Stream & Quick Triage (Col 5 on Desktop, Full Width on Mobile) */}
        <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6">
          <QuickTriagePanel
            activeIssue={selectedIssue}
            onTriageComplete={loadData}
          />
          <DetectionStream
            latestDetection={latestDetection}
            onSelectIssue={(issueId) => {
              const match = issues.find((i) => (i._id || i.id) === issueId);
              if (match) setSelectedIssue(match);
            }}
          />
        </div>
      </div>
    </div>
  );
};
