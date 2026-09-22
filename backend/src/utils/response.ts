import { Response } from "express";
import { AppError } from "./errors";
import { logger } from "./logger";

export interface ApiResponseSuccess<T = unknown> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiResponseError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: Record<string, unknown>): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    meta,
  });
}

export function sendError(res: Response, error: unknown, defaultMessage = "An unexpected error occurred."): Response {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (error instanceof AppError) {
    logger.warn(`Handled error [${error.code}]: ${error.message}`, { requestId, details: error.details });
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      requestId,
    });
  }

  const errMessage = error instanceof Error ? error.message : defaultMessage;
  logger.error(`Unhandled error [INTERNAL_ERROR]: ${errMessage}`, { requestId, error });

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: errMessage,
    },
    requestId,
  });
}
