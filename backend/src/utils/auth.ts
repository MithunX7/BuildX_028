import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "COMMANDER" | "COORDINATOR" | "INSPECTOR" | "VERIFIER" | "OPERATOR" | "CITIZEN" | "ADMIN";
  departmentId?: string;
  departmentCode?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "nagpur-civic-dev-super-secret-key-change-in-production-2026";

export function signToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
