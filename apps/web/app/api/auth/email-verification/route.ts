import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@cortex/db';
import { cookies } from 'next/headers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/email-verification
 * Send email verification to current user
 */
export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = cookies().get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Use auth adapter to send verification email
    const auth = getAuth();

    // Check if method is supported
    if (!auth.sendEmailVerification) {
      return NextResponse.json(
        { error: 'Email verification not supported in current auth mode' },
        { status: 501 }
      );
    }

    await auth.sendEmailVerification();

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send verification email',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/email-verification?code=xxx
 * Verify email with verification code
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Use auth adapter to verify email
    const auth = getAuth();

    // Check if method is supported
    if (!auth.verifyEmail) {
      return NextResponse.redirect(
        new URL(`/email-verification-error?error=${encodeURIComponent(
          'Email verification not supported in current auth mode'
        )}`, request.url)
      );
    }

    await auth.verifyEmail(code);

    // Redirect to success page
    return NextResponse.redirect(new URL('/email-verified', request.url));
  } catch (error) {
    console.error('Email verification confirmation error:', error);

    // Redirect to error page
    return NextResponse.redirect(
      new URL(`/email-verification-error?error=${encodeURIComponent(
        error instanceof Error ? error.message : 'Unknown error'
      )}`, request.url)
    );
  }
}
