import { Model, InferAttributes, InferCreationAttributes } from 'sequelize';

export enum STATUS_CODES {
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHENTICATED = 401,
  UNAUTHORIZED = 403,
  NOT_FOUND = 404,
}

export interface IAuthService {
  registration: (
    name: string,
    email: string,
    password: string,
    role?: string,
  ) => Promise<IUserAuthResponse>;
  login: (email: string, password: string) => Promise<IUserAuthResponse>;
  logout: (userId: string, refreshToken: string) => Promise<boolean>;
  refresh: (refreshToken: string) => Promise<IUserAuthResponse>;
}

export interface IUserService {
  getUserData: (accessToken: string) => IUserDTO;
  updateAccountData: (
    email: string,
    password: string,
    newName: string,
    newEmail: string,
    newPassword: string,
  ) => Promise<IUserAuthResponse>;
  removeAccount: (email: string, password: string) => Promise<void>;
}

export interface IFriendListService {
  addFriend: (userId: string, friendId: string) => Promise<FriendsList>;
  removeFriend: (userId: string, friendId: string) => Promise<FriendsList>;
  getFriends: (userId: string) => Promise<IUserDTO[]>;
  searchUsers: (userId: string, search: string) => Promise<IUserDTO[]>;
}

export interface IChatService {
  getChat: (chatId: string) => Promise<IChatModel>;
  getUserChats: (userId: string) => Promise<IChatModel[]>;
  addChat: (chatId: string, userId: string, receiverId: string) => Promise<[IChatModel, boolean]>;
  removeChat: (chatId: string) => Promise<void>;
  saveMessages: (chatId: string, messages: Message[]) => Promise<IChatModel>;
}

export enum WEBSOCKET_EVENTS {
  SEND_MESSAGE = 'send_message',
  RECEIVE_MESSAGE = 'receive_message',
  CONNECTION = 'connection',
  CONNECTION_ERROR = 'connect_error',
  DISCONNECT = 'disconnect', // * Fired upon disconnection.
  DISCONNECTING = 'disconnecting', // * Fired when the client is going to be disconnected (but hasn't left its rooms yet).
  JOIN_ROOM = 'join_room',
  JOINED_ROOM_SUCCESSFULLY = 'joined_room_successfully',
  LEAVE_ROOM = 'leave_room',
  CONNECT_PARTICIPANT = 'connect_participant',
  DISCONNECT_PARTICIPANT = 'disconnect_participant',
}

interface JoinedRoomSuccessfullyPayload {
  messages: Message[];
  isCreated: boolean;
}

export interface ServerToClientEvents {
  receive_message: (message: Message) => void;
  joined_room_successfully: (payload: JoinedRoomSuccessfullyPayload) => void;
  connect_participant: (isReceiverOnline: boolean) => void;
  disconnect_participant: () => void;
}

export interface JoinRoomPayload {
  chatId: string;
  userId: string;
  receiverId: string;
}

export interface ClientToServerEvents {
  join_room: (payload: JoinRoomPayload) => void;
  send_message: (message: Message) => void;
  leave_room: (chatId: string) => void;
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
  participantsIds: string[];
  participantsNames: string[];
  messages: Message[];
}

export interface IChatModel
  extends Model<InferAttributes<IChatModel>, InferCreationAttributes<IChatModel>>,
    IChat {}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}
