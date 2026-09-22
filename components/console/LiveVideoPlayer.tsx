"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DEMO_SCENES, DemoSceneDef } from "@/lib/detection-service";
import { FrameAnalysisResult } from "@/types/detection";

interface LiveVideoPlayerProps {
  onNewDetection?: (result: FrameAnalysisResult) => void;
}

export function LiveVideoPlayer({ onNewDetection }: LiveVideoPlayerProps) {
  const [activeMode, setActiveMode] = useState<"SCENES" | "WEBCAM">("SCENES");
  const [activeScene, setActiveScene] = useState<DemoSceneDef>(DEMO_SCENES[0]);
  const [isContinuousScanning, setIsContinuousScanning] = useState(true);
  const [isProcessingFrame, setIsProcessingFrame] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<FrameAnalysisResult | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Trigger frame analysis
  const runFrameAnalysis = useCallback(async (sceneToAnalyze: DemoSceneDef) => {
    setIsProcessingFrame(true);
    try {
      let imageBase64: string | undefined;

      // If webcam, grab real frame from canvas
      if (activeMode === "WEBCAM" && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          imageBase64 = canvas.toDataURL("image/jpeg", 0.8);
        }
      }

      const res = await fetch("/api/detection/analyze-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneHint: sceneToAnalyze.id,
          coordinates: sceneToAnalyze.location.coordinates,
          addressText: sceneToAnalyze.location.addressText,
          sourceType: activeMode === "WEBCAM" ? "LIVE_CAMERA" : "PATROL_VIDEO_FEED",
          imageBase64,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const result: FrameAnalysisResult = {
          detected: true,
          defect: {
            category: sceneToAnalyze.category,
            confidence: sceneToAnalyze.confidence,
            boundingBox: sceneToAnalyze.boundingBox,
            label: sceneToAnalyze.label,
            description: sceneToAnalyze.description,
            estimatedSeverity: sceneToAnalyze.estimatedSeverity,
          },
          detectionRecord: data.data.detection,
          matchedIssueId: data.data.canonicalIssue?.id,
          isNewIssue: data.data.isNewIssue,
          priorityScore: data.data.canonicalIssue?.priorityScore,
          priorityReasons: data.data.canonicalIssue?.priorityReasons,
        };
        setLatestAnalysis(result);
        if (onNewDetection) {
          onNewDetection(result);
        }
      }
    } catch (err) {
      console.error("Frame analysis error:", err);
    } finally {
      setIsProcessingFrame(false);
    }
  }, [activeMode, onNewDetection]);

  // Initial analysis on mount and when scene changes
  useEffect(() => {
    runFrameAnalysis(activeScene);
  }, [activeScene, runFrameAnalysis]);

  // Continuous patrol scan timer
  useEffect(() => {
    if (!isContinuousScanning) return;
    const timer = setInterval(() => {
      runFrameAnalysis(activeScene);
    }, 4000);
    return () => clearInterval(timer);
  }, [isContinuousScanning, activeScene, runFrameAnalysis]);

  // Webcam stream start/stop
  const toggleWebcam = async () => {
    if (webcamActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setWebcamActive(false);
      setActiveMode("SCENES");
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
        setActiveMode("WEBCAM");
      } catch (err) {
        alert("Webcam access unavailable or permission denied. Falling back to simulated patrol feed.");
        setWebcamActive(false);
        setActiveMode("SCENES");
      }
    }
  };

  // Icon selector per category
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "POTHOLE":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "GARBAGE_ACCUMULATION":
        return <Trash2 className="w-4 h-4 text-emerald-400" />;
      case "STREETLIGHT_FAULT":
        return <Zap className="w-4 h-4 text-sky-400" />;
      case "ROAD_OBSTRUCTION":
        return <Construction className="w-4 h-4 text-rose-400" />;
      default:
        return <Layers className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 flex flex-col gap-4 overflow-hidden relative">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Live Video Detection Centerpiece
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 uppercase tracking-wide">
                <Sparkles className="w-3 h-3" /> AI Vision Active
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time multi-problem classification, bounding box tracking, and geospatial duplicate matching
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isContinuousScanning ? "primary" : "secondary"}
            onClick={() => setIsContinuousScanning(!isContinuousScanning)}
          >
            {isContinuousScanning ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
            {isContinuousScanning ? "Auto Ingesting (4s)" : "Paused"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            isLoading={isProcessingFrame}
            onClick={() => runFrameAnalysis(activeScene)}
          >
            <Scan className="w-3.5 h-3.5 mr-1 text-sky-400" />
            Analyze Frame
          </Button>

          <Button
            size="sm"
            variant={webcamActive ? "danger" : "secondary"}
            onClick={toggleWebcam}
          >
            <Camera className="w-3.5 h-3.5 mr-1" />
            {webcamActive ? "Stop Camera" : "Live Camera"}
          </Button>
        </div>
      </div>

      {/* Main Video & Bounding Box Viewport */}
      <div className="relative w-full aspect-video rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden group shadow-inner">
        {/* Hidden Canvas for Webcam Grabs */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Video / Simulated Street Survey Rendering */}
        {activeMode === "WEBCAM" ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden">
            {/* Visual Grid & Street Backdrop Simulation */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
            
            {/* Street Scene Graphic Representation */}
            <div className="relative w-full h-full flex flex-col justify-end p-8">
              {/* Road Horizon */}
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-900 to-transparent flex items-center justify-center">
                <div className="w-1 h-32 border-r-2 border-dashed border-amber-400/40" />
              </div>

              {/* Scene Specific Graphic Element */}
              <div className="z-10 bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-4 max-w-md shadow-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
                  <Compass className="w-3.5 h-3.5" /> {activeScene.location.addressText}
                </div>
                <div className="text-sm font-bold text-white">{activeScene.label}</div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{activeScene.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Bounding Box Overlay */}
        {latestAnalysis?.defect && (
          <div
            className="absolute border-2 border-amber-400 bg-amber-500/10 rounded-xl transition-all duration-300 pointer-events-none shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-in fade-in zoom-in-95"
            style={{
              top: `${latestAnalysis.defect.boundingBox.ymin * 100}%`,
              left: `${latestAnalysis.defect.boundingBox.xmin * 100}%`,
              width: `${(latestAnalysis.defect.boundingBox.xmax - latestAnalysis.defect.boundingBox.xmin) * 100}%`,
              height: `${(latestAnalysis.defect.boundingBox.ymax - latestAnalysis.defect.boundingBox.ymin) * 100}%`,
            }}
          >
            {/* Corner Target Markers */}
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-300" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-300" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber-300" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-300" />

            {/* Label Tag over Bounding Box */}
            <div className="absolute -top-7 left-0 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
              <span>{latestAnalysis.defect.category.replace("_", " ")}</span>
              <span className="opacity-80 font-mono">
                {Math.round(latestAnalysis.defect.confidence * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Video HUD Overlays */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          <div className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>STREAM: NMC-PATROL-UNIT-04</span>
            <span className="text-slate-500">|</span>
            <span>FPS: 30.0</span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur border border-slate-800 text-[11px] font-mono text-sky-400">
            GPS: {activeScene.location.coordinates[1].toFixed(4)}° N, {activeScene.location.coordinates[0].toFixed(4)}° E
          </div>
        </div>

        {/* Duplicate / New Match Status Banner */}
        {latestAnalysis && (
          <div className="absolute bottom-4 right-4 animate-in slide-in-from-bottom-2 fade-in">
            {latestAnalysis.isNewIssue ? (
              <Badge variant="danger" size="md" className="shadow-lg backdrop-blur bg-rose-950/90 border-rose-500/50">
                <Flame className="w-3.5 h-3.5" /> NEW CANONICAL ISSUE LOGGED
              </Badge>
            ) : (
              <Badge variant="purple" size="md" className="shadow-lg backdrop-blur bg-purple-950/90 border-purple-500/50">
                <Layers className="w-3.5 h-3.5" /> MATCHED TO EXISTING ISSUE ({latestAnalysis.matchedIssueId})
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Multi-Problem Demonstration Scene Switcher Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
          <span>Demonstration Scenes (Multi-Problem Test Scenarios)</span>
          <span className="text-blue-400 text-[11px]">Click to switch patrol scene</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {DEMO_SCENES.map((scene) => {
            const isSelected = activeScene.id === scene.id && activeMode === "SCENES";
            return (
              <button
                key={scene.id}
                onClick={() => {
                  setActiveMode("SCENES");
                  setActiveScene(scene);
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10 scale-[1.02]"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    {getCategoryIcon(scene.category)}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {Math.round(scene.confidence * 100)}%
                  </span>
                </div>
                <div>
                  <div className={`text-xs font-bold leading-snug line-clamp-1 ${isSelected ? "text-white" : "text-slate-300"}`}>
                    {scene.category.replace("_", " ")}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
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
}
