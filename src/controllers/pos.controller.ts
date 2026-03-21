import { RequestHandler } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

import { sendResponse } from './register.controller';
import { AppError } from '../utils/AppError';
import connection from '../configs/db';

interface RetrieveAllSalesQueries {
  page: string;
  limit: string;
  filter: string;
  filterField: string;
  sortBy: string;
  sortDirection: string;
  startDate: string;
  endDate: string;
  minTotalAmount: string;
  maxTotalAmount: string;
}

export const retrieveAllSales: RequestHandler<
  {},
  any,
  any,
  Partial<RetrieveAllSalesQueries>
> = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      filter,
      filterField,
      sortBy,
      sortDirection,
      startDate,
      endDate,
      minTotalAmount,
      maxTotalAmount,
    } = req.query;

    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const [usersRow] = await connection.execute<RowDataPacket[]>(
      'SELECT store_id FROM users WHERE id = ?',
      [userId]
    );
    const user = usersRow[0];
    if (user.length === 0) throw new AppError('Unauthorized', 401);
    const { store_id: storeId } = user;

    const SORT_DIR_DEFAULT = 'ASC';
    const SORT_FIELD_DEFAULT = 'created_at';
    const PAGE_DEFAULT = 1;
    const LIMIT_DEFAULT = 10;

    let query = ['SELECT * FROM sales', 'WHERE store_id = ?'];
    let data: (string | number)[] = [storeId];

    let filterClause = '';
    const orderClause = `ORDER BY ${sortBy ?? SORT_FIELD_DEFAULT} ${sortDirection ?? SORT_DIR_DEFAULT}`;
    const limitClause = 'LIMIT ?';
    const offsetClause = 'OFFSET ?';

    if (filterField === 'created_at' || filterField === 'voided_at') {
      if (startDate && !endDate) {
        filterClause = `AND ${filterField} >= ?`;
        data.push(startDate);
      }

      if (!startDate && endDate) {
        filterClause = `AND ${filterField} <= ?`;
        data.push(endDate);
      }

      if (startDate && endDate) {
        filterClause = `AND ${filterField} BETWEEN ? AND ?`;
        data.push(startDate, endDate);
      }

      query.push(filterClause);
    }

    if (filterField === 'total_amount') {
      if (minTotalAmount && !maxTotalAmount) {
        filterClause = `AND ${filterField} >= ?`;
        data.push(minTotalAmount);
      }

      if (!minTotalAmount && maxTotalAmount) {
        filterClause = `AND ${filterField} <= ?`;
        data.push(maxTotalAmount);
      }

      if (minTotalAmount && maxTotalAmount) {
        filterClause = `AND ${filterField} BETWEEN ? AND ?`;
        data.push(minTotalAmount, maxTotalAmount);
      }

      query.push(filterClause);
    }

    if (filter) {
      filterClause = `AND ${filterField} = ?`;
      data.push(filter);
      query.push(filterClause);
    }

    const currentPage = +(page ?? PAGE_DEFAULT);
    const currentLimit = +(limit ?? LIMIT_DEFAULT);
    const skippedRecords = (currentPage - 1) * currentLimit;
    const paginationQuery = query.join(' ').replace('SELECT *', 'SELECT COUNT(*) as total');
    const [[{ total }]] = await connection.execute<RowDataPacket[]>(paginationQuery, data);
    const totalPages = Math.ceil(total / currentLimit);
    if (currentPage > totalPages && totalPages > 0) throw new AppError('Page not found', 400);
    const pagination = { currentPage, currentLimit, total, totalPages };

    query.push(orderClause);
    data.push(currentLimit, skippedRecords);
    query.push(limitClause, offsetClause);

    const [rows] = await connection.execute(query.join(' '), data);

    sendResponse(res, {
      data: { result: rows, pagination },
    });
  } catch (error) {
    next(error);
  }
};

export const retrieveOneSales: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = 'SELECT * FROM sales WHERE id = ? LIMIT 1';
    const data = [id];
    const [rows] = await connection.execute<RowDataPacket[]>(query, data);
    const sales = rows[0];
    if (rows.length === 0) throw new AppError('Sales not found', 404);

    sendResponse(res, { data: sales });
  } catch (error) {
    next(error);
  }
};

interface AddSalesBody {
  salesItems: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}

export const addSales: RequestHandler<{}, any, AddSalesBody> = async (req, res, next) => {
  try {
    // todo db transactions, if any of these queries fail then rollback db

    // GET USERID AND STORE ID
    const { salesItems } = req.body;
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const [usersRow] = await connection.execute<RowDataPacket[]>(
      'SELECT store_id FROM users WHERE id = ?',
      [userId]
    );
    const user = usersRow[0];
    if (user.length === 0) throw new AppError('Unauthorized', 401);
    const { store_id: storeId } = user;

    // CALCULATE SALES TOTAL AMOUNT
    const initialAmount = 0;
    const totalAmount = salesItems.reduce(
      (amount, item) => amount + item.price * item.quantity,
      initialAmount
    );

    // ADD SALES RECORD
    const query = `INSERT INTO sales(user_id,store_id,total_amount) VALUES(?,?,?)`;
    const data = [userId, storeId, totalAmount];
    const [salesResult] = await connection.execute<ResultSetHeader>(query, data);
    if (salesResult.affectedRows === 0) throw new AppError('Failed to add sales', 409);

    const salesId = salesResult.insertId;

    for (const item of salesItems) {
      // ADD SALES ITEMS RECORD
      const itemsQuery =
        'INSERT INTO sales_items(sales_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
      const itemsData = [salesId, item.productId, item.quantity, item.price];
      const [itemsResult] = await connection.execute<ResultSetHeader>(itemsQuery, itemsData);
      if (itemsResult.affectedRows === 0)
        throw new AppError('Something went wrong when adding sales items', 409);

      // UPDATE INVENTORY STOCK
      const productsQuery =
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?';
      const productsData = [item.quantity, item.productId];
      const [productsResult] = await connection.execute<ResultSetHeader>(
        productsQuery,
        productsData
      );
      if (productsResult.affectedRows === 0)
        throw new AppError('Something went wrong when updating products stock quantity', 409);
    }

    sendResponse(res, { data: { salesId } });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const voidSale: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    // GET SALE BY ID
    const [salesRows] = await connection.execute<RowDataPacket[]>(
      'SELECT status FROM sales WHERE id = ?',
      [id]
    );
    if (salesRows.length === 0) throw new AppError('Sale not found', 404);

    const sales = salesRows[0];

    // ALREADY VOIDED CHECK
    if (sales.status === 'voided') {
      return sendResponse(res, {
        message: 'Sales already voided',
        data: { salesId: id, status: sales.status },
      });
    }

    // GET ALL SALES_ITEMS OF CURRENT SALES RECORD
    const [items] = await connection.execute<RowDataPacket[]>(
      'SELECT product_id, quantity FROM sales_items WHERE sales_id = ?',
      [id]
    );

    // RETURN STOCK QUANTITIES OF VOIDED SALES ITEMS
    for (const item of items) {
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }

    // UPDATE sTATUS OF SALES TO 'VOIDED'
    const [result] = await connection.execute<ResultSetHeader>(
      'UPDATE sales SET status = "voided" WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) throw new AppError('Failed to update', 400);

    sendResponse(res, {
      data: { message: 'Sale voided successfully', saleId: id, status: 'voided' },
    });
  } catch (error) {
    next(error);
  }
};
