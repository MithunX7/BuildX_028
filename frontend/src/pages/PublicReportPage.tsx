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
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { issueService } from '../services/issueService';

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
      const newIssue = await issueService.createCitizenReport({
        category,
        title: title || `Reported ${category.replace('_', ' ')} Hazard`,
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
    <div className="max-w-2xl mx-auto py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2.5">
          <FilePlus className="w-7 h-7 text-blue-400" />
          Report Infrastructure Defect
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Help NMC repair potholes, streetlights, and hazards. Submit photographic evidence and exact location for rapid municipal dispatch.
        </p>
      </div>

      {submittedIssue ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#111c44] border border-emerald-500/50 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Complaint Registered Successfully
            </div>
            <h2 className="text-2xl font-black text-white">
              Defect ID: {submittedIssue.referenceCode}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Your report has been assigned Priority <strong className="text-amber-400">{submittedIssue.priorityLevel}</strong> and routed to the municipal engineering team.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="font-bold text-white">{submittedIssue.category?.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Location:</span>
              <span className="font-semibold text-slate-200">{submittedIssue.location?.addressText}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target SLA:</span>
              <span className="font-mono text-amber-400 font-bold">Within 24 Hours</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              size="md"
              variant="primary"
              onClick={() => navigate(`/issues/${submittedIssue._id || submittedIssue.id}`)}
            >
              Track Defect Progress
              <ArrowRight className="w-4 h-4 ml-1" />
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
          className="p-5 sm:p-7 rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-2xl space-y-5"
        >
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Automatic Location Display */}
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

            <input
              type="text"
              required
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              placeholder="Landmark, Street name, Ward area in Nagpur..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            />
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
              <option value="ROAD_OBSTRUCTION">Carriageway Obstruction / Pipeline Excavation</option>
              <option value="ROAD_SURFACE_DAMAGE">Cracked or Uneven Asphalt</option>
              <option value="DAMAGED_ASSET">Damaged Divider / Signage / Manhole</option>
            </select>
          </div>

          {/* Title / Summary */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Issue Title / Landmark
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
              Description & Hazard Details
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe defect depth, water presence, traffic disruption..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Photo Evidence Upload (REAL File Picker) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Photo Evidence (Optional but Recommended)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-blue-500/50 bg-slate-950 p-2 group">
                <img
                  src={imagePreview}
                  alt="Evidence Preview"
                  className="w-full max-h-56 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-2xl bg-slate-950 border border-dashed border-slate-700 hover:border-blue-500 text-center space-y-2 cursor-pointer transition-colors"
              >
                <Camera className="w-8 h-8 text-blue-400 mx-auto" />
                <div className="text-xs font-semibold text-white">Click to Select or Capture Photo</div>
                <p className="text-[11px] text-slate-500">
                  Upload JPG, PNG, or WebP photo evidence of the infrastructure defect.
                </p>
              </div>
            )}
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
