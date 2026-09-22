import { getCurrentUser } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/response";
import { UnauthenticatedError } from "@/lib/errors";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthenticatedError();
    }
    return jsonSuccess({ user });
  } catch (error) {
    return jsonError(error);
  }
}
