import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, WEBSOCKET_EVENTS } from '../types/types.js';
import { chatService } from './chat-service.js';

const startSocketServer = (io: Server<ClientToServerEvents, ServerToClientEvents>) => {
  io.on(WEBSOCKET_EVENTS.CONNECTION, (socket) => {
    socket.on(WEBSOCKET_EVENTS.JOIN_ROOM, async ({ chatId, userId, receiverId }) => {
      const [chat, isCreated] = await chatService.addChat(chatId, userId, receiverId);
      const isReceiverOnline = (await io.in(chatId).fetchSockets()).length > 0;

      socket.join(chatId);
      socket.emit(WEBSOCKET_EVENTS.JOINED_ROOM_SUCCESSFULLY, {
        messages: chat.messages,
        isCreated,
      });

      io.to(chatId).emit(WEBSOCKET_EVENTS.CONNECT_PARTICIPANT, isReceiverOnline);
    });

    socket.on(WEBSOCKET_EVENTS.SEND_MESSAGE, async (message) => {
      await chatService.saveMessages(message.chatId, [message]);
      io.to(message.chatId).emit(WEBSOCKET_EVENTS.RECEIVE_MESSAGE, message);
    });

    socket.on(WEBSOCKET_EVENTS.LEAVE_ROOM, (chatId) => {
      socket.leave(chatId);
      socket.removeAllListeners();
      io.to(chatId).emit(WEBSOCKET_EVENTS.DISCONNECT_PARTICIPANT);
    });

    socket.on(WEBSOCKET_EVENTS.DISCONNECTING, () => {
      const chatId = Array.from(socket.rooms)[1]; // take current chat id from rooms Set (second element because the first index contains some service id)
      io.to(chatId).emit(WEBSOCKET_EVENTS.DISCONNECT_PARTICIPANT);
    });
  });
  io.on(WEBSOCKET_EVENTS.DISCONNECT, (reason) => {
    console.log(`Server disconnected by reason: ${reason}`);
  });
};

export default startSocketServer;
