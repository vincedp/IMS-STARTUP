import { Request, Response } from "express";

interface Product {
  name: string;
  id: number;
  quantity: number;
  description: string;
  price: number;
}

interface InventoryParams {
  productId: number;
}

let data: Product[] = [];

//todo
export function retrieveAllProducts(req: Request, res: Response) {
  // validations
  // retrieve product
  // failed response, throw error
  // success response, res.send(product)

  const products = data;

  res
    .status(200)
    .json({ msg: "success! retrieved all products", data: products });
}

//todo
export function retrieveOneProduct(
  req: Request<InventoryParams>,
  res: Response,
) {
  // validations
  // retrieve product
  // failed response, throw error
  // success response, res.send(product)

  const product = data.find((val) => val.id === +req.params.productId);

  if (!product) {
    res.status(404).json({ msg: "failed! unable to retrieve product" });
    return;
  }

  res.status(200).json({ msg: "success! retrieved a product", data: product });
}

// todo
export function addProduct(req: Request<{}, {}, Product>, res: Response) {
  // validations
  // add a product
  // failed response, throw error
  // success response, res.send(product)
  data.push(req.body);
  res.status(200).json({ msg: "success! added a product" });
}

// todo
export function updateProduct(
  req: Request<InventoryParams, {}, Product>,
  res: Response,
) {
  // validations
  // update a product
  // failed response, throw error
  // success response, res.send(product)

  const product = data.find((val) => val.id === +req.params.productId);

  if (!product) {
    res.status(404).json({ msg: "failed! unable to update a product" });
    return;
  }

  const updatedProduct = { ...product, ...req.body };

  const newProductObj = data.map((val) =>
    val.id === +req.params.productId ? updatedProduct : val,
  );

  data = newProductObj;

  res
    .status(200)
    .json({ msg: "success! updated a product", data: updatedProduct });
}

// todo
// review soft delete
export function deleteProduct(req: Request<InventoryParams>, res: Response) {
  // validations
  // delete a product
  // failed response, throw error
  // success response, res.send(product)

  const product = data.find((val) => val.id === +req.params.productId);

  if (!product) {
    res.status(404).json({ msg: "failed! unable to delete a product" });
    return;
  }

  const newProductObj = data.filter((val) => val.id !== +req.params.productId);

  data = newProductObj;

  res.status(200).json({ msg: "success! deleted a product", data: product });
}
