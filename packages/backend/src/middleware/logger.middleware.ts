/**
 * Request Logging Middleware
 * Structured logging for all HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.config';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate or extract request ID
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const id = req.headers['x-request-id'] as string || uuidv4();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
};

/**
 * Request logger middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Assign request ID
  const id = req.headers['x-request-id'] as string || uuidv4();
  req.id = id;
  res.setHeader('X-Request-ID', id);

  const startTime = Date.now();

  // Log request
  const logEntry = {
    timestamp: new Date().toISOString(),
    requestId: id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: (req as any).user?.uid,
  };

  if (config.LOG_FORMAT === 'json') {
    console.log(JSON.stringify({ ...logEntry, event: 'request_received' }));
  } else {
    console.log(`→ ${req.method} ${req.path} [${id}]`);
  }

  // Log response
  const originalSend = res.send;
  res.send = function (data: any): Response {
    const duration = Date.now() - startTime;

    const responseLog = {
      timestamp: new Date().toISOString(),
      requestId: id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: (req as any).user?.uid,
    };

    if (config.LOG_FORMAT === 'json') {
      console.log(JSON.stringify({ ...responseLog, event: 'request_completed' }));
    } else {
      const statusEmoji = res.statusCode < 400 ? '✓' : '✗';
      console.log(`${statusEmoji} ${req.method} ${req.path} ${res.statusCode} ${duration}ms [${id}]`);
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Extend Express Request type
 */
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
