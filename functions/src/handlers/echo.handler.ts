/**
 * Echo Handler
 * Pure Express handler - no Firebase dependencies
 */

import { Request, Response } from 'express';
import { getLogger } from '../adapters/logger.adapter';

const logger = getLogger();

export interface EchoResponse {
  receivedAt: string;
  method: string;
  query: Record<string, unknown>;
  body: unknown;
  headers?: Record<string, string | string[] | undefined>;
}

/**
 * Echo endpoint - returns request details
 * Useful for testing and debugging
 */
export async function echoHandler(req: Request, res: Response): Promise<void> {
  // Add CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'Method Not Allowed',
      allowed: ['POST'],
      received: req.method,
    });
    return;
  }

  const payload: EchoResponse = {
    receivedAt: new Date().toISOString(),
    method: req.method,
    query: req.query as Record<string, unknown>,
    body: req.body,
  };

  // Include headers in debug mode
  if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
    payload.headers = req.headers as Record<string, string | string[] | undefined>;
  }

  logger.info('Echo request received', {
    method: payload.method,
    query: payload.query,
    bodySize: JSON.stringify(payload.body).length,
  });

  res.status(200).json(payload);
}
