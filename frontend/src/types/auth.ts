export type UserRole =
  | "USER"
  | "CITIZEN"
  | "ADMIN"
  | "COMMANDER"
  | "COORDINATOR"
  | "INSPECTOR"
  | "VERIFIER"
  | "OPERATOR";

export interface SessionUser {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | UserRole;
  departmentId?: string;
  departmentName?: string;
  departmentCode?: string;
  phone?: string;
}

export function isAdminRole(role?: string): boolean {
  if (!role) return false;
  return ["ADMIN", "COMMANDER", "COORDINATOR", "VERIFIER", "INSPECTOR", "OPERATOR"].includes(role);
}
