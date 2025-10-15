import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@cortex/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/oauth/github
 * Initiate GitHub OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const auth = getAuth();

    // Get OAuth authorization URL
    const authUrl = await auth.getOAuthAuthorizationUrl('github', {
      redirectUri: `${request.nextUrl.origin}/api/auth/oauth/github/callback`,
      state: generateState(),
    });

    // Redirect to GitHub OAuth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('GitHub OAuth initiation error:', error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('Failed to initiate GitHub sign-in')}`,
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
