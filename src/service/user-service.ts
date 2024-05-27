import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import { IUserAuthResponse, IUserModel } from '../types/types.js';
import { UserDto } from '../dtos/user-dto.js';
import { tokenService } from './token-service.js';
import { ApiError } from '../exceptions/api-error.js';
import { Friends, User } from '../models/models.js';
import { Op } from 'sequelize';

class UserService {
  getUserData = (accessToken: string) => {
    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData || typeof userData === 'string') {
      throw ApiError.UnauthorizedError();
    }
    return new UserDto(userData);
  };

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

  logout = async (userId: string, refreshToken: string) => {
    if (!refreshToken) {
      throw ApiError.UnauthenticatedError();
    }
    const isRemoved = await tokenService.removeToken(userId, refreshToken);
    return isRemoved;
  };

  refresh = async (refreshToken: string): Promise<IUserAuthResponse> => {
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

  getFriends = async (userId: string) => {
    const friends = await Friends.findOne({ where: { userId } });

    if (!friends || (friends && !friends.friendsList.length)) return [];

    const friendsDataPromises = friends.friendsList.map((id) => User.findOne({ where: { id } }));

    const friendsData = (await Promise.allSettled(friendsDataPromises)).filter(
      (res) => res.status === 'fulfilled' && res.value != null,
    ) as PromiseFulfilledResult<IUserModel>[];

    /* The returned array includes only data from successfully resolved promises in userDTO format */
    return friendsData.map((res) => new UserDto(res.value));
  };

  searchUsers = async (userId: string, search: string) => {
    const users = await User.findAll({
      where: {
        id: {
          [Op.not]: userId,
        },
        name: {
          [Op.iLike]: `%${search}%`,
        },
      },
    });

    return users.map((user) => new UserDto(user));
  };
}

export const userService = new UserService();
