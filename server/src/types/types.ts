import { Model, InferAttributes, InferCreationAttributes } from 'sequelize';

export enum WebsocketEvents {
  MESSAGE_EVENT = 'message',
  CONNECTION_EVENT = 'connection',
}

export interface IUserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface IUser extends IUserDTO {
  password: string;
}

export interface IUserAuthResponse {
  user: IUserDTO;
  accessToken: string;
  refreshToken: string;
}

export interface IUserModel
  extends Model<InferAttributes<IUserModel>, InferCreationAttributes<IUserModel>>,
    IUser {}

export interface IUserToken {
  userId: string;
  refreshToken: string;
}

export interface IUserTokenModel
  extends Model<InferAttributes<IUserTokenModel>, InferCreationAttributes<IUserTokenModel>>,
    IUserToken {} // ??? userId field

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}
