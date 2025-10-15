/**
 * Express API Server for Self-Hosted Cortex DC
 * Main entry point
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from 'dotenv';
import { DatabaseFactory } from '@cortex/db/src/adapters/database.factory';
import { povRoutes } from './routes/pov.routes';
import { trrRoutes } from './routes/trr.routes';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';

// Load environment variables
config();

const app: Application = express();
const PORT = process.env.API_PORT || 8080;

// ======================
// Middleware
// ======================

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ======================
// Health Check Routes
// ======================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.get('/ready', async (req, res) => {
  try {
    const db = DatabaseFactory.getAdapter();
    const isConnected = db.isConnected();

    if (!isConnected) {
      return res.status(503).json({
        status: 'not_ready',
        database: 'disconnected',
      });
    }

    res.json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: (error as Error).message,
    });
  }
});

// ======================
// API Routes
// ======================

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes (auth required)
app.use('/api/povs', authMiddleware, povRoutes);
app.use('/api/trrs', authMiddleware, trrRoutes);
app.use('/api/users', authMiddleware, userRoutes);

// ======================
// Error Handling
// ======================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Global error handler
app.use(errorHandler);

// ======================
// Server Startup
// ======================

async function startServer() {
  try {
    // Connect to database
    console.log('[Server] Connecting to database...');
    await DatabaseFactory.connect();
    console.log('[Server] Database connected successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Server] Database Mode: ${process.env.DEPLOYMENT_MODE || 'firebase'}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received, shutting down gracefully...');
  await DatabaseFactory.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Server] SIGINT received, shutting down gracefully...');
  await DatabaseFactory.disconnect();
  process.exit(0);
});

// Start the server
startServer();

export { app };
