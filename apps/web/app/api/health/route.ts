/**
 * Health Check Endpoint for Kubernetes Liveness Probes
 * Returns 200 if the application is running
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Basic health check - just return 200 if the process is running
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'cortex-web',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        service: 'cortex-web',
      },
      { status: 503 }
    );
  }
}

// Also respond to HEAD requests for minimal overhead
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
