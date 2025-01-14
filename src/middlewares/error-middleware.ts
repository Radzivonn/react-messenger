import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../exceptions/api-error.js';

export const errorMiddleware = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(err);
  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message, errors: err.errors });
  }
  res.status(500).json({ message: 'Unexpected error' });
};
