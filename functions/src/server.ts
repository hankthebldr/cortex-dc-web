/**
 * Express Server for Cortex Functions
 * Pure Express server with no Firebase dependencies
 * Supports both standalone and Firebase deployment modes
 */

import express, { Request, Response, NextFunction } from 'express';
import { getLogger } from './adapters/logger.adapter';
import { healthCheckHandler } from './handlers/health.handler';
import { echoHandler } from './handlers/echo.handler';
import { environmentHandler } from './handlers/environment.handler';

const logger = getLogger();
const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
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
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

// Health check endpoints (Kubernetes readiness/liveness probes)
app.get('/health', healthCheckHandler);
app.get('/healthz', healthCheckHandler);
app.get('/readyz', healthCheckHandler);

// Function endpoints
app.post('/echo', echoHandler);
app.get('/environment', environmentHandler);

// Metrics endpoint for Prometheus
app.get('/metrics', (req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP functions_up Service is up and running
# TYPE functions_up gauge
functions_up 1

# HELP functions_deployment_mode Current deployment mode
# TYPE functions_deployment_mode gauge
functions_deployment_mode{mode="${process.env.DEPLOYMENT_MODE || 'standalone'}"} 1

# HELP functions_version Service version
# TYPE functions_version info
functions_version{version="${process.env.APP_VERSION || 'dev'}"} 1
  `.trim());
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /health',
      'GET /healthz',
      'GET /readyz',
      'POST /echo',
      'GET /environment',
      'GET /metrics',
    ],
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

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
  logger.info(`Deployment Mode: ${process.env.DEPLOYMENT_MODE || 'standalone'}`);
  logger.info(`Version: ${process.env.APP_VERSION || 'dev'}`);
});

export default app;
