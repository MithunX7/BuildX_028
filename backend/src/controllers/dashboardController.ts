import { Request, Response } from "express";
import { Issue } from "../models/Issue";
import { Detection } from "../models/Detection";
import { WorkOrder } from "../models/WorkOrder";
import { ConstructionConflict } from "../models/ConstructionConflict";
import { sendSuccess, sendError } from "../utils/response";

export async function getDashboardSummary(req: Request, res: Response) {
  try {
    const [
      totalIssues,
      openIssues,
      criticalIssues,
      resolvedIssues,
      totalDetections,
      activeWorkOrders,
      pendingVerification,
      activeConflicts,
    ] = await Promise.all([
      Issue.countDocuments({}),
      Issue.countDocuments({ status: { $nin: ["RESOLVED", "REJECTED"] } }),
      Issue.countDocuments({ priorityLevel: "CRITICAL", status: { $nin: ["RESOLVED", "REJECTED"] } }),
      Issue.countDocuments({ status: "RESOLVED" }),
      Detection.countDocuments({}),
      WorkOrder.countDocuments({ status: { $in: ["ASSIGNED", "IN_PROGRESS"] } }),
      WorkOrder.countDocuments({ status: { $in: ["SUBMITTED_FOR_VERIFICATION", "COMPLETED_PENDING_VERIFICATION"] } }),
      ConstructionConflict.countDocuments({ status: "ACTIVE" }),
    ]);

    const categoryStats = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    return sendSuccess(res, {
      summary: {
        totalIssues,
        openIssues,
        criticalIssues,
        resolvedIssues,
        totalDetections,
        activeWorkOrders,
        pendingVerification,
        activeConflicts,
        resolutionRatePercent: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0,
      },
      categoryStats,
    });
  } catch (error) {
    return sendError(res, error);
  }
}
