import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { WorkOrder } from "@/models/WorkOrder";
import { Issue } from "@/models/Issue";
import { WorkOrderVerifySchema } from "@/lib/validations";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit-service";
import { jsonSuccess, jsonError } from "@/lib/response";
import { NotFoundError, ValidationError } from "@/lib/errors";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const parsed = WorkOrderVerifySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid verification payload", parsed.error.format());
    }

    const user = await getCurrentUser();
    await connectToDatabase();

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      throw new NotFoundError(`Work order ${id} not found.`);
    }

    const { action, notes } = parsed.data;
    const issue = await Issue.findById(workOrder.issueId);

    if (action === "APPROVE") {
      workOrder.status = "VERIFIED";
      workOrder.verificationNotes = notes;
      workOrder.verifiedById = user?.userId as unknown as typeof workOrder.verifiedById;
      workOrder.verifiedAt = new Date();

      if (issue) {
        issue.status = "RESOLVED";
        issue.resolvedAt = new Date();
        issue.lastUpdatedAt = new Date();
        await issue.save();
      }
    } else if (action === "REOPEN") {
      workOrder.status = "REOPENED";
      workOrder.verificationNotes = notes;
      workOrder.verifiedById = user?.userId as unknown as typeof workOrder.verifiedById;
      workOrder.verifiedAt = new Date();

      if (issue) {
        issue.status = "REOPENED";
        issue.lastUpdatedAt = new Date();
        await issue.save();
      }
    } else if (action === "REJECT") {
      workOrder.status = "REJECTED";
      workOrder.verificationNotes = notes;
      workOrder.verifiedById = user?.userId as unknown as typeof workOrder.verifiedById;
      workOrder.verifiedAt = new Date();

      if (issue) {
        issue.status = "REJECTED";
        issue.lastUpdatedAt = new Date();
        await issue.save();
      }
    }

    await workOrder.save();

    await logAuditEvent({
      actorId: user?.userId,
      actorName: user?.name || "Chief Verification Engineer",
      action: `WORK_ORDER_${action}_BY_VERIFIER`,
      entityType: "WORK_ORDER",
      entityId: workOrder._id.toString(),
      metadata: {
        action,
        notes,
        workOrderNumber: workOrder.workOrderNumber,
        issueRef: issue?.referenceCode,
      },
    });

    return jsonSuccess({
      workOrder,
      issue,
      message:
        action === "APPROVE"
          ? `Work order ${workOrder.workOrderNumber} approved and marked RESOLVED.`
          : `Work order ${workOrder.workOrderNumber} marked as ${action}: ${notes}`,
    });
  } catch (error) {
    return jsonError(error);
  }
}
