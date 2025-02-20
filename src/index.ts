import express from 'express';
import { createServer } from 'https';
import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth-routes.js';
import userRouter from './routes/user-routes.js';
import friendListRouter from './routes/friend-list-routes.js';
import chatRouter from './routes/chat-routes.js';
import { CORPmiddleware } from './middlewares/CORP-middleware.js';
import { errorMiddleware } from './middlewares/error-middleware.js';
import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from './types/types.js';
import { sequelize } from './db/dbConfig.js';
import startSocketServer from './service/socket-service.js';
import 'dotenv/config'; // ???

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.SERVER_PORT;
const ROOT_DIR = process.env.SERVER_ROOT_DIR;
const CORS_URL = process.env.CORS_URL;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: `${CORS_URL}`, credentials: true }));
app.use(CORPmiddleware);
app.use(errorMiddleware);
app.use(`/${ROOT_DIR}/users-avatars`, express.static(path.join(__dirname, 'users-avatars')));
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/friends', friendListRouter);
app.use('/chat', chatRouter);

const options = {
  key: readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
  cert: readFileSync(path.join(__dirname, 'ssl', 'cert.pem')),
};

const httpsServer = createServer(options, app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpsServer, {
  cors: {
    origin: `${CORS_URL}`,
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
    httpsServer.listen(PORT, () => console.log(`server started on ${PORT} port`));
  } catch (e) {}
};

start();
