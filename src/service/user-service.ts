import bcrypt from 'bcrypt';
import { IChatModel, IUserAuthResponse, IUserModel, IUserService } from '../types/types.js';
import { UserDto } from '../dtos/user-dto.js';
import { tokenService } from './token-service.js';
import { ApiError } from '../exceptions/api-error.js';
import { Avatar, OnlineStatus, User } from '../models/models.js';
import { chatService } from './chat-service.js';

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

    await this.updateUserNameInChats(user.id, user.name, newName);

    await User.update(
      { name: newName, email: newEmail, password: hashNewPassword },
      { where: { email } },
    );

    const updatedUser = await User.findOne({ where: { email: newEmail } });

    if (!updatedUser) {
      throw ApiError.NotFoundError('Updated user was not found');
    }

    return this.getUserDTOWithTokens(updatedUser);
  };

  getAvatarImage = async (userId: string) => {
    const file = await Avatar.findOne({ where: { userId } });

    if (!file || !file.avatarPath) {
      throw ApiError.NotFoundError('This avatar was not found');
    }

    return file.avatarPath;
  };

  updateAvatarImage = (userId: string, avatarPath: string) => {
    return Avatar.update({ avatarPath }, { where: { userId } });
  };

  updateUserName = async (id: string, newName: string) => {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      throw ApiError.NotFoundError('This User was not found');
    }

    await this.updateUserNameInChats(id, user.name, newName);

    const updatedUser = await user.update({ name: newName }, { where: { id } });

    return this.getUserDTOWithTokens(updatedUser);
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

  changeOnlineStatus = async (userId: string, online: boolean) => {
    return OnlineStatus.update({ online }, { where: { userId } });
  };

  private getUserDTOWithTokens = async (user: IUserModel) => {
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  };

  private updateUserNameInChats = async (userId: string, userName: string, newName: string) => {
    const userChats = await chatService.getUserChats(userId, userName);

    const updatedChats: Promise<IChatModel>[] = [];

    userChats.forEach((chat) => {
      const receiver = chat.participants.find((user) => user.userId !== userId);

      if (receiver) {
        const updatedMessages = chat.messages.map((message) => {
          if (message.name !== receiver.userName) return { ...message, name: newName };
          return message;
        });

        updatedChats.push(
          chat.update({
            participants: [receiver, { userId: userId, userName: newName }],
            messages: updatedMessages,
          }),
        );
      }
    });

    return Promise.all(updatedChats);
  };
}

export const userService = new UserService();
