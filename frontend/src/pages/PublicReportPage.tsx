import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FilePlus,
  MapPin,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { issueService } from '../services/issueService';

export const PublicReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('POTHOLE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addressText, setAddressText] = useState('Wardha Road, Near Sai Mandir Metro Pillar 142, Nagpur');
  const [coordinates, setCoordinates] = useState<[number, number]>([79.0754, 21.1092]);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(12);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIssue, setSubmittedIssue] = useState<any | null>(null);

  // Auto-request GPS on mount per PRD FR-09 & FR-10
  useEffect(() => {
    if ('geolocation' in navigator) {
      setIsDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates([pos.coords.longitude, pos.coords.latitude]);
          setGpsAccuracy(Math.round(pos.coords.accuracy));
          setIsDetectingLocation(false);
        },
        () => {
          // Fallback to default Nagpur location
          setIsDetectingLocation(false);
        },
        { timeout: 8000 }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newIssue = await issueService.createCitizenReport({
        category,
        title: title || `Reported ${category.replace('_', ' ')} Hazard`,
        description: description || 'Citizen reported municipal road defect needing urgent repair.',
        coordinates,
        addressText,
      });

      setSubmittedIssue(newIssue);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          <FilePlus className="w-7 h-7 text-blue-400" />
          Report Infrastructure Defect
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Help NMC repair potholes, streetlights, and hazards. AI automatically identifies severity and routes to the responsible department.
        </p>
      </div>

      {submittedIssue ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#111c44] border border-emerald-500/50 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Complaint Received & AI Classified
            </div>
            <h2 className="text-2xl font-black text-white">
              Defect ID: {submittedIssue.referenceCode}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Your report has been assigned Priority <strong className="text-amber-400">{submittedIssue.priorityLevel}</strong> and routed to the municipal repair team.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="font-bold text-white">{submittedIssue.category.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Location:</span>
              <span className="font-semibold text-slate-200">{submittedIssue.location?.addressText}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target Inspection SLA:</span>
              <span className="font-mono text-amber-400 font-bold">Within 24 Hours</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              size="md"
              variant="primary"
              onClick={() => navigate('/issues')}
            >
              Track on Public Map
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              size="md"
              variant="secondary"
              onClick={() => {
                setSubmittedIssue(null);
                setTitle('');
                setDescription('');
              }}
            >
              Report Another Defect
            </Button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-7 rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-2xl space-y-5"
        >
          {/* Automatic Location Display (PRD FR-10 to FR-12) */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-400" />
                Automatic Location Detection
              </span>
              {isDetectingLocation ? (
                <span className="text-[10px] text-sky-400 animate-pulse font-mono">Acquiring GPS...</span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-mono">
                  GPS Locked (±{gpsAccuracy || 10}m)
                </span>
              )}
            </div>

            <div className="text-xs text-slate-200 font-medium">{addressText}</div>
            <div className="text-[10px] text-slate-500 font-mono">
              Coordinates: {coordinates[1].toFixed(4)}° N, {coordinates[0].toFixed(4)}° E
            </div>
          </div>

          {/* Defect Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Defect Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="POTHOLE">Pothole / Road Depression</option>
              <option value="GARBAGE_ACCUMULATION">Garbage & Solid Waste Dump</option>
              <option value="STREETLIGHT_FAULT">Broken Streetlight / Exposed Wire</option>
              <option value="ROAD_OBSTRUCTION">Carriageway Obstruction / Pipeline Mound</option>
              <option value="ROAD_SURFACE_DAMAGE">Cracked or Uneven Asphalt</option>
              <option value="DAMAGED_ASSET">Damaged Divider / Bus Stop</option>
            </select>
          </div>

          {/* Title / Summary */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Issue Title / Landmark Summary
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Deep pothole near school entrance on Wardha Road"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Description / Hazard Details
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe the severity, depth, water presence, or traffic disruption..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Photo / Video Upload Preview */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Photo / Video Evidence (PRD FR-05 & FR-06)
            </label>
            <div className="p-5 rounded-2xl bg-slate-950 border border-dashed border-slate-700 text-center space-y-2">
              <Camera className="w-8 h-8 text-blue-400 mx-auto" />
              <div className="text-xs font-semibold text-white">Camera Capture or Upload Evidence</div>
              <p className="text-[11px] text-slate-500">
                Supports JPG, PNG, MP4 up to 50MB. AI automatically analyzes frames for damage severity.
              </p>
            </div>
          </div>

          <Button
            size="lg"
            variant="primary"
            className="w-full font-bold text-sm"
            isLoading={isSubmitting}
            type="submit"
          >
            Submit Grievance to NMC
          </Button>
        </form>
      )}
    </div>
  );
};
