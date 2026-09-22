import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { CivicDefectCategory, PriorityLevel, IssueStatus } from "../types/issue";

export interface IIssue extends Document {
  referenceCode: string;
  category: CivicDefectCategory;
  title: string;
  description: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    addressText?: string;
    zoneName?: string;
  };
  departmentId: Types.ObjectId;
  priorityLevel: PriorityLevel;
  priorityScore: number;
  priorityReasons: string[];
  status: IssueStatus;
  duplicateCount: number;
  reporterId?: Types.ObjectId;
  evidencePhotos?: string[];
  activeWorkOrderId?: Types.ObjectId;
  firstReportedAt: Date;
  lastUpdatedAt: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema = new Schema<IIssue>(
  {
    referenceCode: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: ["POTHOLE", "GARBAGE_ACCUMULATION", "STREETLIGHT_FAULT", "ROAD_OBSTRUCTION", "DAMAGED_ASSET", "ROAD_SURFACE_DAMAGE", "CONSTRUCTION_CONFLICT"],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      addressText: { type: String },
      zoneName: { type: String },
    },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    priorityLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
      index: true,
    },
    priorityScore: { type: Number, default: 50 },
    priorityReasons: { type: [String], default: [] },
    status: {
      type: String,
      enum: [
        "NEW",
        "TRIAGED",
        "ASSIGNED",
        "IN_PROGRESS",
        "SUBMITTED_FOR_VERIFICATION",
        "RESOLVED",
        "REOPENED",
        "REJECTED",
      ],
      default: "NEW",
      index: true,
    },
    duplicateCount: { type: Number, default: 0 },
    reporterId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    evidencePhotos: { type: [String], default: [] },
    activeWorkOrderId: { type: Schema.Types.ObjectId, ref: "WorkOrder" },
    firstReportedAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

// 2dsphere index for geospatial proximity search ($near, $geoWithin)
IssueSchema.index({ location: "2dsphere" });
IssueSchema.index({ status: 1, priorityLevel: 1 });
IssueSchema.index({ departmentId: 1, status: 1 });
IssueSchema.index({ reporterId: 1, createdAt: -1 });

export const Issue: Model<IIssue> =
  mongoose.models.Issue || mongoose.model<IIssue>("Issue", IssueSchema);
