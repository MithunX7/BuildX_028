import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConstructionProject extends Document {
  name: string;
  agencyName: string;
  purpose: string;
  roadName: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  startDate: Date;
  endDate: Date;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  restorationPlan?: string;
  createdAt: Date;
}

const ConstructionProjectSchema = new Schema<IConstructionProject>(
  {
    name: { type: String, required: true },
    agencyName: { type: String, required: true },
    purpose: { type: String, required: true },
    roadName: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["PLANNED", "IN_PROGRESS", "COMPLETED"],
      default: "PLANNED",
    },
    restorationPlan: { type: String },
  },
  { timestamps: true }
);

ConstructionProjectSchema.index({ location: "2dsphere" });

export const ConstructionProject: Model<IConstructionProject> =
  mongoose.models.ConstructionProject ||
  mongoose.model<IConstructionProject>("ConstructionProject", ConstructionProjectSchema);
