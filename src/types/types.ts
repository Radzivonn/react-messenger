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
  updateAvatarImage: (userId: string, avatarPath: string) => Promise<[affectedCount: number]>;
  getAvatarImage: (userId: string) => Promise<string>;
  updateUserName: (email: string, newName: string) => Promise<IUserAuthResponse>;
  removeAccount: (userId: string) => Promise<void>;
  changeOnlineStatus: (userId: string, online: boolean) => Promise<[affectedCount: number]>;
}

export interface IFriendListService {
  addFriend: (userId: string, friendId: string) => Promise<FriendsList>;
  removeFriend: (userId: string, friendId: string) => Promise<FriendsList>;
  getFriends: (userId: string) => Promise<IUserModel[]>;
  searchUsers: (userId: string, search: string) => Promise<IUserWithOnlineStatus[]>;
}

export interface IChatService {
  getChat: (chatId: string) => Promise<IChatModel>;
  getUserChats: (userId: string, userName: string) => Promise<IChatModel[]>;
  addChat: (chatId: string, userId: string, receiverId: string) => Promise<[IChat, boolean]>;
  removeChat: (chatId: string) => Promise<void>;
  saveMessages: (chatId: string, messages: Message[]) => Promise<IChatModel>;
}

export enum WEBSOCKET_EVENTS {
  SOCKET_SUCCESSFULLY_CONNECTED = 'socket_successfully_connected',
  SOCKET_SUCCESSFULLY_DISCONNECTED = 'socket_successfully_disconnected',
  SEND_MESSAGE = 'send_message',
  RECEIVE_MESSAGE = 'receive_message',
  START_TYPING = 'start_typing',
  STOP_TYPING = 'stop_typing',
  RECEIVER_START_TYPING = 'receiver_start_typing',
  RECEIVER_STOP_TYPING = 'receiver_stop_typing',
  CONNECTION = 'connection',
  CONNECTION_ERROR = 'connect_error',
  DISCONNECT = 'disconnect', // * Fired upon disconnection.
  DISCONNECTING = 'disconnecting', // * Fired when the client is going to be disconnected (but hasn't left its rooms yet).
  JOIN_ROOM = 'join_room',
  JOINED_ROOM_SUCCESSFULLY = 'joined_room_successfully',
  LEFT_ROOM_SUCCESSFULLY = 'left_room_successfully',
  LEAVE_ROOM = 'leave_room',
  CONNECT_PARTICIPANT = 'connect_participant',
  PARTICIPANT_CONNECTED = 'participant_connected',
  DISCONNECT_PARTICIPANT = 'disconnect_participant',
  PARTICIPANT_DISCONNECTED = 'participant_disconnected',
}

interface JoinedRoomSuccessfullyPayload {
  chat: IChat;
  isCreated: boolean;
}

export interface ServerToClientEvents {
  socket_successfully_connected: (friendsOnlineStatuses: Record<string, boolean>) => void;
  socket_successfully_disconnected: () => void;
  receive_message: (message: Message) => void;
  receiver_start_typing: (userId: string) => void;
  receiver_stop_typing: (userId: string) => void;
  joined_room_successfully: (payload: JoinedRoomSuccessfullyPayload) => void;
  left_room_successfully: () => void;
  connect_participant: (isReceiverOnline: boolean) => void;
  participant_connected: (userId: string) => void;
  participant_disconnected: (userId: string) => void;
}

export interface JoinRoomPayload {
  chatId: string;
  userId: string;
  receiverId: string;
}

export interface ClientToServerEvents {
  start_typing: (chatId: string, userId: string) => void;
  stop_typing: (chatId: string, userId: string) => void;
  join_room: (payload: JoinRoomPayload) => void;
  send_message: (message: Message) => void;
  leave_room: () => void;
  connect_participant: (userId: string, userName: string) => void;
  disconnect_participant: (userId: string) => void;
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

export interface IUserWithOnlineStatus extends IUserDTO {
  online: boolean;
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

export interface IAvatar {
  userId: string;
  avatarPath: string | null;
}

export interface IAvatarModel
  extends Model<InferAttributes<IAvatarModel>, InferCreationAttributes<IAvatarModel>>,
    IAvatar {}

export interface IOnlineStatus {
  userId: string;
  online: boolean;
}

export interface IOnlineStatusModel
  extends Model<InferAttributes<IOnlineStatusModel>, InferCreationAttributes<IOnlineStatusModel>>,
    IOnlineStatus {}

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

export interface IChatModel
  extends Model<InferAttributes<IChatModel>, InferCreationAttributes<IChatModel>>,
    IChat {}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

interface Participant {
  userId: string;
  userName: string;
}

export interface IChat {
  chatId: string;
  participants: Participant[];
  messages: Message[];
}
