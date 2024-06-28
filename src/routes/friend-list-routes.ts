import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import friendListController from '../controllers/friend-list-controller.js';

const friendListRouter = Router();

friendListRouter.post('/addFriend', authMiddleware, friendListController.addFriend);
friendListRouter.delete('/removeFriend', authMiddleware, friendListController.removeFriend);
friendListRouter.get('/friendList/:id', authMiddleware, friendListController.getFriends);
friendListRouter.get('/:id/searching/:search', friendListController.searchUsers);

export default friendListRouter;
