import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { WorkOrder } from "@/models/WorkOrder";
import { Issue } from "@/models/Issue";
import { Department } from "@/models/Department";
import { User } from "@/models/User";
import { Evidence } from "@/models/Evidence";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit-service";
import { jsonSuccess, jsonError } from "@/lib/response";
import { UnauthenticatedError, ValidationError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const departmentId = searchParams.get("departmentId");

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (departmentId) query.departmentId = departmentId;

    const workOrders = await WorkOrder.find(query)
      .sort({ dueAt: 1, createdAt: -1 })
      .populate("issueId", "referenceCode title category priorityLevel location")
      .populate("departmentId", "name code")
      .populate("assignedToId", "name email phone")
      .populate("evidenceIds");

    return jsonSuccess({ workOrders, count: workOrders.length });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthenticatedError();

    const body = await req.json();
    if (!body.issueId || !body.departmentId) {
      throw new ValidationError("issueId and departmentId are required.");
    }

    await connectToDatabase();

    const issue = await Issue.findById(body.issueId);
    if (!issue) {
      throw new ValidationError(`Issue ${body.issueId} not found.`);
    }

    const dueAt = body.dueAt ? new Date(body.dueAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const woNum = `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const workOrder = await WorkOrder.create({
      workOrderNumber: woNum,
      issueId: issue._id,
      departmentId: body.departmentId,
      assignedToId: body.assignedToId,
      contractorName: body.contractorName || "Nagpur City Infra Maintenance Services",
      status: "ASSIGNED",
      dueAt,
      createdById: user.userId,
    });

    issue.status = "ASSIGNED";
    issue.activeWorkOrderId = workOrder._id;
    await issue.save();

    await logAuditEvent({
      actorId: user.userId,
      actorName: user.name,
      action: "WORK_ORDER_CREATED",
      entityType: "WORK_ORDER",
      entityId: workOrder._id.toString(),
      metadata: { workOrderNumber: woNum, issueRef: issue.referenceCode },
    });

    return jsonSuccess({ workOrder, message: "Work order created successfully" }, undefined, 201);
  } catch (error) {
    return jsonError(error);
  }
}
