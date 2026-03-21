import { authenticate } from './../middlewares/auth.middleware';
import express from 'express';

import {
  retrieveAllSales,
  retrieveOneSales,
  addSales,
  voidSale,
} from '../controllers/pos.controller';

const router = express.Router();

router.get('/sales', authenticate, retrieveAllSales);

router.get('/sales/:id', authenticate, retrieveOneSales);

router.post('/sales', authenticate, addSales);

router.patch('/sales/void/:id', authenticate, voidSale);

export default router;
