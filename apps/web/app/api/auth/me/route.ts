import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuth } from '@cortex/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const sessionToken = cookies().get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify session token using auth adapter
    const auth = getAuth();
    const tokenPayload = await auth.verifyToken(sessionToken);

    // Get full user from the token payload
    const user = await auth.getUserById(tokenPayload.uid);

    if (!user) {
      cookies().delete('session');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
