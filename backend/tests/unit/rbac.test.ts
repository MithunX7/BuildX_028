import { describe, it, expect } from "vitest";
import { signToken, verifyToken, isAdminRole } from "../../src/utils/auth";

describe("Role-Based Access Control (RBAC) System", () => {
  it("should correctly identify admin roles", () => {
    expect(isAdminRole("ADMIN")).toBe(true);
    expect(isAdminRole("COMMANDER")).toBe(true);
    expect(isAdminRole("COORDINATOR")).toBe(true);
    expect(isAdminRole("VERIFIER")).toBe(true);
  });

  it("should deny admin privileges to normal citizens / users", () => {
    expect(isAdminRole("USER")).toBe(false);
    expect(isAdminRole("CITIZEN")).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole("GUEST")).toBe(false);
  });

  it("should generate and verify signed JWT session tokens", () => {
    const user = {
      id: "66fbf881a568ee5664a45711",
      name: "Ravi Joshi",
      email: "citizen@nagpur.gov.in",
      role: "USER",
    };

    const token = signToken(user);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(user.id);
    expect(decoded?.email).toBe(user.email);
    expect(decoded?.role).toBe("USER");
  });

  it("should reject tampered or invalid tokens", () => {
    const invalid = verifyToken("invalid.token.payload");
    expect(invalid).toBeNull();
  });
});
