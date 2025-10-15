/**
 * Firebase Functions Entry Point
 * Wraps Express handlers for Firebase Functions deployment
 *
 * This file maintains backward compatibility with Firebase Functions.
 * The actual logic is in standalone Express handlers.
 */

import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import { healthCheckHandler } from './handlers/health.handler';
import { echoHandler } from './handlers/echo.handler';
import { environmentHandler } from './handlers/environment.handler';

// Set deployment mode for logger adapter
process.env.DEPLOYMENT_MODE = 'firebase';

// Configure Firebase Functions
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
  memory: '256MiB',
  timeoutSeconds: 60,
});

/**
 * Health Check Function
 * Used by monitoring systems and Kubernetes health probes
 */
export const healthCheck = onRequest(
  {
    cors: true,
    timeoutSeconds: 10,
  },
  healthCheckHandler
);

/**
 * Echo Function
 * Returns request details for testing and debugging
 */
export const echo = onRequest(
  {
    cors: true,
    timeoutSeconds: 30,
  },
  echoHandler
);

/**
 * Environment Summary Function
 * Returns configuration and environment details
 */
export const environmentSummary = onRequest(
  {
    cors: true,
    timeoutSeconds: 10,
  },
  environmentHandler
);
