/**
 * Metrics Endpoint for Prometheus Scraping
 * Returns application metrics in Prometheus format
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    // Generate Prometheus-compatible metrics
    const metrics = `# HELP cortex_web_uptime_seconds Application uptime in seconds
# TYPE cortex_web_uptime_seconds gauge
cortex_web_uptime_seconds ${uptime}

# HELP cortex_web_memory_heap_used_bytes Heap memory used in bytes
# TYPE cortex_web_memory_heap_used_bytes gauge
cortex_web_memory_heap_used_bytes ${memUsage.heapUsed}

# HELP cortex_web_memory_heap_total_bytes Total heap memory in bytes
# TYPE cortex_web_memory_heap_total_bytes gauge
cortex_web_memory_heap_total_bytes ${memUsage.heapTotal}

# HELP cortex_web_memory_rss_bytes Resident set size in bytes
# TYPE cortex_web_memory_rss_bytes gauge
cortex_web_memory_rss_bytes ${memUsage.rss}

# HELP cortex_web_memory_external_bytes External memory in bytes
# TYPE cortex_web_memory_external_bytes gauge
cortex_web_memory_external_bytes ${memUsage.external}

# HELP cortex_web_heap_usage_percent Heap usage percentage
# TYPE cortex_web_heap_usage_percent gauge
cortex_web_heap_usage_percent ${((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)}

# HELP cortex_web_nodejs_version Node.js version info
# TYPE cortex_web_nodejs_version gauge
cortex_web_nodejs_version{version="${process.version}"} 1
`;

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    });
  } catch (error) {
    return new NextResponse('Error generating metrics', { status: 500 });
  }
}
