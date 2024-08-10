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

    const friendsData = User.findAll({
      where: {
        id: {
          [Op.in]: friends.friendsList,
        },
      },
    });
    return friendsData;
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

    const idsArray = users.map((user) => user.id);
    const onlineStatuses = await this.getOnlineStatusesByIds(idsArray);

    return users.map((user) => ({
      ...new UserDto(user),
      online: this.findOnlineStatusById(onlineStatuses, user.id),
    }));
  };

  getFriendsOnlineStatuses = async (userId: string) => {
    const friends = await Friends.findOne({ where: { userId } });

    if (!friends || (friends && !friends.friendsList.length)) return [];

    return this.getOnlineStatusesByIds(friends.friendsList);
  };

  private findOnlineStatusById = (onlineStatuses: IOnlineStatusModel[], userId: string) => {
    const foundStatus = onlineStatuses.find((userStatus) => userStatus.userId === userId);
    if (!foundStatus) return false;
    return foundStatus.online;
  };

  private getOnlineStatusesByIds = (idsArray: string[]) =>
    OnlineStatus.findAll({
      where: {
        userId: {
          [Op.in]: idsArray,
        },
      },
    });
}

export const friendListService = new FriendListService();
