import 'dotenv/config'; // ???
import { Sequelize } from 'sequelize';

const DB_NAME = process.env.DB_NAME || 'react_messenger';
const DB_USER = process.env.DB_USER || 'postgres';
const PORT = process.env.DB_PORT || 5432;

export const sequelize = new Sequelize(DB_NAME, DB_USER, process.env.DB_PASSWORD, {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: Number(PORT),
});
