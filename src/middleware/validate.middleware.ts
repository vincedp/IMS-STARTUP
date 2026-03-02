import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError';

export const validate: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);

  // review consider errors property in interface
  if (!errors.isEmpty()) {
    const [err] = errors.array();
    throw new AppError(err.msg, 400);
  }

  next();
};
