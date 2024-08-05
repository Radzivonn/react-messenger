import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth-routes.js';
import userRouter from './routes/user-routes.js';
import friendListRouter from './routes/friend-list-routes.js';
import chatRouter from './routes/chat-routes.js';
import { errorMiddleware } from './middlewares/error-middleware.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from './types/types.js';
import { sequelize } from './db/dbConfig.js';
import startSocketServer from './service/socket-service.js';
import 'dotenv/config'; // ???

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.SERVER_PORT;
const app = express();

app.use(express.json());
app.use('/src/users-avatars', express.static(path.join(__dirname, 'users-avatars')));
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/friends', friendListRouter);
app.use('/chat', chatRouter);
app.use(errorMiddleware);

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('database connected');
    startSocketServer(io);
    console.log('Socket server started');
    httpServer.listen(PORT, () => console.log(`server started on ${PORT} port`));
  } catch (e) {}
};

start();
