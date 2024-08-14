import { RequestHandler } from 'express';
import { IUpdateUserHandlerReqBody } from './types.js';
import { IOnlineStatus, IUser, IUserService, STATUS_CODES } from '../types/types.js';
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

  getAvatarImage: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      const avatarPath = await this.userService.getAvatarImage(id);
      res.json({ avatarPath });
    } catch (e) {
      next(e);
    }
  };

  updateAvatarImage: RequestHandler = async (req, res, next) => {
    try {
      if (req.file) {
        const { id } = req.params;
        await this.userService.updateAvatarImage(id, req.file.path);
        return res.status(STATUS_CODES.NO_CONTENT).json();
      }
    } catch (e) {
      next(e);
    }
  };

  updateUserName: RequestHandler<{}, any, Pick<IUser, 'id' | 'name'>> = async (req, res, next) => {
    try {
      const { id, name } = req.body;

      const user = await this.userService.updateUserName(id, name);

      res.cookie('refreshToken', user.refreshToken, {
        maxAge: this.COOKIES_MAX_AGE,
        httpOnly: true,
      });
      return res.json(user);
    } catch (e) {
      next(e);
    }
  };

  removeAccount: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.userService.removeAccount(id);
      res.clearCookie('refreshToken');
      return res.status(STATUS_CODES.NO_CONTENT).json();
    } catch (e) {
      next(e);
    }
  };

  changeOnlineStatus: RequestHandler<{}, any, IOnlineStatus> = async (req, res, next) => {
    try {
      const { userId, online } = req.body;
      await this.userService.changeOnlineStatus(userId, online);
      return res.status(STATUS_CODES.NO_CONTENT).json();
    } catch (e) {
      next(e);
    }
  };
}

const userController = new UserController(userService);
export default userController;
