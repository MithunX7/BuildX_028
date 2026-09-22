import React, { useState, useEffect } from 'react';
import {
  HardHat,
  AlertTriangle,
  Calendar,
  Building2,
  MapPin,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { constructionService } from '../services/constructionService';

export const ConstructionPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [pData, cData] = await Promise.all([
        constructionService.getProjects(),
        constructionService.getConflicts(),
      ]);
      setProjects(pData || []);
      setConflicts(cData?.conflicts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <HardHat className="w-6 h-6 text-amber-400" />
            Dig-Once Utility Coordination & Conflict Detection
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Prevent newly resurfaced roads from being dug up by synchronizing roadworks with water, metro, and telecom projects.
          </p>
        </div>
      </div>

      {/* Active Conflict Warning Banner (PRD FR-56) */}
      {conflicts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-300 space-y-2">
          <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 animate-bounce" />
            <span>Active Spatial Excavation Conflict Detected</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-300/90 leading-relaxed">
            MahaMetro utility pipeline excavation coincides with scheduled road resurfacing on West High Court Road.
            Excavation permit is held until inter-agency joint work plan is approved.
          </p>
        </div>
      )}

      {/* Main Grid: Planned Projects & Conflicts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Planned Infrastructure Works */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-400" />
            Registered Utility & Road Projects ({projects.length})
          </div>

          <div className="space-y-2.5">
            {projects.map((proj) => (
              <div
                key={proj._id}
                className="p-4 rounded-2xl bg-[#111c44] border border-slate-700/80 space-y-2 shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">{proj.name}</span>
                  <Badge variant="outline" size="sm">
                    {proj.status}
                  </Badge>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-blue-400" />
                    <span>Agency: {proj.agencyName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sky-400" />
                    <span>Location: {proj.roadName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>
                      Schedule: {new Date(proj.startDate).toLocaleDateString()} –{' '}
                      {new Date(proj.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spatial Conflict Alerts */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Detected Inter-Agency Conflicts ({conflicts.length})
          </div>

          <div className="space-y-2.5">
            {conflicts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#111c44] border border-slate-800 text-center text-xs text-slate-400">
                No active conflicts detected. All road excavation schedules are synchronized.
              </div>
            ) : (
              conflicts.map((conf) => (
                <div
                  key={conf._id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/40 space-y-2 shadow-lg"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                      {conf.conflictType || 'Excavation Conflict'}
                    </span>
                    <Badge variant="danger" size="sm">
                      ACTION REQUIRED
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{conf.description}</p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Compass className="w-3 h-3" /> Spatial radius: 50m overlap
                    </span>
                    <span className="text-slate-500 font-mono">
                      Detected: {new Date(conf.detectedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
