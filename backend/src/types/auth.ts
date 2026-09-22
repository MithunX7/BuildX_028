export type UserRole =
  | "COMMANDER"
  | "COORDINATOR"
  | "INSPECTOR"
  | "VERIFIER"
  | "OPERATOR"
  | "CITIZEN"
  | "ADMIN";

export interface SessionUser {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  departmentCode?: string;
}

export interface AuthSession {
  user: SessionUser;
  expiresAt: string;
}
