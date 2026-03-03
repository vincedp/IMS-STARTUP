import { RequestHandler } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

import connection from '../config/db';
import { Product } from '../types/product.types';
import { AppError } from '../utils/AppError';
import { RequestParamsProducts } from '../types/dto.types';

// review basic validations
// review isolate interfaces/types to a declaration file
// review main function
// review send response
// review error handling

export const retrieveAllProducts: RequestHandler = async (req, res, next) => {
  try {
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM products');

    if (!rows.length) throw new AppError('Product list is empty', 404);

    res.status(200).json({ msg: 'success! retrieved all products', data: rows });
  } catch (error) {
    next(error);
  }
};

export const retrieveOneProduct: RequestHandler = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE productId = ?',
      [productId]
    );

    if (!rows.length) throw new AppError('Product list is empty', 404);

    res.status(200).json({ msg: 'success! retrieved one product', data: rows });
  } catch (error) {
    next(error);
  }
};

export const addProduct: RequestHandler<{}, any, Product> = async (req, res, next) => {
  try {
    // review limit max char length

    // review missing required fields, empty string after trim()
    const { name, description, quantity, price } = req.body;

    // review nullish coalescing, replaces only null/undefined
    const safeDescription: string | null = description ?? null;

    let [product] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE name = ?',
      [name]
    );

    // review don't allow duplicate items
    if (product.length > 0) throw new AppError('A product with this name already exists', 409);

    let [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO products (name,description,quantity,price) VALUES (?,?,?,?)`,
      // review sql injection attacks, values parametrized
      [name, safeDescription, quantity, price]
    );

    if (!result.affectedRows) throw Error;

    res.status(200).json({ msg: 'success! added a product', data: req.body });
  } catch (error) {
    next(error);
  }
};

export const updateProduct: RequestHandler<RequestParamsProducts, any, Product> = async (
  req,
  res,
  next
) => {
  try {
    // review id does not exist
    const { productId } = req.params;
    // review empty update body not allowed
    const { name, price, quantity, description } = req.body;

    // review value should only be either null or string, if undefined or null set to null
    const safeDescription: string | null = description ?? null;

    // IDEA partial update handling
    // IDEA check if user input actually changed something, updating to same value, use result.changedRows === 0
    // IDEA race conditions, not a problem with postgresql (2 clients updating the same record simultaneously)

    const [result] = await connection.execute<ResultSetHeader>(
      'UPDATE products SET name = ?, price = ?, quantity = ?, description = ? WHERE productId = ? ',
      [name, price, quantity, safeDescription, productId]
    );

    if (!result.affectedRows) throw Error;

    res.status(200).json({ msg: 'success! updated a product', data: req.body });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct: RequestHandler<RequestParamsProducts> = async (req, res, next) => {
  try {
    // review id does not exist
    const { productId } = req.params;

    // IDEA client deletes twice

    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM products WHERE productId =?',
      [productId]
    );

    if (!result.affectedRows) throw Error;

    res.status(200).json({ msg: 'success! deleted a product' });
  } catch (error) {
    next(error);
  }
};
