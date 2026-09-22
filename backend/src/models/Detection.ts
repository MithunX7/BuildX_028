import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { CivicDefectCategory, DetectionSourceType, MatchStatus } from "@/types/detection";

export interface IDetection extends Document {
  sourceType: DetectionSourceType;
  detectedClass: CivicDefectCategory;
  confidence: number;
  boundingBox: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
    addressText?: string;
  };
  frameSnapshotUrl?: string;
  matchedIssueId?: Types.ObjectId;
  matchStatus: MatchStatus;
  matchConfidence?: number;
  detectedAt: Date;
  createdAt: Date;
}

const DetectionSchema = new Schema<IDetection>(
  {
    sourceType: {
      type: String,
      enum: ["LIVE_CAMERA", "PATROL_VIDEO_FEED", "SURVEY_STREAM"],
      default: "PATROL_VIDEO_FEED",
    },
    detectedClass: {
      type: String,
      enum: ["POTHOLE", "GARBAGE_ACCUMULATION", "STREETLIGHT_FAULT", "ROAD_OBSTRUCTION", "DAMAGED_ASSET"],
      required: true,
      index: true,
    },
    confidence: { type: Number, required: true },
    boundingBox: {
      ymin: { type: Number, required: true },
      xmin: { type: Number, required: true },
      ymax: { type: Number, required: true },
      xmax: { type: Number, required: true },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
      },
      addressText: { type: String },
    },
    frameSnapshotUrl: { type: String },
    matchedIssueId: { type: Schema.Types.ObjectId, ref: "Issue", index: true },
    matchStatus: {
      type: String,
      enum: ["NEW_CANONICAL_ISSUE", "LINKED_DUPLICATE", "PENDING_VERIFICATION"],
      default: "NEW_CANONICAL_ISSUE",
    },
    matchConfidence: { type: Number },
    detectedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

DetectionSchema.index({ location: "2dsphere" });
DetectionSchema.index({ detectedAt: -1 });

export const Detection: Model<IDetection> =
  mongoose.models.Detection || mongoose.model<IDetection>("Detection", DetectionSchema);
