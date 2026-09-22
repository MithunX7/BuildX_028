export type CivicDefectCategory =
  | "POTHOLE"
  | "ROAD_SURFACE_DAMAGE"
  | "GARBAGE_ACCUMULATION"
  | "STREETLIGHT_FAULT"
  | "ROAD_OBSTRUCTION"
  | "CONSTRUCTION_CONFLICT"
  | "DAMAGED_ASSET";

export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IssueStatus =
  | "NEW"
  | "TRIAGED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED_FOR_VERIFICATION"
  | "RESOLVED"
  | "REOPENED"
  | "REJECTED";

export interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
  addressText?: string;
  zoneName?: string;
}

export interface CanonicalIssue {
  id: string;
  referenceCode: string;
  category: CivicDefectCategory;
  title: string;
  description: string;
  location: GeoLocation;
  departmentId: string;
  departmentName?: string;
  departmentCode?: string;
  priorityLevel: PriorityLevel;
  priorityScore: number;
  priorityReasons: string[];
  status: IssueStatus;
  duplicateCount: number;
  reporterId?: string;
  reporterName?: string;
  evidencePhotos?: string[];
  activeWorkOrderId?: string;
  firstReportedAt: string;
  lastUpdatedAt: string;
  resolvedAt?: string;
}
