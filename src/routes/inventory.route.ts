import express from 'express';

import { validate } from '../middlewares/validate.middleware';
import {
  retrieveAllProducts,
  retrieveOneProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/inventory.controller';
import {
  addProductValidator,
  updateProductValidator,
  deleteProductValidator,
  retrieveOneProductValidator,
  retrieveAllProductsValidator,
} from '../validators/inventory.validator';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.get(
  '/product/{:search}',
  authenticate,
  retrieveOneProductValidator,
  validate,
  retrieveOneProduct
);

router.get('/product', authenticate, retrieveAllProductsValidator, validate, retrieveAllProducts);

router.post('/add-product', authenticate, addProductValidator, validate, addProduct);

router.patch(
  '/update-product/:productId',
  authenticate,
  updateProductValidator,
  validate,
  updateProduct
);

router.delete(
  '/delete-product/:productId',
  authenticate,
  deleteProductValidator,
  validate,
  deleteProduct
);

export default router;
