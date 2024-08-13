import { sequelize } from '../db/dbConfig.js';
import { DataTypes } from 'sequelize';
import {
  IAvatarModel,
  IChatModel,
  IOnlineStatusModel,
  IUserFriendsModel,
  IUserModel,
  IUserTokenModel,
} from '../types/types.js';

const User = sequelize.define<IUserModel>('user', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    autoIncrement: false,
  },
  name: { type: DataTypes.STRING(30) },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING(60) },
  role: { type: DataTypes.STRING, defaultValue: 'USER' },
});

const Avatar = sequelize.define<IAvatarModel>('avatar', {
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    autoIncrement: false,
  },
  avatarPath: { type: DataTypes.STRING, allowNull: true },
});

const OnlineStatus = sequelize.define<IOnlineStatusModel>('online_status', {
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    autoIncrement: false,
  },
  online: { type: DataTypes.BOOLEAN },
});

const Token = sequelize.define<IUserTokenModel>('token', {
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    autoIncrement: false,
  },
  refreshToken: { type: DataTypes.TEXT },
});

const Friends = sequelize.define<IUserFriendsModel>('friends', {
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    autoIncrement: false,
  },
  friendsList: { type: DataTypes.ARRAY(DataTypes.UUID) },
});

const Chat = sequelize.define<IChatModel>('chat', {
  chatId: {
    type: DataTypes.STRING,
    primaryKey: true,
    autoIncrement: false,
  },
  participants: { type: DataTypes.ARRAY(DataTypes.JSONB) }, // use JSONB because of usage Op.contains operator in getUserChats method
  messages: { type: DataTypes.ARRAY(DataTypes.JSON) },
});

User.hasOne(Token, { onDelete: 'CASCADE' });
Token.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

User.hasOne(Avatar, { onDelete: 'CASCADE' });
Avatar.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

User.hasOne(OnlineStatus, { onDelete: 'CASCADE' });
OnlineStatus.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

User.hasOne(Friends, { onDelete: 'CASCADE' });
Friends.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

export { User, Avatar, OnlineStatus, Token, Friends, Chat };
