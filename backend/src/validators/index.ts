import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/errors";
import { sendError } from "../utils/response";

export const LoginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const FrameAnalysisSchema = z.object({
  imageBase64: z.string().optional(),
  sceneHint: z.string().optional(),
  coordinates: z.tuple([z.number(), z.number()]).optional(), // [lng, lat]
  addressText: z.string().optional(),
  sourceType: z.enum(["LIVE_CAMERA", "PATROL_VIDEO_FEED", "SURVEY_STREAM"]).default("PATROL_VIDEO_FEED"),
});

export const IssueTriageSchema = z.object({
  departmentId: z.string().optional(),
  priorityLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  priorityScore: z.number().min(0).max(100).optional(),
  assignContractor: z.boolean().default(false),
  contractorName: z.string().optional(),
  dueInHours: z.number().min(1).default(24),
});

export const WorkOrderEvidenceSchema = z.object({
  imageBase64: z.string().min(1, "Evidence image payload is required"),
  completionNotes: z.string().optional(),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
});

export const WorkOrderVerifySchema = z.object({
  action: z.enum(["APPROVE", "REOPEN", "REJECT"]),
  notes: z.string().min(3, "Verification notes are required"),
});

export const CitizenReportSchema = z.object({
  category: z.enum([
    "POTHOLE",
    "GARBAGE_ACCUMULATION",
    "STREETLIGHT_FAULT",
    "ROAD_OBSTRUCTION",
    "DAMAGED_ASSET",
    "ROAD_SURFACE_DAMAGE",
    "CONSTRUCTION_CONFLICT",
  ]).or(z.string()).default("POTHOLE"),
  title: z.string().optional().default("Civic Infrastructure Grievance"),
  description: z.string().optional().default("Citizen reported municipal infrastructure defect needing repair."),
  coordinates: z.union([z.tuple([z.number(), z.number()]), z.array(z.number())]).default([79.0882, 21.1458]),
  addressText: z.string().optional().default("Nagpur Municipal Corporation Area"),
  imageBase64: z.string().optional().nullable(),
});

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return sendError(res, new ValidationError(errorMessages, result.error.format()));
    }
    req.body = result.data;
    next();
  };
}
