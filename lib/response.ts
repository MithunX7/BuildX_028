import { NextResponse } from "next/server";
import { ApiResponse, ApiResponseError, ApiResponseSuccess } from "@/types/api";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function jsonSuccess<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  const payload: ApiResponseSuccess<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  return NextResponse.json(payload, { status });
}

export function jsonError(error: unknown, customRequestId?: string) {
  const requestId = customRequestId || generateRequestId();

  if (error instanceof AppError) {
    logger.warn(`API Application Error [${error.code}]: ${error.message}`, error.details, requestId);
    const payload: ApiResponseError = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      requestId,
    };
    return NextResponse.json(payload, { status: error.statusCode });
  }

  // Unhandled / server errors
  logger.error("API Unhandled Error", error, requestId);
  const payload: ApiResponseError = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected internal server error occurred.",
    },
    requestId,
  };
  return NextResponse.json(payload, { status: 500 });
}
