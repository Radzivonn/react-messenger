import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import chatController from '../controllers/chat-controller.js';

const chatRouter = Router();

chatRouter.get('/chatList/:id', authMiddleware, chatController.getUserChats);

export default chatRouter;
