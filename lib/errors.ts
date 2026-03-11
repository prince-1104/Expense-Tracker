export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code = "APP_ERROR", status = 500) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = "VALIDATION_ERROR") {
    super(message, code, 400);
  }
}

export class AuthError extends AppError {
  constructor(message = "Unauthorized", code = "UNAUTHORIZED") {
    super(message, code, 401);
  }
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorShape {
  success: false;
  error: string;
  code?: string;
}

export function ok<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function fail(error: string, code?: string): ApiErrorShape {
  return { success: false, error, code };
}

