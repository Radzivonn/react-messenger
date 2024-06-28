import bcrypt from 'bcrypt';
import { IUserAuthResponse, IUserService } from '../types/types.js';
import { UserDto } from '../dtos/user-dto.js';
import { tokenService } from './token-service.js';
import { ApiError } from '../exceptions/api-error.js';
import { User } from '../models/models.js';

class UserService implements IUserService {
  getUserData = (accessToken: string) => {
    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData || typeof userData === 'string') {
      throw ApiError.UnauthorizedError();
    }
    return new UserDto(userData);
  };

  updateAccountData = async (
    email: string,
    password: string,
    newName: string,
    newEmail: string,
    newPassword: string,
  ): Promise<IUserAuthResponse> => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw ApiError.NotFoundError('This User was not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.BadRequest('Incorrect password');
    }

    const salt = await bcrypt.genSalt();
    const hashNewPassword = await bcrypt.hash(newPassword, salt);

    await User.update(
      { name: newName, email: newEmail, password: hashNewPassword },
      { where: { email } },
    );

    const updatedUser = await User.findOne({ where: { email: newEmail } });

    if (!updatedUser) {
      throw ApiError.NotFoundError('Updated user was not found');
    }

    const userDto = new UserDto(updatedUser);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  };

  removeAccount = async (email: string, password: string) => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw ApiError.NotFoundError('This User was not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.BadRequest('Incorrect password');
    }

    await user.destroy();
  };
}

export const userService = new UserService();
