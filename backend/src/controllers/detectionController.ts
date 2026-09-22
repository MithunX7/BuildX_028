import { Request, Response } from "express";
import { FrameAnalysisSchema } from "../validators";
import { detectDefectFromFrame } from "../services/detectionService";
import { findNearbyDuplicateIssue } from "../services/duplicateEngine";
import { calculateExplainablePriority } from "../services/prioritizationService";
import { suggestDepartmentForCategory } from "../services/routingEngine";
import { saveBase64Image } from "../services/storageService";
import { logAuditEvent } from "../services/auditService";
import { Detection } from "../models/Detection";
import { Issue } from "../models/Issue";
import { sendSuccess, sendError } from "../utils/response";
import { ValidationError } from "../utils/errors";

export async function analyzeFrame(req: Request, res: Response) {
  try {
    const parsed = FrameAnalysisSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid frame analysis payload", parsed.error.format());
    }

    const { imageBase64, sceneHint, coordinates, addressText, sourceType } = parsed.data;

    const detectionResult = await detectDefectFromFrame({
      imageBase64,
      sceneHint,
      customCoordinates: coordinates,
    });

    if (!detectionResult.detected) {
      return sendSuccess(res, {
        detected: false,
        message: "No supported civic defects detected in this frame.",
      });
    }

    const { sceneDef } = detectionResult;
    const finalCoords: [number, number] = coordinates || sceneDef.location.coordinates;
    const finalAddress = addressText || sceneDef.location.addressText;

    let snapshotUrl: string | undefined;
    if (imageBase64) {
      snapshotUrl = await saveBase64Image(imageBase64, `det_${sceneDef.category.toLowerCase()}`);
    }

    // Duplicate check within 50m radius
    const duplicateCandidate = await findNearbyDuplicateIssue({
      category: sceneDef.category,
      coordinates: finalCoords,
      maxDistanceMeters: 50,
    });

    let canonicalIssueDoc;
    let isNewIssue = false;
    let matchStatus: "NEW_CANONICAL_ISSUE" | "LINKED_DUPLICATE" = "NEW_CANONICAL_ISSUE";

    if (duplicateCandidate) {
      matchStatus = "LINKED_DUPLICATE";
      canonicalIssueDoc = duplicateCandidate.issue;
      canonicalIssueDoc.duplicateCount += 1;
      canonicalIssueDoc.lastUpdatedAt = new Date();

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

    return sendSuccess(res, {
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
    return sendError(res, error);
  }
}

export async function getDetections(req: Request, res: Response) {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);
    const detections = await Detection.find()
      .sort({ detectedAt: -1 })
      .limit(limit)
      .populate("matchedIssueId", "referenceCode title status priorityLevel category");

    return sendSuccess(res, detections);
  } catch (error) {
    return sendError(res, error);
  }
}
