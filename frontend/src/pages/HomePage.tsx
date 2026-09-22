import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Video,
  MapPin,
  Layers,
  CheckCircle2,
  HardHat,
  ArrowRight,
  TrendingUp,
  Activity,
  FilePlus,
  Compass,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const HomePage: React.FC = () => {
  const trustMetrics = [
    { label: 'Open Issues', value: '1,248', color: 'text-blue-400' },
    { label: 'P1 Emergencies', value: '36', color: 'text-rose-400' },
    { label: 'Repairs Completed', value: '8,910', color: 'text-emerald-400' },
    { label: 'Avg P1 Response Time', value: '4.8h', color: 'text-amber-400' },
  ];

  const features = [
    {
      title: 'AI Priority Detection',
      description: 'Photo or video is analyzed to detect defect severity and assign emergency priority (P1–P4) automatically.',
      icon: TrendingUp,
      badge: 'Formula-Driven',
    },
    {
      title: 'Automatic GPS Location',
      description: 'Citizens do not need to enter an address. The platform detects GPS coordinates with interactive map pin correction.',
      icon: MapPin,
      badge: 'Reverse Geocoding',
    },
    {
      title: 'Live Video + Photo Evidence',
      description: 'Upload high-resolution images, patrol video streams, or use live camera detection with bounding box overlays.',
      icon: Video,
      badge: 'Computer Vision',
    },
    {
      title: 'One Complaint, One Defect ID',
      description: 'Multiple citizen reports for the same pothole or broken streetlight are merged into one Defect ID with confirmation tracking.',
      icon: Layers,
      badge: 'Duplicate Merging',
    },
    {
      title: 'Verified Repair Closure',
      description: 'Work orders are closed only after geotagged before-and-after photo/video proof and officer sign-off.',
      icon: CheckCircle2,
      badge: 'Anti-False-Closure',
    },
    {
      title: 'Dig-Once Utility Coordination',
      description: 'Prevents newly resurfaced roads from being dug up by coordinating roadworks with water and telecom projects.',
      icon: HardHat,
      badge: 'GIS Conflict Engine',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/30 text-xs font-semibold text-blue-400 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Nagpur Municipal Corporation (NMC) Civic Innovation Platform
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
          One City. One Platform. <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
            Safer Roads for Nagpur.
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Report potholes, open manholes, and civic hazards with a photo or video. Track verified repairs in real time.
          See who is responsible and eliminate fake closures.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/report"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all active:scale-[0.98]"
          >
            <FilePlus className="w-4 h-4" />
            Report a Problem
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/operations/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#111c44] hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all active:scale-[0.98]"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            Live Operations Console
          </Link>

          <Link
            to="/issues"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium text-sm transition-all active:scale-[0.98]"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            Track My Complaint
          </Link>
        </div>
      </section>

      {/* Trust Metrics Grid (Section 10 of PRD) */}
      <section className="rounded-2xl sm:rounded-3xl bg-[#111c44]/70 border border-slate-700/80 p-6 sm:p-8 backdrop-blur shadow-2xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {trustMetrics.map((metric, i) => (
            <div key={i} className="space-y-1">
              <div className={`text-2xl sm:text-4xl font-extrabold tracking-tight font-mono ${metric.color}`}>
                {metric.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-400">{metric.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 6 Key Features of NagpurOne */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            End-to-End Civic Accountability Loop
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Unlike traditional complaint portals, NagpurOne guarantees 1 Defect ID, deterministic SLA prioritization,
            and independent verification before ticket closure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-[#111c44]/60 border border-slate-700/70 hover:border-blue-500/50 transition-all group flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" size="sm">
                      {feat.badge}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
