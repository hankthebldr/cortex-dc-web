/**
 * Cortex DC Backend API Server
 * Unified Express.js backend service replacing Firebase Functions
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config, isProduction } from './config/env.config';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { authMiddleware } from './middleware/auth.middleware';

// Import routes
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import dataRoutes from './routes/data.routes';
import aiRoutes from './routes/ai.routes';
import exportRoutes from './routes/export.routes';
import storageRoutes from './routes/storage.routes';

/**
 * Initialize Express application
 */
const app: Express = express();

/**
 * Security Middleware
 */
// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: config.CSP_ENABLED ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", config.API_BASE_URL],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOrigins = config.CORS_ORIGINS.split(',').map(origin => origin.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (corsOrigins.includes('*') || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.CORS_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400, // 24 hours
}));

// Rate limiting
if (config.RATE_LIMIT_ENABLED) {
  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/health';
    },
  });
  app.use('/api', limiter);
}

/**
 * Body Parsing Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request Logging Middleware
 */
if (config.ENABLE_REQUEST_LOGGING) {
  app.use(requestLogger);
}

/**
 * Health Check Routes (no authentication required)
 */
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

/**
 * Public Routes (no authentication required)
 */
app.use('/api/auth', authRoutes);

/**
 * Protected Routes (authentication required)
 */
app.use('/api/data', authMiddleware, dataRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/export', authMiddleware, exportRoutes);
app.use('/api/storage', authMiddleware, storageRoutes);

/**
 * Root endpoint
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Cortex DC Backend API',
    version: '0.1.0',
    environment: config.NODE_ENV,
    status: 'operational',
    docs: config.ENABLE_SWAGGER_UI ? '/api/docs' : undefined,
  });
});

/**
 * 404 Handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    path: req.path,
  });
});

/**
 * Error Handler (must be last)
 */
app.use(errorHandler);

/**
 * Start Server
 */
const PORT = config.PORT;
const server = app.listen(PORT, () => {
  console.log(`🚀 Cortex DC Backend API started`);
  console.log(`📡 Environment: ${config.NODE_ENV}`);
  console.log(`🔌 Port: ${PORT}`);
  console.log(`🌐 Base URL: ${config.API_BASE_URL}`);
  console.log(`🔒 Auth Provider: ${config.AUTH_PROVIDER}`);
  console.log(`💾 Database: ${config.DATABASE_TYPE}`);
  console.log(`📦 Storage: ${config.STORAGE_PROVIDER}`);
  console.log(`🤖 AI Features: ${config.ENABLE_AI_FEATURES ? 'enabled' : 'disabled'}`);

  if (!isProduction()) {
    console.log(`\n📚 API Documentation: http://localhost:${PORT}/`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  }
});

/**
 * Graceful Shutdown
 */
const shutdown = (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    console.log('✅ HTTP server closed');

    // Close database connections, etc.
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

/**
 * Unhandled Errors
 */
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  if (isProduction()) {
    // In production, log and continue
    console.error('Application will continue running');
  } else {
    // In development, exit to catch errors early
    process.exit(1);
  }
});

process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Application will exit');
  process.exit(1);
});

export default app;
