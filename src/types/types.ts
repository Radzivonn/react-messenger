import { Model, InferAttributes, InferCreationAttributes } from 'sequelize';

export enum WEBSOCKET_EVENTS {
  SEND_MESSAGE = 'send_message',
  CONNECTION = 'connection',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  DISCONNECTION = 'disconnect',
}

export interface Message {
  chatId: string;
  date: string;
  name: string;
  message: string;
}

export interface IUserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface IUserAuthResponse {
  user: IUserDTO;
  accessToken: string;
  refreshToken: string;
}

export interface IUser extends IUserDTO {
  password: string;
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
    IUserToken {}

export type FriendsList = string[];

export interface IUserFriends {
  userId: string;
  friendsList: FriendsList; // array of users' UUIDs
}

export interface IUserFriendsModel
  extends Model<InferAttributes<IUserFriendsModel>, InferCreationAttributes<IUserFriendsModel>>,
    IUserFriends {}

export type ChatList = string[];

export interface IChat {
  chatId: string;
  participants: string[];
  messages: Message[];
}

export interface IChatModel
  extends Model<InferAttributes<IChatModel>, InferCreationAttributes<IChatModel>>,
    IChat {}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}
