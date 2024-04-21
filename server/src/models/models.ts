import { sequelize } from '../db/dbConfig.js';
import { DataTypes } from 'sequelize';
import { IUserModel, IUserTokenModel } from '../types/types.js';

const User = sequelize.define<IUserModel>('user', {
  id: {
    type: DataTypes.UUID, // ???
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    autoIncrement: false,
  },
  name: { type: DataTypes.STRING(30) },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING(60) },
  role: { type: DataTypes.STRING, defaultValue: 'USER' },
});

const Token = sequelize.define<IUserTokenModel>('token', {
  userId: {
    type: DataTypes.UUID, // ???
    primaryKey: true,
    autoIncrement: false,
  },
  refreshToken: { type: DataTypes.TEXT },
});

User.hasOne(Token, { onDelete: 'CASCADE' });
Token.belongsTo(User, { foreignKey: 'userId' });

export { User, Token };
