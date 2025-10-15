import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@cortex/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/saml/{provider}
 * Initiate SAML SSO flow for any provider
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { provider } = params;

    if (!provider) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent('SAML provider is required')}`,
          request.url
        )
      );
    }

    const auth = getAuth();

    // Get SAML authorization URL
    const authUrl = await auth.getSAMLAuthorizationUrl(provider, {
      redirectUri: `${request.nextUrl.origin}/api/auth/saml/${provider}/callback`,
      relayState: generateRelayState(),
    });

    // Redirect to SAML IdP
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('SAML initiation error:', error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent('Failed to initiate SAML sign-in')}`,
        request.url
      )
    );
  }
}

/**
 * Helper: Generate random relay state
 */
function generateRelayState(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}
