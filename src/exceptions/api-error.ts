import { ValidationError } from 'express-validator';
import { STATUS_CODES } from '../types/types.js';

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
