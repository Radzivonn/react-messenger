import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import { IUserAuthResponse } from '../types/types.js';
import { UserDto } from '../dtos/user-dto.js';
import { tokenService } from './token-service.js';
import { ApiError } from '../exceptions/api-error.js';
import { Friends, User } from '../models/models.js';

class UserService {
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

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
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

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  };

  logout = async (refreshToken: string) => {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const isRemoved = await tokenService.removeToken(refreshToken);
    return isRemoved;
  };

  refresh = async (refreshToken: string): Promise<IUserAuthResponse> => {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await User.findOne({ where: { email: userData.email } });

    if (!user) {
      throw ApiError.NotFoundError('This user was not found');
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  };

  update = async (
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

  remove = async (email: string, password: string) => {
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

  addFriend = async (userId: string, friendId: string) => {
    if (userId === friendId) {
      throw ApiError.BadRequest("You can't add yourself as a friend");
    }

    const userFriend = await User.findOne({ where: { id: friendId } });

    if (!userFriend) {
      throw ApiError.NotFoundError('This User was not found');
    }

    const friends = await Friends.findOne({ where: { userId } });

    if (friends) {
      if (friends.friendsList.find((id) => id === friendId)) {
        throw ApiError.BadRequest('This user is already in friend list');
      }

      return (await friends.update({ friendsList: [...friends.friendsList, friendId] }))
        .friendsList;
    }

    return (await Friends.create({ userId, friendsList: [friendId] })).friendsList;
  };

  removeFriend = async (userId: string, friendId: string) => {
    const friends = await Friends.findOne({ where: { userId } });

    if (!friends || (friends && !friends.friendsList.length)) {
      throw ApiError.BadRequest("This user's friends list is empty");
    }

    const newFriendsList = friends.friendsList.filter((id) => id !== friendId);
    return (await friends.update({ friendsList: newFriendsList })).friendsList;
  };
}

export const userService = new UserService();