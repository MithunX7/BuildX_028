"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  MapPin,
  Camera,
  Send,
  CheckCircle2,
  Layers,
  ArrowLeft,
  Sparkles,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CivicDefectCategory } from "@/types/detection";

const CATEGORIES: { id: CivicDefectCategory; label: string; desc: string }[] = [
  { id: "POTHOLE", label: "Pothole / Road Damage", desc: "Asphalt depressions, craters, broken carriageway" },
  { id: "GARBAGE_ACCUMULATION", label: "Garbage / Bio-Waste", desc: "Overflowing bins, uncollected street trash" },
  { id: "STREETLIGHT_FAULT", label: "Streetlight Fault", desc: "Non-functional lights, broken poles, dark stretches" },
  { id: "ROAD_OBSTRUCTION", label: "Road & Pipe Obstruction", desc: "Excavation debris, barricades, pipeline cuts" },
  { id: "DAMAGED_ASSET", label: "Damaged Public Asset", desc: "Broken dividers, damaged manhole covers, guardrails" },
];

export default function CitizenReportPage() {
  const [selectedCategory, setSelectedCategory] = useState<CivicDefectCategory>("POTHOLE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [addressText, setAddressText] = useState("Wardha Road, Near Sai Mandir, Laxmi Nagar");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    referenceCode: string;
    isDuplicate: boolean;
    duplicateReason?: string;
    priorityLevel: string;
  } | null>(null);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/detection/analyze-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneHint: selectedCategory === "POTHOLE" ? "scene-1-pothole" : "scene-2-garbage",
          addressText,
          sourceType: "LIVE_CAMERA",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({
          referenceCode: data.data.canonicalIssue.referenceCode,
          isDuplicate: !data.data.isNewIssue,
          duplicateReason: data.data.matchReason,
          priorityLevel: data.data.canonicalIssue.priorityLevel,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <span className="text-xs font-bold text-sky-400">NMC Citizen Grievance Portal</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Report a Civic Infrastructure Grievance
          </h1>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Our AI-powered platform automatically consolidates duplicate complaints and calculates risk prioritization for prompt municipal dispatch.
          </p>
        </div>

        {result ? (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Grievance Reference Code
              </span>
              <div className="text-3xl font-black text-white font-mono">{result.referenceCode}</div>
            </div>

            {result.isDuplicate ? (
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs max-w-md mx-auto flex items-center gap-3 text-left">
                <Layers className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <strong className="block text-white">Consolidated with Existing Issue:</strong>
                  {result.duplicateReason}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs max-w-md mx-auto">
                <strong className="block text-white">New Canonical Issue Registered</strong>
                Calculated Priority: <Badge variant="warning">{result.priorityLevel}</Badge>
              </div>
            )}

            <div className="pt-4 flex justify-center gap-3">
              <Button size="sm" variant="secondary" onClick={() => setResult(null)}>
                Submit Another Grievance
              </Button>
              <Link href="/operations/dashboard">
                <Button size="sm" variant="primary">
                  View in Operations Console
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Select Defect Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{cat.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{cat.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Grievance Details
              </label>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Summary e.g. Severe asphalt pothole near Sai Mandir Metro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide additional details regarding the hazard, traffic disruption, or nearby landmark..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                3. Location / Landmark
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-sky-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button type="submit" size="lg" variant="primary" className="w-full" isLoading={isSubmitting}>
                <Send className="w-4 h-4 mr-1.5" />
                Submit Grievance
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
