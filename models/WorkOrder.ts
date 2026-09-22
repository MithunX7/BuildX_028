import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { WorkOrderStatus } from "@/types/work-order";

export interface IWorkOrder extends Document {
  workOrderNumber: string;
  issueId: Types.ObjectId;
  departmentId: Types.ObjectId;
  assignedToId?: Types.ObjectId;
  contractorName?: string;
  status: WorkOrderStatus;
  dueAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  completionNotes?: string;
  evidenceIds: Types.ObjectId[];
  verificationNotes?: string;
  verifiedById?: Types.ObjectId;
  verifiedAt?: Date;
  createdById: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WorkOrderSchema = new Schema<IWorkOrder>(
  {
    workOrderNumber: { type: String, required: true, unique: true, index: true },
    issueId: { type: Schema.Types.ObjectId, ref: "Issue", required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    assignedToId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    contractorName: { type: String },
    status: {
      type: String,
      enum: [
        "CREATED",
        "ASSIGNED",
        "IN_PROGRESS",
        "SUBMITTED_FOR_VERIFICATION",
        "VERIFIED",
        "REJECTED",
        "REOPENED",
        "CANCELLED",
      ],
      default: "CREATED",
      index: true,
    },
    dueAt: { type: Date, required: true },
    startedAt: { type: Date },
    completedAt: { type: Date },
    completionNotes: { type: String },
    evidenceIds: [{ type: Schema.Types.ObjectId, ref: "Evidence" }],
    verificationNotes: { type: String },
    verifiedById: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const WorkOrder: Model<IWorkOrder> =
  mongoose.models.WorkOrder || mongoose.model<IWorkOrder>("WorkOrder", WorkOrderSchema);
