import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Issue } from "@/models/Issue";
import { WorkOrder } from "@/models/WorkOrder";
import { User } from "@/models/User";
import { IssueTriageSchema } from "@/lib/validations";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit-service";
import { jsonSuccess, jsonError } from "@/lib/response";
import { NotFoundError, ValidationError } from "@/lib/errors";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const parsed = IssueTriageSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid triage payload", parsed.error.format());
    }

    const user = await getCurrentUser();
    await connectToDatabase();

    const issue = await Issue.findById(id);
    if (!issue) {
      throw new NotFoundError(`Issue with ID ${id} not found.`);
    }

    const { departmentId, priorityLevel, priorityScore, assignContractor, contractorName, dueInHours } = parsed.data;

    if (departmentId) issue.departmentId = departmentId as unknown as typeof issue.departmentId;
    if (priorityLevel) issue.priorityLevel = priorityLevel;
    if (priorityScore !== undefined) issue.priorityScore = priorityScore;

    let workOrderDoc;
    if (assignContractor) {
      // Find an active inspector or default contractor
      const inspectorUser = await User.findOne({ role: "INSPECTOR", isActive: true });
      const dueAt = new Date(Date.now() + dueInHours * 60 * 60 * 1000);
      const randomWONum = `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      workOrderDoc = await WorkOrder.create({
        workOrderNumber: randomWONum,
        issueId: issue._id,
        departmentId: issue.departmentId,
        assignedToId: inspectorUser?._id,
        contractorName: contractorName || "Nagpur City Infra Maintenance Services",
        status: "ASSIGNED",
        dueAt,
        createdById: user?.userId || issue.departmentId,
      });

      issue.status = "ASSIGNED";
      issue.activeWorkOrderId = workOrderDoc._id;
    } else {
      issue.status = "TRIAGED";
    }

    issue.lastUpdatedAt = new Date();
    await issue.save();

    await logAuditEvent({
      actorId: user?.userId,
      actorName: user?.name || "Operations Coordinator",
      action: assignContractor ? "ISSUE_TRIAGED_AND_DISPATCHED" : "ISSUE_TRIAGED",
      entityType: "ISSUE",
      entityId: issue._id.toString(),
      metadata: {
        priorityLevel: issue.priorityLevel,
        status: issue.status,
        workOrderNumber: workOrderDoc?.workOrderNumber,
      },
    });

    return jsonSuccess({
      issue,
      workOrder: workOrderDoc,
      message: assignContractor
        ? `Issue triaged and dispatched as Work Order ${workOrderDoc?.workOrderNumber}`
        : "Issue triaged successfully",
    });
  } catch (error) {
    return jsonError(error);
  }
}
