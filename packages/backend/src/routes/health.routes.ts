/**
 * Health Check Routes
 * Kubernetes liveness and readiness probes
 */

import { Router, Request, Response } from 'express';
import { config } from '../config/env.config';

const router = Router();

/**
 * Basic health check
 * Used by Kubernetes liveness probe
 */
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
  });
});

/**
 * Detailed readiness check
 * Used by Kubernetes readiness probe
 */
router.get('/ready', async (req: Request, res: Response) => {
  const checks: Record<string, { status: 'ok' | 'error'; message?: string }> = {
    server: { status: 'ok' },
  };

  // Check database connection
  try {
    // TODO: Add actual database health check
    checks.database = { status: 'ok' };
  } catch (error: any) {
    checks.database = { status: 'error', message: error.message };
  }

  // Check storage connection
  try {
    // TODO: Add actual storage health check
    checks.storage = { status: 'ok' };
  } catch (error: any) {
    checks.storage = { status: 'error', message: error.message };
  }

  // Determine overall status
  const allHealthy = Object.values(checks).every(check => check.status === 'ok');
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: allHealthy ? 'ready' : 'not ready',
    timestamp: new Date().toISOString(),
    checks,
  });
});

/**
 * Startup probe
 * Used by Kubernetes startup probe for slow-starting containers
 */
router.get('/startup', (req: Request, res: Response) => {
  // Add any startup checks here
  res.status(200).json({
    status: 'started',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Version information
 */
router.get('/version', (req: Request, res: Response) => {
  res.json({
    name: 'Cortex DC Backend API',
    version: '0.1.0',
    node: process.version,
    environment: config.NODE_ENV,
    buildDate: new Date().toISOString(),
  });
});

export default router;
