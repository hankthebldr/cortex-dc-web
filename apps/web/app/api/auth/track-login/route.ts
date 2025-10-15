import { NextRequest, NextResponse } from 'next/server';
import { eventTrackingService } from '@cortex/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/track-login
 * Track login event (success or failure)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await eventTrackingService.logLogin(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking login:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track login',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
