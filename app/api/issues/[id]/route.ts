import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Issue } from "@/models/Issue";
import { Detection } from "@/models/Detection";
import { WorkOrder } from "@/models/WorkOrder";
import { Evidence } from "@/models/Evidence";
import { AuditLog } from "@/models/AuditLog";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit-service";
import { jsonSuccess, jsonError } from "@/lib/response";
import { NotFoundError } from "@/lib/errors";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const issue = await Issue.findById(id)
      .populate("departmentId", "name code contactEmail")
      .populate("activeWorkOrderId");

    if (!issue) {
      throw new NotFoundError(`Issue with ID ${id} not found.`);
    }

    const [detections, workOrders, evidence, auditLogs] = await Promise.all([
      Detection.find({ matchedIssueId: issue._id }).sort({ detectedAt: -1 }),
      WorkOrder.find({ issueId: issue._id }).populate("assignedToId", "name email role"),
      Evidence.find({ issueId: issue._id }).sort({ capturedAt: -1 }),
      AuditLog.find({ entityId: issue._id }).sort({ timestamp: -1 }),
    ]);

    return jsonSuccess({
      issue,
      detections,
      workOrders,
      evidence,
      auditLogs,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const user = await getCurrentUser();

    await connectToDatabase();

    const issue = await Issue.findById(id);
    if (!issue) {
      throw new NotFoundError(`Issue with ID ${id} not found.`);
    }

    if (body.priorityLevel) issue.priorityLevel = body.priorityLevel;
    if (body.priorityScore !== undefined) issue.priorityScore = body.priorityScore;
    if (body.status) issue.status = body.status;
    if (body.departmentId) issue.departmentId = body.departmentId;

    issue.lastUpdatedAt = new Date();
    await issue.save();

    await logAuditEvent({
      actorId: user?.userId,
      actorName: user?.name || "Operations Coordinator",
      action: "ISSUE_UPDATED",
      entityType: "ISSUE",
      entityId: issue._id.toString(),
      metadata: body,
    });

    return jsonSuccess({ issue, message: "Issue updated successfully" });
  } catch (error) {
    return jsonError(error);
  }
}
