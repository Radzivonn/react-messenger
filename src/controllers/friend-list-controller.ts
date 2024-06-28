import { RequestHandler } from 'express';
import { IFriendListHandlerReqBody } from './types.js';
import { IFriendListService, STATUS_CODES } from '../types/types.js';
import BaseController from './base-controller.js';
import { friendListService } from '../service/friend-list-service.js';

class FriendListController extends BaseController {
  private readonly friendListService: IFriendListService;

  constructor(friendListService: IFriendListService) {
    super();
    this.friendListService = friendListService;
  }

  addFriend: RequestHandler<{}, any, IFriendListHandlerReqBody> = async (req, res, next) => {
    try {
      const { userId, friendId } = req.body;
      await this.friendListService.addFriend(userId, friendId);
      return res.status(STATUS_CODES.NO_CONTENT).json();
    } catch (e) {
      next(e);
    }
  };

  removeFriend: RequestHandler<{}, any, IFriendListHandlerReqBody> = async (req, res, next) => {
    try {
      const { userId, friendId } = req.body;
      await this.friendListService.removeFriend(userId, friendId);
      return res.status(STATUS_CODES.NO_CONTENT).json();
    } catch (e) {
      next(e);
    }
  };

  getFriends: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      const friendList = await this.friendListService.getFriends(id);
      return res.json(friendList);
    } catch (e) {
      next(e);
    }
  };

  searchUsers: RequestHandler = async (req, res, next) => {
    try {
      const { id, search } = req.params;
      const users = await this.friendListService.searchUsers(id, search);
      return res.json(users);
    } catch (e) {
      next(e);
    }
  };
}

const friendListController = new FriendListController(friendListService);
export default friendListController;
