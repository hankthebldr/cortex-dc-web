import { NextRequest, NextResponse } from 'next/server';
import { eventTrackingService } from '@cortex/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/session
 * Create or update a session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create') {
      await eventTrackingService.createSession(data);
    } else if (action === 'update') {
      await eventTrackingService.updateSessionActivity(data.sessionId);
    } else if (action === 'end') {
      await eventTrackingService.endSession(data.sessionId);
    } else {
      throw new Error(`Invalid action: ${action}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error managing session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to manage session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
