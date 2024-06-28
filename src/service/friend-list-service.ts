import { IFriendListService, IUserModel } from '../types/types.js';
import { UserDto } from '../dtos/user-dto.js';
import { ApiError } from '../exceptions/api-error.js';
import { Friends, User } from '../models/models.js';
import { Op } from 'sequelize';

class FriendListService implements IFriendListService {
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

export const friendListService = new FriendListService();
