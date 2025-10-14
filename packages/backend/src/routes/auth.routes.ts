/**
 * Authentication Routes
 * User authentication and token management
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';

const router = Router();
const authService = new AuthService();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;

  const result = await authService.register(email, password, displayName);

  res.status(201).json({
    success: true,
    data: result,
  });
}));

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const result = await authService.refreshToken(refreshToken);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * POST /api/auth/logout
 * Logout user (revoke tokens)
 */
router.post('/logout', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  await authService.logout(user.uid);

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}));

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  const profile = await authService.getUserProfile(user.uid);

  res.json({
    success: true,
    data: profile,
  });
}));

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const updates = req.body;

  const profile = await authService.updateProfile(user.uid, updates);

  res.json({
    success: true,
    data: profile,
  });
}));

/**
 * POST /api/auth/reset-password
 * Request password reset
 */
router.post('/reset-password', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  await authService.requestPasswordReset(email);

  res.json({
    success: true,
    message: 'Password reset email sent',
  });
}));

/**
 * POST /api/auth/verify-email
 * Verify email address
 */
router.post('/verify-email', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  await authService.sendEmailVerification(user.uid);

  res.json({
    success: true,
    message: 'Verification email sent',
  });
}));

export default router;
