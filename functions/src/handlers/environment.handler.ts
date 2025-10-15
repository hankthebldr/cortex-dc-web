/**
 * Environment Handler
 * Pure Express handler - no Firebase dependencies
 */

import { Request, Response } from 'express';
import { getLogger } from '../adapters/logger.adapter';

const logger = getLogger();

export interface EnvironmentResponse {
  environment: string;
  message: string;
  version: string;
  deployment: string;
  nodeVersion: string;
}

/**
 * Environment summary endpoint
 * Returns configuration and environment details
 */
export async function environmentHandler(req: Request, res: Response): Promise<void> {
  // Add CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({
      error: 'Method Not Allowed',
      allowed: ['GET'],
      received: req.method,
    });
    return;
  }

  const payload: EnvironmentResponse = {
    environment: process.env.APP_ENV || process.env.NODE_ENV || 'development',
    message: process.env.PUBLIC_HELLO_MESSAGE || 'Welcome to Cortex Data Connect!',
    version: process.env.APP_VERSION || 'dev',
    deployment: process.env.DEPLOYMENT_MODE || 'standalone',
    nodeVersion: process.version,
  };

  logger.info('Environment summary requested', {
    environment: payload.environment,
    deployment: payload.deployment,
  });

  res.status(200).json(payload);
}
