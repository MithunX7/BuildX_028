import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { FrameAnalysisSchema } from "@/lib/validations";
import { detectDefectFromFrame } from "@/lib/detection-service";
import { findNearbyDuplicateIssue } from "@/lib/duplicate-engine";
import { calculateExplainablePriority } from "@/lib/prioritization";
import { suggestDepartmentForCategory } from "@/lib/routing-engine";
import { saveBase64Image } from "@/lib/storage";
import { logAuditEvent } from "@/lib/audit-service";
import { Detection } from "@/models/Detection";
import { Issue } from "@/models/Issue";
import { jsonSuccess, jsonError } from "@/lib/response";
import { ValidationError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = FrameAnalysisSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid frame analysis payload", parsed.error.format());
    }

    await connectToDatabase();

    const { imageBase64, sceneHint, coordinates, addressText, sourceType } = parsed.data;

    // 1. Run vision detection / classification
    const detectionResult = await detectDefectFromFrame({
      imageBase64,
      sceneHint,
      customCoordinates: coordinates,
    });

    if (!detectionResult.detected) {
      return jsonSuccess({
        detected: false,
        message: "No supported civic defects detected in this frame.",
      });
    }

    const { sceneDef } = detectionResult;
    const finalCoords: [number, number] = coordinates || sceneDef.location.coordinates;
    const finalAddress = addressText || sceneDef.location.addressText;

    // 2. Save frame snapshot
    let snapshotUrl: string | undefined;
    if (imageBase64) {
      snapshotUrl = await saveBase64Image(imageBase64, `det_${sceneDef.category.toLowerCase()}`);
    }

    // 3. Duplicate check within 50m radius
    const duplicateCandidate = await findNearbyDuplicateIssue({
      category: sceneDef.category,
      coordinates: finalCoords,
      maxDistanceMeters: 50,
    });

    let canonicalIssueDoc;
    let isNewIssue = false;
    let matchStatus: "NEW_CANONICAL_ISSUE" | "LINKED_DUPLICATE" = "NEW_CANONICAL_ISSUE";

    if (duplicateCandidate) {
      // LINK AS DUPLICATE
      matchStatus = "LINKED_DUPLICATE";
      canonicalIssueDoc = duplicateCandidate.issue;
      canonicalIssueDoc.duplicateCount += 1;
      canonicalIssueDoc.lastUpdatedAt = new Date();

      // Recalculate priority with higher duplicate count
      const updatedPriority = calculateExplainablePriority({
        category: canonicalIssueDoc.category,
        coordinates: canonicalIssueDoc.location.coordinates,
        duplicateCount: canonicalIssueDoc.duplicateCount,
      });

      canonicalIssueDoc.priorityScore = updatedPriority.priorityScore;
      canonicalIssueDoc.priorityLevel = updatedPriority.priorityLevel;
      canonicalIssueDoc.priorityReasons = updatedPriority.priorityReasons;
      await canonicalIssueDoc.save();

      await logAuditEvent({
        action: "DETECTION_LINKED_DUPLICATE",
        entityType: "ISSUE",
        entityId: canonicalIssueDoc._id.toString(),
        metadata: {
          confidence: sceneDef.confidence,
          distanceMeters: duplicateCandidate.distanceMeters,
          sourceType,
        },
      });
    } else {
      // CREATE NEW CANONICAL ISSUE
      isNewIssue = true;
      const deptSuggestion = await suggestDepartmentForCategory(sceneDef.category);
      const priority = calculateExplainablePriority({
        category: sceneDef.category,
        coordinates: finalCoords,
        duplicateCount: 0,
      });

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const refCode = `NMC-2026-${randomSuffix}`;

      canonicalIssueDoc = await Issue.create({
        referenceCode: refCode,
        category: sceneDef.category,
        title: sceneDef.label,
        description: sceneDef.description,
        location: {
          type: "Point",
          coordinates: finalCoords,
          addressText: finalAddress,
          zoneName: sceneDef.location.zoneName,
        },
        departmentId: deptSuggestion.departmentId,
        priorityLevel: priority.priorityLevel,
        priorityScore: priority.priorityScore,
        priorityReasons: priority.priorityReasons,
        status: "NEW",
        duplicateCount: 0,
        initialDetectionFrame: snapshotUrl,
        firstReportedAt: new Date(),
        lastUpdatedAt: new Date(),
      });

      await logAuditEvent({
        action: "NEW_CANONICAL_ISSUE_DETECTED",
        entityType: "ISSUE",
        entityId: canonicalIssueDoc._id.toString(),
        metadata: {
          referenceCode: refCode,
          category: sceneDef.category,
          confidence: sceneDef.confidence,
          priorityLevel: priority.priorityLevel,
          priorityScore: priority.priorityScore,
        },
      });
    }

    // 4. Save Detection Event
    const detectionDoc = await Detection.create({
      sourceType,
      detectedClass: sceneDef.category,
      confidence: sceneDef.confidence,
      boundingBox: sceneDef.boundingBox,
      location: {
        type: "Point",
        coordinates: finalCoords,
        addressText: finalAddress,
      },
      frameSnapshotUrl: snapshotUrl,
      matchedIssueId: canonicalIssueDoc._id,
      matchStatus,
      matchConfidence: duplicateCandidate ? duplicateCandidate.matchConfidence : sceneDef.confidence,
      detectedAt: new Date(),
    });

    return jsonSuccess({
      detected: true,
      detection: {
        id: detectionDoc._id.toString(),
        sourceType: detectionDoc.sourceType,
        detectedClass: detectionDoc.detectedClass,
        confidence: detectionDoc.confidence,
        boundingBox: detectionDoc.boundingBox,
        location: {
          coordinates: finalCoords,
          addressText: finalAddress,
        },
        frameSnapshotUrl: snapshotUrl,
        matchedIssueId: canonicalIssueDoc._id.toString(),
        matchedIssueRef: canonicalIssueDoc.referenceCode,
        matchStatus,
        detectedAt: detectionDoc.detectedAt.toISOString(),
      },
      canonicalIssue: {
        id: canonicalIssueDoc._id.toString(),
        referenceCode: canonicalIssueDoc.referenceCode,
        category: canonicalIssueDoc.category,
        title: canonicalIssueDoc.title,
        description: canonicalIssueDoc.description,
        location: canonicalIssueDoc.location,
        priorityLevel: canonicalIssueDoc.priorityLevel,
        priorityScore: canonicalIssueDoc.priorityScore,
        priorityReasons: canonicalIssueDoc.priorityReasons,
        status: canonicalIssueDoc.status,
        duplicateCount: canonicalIssueDoc.duplicateCount,
      },
      isNewIssue,
      matchReason: duplicateCandidate ? duplicateCandidate.reason : "New unique location identified.",
    });
  } catch (error) {
    return jsonError(error);
  }
}
