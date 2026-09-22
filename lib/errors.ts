import { ApiErrorCode } from "@/types/api";

export class AppError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code: ApiErrorCode = "INTERNAL_ERROR", statusCode = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message = "The request contains invalid fields.", details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = "Authentication required to access this resource.") {
    super(message, "UNAUTHENTICATED", 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "The requested entity was not found.") {
    super(message, "NOT_FOUND", 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Invalid state transition or duplicate resource exists.") {
    super(message, "CONFLICT", 409);
  }
}

export class FileTooLargeError extends AppError {
  constructor(message = "File exceeds maximum permitted size.") {
    super(message, "FILE_TOO_LARGE", 413);
  }
}

export class UnsupportedFileTypeError extends AppError {
  constructor(message = "Unsupported file type provided.") {
    super(message, "UNSUPPORTED_FILE_TYPE", 415);
  }
}

export class RateLimitedError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, "RATE_LIMITED", 429);
  }
}
