import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, WEBSOCKET_EVENTS } from '../types/types.js';
import { chatService } from './chat-service.js';
import { userService } from './user-service.js';
import { friendListService } from './friend-list-service.js';

const startSocketServer = (io: Server<ClientToServerEvents, ServerToClientEvents>) => {
  io.on(WEBSOCKET_EVENTS.CONNECTION, async (socket) => {
    socket.on(WEBSOCKET_EVENTS.CONNECT_PARTICIPANT, async (userId, userName) => {
      await userService.changeOnlineStatus(userId, true);
      const chats = await chatService.getUserChats(userId, userName);

      chats.forEach((chat) => {
        socket.join(chat.chatId);
        socket.to(chat.chatId).emit(WEBSOCKET_EVENTS.PARTICIPANT_CONNECTED, userId);
      });

      const onlineStatusesArray = await friendListService.getFriendsOnlineStatuses(userId);

      const onlineStatuses = onlineStatusesArray.reduce<Record<string, boolean>>(
        (object, value) => {
          return { ...object, [value.userId]: value.online };
        },
        {},
      );

      socket.emit(WEBSOCKET_EVENTS.SOCKET_SUCCESSFULLY_CONNECTED, onlineStatuses);
    });

    socket.on(WEBSOCKET_EVENTS.DISCONNECT_PARTICIPANT, async (userId) => {
      await userService.changeOnlineStatus(userId, false);

      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.leave(room);
          socket.to(room).emit(WEBSOCKET_EVENTS.PARTICIPANT_DISCONNECTED, userId);
        }
      }

      socket.emit(WEBSOCKET_EVENTS.SOCKET_SUCCESSFULLY_DISCONNECTED);
    });

    socket.on(WEBSOCKET_EVENTS.JOIN_ROOM, async ({ chatId, userId, receiverId }) => {
      const [chat, isCreated] = await chatService.addChat(chatId, userId, receiverId);

      if (isCreated) socket.join(chat.chatId);

      socket.emit(WEBSOCKET_EVENTS.JOINED_ROOM_SUCCESSFULLY, {
        chat,
        isCreated,
      });
    });

    socket.on(WEBSOCKET_EVENTS.SEND_MESSAGE, async (message) => {
      await chatService.saveMessages(message.chatId, [message]);
      io.to(message.chatId).emit(WEBSOCKET_EVENTS.RECEIVE_MESSAGE, message);
    });
  });

  io.on(WEBSOCKET_EVENTS.DISCONNECT, (reason) => {
    console.log(`Server disconnected by reason: ${reason}`);
  });
};

export default startSocketServer;
