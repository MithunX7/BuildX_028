import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IEvidence extends Document {
  issueId?: Types.ObjectId;
  workOrderId?: Types.ObjectId;
  uploadedById?: Types.ObjectId;
  evidenceType: string;
  fileUrl: string;
  mediaUrl?: string;
  notes?: string;
  mimeType: string;
  fileSizeBytes: number;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  capturedAt: Date;
  createdAt: Date;
}

const EvidenceSchema = new Schema<IEvidence>(
  {
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", index: true },
    workOrderId: { type: Schema.Types.ObjectId, ref: "WorkOrder", index: true },
    uploadedById: { type: Schema.Types.ObjectId, ref: "User", required: false },
    evidenceType: {
      type: String,
      default: "FIELD_REPAIR_COMPLETION",
    },
    fileUrl: { type: String, required: true },
    mediaUrl: { type: String },
    notes: { type: String },
    mimeType: { type: String, default: "image/jpeg" },
    fileSizeBytes: { type: Number, default: 0 },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: [Number],
    },
    capturedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Evidence: Model<IEvidence> =
  mongoose.models.Evidence || mongoose.model<IEvidence>("Evidence", EvidenceSchema);
