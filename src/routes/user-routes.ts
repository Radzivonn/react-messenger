import { Router } from 'express';
import userController from '../controllers/user-controller.js';
import { body } from 'express-validator';
import { authMiddleware } from '../middlewares/auth-middleware.js';

const userRouter = Router();

userRouter.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 8, max: 24 }),
  userController.registration,
);
userRouter.post('/login', userController.login);
userRouter.post('/logout', userController.logout);
userRouter.get('/refresh', userController.refresh);
userRouter.put('/update', authMiddleware, userController.update);
userRouter.delete('/remove', authMiddleware, userController.remove);
userRouter.post('/addFriend', authMiddleware, userController.addFriend);
userRouter.delete('/removeFriend', authMiddleware, userController.removeFriend);

export default userRouter;