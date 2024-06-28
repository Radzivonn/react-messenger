import { RequestHandler } from 'express';
import { IUser } from '../types/types.js';

export interface IUpdateUserHandlerReqBody {
  oldData: Pick<IUser, 'email' | 'password'>;
  newData: Omit<IUser, 'id'>;
}

export interface IFriendListHandlerReqBody {
  userId: string;
  friendId: string;
}

export interface IUserController {
  registration: RequestHandler<{}, any, Pick<IUser, 'name' | 'email' | 'password'>>;
  login: RequestHandler<{}, any, Pick<IUser, 'email' | 'password'>>;
  logout: RequestHandler;
  update: RequestHandler<{}, any, IUpdateUserHandlerReqBody>;
  remove: RequestHandler<{}, any, Pick<IUser, 'email' | 'password'>>;
}
