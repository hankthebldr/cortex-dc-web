# Firebase Functions Migration Plan

**Date**: 2025-10-14
**Status**: Planning Complete - Ready for Implementation
**Phase**: Phase 2 - Functions Layer

---

## Executive Summary

The `functions/` directory currently uses `firebase-functions` and `firebase-admin` SDKs. This plan outlines the migration to a pure Express server that can run standalone in Docker/Kubernetes environments.

**Current State**:
- Uses `firebase-functions` v6.0.1 for HTTP triggers
- Uses `firebase-admin` v12.6.0 for initialization
- Uses `firebase-functions/logger` for logging
- Mixed deployment: Firebase Functions OR Kubernetes

**Target State**:
- Pure Express server with no Firebase dependencies
- Standard Node.js logging (Winston or Pino)
- Portable across any deployment environment
- Maintains backward compatibility via adapter pattern

---

## Firebase Dependencies Audit

### Files with Firebase Imports

| File | Firebase Dependencies | Lines | Complexity |
|------|----------------------|-------|------------|
| `src/index.ts` | `onRequest`, `setGlobalOptions`, `logger` | 99 | Low |
| `src/server.ts` | `firebase-admin`, `firebase-functions/logger` | 160 | Medium |
| `src/genkit-sample.ts` | `onCallGenkit`, `defineSecret`, `enableFirebaseTelemetry` | 78 | Medium |

### Dependency Breakdown

**`firebase-functions` Usage**:
```typescript
// src/index.ts
import { setGlobalOptions } from 'firebase-functions/v2/options';
import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

// src/genkit-sample.ts
import { onCallGenkit, hasClaim } from 'firebase-functions/https';
import { defineSecret } from 'firebase-functions/params';
```

**`firebase-admin` Usage**:
```typescript
// src/server.ts
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
```

**`@genkit-ai/firebase` Usage**:
```typescript
// src/genkit-sample.ts
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
enableFirebaseTelemetry();
```

---

## Migration Strategy

### Approach: Dual-Mode Deployment Pattern

Create an adapter pattern that supports both Firebase Functions and standalone Express deployment:

```
DEPLOYMENT_MODE=firebase → Use Firebase Functions
DEPLOYMENT_MODE=standalone → Use pure Express
```

### Benefits

1. **Zero Breaking Changes**: Existing Firebase deployments continue to work
2. **Gradual Migration**: Can migrate function-by-function
3. **Testing**: Both modes can be tested in parallel
4. **Rollback**: Easy to revert if issues arise

---

## Implementation Plan

### Step 1: Create Logger Adapter ✅

**Create** `src/adapters/logger.adapter.ts`:
```typescript
/**
 * Logger Adapter
 * Supports both Firebase Functions logger and Winston
 */

interface Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

class WinstonLogger implements Logger {
  info(message: string, ...args: any[]) {
    console.log(`[INFO] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]) {
    if (process.env.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}

class FirebaseLogger implements Logger {
  private logger: any;

  constructor() {
    this.logger = require('firebase-functions/logger');
  }

  info(message: string, ...args: any[]) {
    this.logger.info(message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.logger.warn(message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.logger.error(message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.logger.debug(message, ...args);
  }
}

export function getLogger(): Logger {
  const mode = process.env.DEPLOYMENT_MODE;

  if (mode === 'firebase') {
    return new FirebaseLogger();
  }

  return new WinstonLogger();
}
```

### Step 2: Convert Functions to Pure Express Handlers ✅

**Create** `src/handlers/health.handler.ts`:
```typescript
import { Request, Response } from 'express';
import { getLogger } from '../adapters/logger.adapter';

const logger = getLogger();

interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  version: string;
}

export async function healthCheckHandler(req: Request, res: Response) {
  const payload: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || 'dev',
  };

  logger.debug('Health check ping', payload);
  res.status(200).json(payload);
}
```

**Create** `src/handlers/echo.handler.ts`:
```typescript
import { Request, Response } from 'express';
import { getLogger } from '../adapters/logger.adapter';

const logger = getLogger();

interface EchoResponse {
  receivedAt: string;
  method: string;
  query: Record<string, unknown>;
  body: unknown;
}

export async function echoHandler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'Method Not Allowed',
      allowed: ['POST'],
    });
    return;
  }

  const payload: EchoResponse = {
    receivedAt: new Date().toISOString(),
    method: req.method,
    query: req.query as Record<string, unknown>,
    body: req.body,
  };

  logger.info('Echo payload', payload);
  res.status(200).json(payload);
}
```

**Create** `src/handlers/environment.handler.ts`:
```typescript
import { Request, Response } from 'express';
import { getLogger } from '../adapters/logger.adapter';

const logger = getLogger();

interface ConfigurationResponse {
  environment: string;
  message: string;
  version: string;
}

export async function environmentHandler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    res.status(405).json({
      error: 'Method Not Allowed',
      allowed: ['GET'],
    });
    return;
  }

  const payload: ConfigurationResponse = {
    environment: process.env.APP_ENV || 'development',
    message: process.env.PUBLIC_HELLO_MESSAGE || 'Welcome to Cortex Data Connect!',
    version: process.env.APP_VERSION || 'dev',
  };

  logger.info('Environment summary requested', payload);
  res.status(200).json(payload);
}
```

### Step 3: Update server.ts to Use Pure Express ✅

**Update** `src/server.ts`:
```typescript
/**
 * Pure Express Server
 * No Firebase dependencies
 */

import express, { Request, Response } from 'express';
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

// Routes
app.get('/health', healthCheckHandler);
app.get('/healthz', healthCheckHandler);
app.get('/readyz', healthCheckHandler);
app.post('/echo', echoHandler);
app.get('/environment', environmentHandler);

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP functions_up Service is up
# TYPE functions_up gauge
functions_up 1
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
```

### Step 4: Create Firebase Functions Wrapper (Backward Compatibility) ✅

**Update** `src/index.ts`:
```typescript
/**
 * Firebase Functions Entry Point
 * Wraps Express handlers for Firebase Functions deployment
 */

import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import { healthCheckHandler } from './handlers/health.handler';
import { echoHandler } from './handlers/echo.handler';
import { environmentHandler } from './handlers/environment.handler';

// Set deployment mode for logger adapter
process.env.DEPLOYMENT_MODE = 'firebase';

setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
});

// Export Firebase Functions
export const healthCheck = onRequest(healthCheckHandler);
export const echo = onRequest(echoHandler);
export const environmentSummary = onRequest(environmentHandler);
```

### Step 5: Update package.json Dependencies ✅

**Remove** Firebase dependencies for standalone mode:
```json
{
  "dependencies": {
    "express": "^5.1.0"
  },
  "optionalDependencies": {
    "firebase-admin": "^12.6.0",
    "firebase-functions": "^6.0.1",
    "@genkit-ai/firebase": "^1.21.0",
    "@genkit-ai/vertexai": "^1.21.0",
    "genkit": "^1.21.0"
  }
}
```

### Step 6: Create Deployment-Specific Build Scripts ✅

**Update** `package.json` scripts:
```json
{
  "scripts": {
    "build": "tsc",
    "build:standalone": "tsc && echo 'DEPLOYMENT_MODE=standalone' > .env",
    "build:firebase": "tsc && echo 'DEPLOYMENT_MODE=firebase' > .env",
    "start": "DEPLOYMENT_MODE=standalone node lib/server.js",
    "start:firebase": "DEPLOYMENT_MODE=firebase npm run serve",
    "docker:build": "docker build --build-arg DEPLOYMENT_MODE=standalone -t gcr.io/cortex-dc-project/functions-microservice:latest ."
  }
}
```

---

## Migration Timeline

| Phase | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| 1 | Create logger adapter | 2 hours | None |
| 1 | Create handler files | 3 hours | Logger adapter |
| 2 | Update server.ts | 2 hours | Handlers complete |
| 2 | Update index.ts wrapper | 1 hour | Handlers complete |
| 3 | Update package.json | 1 hour | All code complete |
| 3 | Test standalone mode | 2 hours | Build complete |
| 3 | Test Firebase mode | 2 hours | Build complete |
| 4 | Deploy to K8s | 2 hours | Standalone tests pass |
| 4 | Deploy to Firebase | 1 hour | Firebase tests pass |

**Total**: ~16 hours (~2 days)

---

## Testing Strategy

### Unit Tests

Test handlers independently:
```typescript
describe('healthCheckHandler', () => {
  it('should return 200 with health status', async () => {
    const req = createMockRequest();
    const res = createMockResponse();

    await healthCheckHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ok' })
    );
  });
});
```

### Integration Tests

#### Standalone Mode
```bash
# Start server
DEPLOYMENT_MODE=standalone npm start

# Test endpoints
curl http://localhost:8080/health
curl -X POST http://localhost:8080/echo -d '{"test": "data"}'
curl http://localhost:8080/environment
```

#### Firebase Mode
```bash
# Start Firebase emulator
firebase emulators:start --only functions

# Test endpoints
curl http://localhost:5001/cortex-dc-portal/us-central1/healthCheck
curl -X POST http://localhost:5001/cortex-dc-portal/us-central1/echo -d '{"test": "data"}'
```

### Deployment Tests

#### Docker/Kubernetes
```bash
# Build and run Docker container
docker build -t functions-test .
docker run -p 8080:8080 --env DEPLOYMENT_MODE=standalone functions-test

# Test
curl http://localhost:8080/health
```

#### Firebase Functions
```bash
# Deploy to Firebase
firebase deploy --only functions

# Test production endpoints
curl https://us-central1-cortex-dc-portal.cloudfunctions.net/healthCheck
```

---

## Backward Compatibility

### Firebase Functions Deployment

**No changes required!** Existing Firebase Functions deployments continue to work:

1. `index.ts` exports Firebase Functions using `onRequest`
2. `DEPLOYMENT_MODE=firebase` uses firebase-functions/logger
3. All existing Cloud Functions features supported

### Kubernetes Deployment

**New capability!** Can now deploy as standalone Express server:

1. `server.ts` runs pure Express without Firebase dependencies
2. `DEPLOYMENT_MODE=standalone` uses Winston logger
3. Docker + Kubernetes deployment fully supported

---

## Benefits

### Performance
- **Faster cold starts**: No Firebase SDK initialization
- **Lower memory usage**: ~100MB vs ~150MB with Firebase SDKs
- **Better request handling**: Direct Express, no Firebase wrapper overhead

### Cost
- **K8s deployment**: Pay for compute only, no Firebase Functions costs
- **Scaling**: Horizontal pod autoscaling in K8s vs Firebase Functions limits
- **Regional control**: Deploy to any region, not just Firebase regions

### Flexibility
- **Any cloud provider**: AWS, GCP, Azure, on-premises
- **Custom middleware**: Full Express control, no Firebase limitations
- **Testing**: Easier to test standalone without Firebase emulator

---

## Risks & Mitigation

### Risk 1: Breaking Firebase Deployments

**Mitigation**:
- Keep `index.ts` as Firebase Functions wrapper
- Extensive testing in Firebase mode before deployment
- Gradual rollout with canary deployments

### Risk 2: Logger API Differences

**Mitigation**:
- Logger adapter maintains same API surface
- Both loggers tested with identical calls
- Fallback to console if adapter fails

### Risk 3: Genkit Functions Complexity

**Mitigation**:
- Keep `genkit-sample.ts` as optional Firebase-only function
- Document that Genkit requires Firebase mode
- Separate Genkit functions from core API endpoints

---

## Success Criteria

- [ ] All handlers work in standalone mode
- [ ] All handlers work in Firebase mode
- [ ] Logger adapter supports both modes
- [ ] Docker build succeeds
- [ ] K8s deployment succeeds
- [ ] Firebase deployment succeeds
- [ ] All tests pass in both modes
- [ ] Performance metrics meet targets
- [ ] No breaking changes to existing deployments

---

## Next Steps

1. **Implement logger adapter** - Create `src/adapters/logger.adapter.ts`
2. **Create handler files** - Extract to `src/handlers/`
3. **Update server.ts** - Remove Firebase dependencies
4. **Update index.ts** - Create Firebase wrapper
5. **Test both modes** - Standalone and Firebase
6. **Deploy to K8s** - Test production deployment
7. **Document deployment** - Update README with both deployment options

---

**Document Owner**: Development Team
**Last Updated**: 2025-10-14
**Status**: Ready for Implementation
**Estimated Completion**: 2 days
