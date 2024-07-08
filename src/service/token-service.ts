import 'dotenv/config';
import { ITokens, IUserDTO } from '../types/types.js';
import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;
import { Token } from '../models/models.js';

class TokenService {
  generateTokens = (payload: IUserDTO): ITokens => {
    const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

    if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
      throw new Error('JWT secret does not exist');
    }

    const accessToken = sign(payload, JWT_ACCESS_SECRET, { expiresIn: '12h' });
    const refreshToken = sign(payload, JWT_REFRESH_SECRET, { expiresIn: '24h' });
    return {
      accessToken,
      refreshToken,
    };
  };

  validateAccessToken = (token: string) => {
    try {
      const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

      if (!JWT_ACCESS_SECRET) throw new Error('JWT access token secret does not exist');

      const userData = verify(token, JWT_ACCESS_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  };

  validateRefreshToken = (token: string) => {
    try {
      const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

      if (!JWT_REFRESH_SECRET) throw new Error('Refresh token secret does not exist');

      const userData = verify(token, JWT_REFRESH_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  };

  saveToken = async (userId: string, refreshToken: string) => {
    const tokenData = await Token.findOne({ where: { userId } });

    if (tokenData) {
      const newTokenData = await Token.update({ refreshToken }, { where: { userId } });
      return newTokenData;
    }

    const token = await Token.create({ userId, refreshToken });
    return token;
  };

  removeToken = async (userId: string, refreshToken: string) => {
    const isRemoved = Boolean(await Token.destroy({ where: { userId, refreshToken } }));
    return isRemoved;
  };

  findToken = async (refreshToken: string) => {
    const tokenData = await Token.findOne({ where: { refreshToken } });
    return tokenData;
  };
}

export const tokenService = new TokenService();
