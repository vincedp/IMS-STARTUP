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

const router = express.Router();

router.get('/product/{:search}', retrieveOneProductValidator, validate, retrieveOneProduct);

router.get('/product', retrieveAllProductsValidator, validate, retrieveAllProducts);

router.post('/add-product', addProductValidator, validate, addProduct);

router.patch('/update-product/:productId', updateProductValidator, validate, updateProduct);

router.delete('/delete-product/:productId', deleteProductValidator, validate, deleteProduct);

export default router;
