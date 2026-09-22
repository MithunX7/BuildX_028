import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { Issue } from "../models/Issue";
import { User } from "../models/User";
import { WorkOrder } from "../models/WorkOrder";
import { Department } from "../models/Department";
import { AuditLog } from "../models/AuditLog";
import { ConstructionConflict } from "../models/ConstructionConflict";
import { sendSuccess, sendError } from "../utils/response";
import { NotFoundError, ValidationError } from "../utils/errors";

export async function getAdminDashboardSummary(req: AuthenticatedRequest, res: Response) {
  try {
    const [
      totalIssues,
      openIssues,
      criticalIssues,
      resolvedIssues,
      totalWorkOrders,
      pendingVerificationOrders,
      activeConflicts,
      categoryStats,
    ] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: { $nin: ["RESOLVED", "REJECTED"] } }),
      Issue.countDocuments({ priorityLevel: "CRITICAL", status: { $nin: ["RESOLVED", "REJECTED"] } }),
      Issue.countDocuments({ status: "RESOLVED" }),
      WorkOrder.countDocuments(),
      WorkOrder.countDocuments({ status: "SUBMITTED_FOR_VERIFICATION" }),
      ConstructionConflict.countDocuments({ isResolved: false }),
      Issue.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const resolutionRatePercent =
      totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

    return sendSuccess(res, {
      summary: {
        totalIssues,
        openIssues,
        criticalIssues,
        resolvedIssues,
        totalWorkOrders,
        pendingVerification: pendingVerificationOrders,
        activeConflicts,
        resolutionRatePercent,
      },
      categoryStats,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getAdminIssues(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, category, priority, search, page = "1", limit = "50" } = req.query;

    const filter: Record<string, any> = {};
    if (status && status !== "ALL") filter.status = status;
    if (category && category !== "ALL") filter.category = category;
    if (priority && priority !== "ALL") filter.priorityLevel = priority;

    if (search && typeof search === "string" && search.trim()) {
      filter.$or = [
        { referenceCode: { $regex: search.trim(), $options: "i" } },
        { title: { $regex: search.trim(), $options: "i" } },
        { "location.addressText": { $regex: search.trim(), $options: "i" } },
      ];
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .populate("departmentId", "name code slaHours")
        .populate("reporterId", "name email phone")
        .populate("activeWorkOrderId")
        .sort({ priorityScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Issue.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      issues,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getAdminIssueById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const issue = await Issue.findById(id)
      .populate("departmentId", "name code slaHours")
      .populate("reporterId", "name email phone")
      .populate("activeWorkOrderId");

    if (!issue) {
      throw new NotFoundError(`Issue with ID ${id} not found`);
    }

    const auditHistory = await AuditLog.find({
      entityType: "ISSUE",
      entityId: issue._id,
    }).sort({ timestamp: -1 });

    return sendSuccess(res, {
      issue,
      auditHistory,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function triageAdminIssue(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { departmentId, priorityLevel, priorityScore, assignContractor, contractorName, dueInHours } = req.body;

    const issue = await Issue.findById(id);
    if (!issue) {
      throw new NotFoundError(`Issue with ID ${id} not found`);
    }

    if (departmentId) {
      const dept = await Department.findById(departmentId);
      if (!dept) throw new NotFoundError("Department not found");
      issue.departmentId = dept._id as any;
    }

    if (priorityLevel) issue.priorityLevel = priorityLevel;
    if (priorityScore !== undefined) issue.priorityScore = priorityScore;
    issue.status = "TRIAGED";
    issue.lastUpdatedAt = new Date();

    let workOrder = null;
    if (assignContractor) {
      const hours = dueInHours || 24;
      const dueAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      const workOrderNumber = `WO-NMC-${Date.now().toString().slice(-6)}`;

      workOrder = await WorkOrder.create({
        workOrderNumber,
        issueId: issue._id,
        departmentId: issue.departmentId,
        contractorName: contractorName || "NMC Rapid Response Engineering Cell",
        status: "ASSIGNED",
        dueAt,
        createdById: req.user?.id,
      });

      issue.activeWorkOrderId = workOrder._id as any;
      issue.status = "ASSIGNED";
    }

    await issue.save();

    await AuditLog.create({
      actorId: req.user?.id,
      actorName: req.user?.name || "Admin Officer",
      action: assignContractor ? "ISSUE_TRIAGED_AND_DISPATCHED" : "ISSUE_TRIAGED",
      entityType: "ISSUE",
      entityId: issue._id,
      metadata: {
        priorityLevel: issue.priorityLevel,
        priorityScore: issue.priorityScore,
        departmentId: issue.departmentId,
        workOrderId: workOrder?._id,
      },
    });

    return sendSuccess(res, {
      issue,
      workOrder,
      message: assignContractor
        ? `Issue triaged and work order ${workOrder?.workOrderNumber} dispatched.`
        : "Issue triage details saved successfully.",
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function updateAdminIssueStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    if (!status) throw new ValidationError("Status field is required");

    const issue = await Issue.findById(id);
    if (!issue) throw new NotFoundError("Issue not found");

    const oldStatus = issue.status;
    issue.status = status;
    issue.lastUpdatedAt = new Date();
    if (status === "RESOLVED") {
      issue.resolvedAt = new Date();
    }

    await issue.save();

    await AuditLog.create({
      actorId: req.user?.id,
      actorName: req.user?.name || "Admin Officer",
      action: "ISSUE_STATUS_UPDATED",
      entityType: "ISSUE",
      entityId: issue._id,
      metadata: { oldStatus, newStatus: status, resolutionNotes },
    });

    return sendSuccess(res, {
      issue,
      message: `Issue status updated from ${oldStatus} to ${status}.`,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getAdminWorkOrders(req: AuthenticatedRequest, res: Response) {
  try {
    const workOrders = await WorkOrder.find()
      .populate("issueId")
      .populate("departmentId", "name code")
      .populate("evidenceIds")
      .populate("verifiedById", "name email role")
      .populate("assignedToId", "name email")
      .sort({ createdAt: -1 });

    return sendSuccess(res, { workOrders });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function createAdminWorkOrder(req: AuthenticatedRequest, res: Response) {
  try {
    const { issueId, contractorName, dueInHours = 24 } = req.body;
    if (!issueId) throw new ValidationError("issueId is required");

    const issue = await Issue.findById(issueId);
    if (!issue) throw new NotFoundError("Issue not found");

    const dueAt = new Date(Date.now() + dueInHours * 60 * 60 * 1000);
    const workOrderNumber = `WO-NMC-${Date.now().toString().slice(-6)}`;

    const workOrder = await WorkOrder.create({
      workOrderNumber,
      issueId: issue._id,
      departmentId: issue.departmentId,
      contractorName: contractorName || "NMC Field Repair Crew",
      status: "ASSIGNED",
      dueAt,
      createdById: req.user?.id,
    });

    issue.activeWorkOrderId = workOrder._id as any;
    issue.status = "ASSIGNED";
    issue.lastUpdatedAt = new Date();
    await issue.save();

    await AuditLog.create({
      actorId: req.user?.id,
      actorName: req.user?.name || "Admin",
      action: "WORK_ORDER_DISPATCHED",
      entityType: "WORK_ORDER",
      entityId: workOrder._id,
      metadata: { workOrderNumber, contractorName, dueAt },
    });

    return sendSuccess(res, {
      workOrder,
      message: `Work Order ${workOrderNumber} created and assigned.`,
    }, 201);
  } catch (error) {
    return sendError(res, error);
  }
}

export async function verifyAdminWorkOrder(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { action, verificationNotes } = req.body; // action: "APPROVE" | "REOPEN"

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) throw new NotFoundError("Work Order not found");

    if (workOrder.status !== "SUBMITTED_FOR_VERIFICATION") {
      throw new ValidationError(
        `Cannot verify a work order in "${workOrder.status}" status. It must be "SUBMITTED_FOR_VERIFICATION".`
      );
    }

    const issue = await Issue.findById(workOrder.issueId);

    if (action === "APPROVE") {
      workOrder.status = "VERIFIED";
      workOrder.verificationNotes = verificationNotes || "Quality inspected and approved by Municipal Engineer.";
      workOrder.verifiedById = req.user?.id as any;
      workOrder.verifiedAt = new Date();
      await workOrder.save();

      if (issue) {
        issue.status = "RESOLVED";
        issue.resolvedAt = new Date();
        issue.lastUpdatedAt = new Date();
        await issue.save();
      }

      await AuditLog.create({
        actorId: req.user?.id,
        actorName: req.user?.name || "Engineering Verifier",
        action: "WORK_ORDER_VERIFIED_AND_CLOSED",
        entityType: "WORK_ORDER",
        entityId: workOrder._id,
        metadata: { verificationNotes },
      });

      return sendSuccess(res, {
        workOrder,
        message: `Work Order ${workOrder.workOrderNumber} approved and issue marked RESOLVED.`,
      });
    } else {
      workOrder.status = "REOPENED";
      workOrder.verificationNotes = verificationNotes || "Quality rejected. Reopened for corrective work.";
      workOrder.verifiedAt = undefined;
      workOrder.verifiedById = undefined;
      await workOrder.save();

      if (issue) {
        issue.status = "REOPENED";
        issue.lastUpdatedAt = new Date();
        await issue.save();
      }

      await AuditLog.create({
        actorId: req.user?.id,
        actorName: req.user?.name || "Engineering Verifier",
        action: "WORK_ORDER_REOPENED",
        entityType: "WORK_ORDER",
        entityId: workOrder._id,
        metadata: { verificationNotes },
      });

      return sendSuccess(res, {
        workOrder,
        message: `Work Order ${workOrder.workOrderNumber} rejected and reopened for rework.`,
      });
    }
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getAdminUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const users = await User.find()
      .select("-passwordHash")
      .populate("departmentId", "name code")
      .sort({ createdAt: -1 });

    return sendSuccess(res, { users });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function updateAdminUserStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const user = await User.findById(id).select("-passwordHash");
    if (!user) throw new NotFoundError("User not found");

    if (isActive !== undefined) user.isActive = isActive;
    if (role) user.role = role;
    await user.save();

    await AuditLog.create({
      actorId: req.user?.id,
      actorName: req.user?.name || "System Admin",
      action: "USER_STATUS_UPDATED",
      entityType: "USER",
      entityId: user._id,
      metadata: { isActive, role },
    });

    return sendSuccess(res, {
      user,
      message: `User ${user.name} updated successfully.`,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getAdminAuditLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(limit);

    return sendSuccess(res, { logs });
  } catch (error) {
    return sendError(res, error);
  }
}
