/**
 * Error Handling Middleware
 * Centralized error handling for the API
 */

import { Request, Response, NextFunction } from 'express';
import { config, isProduction } from '../config/env.config';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: any;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error responses
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', details?: any) {
    super(400, message, true, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', details?: any) {
    super(401, message, true, details);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', details?: any) {
    super(403, message, true, details);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not Found', details?: any) {
    super(404, message, true, details);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Conflict', details?: any) {
    super(409, message, true, details);
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation Error', details?: any) {
    super(422, message, true, details);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal Server Error', details?: any) {
    super(500, message, false, details);
  }
}

/**
 * Error handler middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;
  let details: any = undefined;

  // Handle ApiError instances
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
    details = err.details;
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 422;
    message = 'Validation Error';
    isOperational = true;
    details = (err as any).errors;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  }

  // Log error
  const errorLog = {
    timestamp: new Date().toISOString(),
    requestId: req.id,
    method: req.method,
    path: req.path,
    statusCode,
    message,
    isOperational,
    userId: (req as any).user?.uid,
    stack: err.stack,
    details,
  };

  if (config.LOG_FORMAT === 'json') {
    console.error(JSON.stringify({ ...errorLog, event: 'error' }));
  } else {
    console.error(`❌ Error [${req.id}]:`, message);
    if (!isProduction()) {
      console.error(err.stack);
    }
  }

  // Send error response
  const errorResponse: any = {
    error: {
      message,
      statusCode,
      requestId: req.id,
    },
  };

  // Include details in non-production or operational errors
  if (!isProduction() || isOperational) {
    if (details) {
      errorResponse.error.details = details;
    }
  }

  // Include stack trace in development
  if (!isProduction() && err.stack) {
    errorResponse.error.stack = err.stack.split('\n');
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  next(new NotFoundError(`Cannot ${req.method} ${req.path}`));
};
