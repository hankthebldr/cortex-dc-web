/**
 * Authentication Service
 * User authentication and profile management
 */

import { config } from '../config/env.config';
import { UnauthorizedError, BadRequestError, NotFoundError } from '../middleware/error.middleware';
import * as admin from 'firebase-admin';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { Firestore } from '@google-cloud/firestore';

/**
 * Auth result interface
 */
interface AuthResult {
  user: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    emailVerified: boolean;
  };
  token: string;
  refreshToken?: string;
}

/**
 * Authentication Service class
 */
export class AuthService {
  private firestore?: Firestore;

  constructor() {
    if (config.DATABASE_TYPE === 'firestore') {
      this.firestore = new Firestore({
        projectId: config.FIRESTORE_PROJECT_ID || config.GCP_PROJECT_ID,
        databaseId: config.FIRESTORE_DATABASE_ID,
      });
    }
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string, displayName?: string): Promise<AuthResult> {
    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    if (password.length < 8) {
      throw new BadRequestError('Password must be at least 8 characters');
    }

    if (config.AUTH_PROVIDER === 'firebase') {
      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
        emailVerified: false,
      });

      // Generate custom token
      const token = await admin.auth().createCustomToken(userRecord.uid);

      // Create user profile in database
      await this.createUserProfile(userRecord.uid, {
        email,
        displayName,
        createdAt: new Date().toISOString(),
      });

      return {
        user: {
          uid: userRecord.uid,
          email: userRecord.email!,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          emailVerified: userRecord.emailVerified,
        },
        token,
      };
    }

    // JWT-based auth
    const userId = `user_${Date.now()}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user in database
    await this.createUserProfile(userId, {
      email,
      displayName,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });

    // Generate JWT tokens
    const token = this.generateJWT(userId, email);
    const refreshToken = this.generateRefreshToken(userId);

    return {
      user: {
        uid: userId,
        email,
        displayName,
        emailVerified: false,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResult> {
    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    if (config.AUTH_PROVIDER === 'firebase') {
      // Firebase Auth doesn't support server-side password verification
      // In production, use Firebase Client SDK on frontend
      throw new BadRequestError('Use Firebase Client SDK for authentication');
    }

    // JWT-based auth
    const user = await this.getUserByEmail(email);

    if (!user || !user.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT tokens
    const token = this.generateJWT(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: {
        uid: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified || false,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const decoded = jwt.verify(refreshToken, config.JWT_SECRET) as any;

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const user = await this.getUserProfile(decoded.uid);

      const newToken = this.generateJWT(user.id, user.email);
      const newRefreshToken = this.generateRefreshToken(user.id);

      return {
        user: {
          uid: user.id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified || false,
        },
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: any) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    if (config.AUTH_PROVIDER === 'firebase') {
      // Revoke refresh tokens
      await admin.auth().revokeRefreshTokens(userId);
    }

    // Additional cleanup can be done here (e.g., invalidate sessions)
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<any> {
    if (config.DATABASE_TYPE === 'firestore') {
      const doc = await this.firestore!.collection('users').doc(userId).get();

      if (!doc.exists) {
        throw new NotFoundError('User not found');
      }

      return {
        id: doc.id,
        ...doc.data(),
      };
    }

    throw new Error(`Unsupported database type: ${config.DATABASE_TYPE}`);
  }

  /**
   * Get user by email
   */
  private async getUserByEmail(email: string): Promise<any> {
    if (config.DATABASE_TYPE === 'firestore') {
      const snapshot = await this.firestore!
        .collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    }

    throw new Error(`Unsupported database type: ${config.DATABASE_TYPE}`);
  }

  /**
   * Create user profile
   */
  private async createUserProfile(userId: string, data: any): Promise<void> {
    if (config.DATABASE_TYPE === 'firestore') {
      await this.firestore!.collection('users').doc(userId).set(data);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: any): Promise<any> {
    if (config.DATABASE_TYPE === 'firestore') {
      const docRef = this.firestore!.collection('users').doc(userId);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundError('User not found');
      }

      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await docRef.update(updatedData);

      const updated = await docRef.get();
      return {
        id: updated.id,
        ...updated.data(),
      };
    }

    throw new Error(`Unsupported database type: ${config.DATABASE_TYPE}`);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    if (config.AUTH_PROVIDER === 'firebase') {
      // Use Firebase Auth password reset
      // Note: This requires Firebase Client SDK on frontend
      throw new BadRequestError('Use Firebase Client SDK for password reset');
    }

    // JWT-based auth - implement custom password reset flow
    const user = await this.getUserByEmail(email);

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // TODO: Generate reset token and send email
    console.log(`Password reset requested for ${email}`);
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(userId: string): Promise<void> {
    if (config.AUTH_PROVIDER === 'firebase') {
      // Use Firebase Client SDK on frontend
      throw new BadRequestError('Use Firebase Client SDK for email verification');
    }

    // TODO: Generate verification token and send email
    console.log(`Email verification requested for user ${userId}`);
  }

  /**
   * Generate JWT access token
   */
  private generateJWT(userId: string, email: string): string {
    return jwt.sign(
      {
        uid: userId,
        email,
        type: 'access',
      },
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_EXPIRATION,
      }
    );
  }

  /**
   * Generate JWT refresh token
   */
  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      {
        uid: userId,
        type: 'refresh',
      },
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_REFRESH_EXPIRATION,
      }
    );
  }
}
