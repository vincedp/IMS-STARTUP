import express from 'express';
import dotenv from 'dotenv';

import inventoryRouter from './routes/inventory.route';
import { errorHandler } from './middlewares/error.middleware';
import { AppError } from './utils/AppError';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/v1/inventory', inventoryRouter);

app.use('/*splat', (req, res, next) => {
  const err = new AppError('Endpoint not found', 404);

  next(err);
});

app.use(errorHandler);

app.listen(process.env.SERVER_PORT, () => {
  console.log(`🚀 App is running on http://localhost:${process.env.SERVER_PORT}`);
});
