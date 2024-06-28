import { RequestHandler } from 'express';
import { IChatService } from '../types/types.js';
import BaseController from './base-controller.js';
import { chatService } from '../service/chat-service.js';

class ChatController extends BaseController {
  private readonly chatService: IChatService;

  constructor(chatService: IChatService) {
    super();
    this.chatService = chatService;
  }

  getUserChats: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userChats = await this.chatService.getUserChats(id);
      return res.json(userChats);
    } catch (e) {
      next(e);
    }
  };
}

const chatController = new ChatController(chatService);
export default chatController;
