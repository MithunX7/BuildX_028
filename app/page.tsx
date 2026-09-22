import Link from "next/link";
import { Shield, AlertCircle, Wrench, GitMerge, FileCheck, HardHat } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              NMC
            </div>
            <div>
              <span className="font-bold text-lg text-white block leading-tight">Nagpur Civic Co-Ord</span>
              <span className="text-xs text-slate-400">Infrastructure & Grievance Resolution</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/report"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
            >
              Report an Issue
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            Nagpur Smart City Initiative
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Coordinated Civic Infrastructure & Maintenance
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Consolidating multi-channel citizen complaints into canonical issues, explainable risk prioritization, department routing, and evidence-verified work order closures.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/report"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/30 text-base"
            >
              Submit Citizen Grievance
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors text-base"
            >
              Operations & Triage
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <GitMerge className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white">Smart Duplicate Consolidation</h3>
            <p className="text-sm text-slate-400">
              Groups repeated complaints from helplines, WhatsApp, and the portal into single canonical issues with explainable proximity matching.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white">Explainable Prioritization</h3>
            <p className="text-sm text-slate-400">
              Ranks urgent defects based on proximity to schools, hospitals, and junctions rather than raw complaint counts alone.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-white">Evidence-Based Verification</h3>
            <p className="text-sm text-slate-400">
              Field workers upload geotagged repair photos. Verifiers can approve, reject, or reopen incomplete repairs with recorded audit notes.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        Nagpur Municipal Corporation Civic Infrastructure Coordination MVP • {new Date().getFullYear()}
      </footer>
    </div>
  );
}
