import mongoose from "mongoose";
import { AuditLog } from "@/models/AuditLog";
import { logger } from "./logger";

export async function logAuditEvent(params: {
  actorId?: string;
  actorName?: string;
  action: string;
  entityType: "ISSUE" | "WORK_ORDER" | "DETECTION" | "CONFLICT" | "USER";
  entityId: string | mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
}) {
  try {
    await AuditLog.create({
      actorId: params.actorId ? new mongoose.Types.ObjectId(params.actorId) : undefined,
      actorName: params.actorName || "SYSTEM",
      action: params.action,
      entityType: params.entityType,
      entityId: new mongoose.Types.ObjectId(params.entityId),
      metadata: params.metadata,
      timestamp: new Date(),
    });
    logger.info(`[AUDIT] ${params.action} on ${params.entityType}:${params.entityId}`, params.metadata);
  } catch (error) {
    logger.error("Failed to write audit log", error);
  }
}
