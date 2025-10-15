/**
 * Global Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[ErrorHandler]', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: error.name || 'Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}
