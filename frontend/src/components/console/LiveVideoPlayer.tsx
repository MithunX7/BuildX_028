import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Video,
  Camera,
  Play,
  Pause,
  Scan,
  AlertTriangle,
  Flame,
  Zap,
  Trash2,
  Construction,
  Layers,
  Sparkles,
  Compass,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { detectionService } from '../../services/detectionService';

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DemoSceneDef {
  id: string;
  sceneName: string;
  category: 'POTHOLE' | 'ROAD_SURFACE_DAMAGE' | 'GARBAGE_ACCUMULATION' | 'STREETLIGHT_FAULT' | 'ROAD_OBSTRUCTION' | 'CONSTRUCTION_CONFLICT' | 'DAMAGED_ASSET';
  label: string;
  description: string;
  confidence: number;
  boundingBox: BoundingBox;
  estimatedSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: {
    coordinates: [number, number];
    addressText: string;
    zoneName: string;
  };
}

export const DEMO_SCENES: DemoSceneDef[] = [
  {
    id: 'scene-1-pothole',
    sceneName: 'Scene 1: Severe Asphalt Pothole on Wardha Road',
    category: 'POTHOLE',
    label: 'Severe Pothole / Carriageway Crater',
    description: 'Deep asphalt depression with exposed sub-base measuring approx 60cm diameter. High hazard for two-wheelers.',
    confidence: 0.89,
    boundingBox: { ymin: 0.55, xmin: 0.35, ymax: 0.86, xmax: 0.65 },
    estimatedSeverity: 'HIGH',
    location: {
      coordinates: [79.0754, 21.1092],
      addressText: 'Wardha Road, Near Sai Mandir Metro Pillar 142',
      zoneName: 'Laxmi Nagar Zone',
    },
  },
  {
    id: 'scene-2-garbage',
    sceneName: 'Scene 2: Overflowing Waste Dump at Sitabuldi',
    category: 'GARBAGE_ACCUMULATION',
    label: 'Commercial Waste & Garbage Accumulation',
    description: 'Unattended municipal bio-waste pile obstructing pedestrian pathway outside commercial market complex.',
    confidence: 0.94,
    boundingBox: { ymin: 0.42, xmin: 0.58, ymax: 0.84, xmax: 0.92 },
    estimatedSeverity: 'MEDIUM',
    location: {
      coordinates: [79.0825, 21.1465],
      addressText: 'Sitabuldi Main Road, Opp Metro Station Gate 2',
      zoneName: 'Dharampeth Zone',
    },
  },
  {
    id: 'scene-3-streetlight',
    sceneName: 'Scene 3: Broken Luminaire / Pole on Central Avenue',
    category: 'STREETLIGHT_FAULT',
    label: 'Damaged Luminaire Pole & Wiring Hazard',
    description: 'Streetlight fixture with exposed wiring and bent luminaire casing. Nighttime illumination blackout in sector.',
    confidence: 0.86,
    boundingBox: { ymin: 0.15, xmin: 0.42, ymax: 0.68, xmax: 0.58 },
    estimatedSeverity: 'MEDIUM',
    location: {
      coordinates: [79.0903, 21.1524],
      addressText: 'Central Avenue, Near Agrasen Square',
      zoneName: 'Gandhibagh Zone',
    },
  },
  {
    id: 'scene-4-obstruction',
    sceneName: 'Scene 4: Uncoordinated Pipe Excavation Debris',
    category: 'ROAD_OBSTRUCTION',
    label: 'Excavation Debris & Pipe Barrier Obstruction',
    description: 'Unmarked water pipeline excavation mound and steel barrier blocking 1.5 traffic lanes without warning signboards.',
    confidence: 0.92,
    boundingBox: { ymin: 0.48, xmin: 0.22, ymax: 0.88, xmax: 0.78 },
    estimatedSeverity: 'CRITICAL',
    location: {
      coordinates: [79.0621, 21.1418],
      addressText: 'West High Court Road, Dharampeth Junction',
      zoneName: 'Dharampeth Zone',
    },
  },
  {
    id: 'scene-5-duplicate',
    sceneName: 'Scene 5: Re-surveying Wardha Road Pothole (Duplicate)',
    category: 'POTHOLE',
    label: 'Pothole Re-Detection (Proximity Candidate)',
    description: 'Second patrol detection of the existing Wardha Road crater within 12 meters of previous report.',
    confidence: 0.91,
    boundingBox: { ymin: 0.52, xmin: 0.38, ymax: 0.84, xmax: 0.68 },
    estimatedSeverity: 'HIGH',
    location: {
      coordinates: [79.0756, 21.1094],
      addressText: 'Wardha Road, Metro Pillar 143 (Opposite Sai Mandir)',
      zoneName: 'Laxmi Nagar Zone',
    },
  },
];

interface LiveVideoPlayerProps {
  onNewDetection?: (result: any) => void;
}

export const LiveVideoPlayer: React.FC<LiveVideoPlayerProps> = ({ onNewDetection }) => {
  const [activeMode, setActiveMode] = useState<'SCENES' | 'WEBCAM'>('SCENES');
  const [activeScene, setActiveScene] = useState<DemoSceneDef>(DEMO_SCENES[0]);
  const [isContinuousScanning, setIsContinuousScanning] = useState(true);
  const [isProcessingFrame, setIsProcessingFrame] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<any | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const runFrameAnalysis = useCallback(
    async (sceneToAnalyze: DemoSceneDef) => {
      setIsProcessingFrame(true);
      try {
        let imageBase64: string | undefined;

        if (activeMode === 'WEBCAM' && videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
          }
        }

        const data = await detectionService.analyzeFrame({
          sceneHint: sceneToAnalyze.id,
          coordinates: sceneToAnalyze.location.coordinates,
          addressText: sceneToAnalyze.location.addressText,
          sourceType: activeMode === 'WEBCAM' ? 'LIVE_CAMERA' : 'PATROL_VIDEO_FEED',
          imageBase64,
        });

        if (data.detected) {
          const result = {
            detected: true,
            defect: {
              category: sceneToAnalyze.category,
              confidence: sceneToAnalyze.confidence,
              boundingBox: sceneToAnalyze.boundingBox,
              label: sceneToAnalyze.label,
              description: sceneToAnalyze.description,
              estimatedSeverity: sceneToAnalyze.estimatedSeverity,
            },
            detectionRecord: data.detection,
            matchedIssueId: data.canonicalIssue?.id || data.canonicalIssue?._id,
            canonicalIssue: data.canonicalIssue,
            isNewIssue: data.isNewIssue,
            priorityScore: data.canonicalIssue?.priorityScore,
            priorityReasons: data.canonicalIssue?.priorityReasons,
          };
          setLatestAnalysis(result);
          if (onNewDetection) {
            onNewDetection(result);
          }
        }
      } catch (err) {
        console.error('Frame analysis error:', err);
      } finally {
        setIsProcessingFrame(false);
      }
    },
    [activeMode, onNewDetection]
  );

  useEffect(() => {
    runFrameAnalysis(activeScene);
  }, [activeScene, runFrameAnalysis]);

  useEffect(() => {
    if (!isContinuousScanning) return;
    const timer = setInterval(() => {
      runFrameAnalysis(activeScene);
    }, 4500);
    return () => clearInterval(timer);
  }, [isContinuousScanning, activeScene, runFrameAnalysis]);

  const toggleWebcam = async () => {
    if (webcamActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setWebcamActive(false);
      setActiveMode('SCENES');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setWebcamActive(true);
        setActiveMode('WEBCAM');
      } catch (err) {
        alert('Webcam access unavailable or permission denied. Falling back to simulated patrol feed.');
        setWebcamActive(false);
        setActiveMode('SCENES');
      }
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'POTHOLE':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'GARBAGE_ACCUMULATION':
        return <Trash2 className="w-4 h-4 text-emerald-400" />;
      case 'STREETLIGHT_FAULT':
        return <Zap className="w-4 h-4 text-sky-400" />;
      case 'ROAD_OBSTRUCTION':
        return <Construction className="w-4 h-4 text-rose-400" />;
      default:
        return <Layers className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-[#111c44] border border-slate-700/80 shadow-2xl p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 overflow-hidden relative">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Live Video Detection Feed
              </h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 uppercase tracking-wide">
                <Sparkles className="w-3 h-3" /> AI Vision
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">
              Real-time classification, bounding box tracking, and spatial duplicate clustering
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <Button
            size="sm"
            variant={isContinuousScanning ? 'primary' : 'secondary'}
            onClick={() => setIsContinuousScanning(!isContinuousScanning)}
          >
            {isContinuousScanning ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
            {isContinuousScanning ? 'Auto (4s)' : 'Paused'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            isLoading={isProcessingFrame}
            onClick={() => runFrameAnalysis(activeScene)}
          >
            <Scan className="w-3.5 h-3.5 mr-1 text-sky-400" />
            Analyze
          </Button>

          <Button
            size="sm"
            variant={webcamActive ? 'danger' : 'secondary'}
            onClick={toggleWebcam}
          >
            <Camera className="w-3.5 h-3.5 mr-1" />
            {webcamActive ? 'Stop Cam' : 'Camera'}
          </Button>
        </div>
      </div>

      {/* Main Video & Bounding Box Viewport */}
      <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
        <canvas ref={canvasRef} className="hidden" />

        {activeMode === 'WEBCAM' ? (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />

            <div className="relative w-full h-full flex flex-col justify-end p-4 sm:p-6">
              <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-slate-950 to-transparent flex items-center justify-center">
                <div className="w-1 h-24 border-r-2 border-dashed border-amber-400/40" />
              </div>

              <div className="z-10 bg-slate-900/85 backdrop-blur border border-slate-800 rounded-xl p-3 max-w-sm sm:max-w-md shadow-xl">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-400 mb-0.5">
                  <Compass className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{activeScene.location.addressText}</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white leading-snug">{activeScene.label}</div>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1 line-clamp-2">{activeScene.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Bounding Box Overlay */}
        {latestAnalysis?.defect && (
          <div
            className="absolute border-2 border-amber-400 bg-amber-500/10 rounded-lg transition-all duration-300 pointer-events-none shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-in fade-in"
            style={{
              top: `${latestAnalysis.defect.boundingBox.ymin * 100}%`,
              left: `${latestAnalysis.defect.boundingBox.xmin * 100}%`,
              width: `${(latestAnalysis.defect.boundingBox.xmax - latestAnalysis.defect.boundingBox.xmin) * 100}%`,
              height: `${(latestAnalysis.defect.boundingBox.ymax - latestAnalysis.defect.boundingBox.ymin) * 100}%`,
            }}
          >
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-300" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-300" />
            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-300" />
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-300" />

            <div className="absolute -top-6 left-0 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 whitespace-nowrap">
              <span>{latestAnalysis.defect.category.replace('_', ' ')}</span>
              <span className="opacity-80 font-mono">
                {Math.round(latestAnalysis.defect.confidence * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Video HUD Overlays */}
        <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 flex flex-col gap-1.5 pointer-events-none">
          <div className="px-2.5 py-0.5 sm:py-1 rounded-lg bg-slate-950/80 backdrop-blur border border-slate-800 text-[10px] sm:text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>NMC-PATROL-04</span>
            <span className="text-slate-600">|</span>
            <span>FPS: 30</span>
          </div>

          <div className="px-2.5 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur border border-slate-800 text-[10px] font-mono text-sky-400">
            GPS: {activeScene.location.coordinates[1].toFixed(3)}°N, {activeScene.location.coordinates[0].toFixed(3)}°E
          </div>
        </div>

        {/* Duplicate / New Match Status Banner */}
        {latestAnalysis && (
          <div className="absolute bottom-2.5 sm:bottom-4 right-2.5 sm:right-4 animate-in slide-in-from-bottom-2 fade-in">
            {latestAnalysis.isNewIssue ? (
              <Badge variant="danger" size="sm" className="shadow-lg backdrop-blur bg-rose-950/90 border-rose-500/50 text-[10px] sm:text-xs">
                <Flame className="w-3 h-3 mr-1" /> NEW CANONICAL ISSUE
              </Badge>
            ) : (
              <Badge variant="warning" size="sm" className="shadow-lg backdrop-blur bg-amber-950/90 border-amber-500/50 text-[10px] sm:text-xs">
                <Layers className="w-3 h-3 mr-1" /> MATCHED TO EXISTING ISSUE
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Multi-Problem Demonstration Scene Switcher */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-400 px-1">
          <span>Demonstration Scenes</span>
          <span className="text-blue-400 text-[10px] sm:text-[11px]">Select scenario to test</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {DEMO_SCENES.map((scene) => {
            const isSelected = activeScene.id === scene.id && activeMode === 'SCENES';
            return (
              <button
                key={scene.id}
                onClick={() => {
                  setActiveMode('SCENES');
                  setActiveScene(scene);
                }}
                className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-1 rounded-lg bg-slate-900 border border-slate-800">
                    {getCategoryIcon(scene.category)}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {Math.round(scene.confidence * 100)}%
                  </span>
                </div>
                <div>
                  <div className={`text-[11px] sm:text-xs font-bold leading-tight line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {scene.category.replace('_', ' ')}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {scene.location.zoneName}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
