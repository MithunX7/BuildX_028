import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAuditLog extends Document {
  actorId?: Types.ObjectId;
  actorName: string;
  action: string;
  entityType: "ISSUE" | "WORK_ORDER" | "DETECTION" | "CONFLICT" | "USER";
  entityId: Types.ObjectId;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    actorName: { type: String, default: "SYSTEM" },
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ["ISSUE", "WORK_ORDER", "DETECTION", "CONFLICT", "USER"],
      required: true,
      index: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ timestamp: -1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
