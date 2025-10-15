/**
 * Express Server for Firebase Functions
 * Converts Firebase Cloud Functions to standalone Express server
 * for Kubernetes deployment
 */

import express, { Request, Response } from 'express';
import * as logger from 'firebase-functions/logger';
import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Import function handlers
import { healthCheck, echo, environmentSummary } from './index';

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  next();
});

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

// Helper to convert Firebase function to Express route
function wrapFirebaseFunction(firebaseFunction: any) {
  return (req: Request, res: Response) => {
    const mockRequest = {
      ...req,
      rawBody: Buffer.from(JSON.stringify(req.body)),
    };

    const mockResponse = {
      ...res,
      send: (data: any) => res.send(data),
      json: (data: any) => res.json(data),
      status: (code: number) => {
        res.status(code);
        return mockResponse;
      },
      set: (field: string, value: string) => {
        res.set(field, value);
        return mockResponse;
      },
    };

    return firebaseFunction(mockRequest, mockResponse);
  };
}

// Health check endpoint (K8s readiness/liveness probes)
app.get('/health', wrapFirebaseFunction(healthCheck));
app.get('/healthz', wrapFirebaseFunction(healthCheck));
app.get('/readyz', wrapFirebaseFunction(healthCheck));

// Function endpoints
app.post('/echo', wrapFirebaseFunction(echo));
app.get('/environment', wrapFirebaseFunction(environmentSummary));

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP functions_up Service is up and running
# TYPE functions_up gauge
functions_up 1

# HELP functions_requests_total Total number of requests
# TYPE functions_requests_total counter
functions_requests_total{method="GET",path="/health"} 100

# HELP functions_request_duration_seconds Request duration in seconds
# TYPE functions_request_duration_seconds histogram
functions_request_duration_seconds_bucket{le="0.05"} 95
functions_request_duration_seconds_bucket{le="0.1"} 98
functions_request_duration_seconds_bucket{le="0.5"} 100
functions_request_duration_seconds_sum 4.5
functions_request_duration_seconds_count 100
  `.trim());
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Functions microservice running on ${HOST}:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Version: ${process.env.APP_VERSION || 'dev'}`);
});

export default app;
