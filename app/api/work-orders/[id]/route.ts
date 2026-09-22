import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { WorkOrder } from "@/models/WorkOrder";
import { Issue } from "@/models/Issue";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit-service";
import { jsonSuccess, jsonError } from "@/lib/response";
import { NotFoundError } from "@/lib/errors";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const workOrder = await WorkOrder.findById(id)
      .populate("issueId")
      .populate("departmentId")
      .populate("assignedToId")
      .populate("evidenceIds");

    if (!workOrder) {
      throw new NotFoundError(`Work order ${id} not found.`);
    }

    return jsonSuccess({ workOrder });
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

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      throw new NotFoundError(`Work order ${id} not found.`);
    }

    if (body.status) {
      workOrder.status = body.status;
      if (body.status === "IN_PROGRESS" && !workOrder.startedAt) {
        workOrder.startedAt = new Date();
      }

      // Update parent issue status accordingly
      const issue = await Issue.findById(workOrder.issueId);
      if (issue) {
        if (body.status === "IN_PROGRESS") issue.status = "IN_PROGRESS";
        await issue.save();
      }
    }

    if (body.completionNotes) workOrder.completionNotes = body.completionNotes;
    if (body.contractorName) workOrder.contractorName = body.contractorName;
    if (body.assignedToId) workOrder.assignedToId = body.assignedToId;

    workOrder.updatedAt = new Date();
    await workOrder.save();

    await logAuditEvent({
      actorId: user?.userId,
      actorName: user?.name || "Contractor",
      action: "WORK_ORDER_PROGRESS_UPDATED",
      entityType: "WORK_ORDER",
      entityId: workOrder._id.toString(),
      metadata: body,
    });

    return jsonSuccess({ workOrder, message: "Work order updated successfully" });
  } catch (error) {
    return jsonError(error);
  }
}
