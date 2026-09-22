import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  code: string;
  contactEmail: string;
  slaHours: Record<string, number>;
  isActive: boolean;
  createdAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    contactEmail: { type: String, required: true },
    slaHours: {
      type: Map,
      of: Number,
      default: {
        LOW: 72,
        MEDIUM: 48,
        HIGH: 24,
        CRITICAL: 12,
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema);
