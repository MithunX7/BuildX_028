export type CivicDefectCategory =
  | "POTHOLE"
  | "GARBAGE_ACCUMULATION"
  | "STREETLIGHT_FAULT"
  | "ROAD_OBSTRUCTION"
  | "DAMAGED_ASSET";

export interface BoundingBox {
  ymin: number; // 0.0 - 1.0 (normalized percentage from top)
  xmin: number; // 0.0 - 1.0 (normalized percentage from left)
  ymax: number; // 0.0 - 1.0 (normalized percentage from top)
  xmax: number; // 0.0 - 1.0 (normalized percentage from left)
}

export type DetectionSourceType = "LIVE_CAMERA" | "PATROL_VIDEO_FEED" | "SURVEY_STREAM";

export type MatchStatus = "NEW_CANONICAL_ISSUE" | "LINKED_DUPLICATE" | "PENDING_VERIFICATION";

export interface DetectionEvent {
  id: string;
  sourceType: DetectionSourceType;
  detectedClass: CivicDefectCategory;
  confidence: number;
  boundingBox: BoundingBox;
  location?: {
    coordinates: [number, number]; // [lng, lat]
    addressText?: string;
  };
  frameSnapshotUrl?: string;
  matchedIssueId?: string;
  matchedIssueRef?: string;
  matchStatus: MatchStatus;
  matchConfidence?: number;
  detectedAt: string;
}

export interface FrameAnalysisResult {
  detected: boolean;
  defect?: {
    category: CivicDefectCategory;
    confidence: number;
    boundingBox: BoundingBox;
    label: string;
    description: string;
    estimatedSeverity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  };
  detectionRecord?: DetectionEvent;
  matchedIssueId?: string;
  isNewIssue: boolean;
  priorityScore?: number;
  priorityReasons?: string[];
  departmentCode?: string;
}
