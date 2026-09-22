"use client";

import React, { useState, useEffect } from "react";
import {
  HardHat,
  AlertTriangle,
  Calendar,
  Building2,
  MapPin,
  Plus,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ProjectItem {
  _id: string;
  name: string;
  agencyName: string;
  purpose: string;
  roadName: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface ConflictItem {
  _id: string;
  projectId: { name: string; agencyName: string; roadName: string; startDate: string; endDate: string };
  issueId?: { referenceCode: string; title: string; category: string; priorityLevel: string };
  conflictType: string;
  severity: string;
  explanation: string;
  status: string;
}

export default function ConstructionConflictsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [agencyName, setAgencyName] = useState("OCW Water Works");
  const [purpose, setPurpose] = useState("Underground distribution valve installation");
  const [roadName, setRoadName] = useState("Central Avenue Stretch");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/construction-projects"),
        fetch("/api/construction-projects/conflicts"),
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      if (pData.success) setProjects(pData.data.projects);
      if (cData.success) setConflicts(cData.data.conflicts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/construction-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          agencyName,
          purpose,
          roadName,
          coordinates: [79.0903, 21.1524],
          startDate: new Date(),
          endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          status: "PLANNED",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsNewProjectModalOpen(false);
        setProjectName("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <HardHat className="w-6 h-6 text-amber-400" />
            Construction Coordination & Spatial Conflict Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Detect spatial and temporal overlap between municipal utility road cuts and active road resurfacing projects to prevent redundant digging.
          </p>
        </div>

        <Button size="sm" variant="primary" onClick={() => setIsNewProjectModalOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Register Planned Project
        </Button>
      </div>

      {/* Active Conflict Alerts Banner */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          Detected Road Conflict Alerts
        </h2>

        {conflicts.map((conflict) => (
          <div
            key={conflict._id}
            className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="danger" size="sm">
                  {conflict.severity} SEVERITY CONFLICT
                </Badge>
                <span className="text-xs font-mono font-bold text-rose-300">
                  {conflict.projectId?.agencyName} vs {conflict.issueId?.referenceCode}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">{conflict.explanation}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sky-400" /> {conflict.projectId?.roadName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  Active Window: {new Date(conflict.projectId?.startDate).toLocaleDateString()} -{" "}
                  {new Date(conflict.projectId?.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <Button size="sm" variant="secondary" className="shrink-0">
              Coordinate Diversion
            </Button>
          </div>
        ))}
      </div>

      {/* Registered Projects Grid */}
      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-400" />
          Registered Municipal Infrastructure Projects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <Badge variant="info" size="sm">
                  {proj.agencyName}
                </Badge>
                <Badge variant="default" size="sm">
                  {proj.status}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{proj.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{proj.purpose}</p>
              </div>

              <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>{proj.roadName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(proj.startDate).toLocaleDateString()} -{" "}
                    {new Date(proj.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Project Registration Modal */}
      <Modal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        title="Register Planned Municipal Road Project"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Project Name</label>
            <input
              type="text"
              placeholder="e.g. Mahavitaran Underground Cable Laying"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Executing Agency</label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Road / Sector Location</label>
            <input
              type="text"
              value={roadName}
              onChange={(e) => setRoadName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Project Scope & Purpose</label>
            <textarea
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => setIsNewProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" isLoading={isSubmitting} onClick={handleCreateProject}>
              Register Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
