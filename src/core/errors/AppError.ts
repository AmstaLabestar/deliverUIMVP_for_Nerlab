export type ErrorCode =
  | "network_error"
  | "unauthorized"
  | "validation_error"
  | "unknown_error";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly cause?: unknown;

  constructor(code: ErrorCode, message: string, cause?: unknown) {
    super(message);
    this.code = code;
    this.cause = cause;
  }
}
