import { RequestHandler } from 'express';
import { IUpdateUserHandlerReqBody } from './types.js';
import { IUser, IUserService, STATUS_CODES } from '../types/types.js';
import { userService } from '../service/user-service.js';
import BaseController from './base-controller.js';

class UserController extends BaseController {
  private readonly userService: IUserService;

  constructor(userService: IUserService) {
    super();
    this.userService = userService;
  }

  getUserData: RequestHandler = (req, res, next) => {
    try {
      const accessToken = req.headers.authorization!.split(' ')[1]; // not undefined because before that auth middleware checked user auth
      const user = this.userService.getUserData(accessToken);
      return res.json(user);
    } catch (e) {
      next(e);
    }
  };

  updateAccountData: RequestHandler<{}, any, IUpdateUserHandlerReqBody> = async (
    req,
    res,
    next,
  ) => {
    try {
      const { email, password } = req.body.oldData;
      const { name: newName, email: newEmail, password: newPassword } = req.body.newData;

      const user = await this.userService.updateAccountData(
        email,
        password,
        newName,
        newEmail,
        newPassword,
      );
      res.cookie('refreshToken', user.refreshToken, {
        maxAge: this.COOKIES_MAX_AGE,
        httpOnly: true,
      });
      return res.json(user);
    } catch (e) {
      next(e);
    }
  };

  removeAccount: RequestHandler<{}, any, Pick<IUser, 'email' | 'password'>> = async (
    req,
    res,
    next,
  ) => {
    try {
      const { email, password } = req.body;
      await this.userService.removeAccount(email, password);
      res.clearCookie('refreshToken');
      return res.status(STATUS_CODES.NO_CONTENT).json();
    } catch (e) {
      next(e);
    }
  };
}

const userController = new UserController(userService);
export default userController;
