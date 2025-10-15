/**
 * Kubernetes-style Readiness Probe Endpoint
 * Returns 200 only if the application is ready to serve traffic
 * Used by K8s to determine if the pod should receive traffic
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Minimum uptime before considering the app ready (in seconds)
const MIN_UPTIME_SECONDS = 5;

export async function GET() {
  try {
    const uptime = process.uptime();
    const isReady = uptime >= MIN_UPTIME_SECONDS;

    // Check if environment variables are set
    const hasConfig = !!(
      process.env.NODE_ENV
    );

    // Check memory usage (fail if > 90% of heap is used)
    const memUsage = process.memoryUsage();
    const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    const memoryHealthy = heapUsagePercent < 90;

    const allChecksPass = isReady && hasConfig && memoryHealthy;

    if (!allChecksPass) {
      return NextResponse.json(
        {
          status: 'not_ready',
          checks: {
            uptime: isReady ? 'pass' : 'fail',
            config: hasConfig ? 'pass' : 'fail',
            memory: memoryHealthy ? 'pass' : 'fail',
          },
          details: {
            uptime: `${uptime.toFixed(2)}s`,
            memoryUsagePercent: `${heapUsagePercent.toFixed(2)}%`,
          },
          timestamp: new Date().toISOString(),
          service: 'cortex-web',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'ready',
        checks: {
          uptime: 'pass',
          config: 'pass',
          memory: 'pass',
        },
        details: {
          uptime: `${uptime.toFixed(2)}s`,
          memoryUsagePercent: `${heapUsagePercent.toFixed(2)}%`,
        },
        timestamp: new Date().toISOString(),
        service: 'cortex-web',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'not_ready',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        service: 'cortex-web',
      },
      { status: 503 }
    );
  }
}

export async function HEAD() {
  const uptime = process.uptime();
  const isReady = uptime >= MIN_UPTIME_SECONDS;
  return new NextResponse(null, { status: isReady ? 200 : 503 });
}
