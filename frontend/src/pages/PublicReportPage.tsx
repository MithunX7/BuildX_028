import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FilePlus,
  MapPin,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Sparkles,
  Zap,
  Trash2,
  Layers,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { issueService } from '../services/issueService';

const CATEGORY_OPTIONS = [
  {
    id: 'POTHOLE',
    label: 'Pothole / Road Crater',
    desc: 'Cavities, deep ruts, depressions on road carriageway',
    sla: '24h SLA',
    icon: AlertTriangle,
    accent: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
  },
  {
    id: 'ROAD_SURFACE_DAMAGE',
    label: 'Cracked / Uneven Asphalt',
    desc: 'Alligator cracking, peeling bituminous surface, edge breaks',
    sla: '48h SLA',
    icon: Layers,
    accent: 'from-blue-500/20 to-sky-500/10 text-blue-400 border-blue-500/30',
  },
  {
    id: 'GARBAGE_ACCUMULATION',
    label: 'Garbage & Solid Waste Dump',
    desc: 'Overflowing bins, roadside open waste, stagnant debris',
    sla: '12h SLA',
    icon: Trash2,
    accent: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'STREETLIGHT_FAULT',
    label: 'Broken Streetlight / Dark Spot',
    desc: 'Non-functional luminaires, exposed cables, knocked poles',
    sla: '24h SLA',
    icon: Zap,
    accent: 'from-yellow-500/20 to-amber-500/10 text-yellow-300 border-yellow-500/30',
  },
  {
    id: 'ROAD_OBSTRUCTION',
    label: 'Excavation & Obstruction',
    desc: 'Unmarked utility trenches, pipeline cuts, construction debris',
    sla: '18h SLA',
    icon: Clock,
    accent: 'from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/30',
  },
  {
    id: 'DAMAGED_ASSET',
    label: 'Damaged Public Asset',
    desc: 'Open manhole chambers, broken median dividers, signboards',
    sla: '24h SLA',
    icon: ShieldCheck,
    accent: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
  },
];

export const PublicReportPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState('POTHOLE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addressText, setAddressText] = useState('Wardha Road, Near Sai Mandir Metro Pillar 142, Nagpur');
  const [coordinates, setCoordinates] = useState<[number, number]>([79.0754, 21.1092]);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(12);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIssue, setSubmittedIssue] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-request GPS on mount
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
          setIsDetectingLocation(false);
        },
        { timeout: 8000 }
      );
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setImageBase64(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const selectedCategoryObj = CATEGORY_OPTIONS.find((c) => c.id === category);
      const newIssue = await issueService.createCitizenReport({
        category,
        title: title || `Reported ${selectedCategoryObj?.label || category} Defect`,
        description: description || 'Citizen reported municipal infrastructure defect needing repair.',
        coordinates,
        addressText,
        imageBase64: imageBase64 || undefined,
      });

      setSubmittedIssue(newIssue);
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      const msg = err.response?.data?.error?.message || err.message || 'Unable to submit grievance. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6 sm:space-y-8 relative">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-full max-w-lg h-[250px] bg-blue-600/10 blur-[90px] rounded-full" />

      {/* Header */}
      <div className="text-center space-y-2 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/30 text-xs font-bold text-blue-300">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Nagpur Municipal Grievance Ingestion
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Report Infrastructure Defect
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          Submit photo proof and GPS coordinates to dispatch NMC engineering repair teams.
        </p>
      </div>

      {submittedIssue ? (
        <div className="p-6 sm:p-10 rounded-3xl bg-[#0f172a]/90 backdrop-blur-xl border border-emerald-500/40 shadow-2xl text-center space-y-6 animate-in zoom-in-95 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/10">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
              Official Grievance Registered
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-mono">
              {submittedIssue.referenceCode}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Your defect has been logged and assigned priority{' '}
              <strong className="text-amber-400 font-mono">{submittedIssue.priorityLevel}</strong> with immediate municipal SLA dispatch.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-white/[0.08] text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Category:</span>
              <span className="font-bold text-white">{submittedIssue.category?.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Location:</span>
              <span className="font-medium text-slate-200 truncate max-w-[280px]">{submittedIssue.location?.addressText}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Turnaround SLA:</span>
              <span className="font-mono text-amber-400 font-bold">Within 24 Hours</span>
            </div>
            {submittedIssue.evidencePhotos?.[0] && (
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Photo Proof:</span>
                <span className="text-emerald-400 font-mono text-[11px] font-bold">Attached & Audited ✓</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              size="md"
              variant="primary"
              onClick={() => navigate(`/issues/${submittedIssue._id || submittedIssue.id}`)}
              className="font-bold"
            >
              Track Real-Time Status
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <Button
              size="md"
              variant="secondary"
              onClick={() => {
                setSubmittedIssue(null);
                setTitle('');
                setDescription('');
                removePhoto();
              }}
            >
              Report Another Defect
            </Button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-8 rounded-3xl bg-[#0f172a]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-6 relative z-10"
        >
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Category Selection Grid */}
          <div className="space-y-2.5">
            <label className="block text-xs font-extrabold text-slate-200 uppercase tracking-wider">
              1. Select Defect Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = category === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setCategory(opt.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-400/40'
                        : 'bg-slate-900/60 border-white/[0.06] hover:border-slate-600 hover:bg-slate-900'
                    }`}
                  >
                    <div className={`p-2 rounded-xl border flex-shrink-0 bg-gradient-to-br ${opt.accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-white truncate">{opt.label}</span>
                        <span className="text-[10px] font-mono text-slate-400">{opt.sla}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight line-clamp-2">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Photo Upload Area */}
          <div className="space-y-2.5">
            <label className="block text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>2. Photographic Evidence</span>
              <span className="text-[10px] font-normal text-slate-400 font-mono">JPG, PNG, WebP</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950 group aspect-video max-h-56">
                <img src={imagePreview} alt="Defect Evidence" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex items-end justify-between p-3.5">
                  <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Photo attached
                  </div>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="p-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-white/[0.12] hover:border-blue-500/50 bg-slate-900/40 hover:bg-slate-900/80 cursor-pointer transition-all text-center space-y-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                    Click to capture or upload photo
                  </span>
                  <p className="text-[11px] text-slate-400">
                    High-quality photos enable engineers to instantly verify repairs
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Location Telemetry */}
          <div className="space-y-2.5">
            <label className="block text-xs font-extrabold text-slate-200 uppercase tracking-wider">
              3. Defect Location & Landmark
            </label>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  Automatic Location Geocoding
                </span>
                {isDetectingLocation ? (
                  <span className="text-[10px] text-sky-400 animate-pulse font-mono font-bold">Acquiring GPS...</span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    GPS Locked (±{gpsAccuracy || 10}m)
                  </span>
                )}
              </div>

              <input
                type="text"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="Landmark, road name, ward in Nagpur..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/[0.1] text-white text-xs focus:outline-none focus:border-blue-500"
              />
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                <span>Lat: {coordinates[1].toFixed(4)}° N</span>
                <span>•</span>
                <span>Lng: {coordinates[0].toFixed(4)}° E</span>
              </div>
            </div>
          </div>

          {/* Step 4: Description (Optional/Short) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-extrabold text-slate-200 uppercase tracking-wider">
              4. Additional Details (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep crater near hospital gate"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/[0.1] text-white text-xs focus:outline-none focus:border-blue-500"
            />
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra context for field crew..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/[0.1] text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Registering Complaint...</span>
              ) : (
                <>
                  <FilePlus className="w-4 h-4" />
                  Submit Official NMC Grievance
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
