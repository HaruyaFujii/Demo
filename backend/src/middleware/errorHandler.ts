import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/exceptions.js';

export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  return res.status(500).json({ error: 'Internal server error' });
}