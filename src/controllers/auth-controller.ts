import { RequestHandler } from 'express';
import { IAuthService, IUser, STATUS_CODES } from '../types/types.js';
import { ApiError } from '../exceptions/api-error.js';
import { validationResult } from 'express-validator';
import { authService } from '../service/auth-service.js';
import BaseController from './base-controller.js';

class AuthController extends BaseController {
  private readonly authService: IAuthService;

  constructor(authService: IAuthService) {
    super();
    this.authService = authService;
  }

  registration: RequestHandler<{}, any, Pick<IUser, 'name' | 'email' | 'password'>> = async (
    req,
    res,
    next,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Validation error', errors.array()));
      }

      const { name, email, password } = req.body;
      const user = await this.authService.registration(name, email, password);
      res.cookie('refreshToken', user.refreshToken, {
        maxAge: this.COOKIES_MAX_AGE,
        httpOnly: true,
      });
      return res.json(user);
    } catch (e) {
      next(e);
    }
  };

  login: RequestHandler<{}, any, Pick<IUser, 'email' | 'password'>> = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await this.authService.login(email, password);
      res.cookie('refreshToken', user.refreshToken, {
        maxAge: this.COOKIES_MAX_AGE,
        httpOnly: true,
      });
      return res.json(user);
    } catch (e) {
      next(e);
    }
  };

  logout: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { refreshToken } = req.cookies; // TODO typing refreshToken
      const isLoggedOut = await this.authService.logout(id, refreshToken);
      if (isLoggedOut) {
        res.clearCookie('refreshToken');
        return res.status(STATUS_CODES.NO_CONTENT).json();
      }
      return next(ApiError.BadRequest('This User has not logged out'));
    } catch (e) {
      next(e);
    }
  };

  refresh: RequestHandler = async (req, res, next) => {
    try {
      const { refreshToken } = req.cookies; // TODO typing refreshToken
      const user = await this.authService.refresh(refreshToken);
      res.cookie('refreshToken', user.refreshToken, {
        maxAge: this.COOKIES_MAX_AGE,
        httpOnly: true,
      });
      return res.json(user);
    } catch (e) {
      next(e);
    }
  };
}

const authController = new AuthController(authService);
export default authController;
