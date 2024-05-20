import { RequestHandler } from 'express';
import { IFriendListHandlerReqBody, IUpdateUserHandlerReqBody, IUserController } from './types.js';
import { IUser } from '../types/types.js';
import { userService } from '../service/user-service.js';
import { ApiError } from '../exceptions/api-error.js';
import { validationResult } from 'express-validator';

class UserController implements IUserController {
  private COOKIES_MAX_AGE = 5 * 60 * 1000; // ? 5 minutes test value

  getUserData: RequestHandler = (req, res, next) => {
    try {
      const accessToken = req.headers.authorization!.split(' ')[1]; // not undefined because before that auth middleware checked user auth
      const user = userService.getUserData(accessToken);
      return res.json(user);
    } catch (e) {
      next(e);
    }
  };

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
      const user = await userService.registration(name, email, password);
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
      const user = await userService.login(email, password);
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
      const isLoggedOut = await userService.logout(id, refreshToken);
      if (isLoggedOut) {
        res.clearCookie('refreshToken');
        return res.status(204).json();
      }
      return next(ApiError.BadRequest('This User has not logged out'));
    } catch (e) {
      next(e);
    }
  };

  refresh: RequestHandler = async (req, res, next) => {
    try {
      const { refreshToken } = req.cookies; // TODO typing refreshToken
      const user = await userService.refresh(refreshToken);
      res.cookie('refreshToken', user.refreshToken, {
        maxAge: this.COOKIES_MAX_AGE,
        httpOnly: true,
      });
      return res.json(user);
    } catch (e) {
      next(e);
    }
  };

  update: RequestHandler<{}, any, IUpdateUserHandlerReqBody> = async (req, res, next) => {
    try {
      const { email, password } = req.body.oldData;
      const { name: newName, email: newEmail, password: newPassword } = req.body.newData;

      const user = await userService.update(email, password, newName, newEmail, newPassword);
      res.cookie('refreshToken', user.refreshToken, {
        maxAge: this.COOKIES_MAX_AGE,
        httpOnly: true,
      });
      return res.json(user);
    } catch (e) {
      next(e);
    }
  };

  remove: RequestHandler<{}, any, Pick<IUser, 'email' | 'password'>> = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      await userService.remove(email, password);
      res.clearCookie('refreshToken');
      return res.status(204).json();
    } catch (e) {
      next(e);
    }
  };

  addFriend: RequestHandler<{}, any, IFriendListHandlerReqBody> = async (req, res, next) => {
    try {
      const { userId, friendId } = req.body;
      const friends = await userService.addFriend(userId, friendId);
      return res.json(friends);
    } catch (e) {
      next(e);
    }
  };

  removeFriend: RequestHandler<{}, any, IFriendListHandlerReqBody> = async (req, res, next) => {
    try {
      const { userId, friendId } = req.body;
      const friends = await userService.removeFriend(userId, friendId);
      return res.json(friends);
    } catch (e) {
      next(e);
    }
  };

  getFriends: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      const friendList = await userService.getFriends(id);
      return res.json(friendList);
    } catch (e) {
      next(e);
    }
  };
}

const userController = new UserController();
export default userController;
