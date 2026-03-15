import { RequestHandler } from 'express';
import { AppError } from '../utils/AppError';
import { verifyToken } from '../utils/jwt';

interface JwtPayload {
  userId: number;
}

export const authenticate: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) throw new AppError('Unauthorized', 401);

    const token = authHeader.split(' ')[1]; // 'Bearer ${token}' ==>  ['Bearer', '${token}'] ==> ${token}

    const decoded = verifyToken(token) as JwtPayload;

    req.user = { userId: decoded.userId };

    next();
  } catch (error) {
    next(error);
  }
};
