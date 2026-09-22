import { SessionUser, UserRole } from "@/types/auth";
import { ForbiddenError, UnauthenticatedError } from "./errors";

export type PermissionAction =
  | "DETECT_LIVE_FEED"
  | "VIEW_OPERATIONS_DASHBOARD"
  | "TRIAGE_ISSUE"
  | "OVERRIDE_PRIORITY"
  | "DISPATCH_WORK_ORDER"
  | "UPDATE_WORK_ORDER_PROGRESS"
  | "UPLOAD_COMPLETION_EVIDENCE"
  | "VERIFY_AND_CLOSE_WORK_ORDER"
  | "REOPEN_WORK_ORDER"
  | "MANAGE_CONSTRUCTION_PROJECTS"
  | "RESOLVE_CONSTRUCTION_CONFLICT"
  | "CREATE_CITIZEN_REPORT"
  | "VIEW_AUDIT_LOGS"
  | "MANAGE_USERS";

const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  COMMANDER: [
    "DETECT_LIVE_FEED",
    "VIEW_OPERATIONS_DASHBOARD",
    "TRIAGE_ISSUE",
    "OVERRIDE_PRIORITY",
    "DISPATCH_WORK_ORDER",
    "UPDATE_WORK_ORDER_PROGRESS",
    "UPLOAD_COMPLETION_EVIDENCE",
    "VERIFY_AND_CLOSE_WORK_ORDER",
    "REOPEN_WORK_ORDER",
    "MANAGE_CONSTRUCTION_PROJECTS",
    "RESOLVE_CONSTRUCTION_CONFLICT",
    "CREATE_CITIZEN_REPORT",
    "VIEW_AUDIT_LOGS",
    "MANAGE_USERS",
  ],
  COORDINATOR: [
    "DETECT_LIVE_FEED",
    "VIEW_OPERATIONS_DASHBOARD",
    "TRIAGE_ISSUE",
    "OVERRIDE_PRIORITY",
    "DISPATCH_WORK_ORDER",
    "MANAGE_CONSTRUCTION_PROJECTS",
    "RESOLVE_CONSTRUCTION_CONFLICT",
    "CREATE_CITIZEN_REPORT",
    "VIEW_AUDIT_LOGS",
  ],
  INSPECTOR: [
    "DETECT_LIVE_FEED",
    "VIEW_OPERATIONS_DASHBOARD",
    "UPDATE_WORK_ORDER_PROGRESS",
    "UPLOAD_COMPLETION_EVIDENCE",
    "CREATE_CITIZEN_REPORT",
  ],
  VERIFIER: [
    "DETECT_LIVE_FEED",
    "VIEW_OPERATIONS_DASHBOARD",
    "VERIFY_AND_CLOSE_WORK_ORDER",
    "REOPEN_WORK_ORDER",
    "VIEW_AUDIT_LOGS",
    "CREATE_CITIZEN_REPORT",
  ],
  OPERATOR: [
    "DETECT_LIVE_FEED",
    "CREATE_CITIZEN_REPORT",
    "VIEW_OPERATIONS_DASHBOARD",
  ],
  CITIZEN: [
    "CREATE_CITIZEN_REPORT",
  ],
  ADMIN: [
    "DETECT_LIVE_FEED",
    "VIEW_OPERATIONS_DASHBOARD",
    "TRIAGE_ISSUE",
    "OVERRIDE_PRIORITY",
    "DISPATCH_WORK_ORDER",
    "UPDATE_WORK_ORDER_PROGRESS",
    "UPLOAD_COMPLETION_EVIDENCE",
    "VERIFY_AND_CLOSE_WORK_ORDER",
    "REOPEN_WORK_ORDER",
    "MANAGE_CONSTRUCTION_PROJECTS",
    "RESOLVE_CONSTRUCTION_CONFLICT",
    "CREATE_CITIZEN_REPORT",
    "VIEW_AUDIT_LOGS",
    "MANAGE_USERS",
  ],
};

export function hasPermission(user: SessionUser | null, action: PermissionAction): boolean {
  if (!user) return false;
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.includes(action);
}

export function requirePermission(user: SessionUser | null, action: PermissionAction) {
  if (!user) {
    throw new UnauthenticatedError();
  }
  if (!hasPermission(user, action)) {
    throw new ForbiddenError(`User role ${user.role} lacks permission for ${action}`);
  }
}
