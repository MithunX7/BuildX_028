import { jsonSuccess } from "@/lib/response";

export async function GET() {
  return jsonSuccess({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Nagpur Civic Infrastructure Platform API",
    version: "1.0.0",
  });
}
