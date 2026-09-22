import { Request, Response } from "express";
import mongoose from "mongoose";
import { WorkOrder } from "../models/WorkOrder";
import { Issue } from "../models/Issue";
import { Evidence } from "../models/Evidence";
import { saveBase64Image } from "../services/storageService";
import { logAuditEvent } from "../services/auditService";
import { sendSuccess, sendError } from "../utils/response";
import { NotFoundError, ValidationError } from "../utils/errors";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export async function getWorkOrders(req: Request, res: Response) {
  try {
    const { status, departmentId } = req.query;
    const filter: Record<string, unknown> = {};

    if (status) filter.status = status;
    if (departmentId) filter.departmentId = departmentId;

    const workOrders = await WorkOrder.find(filter)
      .sort({ createdAt: -1 })
      .populate("issueId", "referenceCode title category priorityLevel location initialDetectionFrame evidencePhotos")
      .populate("departmentId", "name code")
      .populate("evidenceIds");

    return sendSuccess(res, workOrders);
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getWorkOrderById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const workOrder = await WorkOrder.findById(id)
      .populate("issueId")
      .populate("departmentId")
      .populate("evidenceIds");

    if (!workOrder) {
      throw new NotFoundError(`Work order ${id} not found`);
    }

    const evidence = await Evidence.find({ workOrderId: workOrder._id }).sort({ uploadedAt: -1 });

    return sendSuccess(res, {
      workOrder,
      evidence,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function updateProgress(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) throw new NotFoundError(`Work order ${id} not found`);

    if (status) workOrder.status = status;
    if (notes) workOrder.completionNotes = notes;
    if (status === "IN_PROGRESS" && !workOrder.startedAt) {
      workOrder.startedAt = new Date();
    }

    await workOrder.save();

    await logAuditEvent({
      actorId: req.user?.id,
      actorName: req.user?.name || "Contractor",
      action: "WORK_ORDER_PROGRESS_UPDATED",
      entityType: "WORK_ORDER",
      entityId: workOrder._id.toString(),
      metadata: { status: workOrder.status, notes },
    });

    return sendSuccess(res, workOrder);
  } catch (error) {
    return sendError(res, error);
  }
}

export async function uploadEvidence(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { imageBase64, completionNotes, coordinates, evidenceType = "FIELD_REPAIR_COMPLETION" } = req.body;

    if (!imageBase64) {
      throw new ValidationError("Evidence image is required");
    }

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) throw new NotFoundError(`Work order ${id} not found`);

    const imageUrl = await saveBase64Image(imageBase64, `evidence_${id}`);

    const evidenceDoc = await Evidence.create({
      issueId: workOrder.issueId,
      workOrderId: workOrder._id,
      evidenceType: evidenceType || "FIELD_REPAIR_COMPLETION",
      fileUrl: imageUrl,
      mediaUrl: imageUrl,
      notes: completionNotes || "Repair completion evidence",
      coordinates,
      uploadedById: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      capturedAt: new Date(),
    });

    workOrder.status = "SUBMITTED_FOR_VERIFICATION";
    workOrder.completedAt = new Date();
    workOrder.completionNotes = completionNotes;
    if (!workOrder.evidenceIds.includes(evidenceDoc._id as mongoose.Types.ObjectId)) {
      workOrder.evidenceIds.push(evidenceDoc._id as mongoose.Types.ObjectId);
    }
    await workOrder.save();

    await Issue.findByIdAndUpdate(workOrder.issueId, {
      status: "RESOLVED",
      lastUpdatedAt: new Date(),
    });

    await logAuditEvent({
      actorId: req.user?.id,
      actorName: req.user?.name || "Field Contractor",
      action: "EVIDENCE_UPLOADED",
      entityType: "WORK_ORDER",
      entityId: workOrder._id.toString(),
      metadata: { evidenceId: evidenceDoc._id.toString(), imageUrl },
    });

    return sendSuccess(res, {
      workOrder,
      evidence: evidenceDoc,
      message: "Evidence recorded successfully. Work order submitted for verification.",
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function verifyWorkOrder(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) throw new NotFoundError(`Work order ${id} not found`);

    if (action === "APPROVE") {
      workOrder.status = "VERIFIED";
      workOrder.verifiedById = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined;
      workOrder.verifiedAt = new Date();
      workOrder.verificationNotes = notes;

      await Issue.findByIdAndUpdate(workOrder.issueId, {
        status: "RESOLVED",
        resolvedAt: new Date(),
      });
    } else if (action === "REOPEN") {
      workOrder.status = "REOPENED";
      workOrder.verificationNotes = `Reopened: ${notes}`;

      await Issue.findByIdAndUpdate(workOrder.issueId, {
        status: "IN_PROGRESS",
      });
    }

    await workOrder.save();

    await logAuditEvent({
      actorId: req.user?.id,
      actorName: req.user?.name || "Inspector",
      action: action === "APPROVE" ? "WORK_ORDER_VERIFIED" : "WORK_ORDER_REOPENED",
      entityType: "WORK_ORDER",
      entityId: workOrder._id.toString(),
      metadata: { action, notes },
    });

    return sendSuccess(res, {
      workOrder,
      message: action === "APPROVE" ? "Work order verified and closed." : "Work order reopened for rework.",
    });
  } catch (error) {
    return sendError(res, error);
  }
}
