import { Router } from 'express';
import userController from '../controllers/user-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import uploadFileMiddleware from '../middlewares/upload-file-middleware.js';

const userRouter = Router();

userRouter.get('/getData', authMiddleware, userController.getUserData);
userRouter.put('/update', authMiddleware, userController.updateAccountData);
userRouter.put('/updateUserName', authMiddleware, userController.updateUserName);
userRouter.post(
  '/:id/updateAvatarImage',
  authMiddleware,
  uploadFileMiddleware.single('avatar'),
  userController.updateAvatarImage,
);
userRouter.get('/:id/getAvatarImage', authMiddleware, userController.getAvatarImage);
userRouter.delete('/remove', authMiddleware, userController.removeAccount);
userRouter.put('/changeOnlineStatus', userController.changeOnlineStatus); // TODO maybe need authMiddleware

export default userRouter;
