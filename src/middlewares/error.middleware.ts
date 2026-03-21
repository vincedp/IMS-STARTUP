import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;

    if ('code' in err) {
      switch (err.code) {
        case 'ER_DUP_ENTRY':
          statusCode = 409;
          message = 'Duplicate entry error';
          break;
        case 'ER_NO_SUCH_TABLE':
        case 'ER_BAD_TABLE_ERROR':
          statusCode = 404;
          message = 'Requested data not found';
          break;
        case 'ER_PARSE_ERROR':
          statusCode = 400;
          message = 'Invalid query syntax';
          break;
        case 'ER_CONNECT_HOST_ERROR':
        case 'ECONNREFUSED':
          statusCode = 503;
          message = 'Database connection failed';
          break;
        default:
          console.error('MySQL Error:', err);
      }
    }
  }

  if (err instanceof Error || err instanceof AppError) {
    if (process.env.NODE_ENV === 'development') {
      return res.status(statusCode).json({
        success: false,
        message,
        stack: err.stack,
      });
    }
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export const endpointNotFoundHandler: RequestHandler = (req, res, next) => {
  const err = new AppError('Endpoint not found', 404);

  next(err);
};
