/// <reference path="../../common_types/types.d.ts" />
import express from 'express';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import cors from 'cors';
import userRouter from './routes/user-routes.js';
import { errorMiddleware } from './middlewares/error-middleware.js';
import { sequelize } from './db/dbConfig.js';
import 'dotenv/config'; // ???

const PORT = process.env.SERVER_PORT;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: '*' }));
app.use('/auth', userRouter);
app.use(errorMiddleware);

const httpServer = createServer(app);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('database connected');
    httpServer.listen(PORT, () => console.log(`server started on ${PORT} port`));
  } catch (e) {}
};

start();
