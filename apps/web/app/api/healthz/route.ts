/**
 * Kubernetes-style Liveness Probe Endpoint
 * Returns 200 if the application is alive
 * Used by K8s to determine if the pod should be restarted
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Liveness check - verify the process is responsive
    const isAlive = process.uptime() > 0;

    if (!isAlive) {
      throw new Error('Process is not alive');
    }

    return NextResponse.json(
      {
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'cortex-web',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'dead',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        service: 'cortex-web',
      },
      { status: 503 }
    );
  }
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
