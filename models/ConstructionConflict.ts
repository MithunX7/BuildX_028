import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IConstructionConflict extends Document {
  projectId: Types.ObjectId;
  issueId?: Types.ObjectId;
  conflictingProjectId?: Types.ObjectId;
  conflictType: "SPATIAL_AND_TEMPORAL_OVERLAP" | "RECENTLY_SURFACED_ROAD_CUT";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  explanation: string;
  status: "ACTIVE" | "RESOLVED" | "IGNORED";
  createdAt: Date;
}

const ConstructionConflictSchema = new Schema<IConstructionConflict>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "ConstructionProject", required: true, index: true },
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", index: true },
    conflictingProjectId: { type: Schema.Types.ObjectId, ref: "ConstructionProject" },
    conflictType: {
      type: String,
      enum: ["SPATIAL_AND_TEMPORAL_OVERLAP", "RECENTLY_SURFACED_ROAD_CUT"],
      default: "SPATIAL_AND_TEMPORAL_OVERLAP",
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "HIGH",
    },
    explanation: { type: String, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "RESOLVED", "IGNORED"],
      default: "ACTIVE",
      index: true,
    },
  },
  { timestamps: true }
);

export const ConstructionConflict: Model<IConstructionConflict> =
  mongoose.models.ConstructionConflict ||
  mongoose.model<IConstructionConflict>("ConstructionConflict", ConstructionConflictSchema);
