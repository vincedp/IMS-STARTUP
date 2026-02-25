import express from "express";

import {
  retrieveAllProducts,
  retrieveOneProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/inventory.controller";

const router = express.Router();

router.get("/product", retrieveAllProducts);

router.get("/product/:productId", retrieveOneProduct);

router.post("/add-product", addProduct);

router.patch("/update-product/:productId", updateProduct);

router.delete("/delete-product/:productId", deleteProduct);

export default router;
