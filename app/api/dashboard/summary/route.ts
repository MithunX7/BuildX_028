import { connectToDatabase } from "@/lib/mongodb";
import { Issue } from "@/models/Issue";
import { Detection } from "@/models/Detection";
import { WorkOrder } from "@/models/WorkOrder";
import { ConstructionConflict } from "@/models/ConstructionConflict";
import { jsonSuccess, jsonError } from "@/lib/response";

export async function GET() {
  try {
    await connectToDatabase();

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
      WorkOrder.countDocuments({ status: "SUBMITTED_FOR_VERIFICATION" }),
      ConstructionConflict.countDocuments({ status: "ACTIVE" }),
    ]);

    // Group issues by category
    const categoryStats = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    return jsonSuccess({
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
    return jsonError(error);
  }
}
