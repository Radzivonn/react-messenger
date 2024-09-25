import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, WEBSOCKET_EVENTS } from '../types/types.js';
import { chatService } from './chat-service.js';
import { userService } from './user-service.js';
import { friendListService } from './friend-list-service.js';

const startSocketServer = (io: Server<ClientToServerEvents, ServerToClientEvents>) => {
  io.on(WEBSOCKET_EVENTS.CONNECTION, async (socket) => {
    socket.on(WEBSOCKET_EVENTS.CONNECT_USER, async (userId, userName) => {
      await userService.changeOnlineStatus(userId, true);
      const chats = await chatService.getUserChats(userId, userName);

      chats.forEach((chat) => {
        socket.join(chat.chatId);
        socket.to(chat.chatId).emit(WEBSOCKET_EVENTS.USER_CONNECTED, userId);
      });

      const onlineStatusesArray = await friendListService.getFriendsOnlineStatuses(userId);

      const onlineStatuses = onlineStatusesArray.reduce<Record<string, boolean>>(
        (object, value) => {
          return { ...object, [value.userId]: value.online };
        },
        {},
      );

      socket.emit(WEBSOCKET_EVENTS.SOCKET_SUCCESSFULLY_CONNECTED, onlineStatuses, chats);
    });

    socket.on(WEBSOCKET_EVENTS.DISCONNECT_USER, async (userId) => {
      await userService.changeOnlineStatus(userId, false);

      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.leave(room);
          socket.to(room).emit(WEBSOCKET_EVENTS.USER_DISCONNECTED, userId);
        }
      }

      socket.emit(WEBSOCKET_EVENTS.SOCKET_SUCCESSFULLY_DISCONNECTED);
    });

    socket.on(WEBSOCKET_EVENTS.CREATE_CHAT, async ({ chatId, userId, receiverId }) => {
      const [chat, isCreated] = await chatService.addChat(chatId, userId, receiverId);

      if (isCreated) socket.join(chat.chatId);

      socket.emit(WEBSOCKET_EVENTS.CREATED_CHAT_SUCCESSFULLY, {
        chat,
        isCreated,
      });
    });

    socket.on(WEBSOCKET_EVENTS.START_TYPING, (chatId, userId) => {
      socket.to(chatId).emit(WEBSOCKET_EVENTS.RECEIVER_START_TYPING, userId);
    });

    socket.on(WEBSOCKET_EVENTS.STOP_TYPING, (chatId, userId) => {
      socket.to(chatId).emit(WEBSOCKET_EVENTS.RECEIVER_STOP_TYPING, userId);
    });

    socket.on(WEBSOCKET_EVENTS.SEND_MESSAGE, async (message) => {
      await chatService.saveMessages(message.chatId, [message]);
      socket.to(message.chatId).emit(WEBSOCKET_EVENTS.RECEIVE_MESSAGE, message);
    });
  });

  io.on(WEBSOCKET_EVENTS.DISCONNECT, (reason) => {
    console.log(`Server disconnected by reason: ${reason}`);
  });
};

export default startSocketServer;
