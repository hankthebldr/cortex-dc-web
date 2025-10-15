import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@cortex/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/password-reset
 * Send password reset email
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Use auth adapter to send password reset email
    const auth = getAuth();
    await auth.sendPasswordResetEmail(email);

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send password reset email',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/password-reset
 * Reset password with verification code
 */
export async function PUT(request: NextRequest) {
  try {
    const { code, newPassword } = await request.json();

    if (!code || !newPassword) {
      return NextResponse.json(
        { error: 'Verification code and new password are required' },
        { status: 400 }
      );
    }

    // Use auth adapter to reset password
    const auth = getAuth();
    await auth.confirmPasswordReset(code, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset password',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
