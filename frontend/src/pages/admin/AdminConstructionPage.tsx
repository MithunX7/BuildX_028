import React, { useState, useEffect } from 'react';
import {
  HardHat,
  AlertTriangle,
  Calendar,
  Building2,
  MapPin,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { constructionService } from '../../services/constructionService';

export const AdminConstructionPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pData, cData] = await Promise.all([
        constructionService.getProjects(),
        constructionService.getConflicts(),
      ]);
      setProjects(pData || []);
      setConflicts(cData?.conflicts || []);
    } catch (err) {
      console.error('Failed to load construction data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <HardHat className="w-7 h-7 text-amber-400" />
            Dig-Once Utility Coordination & Conflict Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Prevent newly resurfaced roads from being dug up by synchronizing roadworks with water, metro, and telecom projects.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all self-start sm:self-auto"
          title="Refresh projects"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Active Conflict Warning Banner */}
      {conflicts.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-300 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-base font-extrabold text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 animate-bounce" />
            <span>Active Spatial Excavation Conflict Warning</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-300/90 leading-relaxed">
            MahaMetro utility pipeline excavation coincides with scheduled road resurfacing on West High Court Road.
            Excavation permit is held until inter-agency joint work plan is signed off.
          </p>
        </div>
      )}

      {/* Main Grid: Projects & Conflicts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Planned Infrastructure Works */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-400" />
            Registered Utility & Road Projects ({projects.length})
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-[#111c44] rounded-2xl border border-slate-800">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-[#111c44] rounded-2xl border border-slate-800">
              No construction projects currently registered.
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((proj) => (
                <div
                  key={proj._id}
                  className="p-4 rounded-2xl bg-[#111c44] border border-slate-700/80 space-y-2.5 shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white">{proj.name}</span>
                    <Badge variant="outline" size="sm">
                      {proj.status}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Agency: {proj.agencyName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      <span>Location: {proj.roadName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Timeline: {new Date(proj.startDate).toLocaleDateString()} –{' '}
                        {new Date(proj.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spatial Conflicts List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Detected Inter-Agency Conflicts ({conflicts.length})
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-[#111c44] rounded-2xl border border-slate-800">
              Analyzing spatial overlaps...
            </div>
          ) : conflicts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-[#111c44] rounded-2xl border border-slate-800">
              No spatial construction conflicts detected.
            </div>
          ) : (
            <div className="space-y-3">
              {conflicts.map((conf) => (
                <div
                  key={conf._id}
                  className="p-4 rounded-2xl bg-[#111c44] border-2 border-amber-500/40 space-y-2 shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-amber-300">{conf.conflictType || 'Spatial Overlap'}</span>
                    <Badge variant="warning" size="sm">
                      {conf.severity || 'HIGH'}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {conf.description ||
                      'Excavation cut scheduled within 100 meters of planned road resurfacing project.'}
                  </p>

                  <div className="pt-1 text-[11px] text-slate-400 font-mono">
                    Status: <span className="text-amber-400 font-bold">{conf.isResolved ? 'RESOLVED' : 'PERMIT HELD'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
