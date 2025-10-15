/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
    [key: string]: any;
  };
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7);

    // Verify token
    // For Firebase: This would verify Firebase ID token
    // For Keycloak: This would verify Keycloak JWT token
    const decoded = jwt.decode(token) as any;

    if (!decoded) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }

    // Attach user to request
    req.user = {
      uid: decoded.sub || decoded.user_id || decoded.uid,
      email: decoded.email,
      role: decoded.role || 'user',
      ...decoded,
    };

    next();
  } catch (error) {
    console.error('[AuthMiddleware] Error:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token verification failed',
    });
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role || 'user')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }

    next();
  };
}
