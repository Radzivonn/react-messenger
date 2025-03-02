import { RequestHandler } from 'express';
import { ApiError } from '../exceptions/api-error.js';
import { tokenService } from '../service/token-service.js';
import { JWTCookies } from '../types/types.js';

export const authMiddleware: RequestHandler = (req, res, next) => {
  try {
    const { accessToken } = req.cookies as JWTCookies;
    if (!accessToken || typeof accessToken !== 'string') {
      return next(ApiError.UnauthorizedError());
    }

    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
};
