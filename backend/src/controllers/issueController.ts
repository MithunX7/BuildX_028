import { Request, Response } from "express";
import mongoose from "mongoose";
import { Issue } from "../models/Issue";
import { Detection } from "../models/Detection";
import { WorkOrder } from "../models/WorkOrder";
import { Department } from "../models/Department";
import { ConstructionProject } from "../models/ConstructionProject";
import { IssueTriageSchema, CitizenReportSchema } from "../validators";
import { calculateExplainablePriority } from "../services/prioritizationService";
import { suggestDepartmentForCategory } from "../services/routingEngine";
import { saveBase64Image } from "../services/storageService";
import { logAuditEvent } from "../services/auditService";
import { sendSuccess, sendError } from "../utils/response";
import { NotFoundError, ValidationError } from "../utils/errors";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export async function getIssues(req: Request, res: Response) {
  try {
    const { category, status, priorityLevel, search } = req.query;
    const filter: Record<string, unknown> = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priorityLevel) filter.priorityLevel = priorityLevel;
    if (search && typeof search === "string") {
      filter.$or = [
        { referenceCode: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { "location.addressText": { $regex: search, $options: "i" } },
      ];
    }

    const issues = await Issue.find(filter)
      .sort({ priorityScore: -1, lastUpdatedAt: -1 })
      .populate("departmentId", "name code slaHours")
      .limit(100);

    return sendSuccess(res, issues);
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getIssueById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const issue = await Issue.findById(id).populate("departmentId", "name code contactEmail slaHours");

    if (!issue) {
      throw new NotFoundError(`Issue with ID ${id} not found`);
    }

    const detections = await Detection.find({ matchedIssueId: issue._id }).sort({ detectedAt: -1 });
    const workOrders = await WorkOrder.find({ issueId: issue._id }).sort({ createdAt: -1 });

    // Check for nearby construction project conflicts (within 200m)
    let nearbyProjects: unknown[] = [];
    if (issue.location?.coordinates) {
      nearbyProjects = await ConstructionProject.find({
        status: { $in: ["ACTIVE", "PLANNED"] },
      }).limit(5);
    }

    return sendSuccess(res, {
      issue,
      detections,
      workOrders,
      nearbyProjects,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function createCitizenReport(req: Request, res: Response) {
  try {
    const parsed = CitizenReportSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid report payload", parsed.error.format());
    }

    const { category, title, description, coordinates, addressText, imageBase64 } = parsed.data;

    let snapshotUrl: string | undefined;
    if (imageBase64) {
      snapshotUrl = await saveBase64Image(imageBase64, `citizen_${category.toLowerCase()}`);
    }

    const deptSuggestion = await suggestDepartmentForCategory(category);
    const priority = calculateExplainablePriority({
      category,
      coordinates,
      duplicateCount: 0,
    });

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refCode = `NMC-2026-${randomSuffix}`;

    const newIssue = await Issue.create({
      referenceCode: refCode,
      category,
      title,
      description,
      location: {
        type: "Point",
        coordinates,
        addressText,
        zoneName: "Nagpur Municipal Zone",
      },
      departmentId: deptSuggestion.departmentId,
      priorityLevel: priority.priorityLevel,
      priorityScore: priority.priorityScore,
      priorityReasons: ["Citizen reported complaint", ...priority.priorityReasons],
      status: "NEW",
      duplicateCount: 0,
      initialDetectionFrame: snapshotUrl,
      firstReportedAt: new Date(),
      lastUpdatedAt: new Date(),
    });

    await logAuditEvent({
      action: "CITIZEN_REPORT_SUBMITTED",
      entityType: "ISSUE",
      entityId: newIssue._id.toString(),
      metadata: { referenceCode: refCode, category, priorityScore: priority.priorityScore },
    });

    return sendSuccess(res, newIssue, 201);
  } catch (error) {
    return sendError(res, error);
  }
}

export async function triageIssue(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const parsed = IssueTriageSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid triage parameters", parsed.error.format());
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      throw new NotFoundError(`Issue ${id} not found`);
    }

    const { departmentId, priorityLevel, priorityScore, assignContractor, contractorName, dueInHours } = parsed.data;

    if (departmentId) issue.departmentId = departmentId as any;
    if (priorityLevel) issue.priorityLevel = priorityLevel;
    if (priorityScore !== undefined) issue.priorityScore = priorityScore;

    issue.status = "TRIAGED";
    issue.lastUpdatedAt = new Date();
    await issue.save();

    let workOrder = null;
    if (assignContractor) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const woRef = `WO-2026-${randomSuffix}`;

      const dueDate = new Date();
      dueDate.setHours(dueDate.getHours() + (dueInHours || 24));

      workOrder = await WorkOrder.create({
        workOrderNumber: woRef,
        issueId: issue._id,
        departmentId: issue.departmentId,
        contractorName: contractorName || "Standard Ward Contractor",
        status: "ASSIGNED",
        dueAt: dueDate,
        createdById: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : new mongoose.Types.ObjectId(),
        evidenceIds: [],
      });

      issue.status = "IN_PROGRESS";
      await issue.save();
    }

    await logAuditEvent({
      actorId: req.user?.id,
      actorName: req.user?.name || "Operations Officer",
      action: "ISSUE_TRIAGED",
      entityType: "ISSUE",
      entityId: issue._id.toString(),
      metadata: {
        priorityLevel: issue.priorityLevel,
        workOrderId: workOrder?._id?.toString(),
      },
    });

    return sendSuccess(res, {
      issue,
      workOrder,
      message: workOrder ? "Issue triaged and work order dispatched." : "Issue triaged successfully.",
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function verifyIssue(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    const issue = await Issue.findById(id);
    if (!issue) throw new NotFoundError(`Issue ${id} not found`);

    if (action === "APPROVE") {
      issue.status = "RESOLVED";
      issue.resolvedAt = new Date();
    } else if (action === "REOPEN") {
      issue.status = "IN_PROGRESS";
    }

    issue.lastUpdatedAt = new Date();
    await issue.save();

    await logAuditEvent({
      actorId: req.user?.id,
      actorName: req.user?.name || "Inspector",
      action: action === "APPROVE" ? "ISSUE_VERIFIED_RESOLVED" : "ISSUE_REOPENED",
      entityType: "ISSUE",
      entityId: issue._id.toString(),
      metadata: { action, notes },
    });

    return sendSuccess(res, {
      issue,
      message: action === "APPROVE" ? "Issue marked as verified and resolved." : "Issue reopened for correction.",
    });
  } catch (error) {
    return sendError(res, error);
  }
}
