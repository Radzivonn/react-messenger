import { IChatService, Message } from '../types/types.js';
import { ApiError } from '../exceptions/api-error.js';
import { Chat, User } from '../models/models.js';
import { Op } from 'sequelize';

class ChatService implements IChatService {
  getChat = async (chatId: string) => {
    const chat = await Chat.findOne({ where: { chatId } });
    if (!chat) throw ApiError.NotFoundError('This chat was not found');
    return chat;
  };

  getUserChats = async (userId: string, userName: string) => {
    const userChats = await Chat.findAll({
      where: {
        participants: {
          [Op.contains]: [{ userId, userName }],
        },
      },
    });
    return userChats;
  };

  addChat = async (chatId: string, userId: string, receiverId: string) => {
    const participants = await User.findAll({
      where: {
        id: {
          [Op.or]: [userId, receiverId],
        },
      },
    });

    if (participants.length < 2) throw ApiError.NotFoundError('Participants not found');

    const user = participants.find((user) => user.id === userId);
    const receiver = participants.find((user) => user.id !== userId);

    if (!user || !receiver) throw ApiError.NotFoundError('Some participant was not found');

    const chat = await Chat.findOrCreate({
      where: { chatId },
      defaults: {
        chatId,
        participants: [
          { userId: user.id, userName: user.name },
          { userId: receiver.id, userName: receiver.name },
        ],
        messages: [],
      },
    });
    return chat;
  };

  removeChat = async (chatId: string) => {
    const chat = await Chat.findOne({ where: { chatId } });
    if (!chat) throw ApiError.NotFoundError('This chat was not found');
    await chat.destroy();
  };

  saveMessages = async (chatId: string, messages: Message[]) => {
    const chat = await Chat.findOne({ where: { chatId } });
    if (!chat) throw ApiError.BadRequest('This chat was not found');
    return chat.update({ messages: [...chat.messages, ...messages] });
  };
}

export const chatService = new ChatService();
