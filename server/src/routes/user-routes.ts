import { Router } from 'express';
import userController from '../controllers/user-controller.js';
import { body } from 'express-validator';
import { authMiddleware } from '../middlewares/auth-middleware.js';
const userRouter = Router();

userRouter.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 6, max: 32 }),
  userController.registration,
);
userRouter.post('/login', userController.login);
userRouter.post('/logout', userController.logout);
userRouter.get('/refresh', userController.refresh);
userRouter.put('/update', authMiddleware, userController.update);
userRouter.delete('/remove', authMiddleware, userController.remove);

export default userRouter;
