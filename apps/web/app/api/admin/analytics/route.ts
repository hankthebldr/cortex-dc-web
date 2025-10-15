import { NextRequest, NextResponse } from 'next/server';
import { eventTrackingService } from '@cortex/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics
 * Get login and user activity analytics
 *
 * Query parameters:
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - activityLimit: number (default: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = new Date(searchParams.get('startDate') || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(searchParams.get('endDate') || Date.now());
    const activityLimit = parseInt(searchParams.get('activityLimit') || '100');

    const [loginData, activityData] = await Promise.all([
      eventTrackingService.getLoginAnalytics(startDate, endDate),
      eventTrackingService.getRecentActivity(activityLimit),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        login: loginData,
        activity: activityData,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
