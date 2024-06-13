import express from 'express';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import cors from 'cors';
import userRouter from './routes/user-routes.js';
import { errorMiddleware } from './middlewares/error-middleware.js';
import { sequelize } from './db/dbConfig.js';
import { Server } from 'socket.io';
import 'dotenv/config'; // ???
import startSocketServer from './service/socket-service.js';
import { ClientToServerEvents, ServerToClientEvents } from './types/types.js';

const PORT = process.env.SERVER_PORT;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use('/user', userRouter);
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
