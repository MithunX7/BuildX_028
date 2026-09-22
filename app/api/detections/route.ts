import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Detection } from "@/models/Detection";
import { Issue } from "@/models/Issue";
import { jsonSuccess, jsonError } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const detections = await Detection.find({})
      .sort({ detectedAt: -1 })
      .limit(limit)
      .populate("matchedIssueId", "referenceCode title status priorityLevel priorityScore");

    const formatted = detections.map((d) => ({
      id: d._id.toString(),
      sourceType: d.sourceType,
      detectedClass: d.detectedClass,
      confidence: d.confidence,
      boundingBox: d.boundingBox,
      location: d.location,
      frameSnapshotUrl: d.frameSnapshotUrl,
      matchedIssueId: d.matchedIssueId ? (d.matchedIssueId as unknown as { _id: { toString(): string } })._id.toString() : undefined,
      matchedIssue: d.matchedIssueId,
      matchStatus: d.matchStatus,
      detectedAt: d.detectedAt.toISOString(),
    }));

    return jsonSuccess({ detections: formatted, count: formatted.length });
  } catch (error) {
    return jsonError(error);
  }
}
