import { Router } from 'express';
import userController from '../controllers/user-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';

const userRouter = Router();

userRouter.get('/getData', authMiddleware, userController.getUserData);
userRouter.put('/update', authMiddleware, userController.updateAccountData);
userRouter.delete('/remove', authMiddleware, userController.removeAccount);

export default userRouter;
