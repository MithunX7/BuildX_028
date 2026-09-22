import { apiClient } from './apiClient';

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DetectionEvent {
  id: string;
  sourceType: string;
  detectedClass: string;
  confidence: number;
  boundingBox: BoundingBox;
  location: {
    coordinates: [number, number];
    addressText: string;
  };
  frameSnapshotUrl?: string;
  matchedIssueId: string;
  matchedIssueRef: string;
  matchStatus: string;
  detectedAt: string;
}

export interface AnalyzeFrameResponse {
  detected: boolean;
  message?: string;
  detection?: DetectionEvent;
  canonicalIssue?: any;
  isNewIssue?: boolean;
  matchReason?: string;
}

export const detectionService = {
  analyzeFrame: async (payload: {
    imageBase64?: string;
    sceneHint?: string;
    coordinates?: [number, number];
    addressText?: string;
    sourceType?: string;
  }): Promise<AnalyzeFrameResponse> => {
    return apiClient.post<AnalyzeFrameResponse>('/detection/analyze-frame', payload);
  },

  getDetections: async (limit = 30): Promise<any[]> => {
    return apiClient.get<any[]>(`/detections?limit=${limit}`);
  },
};
