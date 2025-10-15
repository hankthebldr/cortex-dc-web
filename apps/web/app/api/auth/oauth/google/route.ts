import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuth } from '@cortex/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/oauth/google
 * Initiate Google OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const auth = getAuth();

    // Get OAuth authorization URL
    const authUrl = await auth.getOAuthAuthorizationUrl('google', {
      redirectUri: `${request.nextUrl.origin}/api/auth/oauth/google/callback`,
      state: generateState(),
    });

    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('Failed to initiate Google sign-in')}`,
        request.url
      )
    );
  }
}

/**
 * Helper: Generate random state for CSRF protection
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}
