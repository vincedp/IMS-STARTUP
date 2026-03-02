import express from 'express';

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
} from '../validators/inventory.validator';
import { validate } from '../middleware/validate.middleware';
import { RequestParamsProducts } from '../types/dto.types';
import { Product } from '../types/product.types';

const router = express.Router();

router.get('/product', retrieveAllProducts);

router.get('/product/:productId', retrieveOneProduct);

router.post<{}, any, Product>('/add-product', addProductValidator, validate, addProduct);

router.patch<RequestParamsProducts, any, Product>(
  '/update-product/:productId',
  updateProductValidator,
  validate,
  updateProduct
);

router.delete<RequestParamsProducts>(
  '/delete-product/:productId',
  deleteProductValidator,
  validate,
  deleteProduct
);

export default router;
