import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { WorkOrder } from "@/models/WorkOrder";
import { Issue } from "@/models/Issue";
import { Evidence } from "@/models/Evidence";
import { WorkOrderEvidenceSchema } from "@/lib/validations";
import { saveBase64Image } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit-service";
import { jsonSuccess, jsonError } from "@/lib/response";
import { NotFoundError, ValidationError } from "@/lib/errors";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const parsed = WorkOrderEvidenceSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid evidence payload", parsed.error.format());
    }

    const user = await getCurrentUser();
    await connectToDatabase();

    const workOrder = await WorkOrder.findById(id);
    if (!workOrder) {
      throw new NotFoundError(`Work order ${id} not found.`);
    }

    const { imageBase64, completionNotes, coordinates } = parsed.data;

    // Save image to disk
    const fileUrl = await saveBase64Image(imageBase64, `evidence_${workOrder.workOrderNumber}`);

    // Create Evidence record
    const evidenceDoc = await Evidence.create({
      issueId: workOrder.issueId,
      workOrderId: workOrder._id,
      uploadedById: user?.userId || workOrder.createdById,
      evidenceType: "FIELD_REPAIR_COMPLETION",
      fileUrl,
      location: coordinates
        ? { type: "Point", coordinates }
        : undefined,
      capturedAt: new Date(),
    });

    // Update Work Order
    workOrder.evidenceIds.push(evidenceDoc._id as unknown as (typeof workOrder.evidenceIds)[0]);
    workOrder.status = "SUBMITTED_FOR_VERIFICATION";
    workOrder.completedAt = new Date();
    if (completionNotes) workOrder.completionNotes = completionNotes;
    await workOrder.save();

    // Update Issue status
    const issue = await Issue.findById(workOrder.issueId);
    if (issue) {
      issue.status = "SUBMITTED_FOR_VERIFICATION";
      issue.lastUpdatedAt = new Date();
      await issue.save();
    }

    await logAuditEvent({
      actorId: user?.userId,
      actorName: user?.name || "Contractor Field Team",
      action: "EVIDENCE_SUBMITTED_FOR_VERIFICATION",
      entityType: "WORK_ORDER",
      entityId: workOrder._id.toString(),
      metadata: {
        workOrderNumber: workOrder.workOrderNumber,
        fileUrl,
        completionNotes,
      },
    });

    return jsonSuccess({
      workOrder,
      evidence: evidenceDoc,
      message: "Repair completion evidence uploaded and submitted for engineering verification!",
    });
  } catch (error) {
    return jsonError(error);
  }
}
