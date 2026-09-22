import { z } from "zod";

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
  category: z.enum(["POTHOLE", "GARBAGE_ACCUMULATION", "STREETLIGHT_FAULT", "ROAD_OBSTRUCTION", "DAMAGED_ASSET"]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
  addressText: z.string().min(3, "Address or landmark is required"),
  imageBase64: z.string().optional(),
});
