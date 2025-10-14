/**
 * Authentication Middleware
 * JWT and Firebase Auth validation
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.config';
import { UnauthorizedError, ForbiddenError } from './error.middleware';
import * as jwt from 'jsonwebtoken';
import * as admin from 'firebase-admin';

/**
 * Initialize Firebase Admin (if using Firebase auth)
 */
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return;

  try {
    if (config.AUTH_PROVIDER === 'firebase') {
      // Initialize with service account key or default credentials
      if (config.GCP_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(
          Buffer.from(config.GCP_SERVICE_ACCOUNT_KEY, 'base64').toString()
        );
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: config.GCP_PROJECT_ID,
        });
      } else {
        // Use Application Default Credentials (for GKE with Workload Identity)
        admin.initializeApp({
          projectId: config.GCP_PROJECT_ID,
        });
      }
      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
  }
};

// Initialize on module load
if (config.AUTH_PROVIDER === 'firebase') {
  initializeFirebase();
}

/**
 * User interface
 */
export interface AuthUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  roles?: string[];
  permissions?: string[];
}

/**
 * Extract token from Authorization header
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
};

/**
 * Verify Firebase token
 */
const verifyFirebaseToken = async (token: string): Promise<AuthUser> => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
      emailVerified: decodedToken.email_verified,
      roles: decodedToken.roles || [],
      permissions: decodedToken.permissions || [],
    };
  } catch (error: any) {
    if (error.code === 'auth/id-token-expired') {
      throw new UnauthorizedError('Token expired');
    }
    if (error.code === 'auth/argument-error') {
      throw new UnauthorizedError('Invalid token format');
    }
    throw new UnauthorizedError('Invalid token');
  }
};

/**
 * Verify JWT token
 */
const verifyJwtToken = async (token: string): Promise<AuthUser> => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;

    return {
      uid: decoded.uid || decoded.sub,
      email: decoded.email,
      displayName: decoded.name || decoded.displayName,
      emailVerified: decoded.emailVerified,
      roles: decoded.roles || [],
      permissions: decoded.permissions || [],
    };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token');
    }
    throw new UnauthorizedError('Authentication failed');
  }
};

/**
 * Authentication middleware
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    // Verify token based on provider
    let user: AuthUser;

    if (config.AUTH_PROVIDER === 'firebase') {
      user = await verifyFirebaseToken(token);
    } else {
      user = await verifyJwtToken(token);
    }

    // Attach user to request
    (req as any).user = user;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (token) {
      let user: AuthUser;

      if (config.AUTH_PROVIDER === 'firebase') {
        user = await verifyFirebaseToken(token);
      } else {
        user = await verifyJwtToken(token);
      }

      (req as any).user = user;
    }

    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
};

/**
 * Role-based access control middleware
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user as AuthUser;

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!user.roles || !roles.some(role => user.roles?.includes(role))) {
      throw new ForbiddenError(`Required role: ${roles.join(' or ')}`);
    }

    next();
  };
};

/**
 * Permission-based access control middleware
 */
export const requirePermission = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user as AuthUser;

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!user.permissions || !permissions.some(perm => user.permissions?.includes(perm))) {
      throw new ForbiddenError(`Required permission: ${permissions.join(' or ')}`);
    }

    next();
  };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole('admin');

/**
 * Extend Express Request type
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
