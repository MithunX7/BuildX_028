import mongoose, { Schema, Document, Model } from "mongoose";

export type TrafficDensity = "LOW" | "MEDIUM" | "HIGH";
export type AccidentHistory = "LOW" | "MEDIUM" | "HIGH";
export type EconomicImportance = "LOW" | "MEDIUM" | "HIGH";
export type MaintenanceDecision = "RECOMMENDED" | "DEFERRED" | "PENDING";

export interface IRoad extends Document {
  roadName: string;
  location: string;
  latitude: number;
  longitude: number;
  trafficDensity: TrafficDensity;
  accidentHistory: AccidentHistory;
  complaintCount: number;
  economicImportance: EconomicImportance;
  damageSeverity: "MINOR" | "MODERATE" | "SEVERE" | "CRITICAL";
  estimatedRepairCost: number; // in Lakhs (₹)
  priorityScore: number;
  priorityLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  maintenanceDecision: MaintenanceDecision;
  decisionReason?: string;
  status: "ACTIVE" | "UNDER_REPAIR" | "REPAIRED";
  createdAt: Date;
  updatedAt: Date;
}

const RoadSchema = new Schema<IRoad>(
  {
    roadName: { type: String, required: true },
    location: { type: String, required: true },
    latitude: { type: Number, default: 21.1458 },
    longitude: { type: Number, default: 79.0882 },
    trafficDensity: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
    accidentHistory: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "LOW" },
    complaintCount: { type: Number, default: 0 },
    economicImportance: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
    damageSeverity: { type: String, enum: ["MINOR", "MODERATE", "SEVERE", "CRITICAL"], default: "MODERATE" },
    estimatedRepairCost: { type: Number, required: true }, // Lakhs
    priorityScore: { type: Number, default: 0 },
    priorityLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "LOW" },
    maintenanceDecision: { type: String, enum: ["RECOMMENDED", "DEFERRED", "PENDING"], default: "PENDING" },
    decisionReason: { type: String },
    status: { type: String, enum: ["ACTIVE", "UNDER_REPAIR", "REPAIRED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

export const Road: Model<IRoad> =
  mongoose.models.Road || mongoose.model<IRoad>("Road", RoadSchema);
