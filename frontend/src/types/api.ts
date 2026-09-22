export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_FILE_TYPE"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export interface ApiErrorDetail {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
}

export interface ApiResponseSuccess<T = unknown> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiResponseError {
  success: false;
  error: ApiErrorDetail;
  requestId: string;
}

export type ApiResponse<T = unknown> = ApiResponseSuccess<T> | ApiResponseError;
