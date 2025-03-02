import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import { IAuthService, IUserAuthResponse, IUserModel } from '../types/types.js';
import { tokenService } from './token-service.js';
import { ApiError } from '../exceptions/api-error.js';
import { Avatar, OnlineStatus, User } from '../models/models.js';

class AuthService implements IAuthService {
  registration = async (
    name: string,
    email: string,
    password: string,
    role = 'USER',
  ): Promise<IUserAuthResponse> => {
    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      throw ApiError.BadRequest(`User with the email address ${email} already exists`);
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    const randomId = v4();

    const user = await User.create({ id: randomId, name, email, password: hashPassword, role });
    await OnlineStatus.create({ userId: randomId, online: false });
    await Avatar.create({ userId: randomId, avatarPath: null });

    return tokenService.getUserDTOWithTokens(user);
  };

  login = async (email: string, password: string): Promise<IUserAuthResponse> => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw ApiError.NotFoundError('User with this email was not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.BadRequest('Incorrect password');
    }

    return tokenService.getUserDTOWithTokens(user);
  };

  logout = async (userId: string) => {
    const isRemoved = tokenService.removeToken(userId);
    return isRemoved;
  };

  refresh = async (refreshToken: string | undefined): Promise<IUserAuthResponse> => {
    if (!refreshToken) {
      throw ApiError.UnauthenticatedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || typeof userData === 'string' || !tokenFromDb) {
      throw ApiError.UnauthenticatedError();
    }

    const user = await User.findOne({ where: { email: userData.email } });

    if (!user) {
      throw ApiError.NotFoundError('This user was not found');
    }

    return tokenService.getUserDTOWithTokens(user);
  };
}

export const authService = new AuthService();
