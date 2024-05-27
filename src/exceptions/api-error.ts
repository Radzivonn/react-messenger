import { ValidationError } from 'express-validator';

enum STATUS_CODES {
  BAD_REQUEST = 400,
  UNAUTHENTICATED = 401,
  UNAUTHORIZED = 403,
  NOT_FOUND = 404,
}

export class ApiError extends Error {
  status: number;
  errors: ValidationError[];

  constructor(status: number, message: string, errors: ValidationError[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthenticatedError() {
    return new ApiError(STATUS_CODES.UNAUTHENTICATED, 'User is not authenticated');
  }

  static UnauthorizedError() {
    return new ApiError(STATUS_CODES.UNAUTHORIZED, 'User is not authorized');
  }

  static NotFoundError(message: string) {
    return new ApiError(STATUS_CODES.NOT_FOUND, message);
  }

  static BadRequest(message: string, errors: ValidationError[] = []) {
    return new ApiError(STATUS_CODES.BAD_REQUEST, message, errors);
  }
}
