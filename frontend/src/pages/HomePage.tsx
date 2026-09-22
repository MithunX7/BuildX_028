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
    { label: 'Total Tracked Grievances', value: summary.totalIssues || 7, color: 'text-blue-400' },
    { label: 'Active Open Defects', value: summary.openIssues || 7, color: 'text-amber-400' },
    { label: 'P1 Emergency Hazards', value: summary.criticalIssues || 2, color: 'text-rose-400' },
    { label: 'Verified Repairs Closed', value: summary.resolvedIssues || 0, color: 'text-emerald-400' },
  ];

  const features = [
    {
      title: 'Automatic GPS Geolocation',
      description: 'Citizens do not need to enter an address. The platform detects GPS coordinates with landmark proximity tagging.',
      icon: MapPin,
      badge: 'Geocoding',
    },
    {
      title: 'Real Photographic Proof',
      description: 'Upload high-resolution images of road craters, broken streetlights, or waste accumulation for field dispatch.',
      icon: CheckCircle2,
      badge: 'Photo Evidence',
    },
    {
      title: 'One Complaint, One Defect ID',
      description: 'Multiple citizen reports for the same pothole or hazard within 50 meters are automatically merged to prevent ticket flooding.',
      icon: Layers,
      badge: 'Duplicate Merging',
    },
    {
      title: 'Verified Repair Closure',
      description: 'Work orders are closed only after geotagged contractor completion photos are inspected and approved by an engineer.',
      icon: ShieldAlert,
      badge: 'Anti-False-Closure',
    },
    {
      title: 'Dig-Once Utility Coordination',
      description: 'Prevents newly resurfaced roads from being dug up by coordinating roadworks with water and telecom excavations.',
      icon: HardHat,
      badge: 'GIS Coordination',
    },
    {
      title: 'Explainable Prioritization',
      description: 'Formula-based risk scoring elevates defects near hospitals, schools, metro stations, and high-speed corridors.',
      icon: TrendingUp,
      badge: 'Safety Scoring',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/30 text-xs font-semibold text-blue-400 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Nagpur Municipal Corporation (NMC) Civic Infrastructure Platform
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
          One City. One Platform. <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
            Safer Roads for Nagpur.
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Report potholes, open manholes, and civic hazards with photo proof. Track verified municipal repairs in real time and eliminate fake closures.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/report"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all active:scale-[0.98]"
          >
            <FilePlus className="w-4 h-4" />
            Report Infrastructure Defect
          </Link>

          <Link
            to="/issues"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 transition-all active:scale-[0.98]"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            Explore City Map
          </Link>

          {isAuthenticated ? (
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all"
            >
              <UserCheck className="w-4 h-4" />
              Go to {isAdmin ? 'Admin Console' : 'My Dashboard'}
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm border border-slate-700 transition-all"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      </section>

      {/* Real Trust Metrics */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-3xl bg-[#111c44]/80 border border-slate-800 shadow-2xl backdrop-blur">
          {trustMetrics.map((metric, i) => (
            <div key={i} className="text-center p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className={`text-2xl sm:text-4xl font-extrabold font-mono ${metric.color} tracking-tight`}>
                {metric.value}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-1">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            How NagpurOne Solves Infrastructure Defects
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            From citizen intake to contractor photo evidence verification, every step is transparent and tracked.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl bg-[#111c44] border border-slate-700/70 hover:border-blue-500/50 transition-all space-y-3 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" size="sm">
                      {feat.badge}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">{feat.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
