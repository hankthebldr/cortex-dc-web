import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuth } from '@cortex/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/oauth/github/callback
 * Handle GitHub OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth error
    if (error) {
      console.error('GitHub OAuth error:', error);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent('GitHub sign-in failed')}`,
          request.url
        )
      );
    }

    // Validate required parameters
    if (!code) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent('Invalid OAuth response')}`,
          request.url
        )
      );
    }

    // Exchange code for tokens
    const auth = getAuth();
    const result = await auth.exchangeOAuthCode('github', {
      code,
      redirectUri: `${request.nextUrl.origin}/api/auth/oauth/github/callback`,
    });

    // Set session cookie
    cookies().set('session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          error instanceof Error ? error.message : 'Failed to sign in with GitHub'
        )}`,
        request.url
      )
    );
  }
}
