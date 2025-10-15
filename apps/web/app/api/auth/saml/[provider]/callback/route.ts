import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuth } from '@cortex/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/saml/{provider}/callback
 * Handle SAML ACS (Assertion Consumer Service) callback
 * This endpoint receives the SAML assertion from the IdP
 */
export async function POST(
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

    // Get SAML response from form data
    const formData = await request.formData();
    const samlResponse = formData.get('SAMLResponse') as string;
    const relayState = formData.get('RelayState') as string;

    if (!samlResponse) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent('Invalid SAML response')}`,
          request.url
        )
      );
    }

    // Validate and exchange SAML response for session
    const auth = getAuth();
    const result = await auth.exchangeSAMLResponse(provider, {
      samlResponse,
      relayState,
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
    console.error('SAML callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          error instanceof Error ? error.message : 'Failed to sign in with SAML'
        )}`,
        request.url
      )
    );
  }
}

/**
 * GET /api/auth/saml/{provider}/callback
 * Some IdPs use GET instead of POST for SAML callback
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { provider } = params;
    const searchParams = request.nextUrl.searchParams;
    const samlResponse = searchParams.get('SAMLResponse');
    const relayState = searchParams.get('RelayState');

    if (!samlResponse) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent('Invalid SAML response')}`,
          request.url
        )
      );
    }

    // Validate and exchange SAML response for session
    const auth = getAuth();
    const result = await auth.exchangeSAMLResponse(provider, {
      samlResponse,
      relayState: relayState || undefined,
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
    console.error('SAML callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          error instanceof Error ? error.message : 'Failed to sign in with SAML'
        )}`,
        request.url
      )
    );
  }
}
