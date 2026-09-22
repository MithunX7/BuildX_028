import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMaintenanceConfig extends Document {
  originalBudget: number;     // in Lakhs (₹)
  reductionPercentage: number; // default 40
  availableBudget: number;    // originalBudget * (1 - reduction/100)
  usedBudget: number;
  remainingBudget: number;
  lastCalculatedAt: Date;
  updatedAt: Date;
}

const MaintenanceConfigSchema = new Schema<IMaintenanceConfig>(
  {
    originalBudget: { type: Number, required: true, default: 100 },
    reductionPercentage: { type: Number, default: 40 },
    availableBudget: { type: Number, default: 60 },
    usedBudget: { type: Number, default: 0 },
    remainingBudget: { type: Number, default: 60 },
    lastCalculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MaintenanceConfig: Model<IMaintenanceConfig> =
  mongoose.models.MaintenanceConfig ||
  mongoose.model<IMaintenanceConfig>("MaintenanceConfig", MaintenanceConfigSchema);
