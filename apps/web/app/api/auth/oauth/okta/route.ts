import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@cortex/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/oauth/okta?client_id=xxx
 * Initiate Okta OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('client_id');

    if (!clientId) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent('Okta client ID is required')}`,
          request.url
        )
      );
    }

    const auth = getAuth();

    // Get OAuth authorization URL
    const authUrl = await auth.getOAuthAuthorizationUrl('okta', {
      redirectUri: `${request.nextUrl.origin}/api/auth/oauth/okta/callback`,
      state: generateState(),
      clientId,
    });

    // Redirect to Okta OAuth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Okta OAuth initiation error:', error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('Failed to initiate Okta sign-in')}`,
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
