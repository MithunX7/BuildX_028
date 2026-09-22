import { Request, Response, NextFunction } from "express";
import { verifyToken, SessionUser, isAdminRole } from "../utils/auth";
import { UnauthenticatedError, ForbiddenError } from "../utils/errors";
import { sendError } from "../utils/response";

export interface AuthenticatedRequest extends Request {
  user?: SessionUser;
}

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

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    const user = extractUser(req);
    if (!user) {
      return sendError(res, new UnauthenticatedError("Authentication token is missing or invalid"));
    }
    req.user = user;
  }

  if (!isAdminRole(req.user.role) && req.user.role !== "ADMIN") {
    return sendError(
      res,
      new ForbiddenError("Access denied. Administrative privileges are required to access this resource.")
    );
  }

  next();
}
