import { Request, Response, NextFunction } from "express";
import { verifyToken, SessionUser } from "../utils/auth";
import { UnauthenticatedError, ForbiddenError } from "../utils/errors";
import { sendError } from "../utils/response";

export interface AuthenticatedRequest extends Request {
  user?: SessionUser;
}

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

export type UserRole = "COMMANDER" | "COORDINATOR" | "INSPECTOR" | "VERIFIER" | "OPERATOR" | "CITIZEN" | "ADMIN";

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

export function extractUser(req: Request): SessionUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return verifyToken(parts[1]);
  }
  return null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = extractUser(req);
  if (!user) {
    return sendError(res, new UnauthenticatedError("Authentication token is missing or invalid"));
  }
  req.user = user;
  next();
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = extractUser(req);
  if (user) {
    req.user = user;
  }
  next();
}

export function requirePermission(action: PermissionAction) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, new UnauthenticatedError());
    }

    const permissions = ROLE_PERMISSIONS[req.user.role] || [];
    if (!permissions.includes(action)) {
      return sendError(res, new ForbiddenError(`User role ${req.user.role} lacks permission for ${action}`));
    }

    next();
  };
}
