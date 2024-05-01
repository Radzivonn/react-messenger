import { RequestHandler } from 'express';
import { IUser } from '../types/types.js';

export interface IUpdateUserDataBody {
  oldData: Pick<IUser, 'email' | 'password'>;
  newData: Omit<IUser, 'id'>;
}

export interface IUserController {
  registration: RequestHandler<{}, any, Pick<IUser, 'name' | 'email' | 'password'>>;
  login: RequestHandler<{}, any, Pick<IUser, 'email' | 'password'>>;
  logout: RequestHandler;
  update: RequestHandler<{}, any, IUpdateUserDataBody>;
  remove: RequestHandler<{}, any, Pick<IUser, 'email' | 'password'>>;
}
