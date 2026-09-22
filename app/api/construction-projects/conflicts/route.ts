import { connectToDatabase } from "@/lib/mongodb";
import { ConstructionConflict } from "@/models/ConstructionConflict";
import { jsonSuccess, jsonError } from "@/lib/response";

export async function GET() {
  try {
    await connectToDatabase();
    const conflicts = await ConstructionConflict.find({ status: "ACTIVE" })
      .populate("projectId", "name agencyName roadName location startDate endDate")
      .populate("issueId", "referenceCode title category location priorityLevel")
      .sort({ createdAt: -1 });

    return jsonSuccess({ conflicts, count: conflicts.length });
  } catch (error) {
    return jsonError(error);
  }
}
