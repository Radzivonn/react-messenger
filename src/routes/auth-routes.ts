import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';

const authRouter = Router();

authRouter.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 8, max: 24 }),
  authController.registration,
);
authRouter.post('/login', authController.login);
authRouter.post('/logout/:id', authMiddleware, authController.logout);
authRouter.get('/refresh', authController.refresh);

export default authRouter;
