import express from 'express';
import dotenv from 'dotenv';

import { endpointNotFoundHandler, errorHandler } from './middlewares/error.middleware';
import inventoryRouter from './routes/inventory.route';
import authRouter from './routes/auth.route';
import posRouter from './routes/pos.route';

// idea compression, helmet, cors, logging, rate-limiter

// idea use database transactions in all controllers that interact with db

const BASE_URL = `/api/v1`;

dotenv.config();

const app = express();

app.use(express.json());

app.use(`${BASE_URL}/inventory`, inventoryRouter);
app.use(`${BASE_URL}/auth`, authRouter);
app.use(`${BASE_URL}/pos`, posRouter);

app.use('/*splat', endpointNotFoundHandler);
app.use(errorHandler);

app.listen(process.env.SERVER_PORT, () => {
  console.log(`🚀 App is running on http://localhost:${process.env.SERVER_PORT}`);
});
