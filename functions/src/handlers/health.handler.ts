/**
 * Health Check Handler
 * Pure Express handler - no Firebase dependencies
 */

import { Request, Response } from 'express';
import { getLogger } from '../adapters/logger.adapter';

const logger = getLogger();

export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  version: string;
  deployment: string;
}

/**
 * Health check endpoint for Kubernetes probes
 * Returns 200 OK with system status
 */
export async function healthCheckHandler(req: Request, res: Response): Promise<void> {
  // Add CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const payload: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || 'dev',
    deployment: process.env.DEPLOYMENT_MODE || 'standalone',
  };

  logger.debug('Health check ping', payload);
  res.status(200).json(payload);
}
