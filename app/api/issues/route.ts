import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Issue } from "@/models/Issue";
import { Department } from "@/models/Department";
import { WorkOrder } from "@/models/WorkOrder";
import { jsonSuccess, jsonError } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const departmentId = searchParams.get("departmentId");

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priorityLevel = priority;
    if (departmentId) query.departmentId = departmentId;

    const issues = await Issue.find(query)
      .sort({ priorityScore: -1, createdAt: -1 })
      .populate("departmentId", "name code")
      .populate("activeWorkOrderId", "workOrderNumber status dueAt contractorName");

    const formatted = issues.map((issue) => ({
      id: issue._id.toString(),
      referenceCode: issue.referenceCode,
      category: issue.category,
      title: issue.title,
      description: issue.description,
      location: issue.location,
      department: issue.departmentId,
      priorityLevel: issue.priorityLevel,
      priorityScore: issue.priorityScore,
      priorityReasons: issue.priorityReasons,
      status: issue.status,
      duplicateCount: issue.duplicateCount,
      initialDetectionFrame: issue.initialDetectionFrame,
      activeWorkOrder: issue.activeWorkOrderId,
      firstReportedAt: issue.firstReportedAt.toISOString(),
      lastUpdatedAt: issue.lastUpdatedAt.toISOString(),
      resolvedAt: issue.resolvedAt ? issue.resolvedAt.toISOString() : undefined,
    }));

    return jsonSuccess({ issues: formatted, count: formatted.length });
  } catch (error) {
    return jsonError(error);
  }
}
