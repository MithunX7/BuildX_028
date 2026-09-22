import mongoose from "mongoose";
import { CivicDefectCategory } from "./detectionService";
import { Department } from "../models/Department";

export interface DepartmentRoutingSuggestion {
  departmentCode: string;
  departmentName: string;
  departmentId?: string;
  slaHours: number;
  routingReason: string;
}

const CATEGORY_DEPARTMENT_MAP: Record<CivicDefectCategory, { code: string; defaultName: string; defaultSla: number; reason: string }> = {
  POTHOLE: {
    code: "ROADS",
    defaultName: "Roads & Traffic Department",
    defaultSla: 24,
    reason: "Assigned to Roads Department due to asphalt/carriageway structural damage.",
  },
  GARBAGE_ACCUMULATION: {
    code: "SANITATION",
    defaultName: "Solid Waste Management Department",
    defaultSla: 12,
    reason: "Assigned to Solid Waste Management for debris and garbage clearance.",
  },
  STREETLIGHT_FAULT: {
    code: "ELECTRICAL",
    defaultName: "Electrical & Public Lighting Department",
    defaultSla: 24,
    reason: "Assigned to Electrical Department for luminaire/pole repair.",
  },
  ROAD_OBSTRUCTION: {
    code: "WATER_WORKS",
    defaultName: "Water Works & Public Infrastructure",
    defaultSla: 12,
    reason: "Assigned to Water Works / Public Works for pipeline obstruction clearance.",
  },
  ROAD_SURFACE_DAMAGE: {
    code: "ROADS",
    defaultName: "Roads & Traffic Department",
    defaultSla: 24,
    reason: "Assigned to Roads Department for surface resurfacing.",
  },
  CONSTRUCTION_CONFLICT: {
    code: "ROADS",
    defaultName: "Roads & Traffic Department",
    defaultSla: 24,
    reason: "Assigned for inter-agency construction project conflict resolution.",
  },
  DAMAGED_ASSET: {
    code: "ROADS",
    defaultName: "Roads & Traffic Department",
    defaultSla: 48,
    reason: "Assigned to Roads Department for divider/guard rail maintenance.",
  },
};

export async function suggestDepartmentForCategory(category: CivicDefectCategory): Promise<DepartmentRoutingSuggestion> {
  const config = CATEGORY_DEPARTMENT_MAP[category] || CATEGORY_DEPARTMENT_MAP.POTHOLE;
  
  if (mongoose.connection.readyState === 1) {
    try {
      const deptDoc = await Department.findOne({ code: config.code, isActive: true });
      if (deptDoc) {
        return {
          departmentCode: deptDoc.code,
          departmentName: deptDoc.name,
          departmentId: deptDoc._id.toString(),
          slaHours: (deptDoc.slaHours as unknown as Record<string, number>)?.HIGH || config.defaultSla,
          routingReason: config.reason,
        };
      }
    } catch {
      // Fallback
    }
  }

  return {
    departmentCode: config.code,
    departmentName: config.defaultName,
    slaHours: config.defaultSla,
    routingReason: config.reason,
  };
}
