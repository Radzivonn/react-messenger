import { IFriendListService, IOnlineStatusModel } from '../types/types.js';
import { UserDto } from '../dtos/user-dto.js';
import { ApiError } from '../exceptions/api-error.js';
import { Friends, OnlineStatus, User } from '../models/models.js';
import { Op } from 'sequelize';

class FriendListService implements IFriendListService {
  addFriend = async (userId: string, friendId: string) => {
    if (userId === friendId) {
      throw ApiError.BadRequest("You can't add yourself as a friend");
    }

    const friend = await User.findOne({ where: { id: friendId } });

    if (!friend) {
      throw ApiError.NotFoundError('This User was not found');
    }

    const friends = await Friends.findOne({ where: { userId } });

    if (!friends) {
      return (await Friends.create({ userId, friendsList: [friendId] })).friendsList;
    }

    if (friends.friendsList.find((id) => id === friendId)) {
      throw ApiError.BadRequest('This user is already in friend list');
    }

    return (await friends.update({ friendsList: [...friends.friendsList, friendId] })).friendsList;
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

    const friendsData = await User.findAll({
      where: {
        id: {
          [Op.in]: friends.friendsList,
        },
      },
    });

    const onlineStatuses = await OnlineStatus.findAll({
      where: {
        userId: {
          [Op.in]: friends.friendsList,
        },
      },
    });

    return friendsData.map((friend) => ({
      ...new UserDto(friend),
      online: this.findOnlineStatusById(onlineStatuses, friend.id),
    }));
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

    const onlineStatuses = await OnlineStatus.findAll({
      where: {
        userId: {
          [Op.in]: users.map((user) => user.id),
        },
      },
    });

    return users.map((user) => ({
      ...new UserDto(user),
      online: this.findOnlineStatusById(onlineStatuses, user.id),
    }));
  };

  private findOnlineStatusById = (onlineStatuses: IOnlineStatusModel[], userId: string) => {
    const foundStatus = onlineStatuses.find((userStatus) => userStatus.userId === userId);
    if (!foundStatus) return false;
    return foundStatus.online;
  };
}

export const friendListService = new FriendListService();
