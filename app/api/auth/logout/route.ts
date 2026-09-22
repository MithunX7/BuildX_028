import { clearSessionCookie } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/response";

export async function POST() {
  try {
    await clearSessionCookie();
    return jsonSuccess({ message: "Logged out successfully" });
  } catch (error) {
    return jsonError(error);
  }
}
