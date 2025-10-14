# Cortex DC Backend API

Unified Express.js backend service replacing Firebase Functions, implementing .env-based configuration.

## Architecture

The backend is a standalone Express.js API server that provides:

- **RESTful API endpoints** for all application features
- **Authentication** via Firebase Auth or JWT
- **Data management** with Firestore or PostgreSQL support
- **File storage** via Google Cloud Storage
- **AI integration** with Gemini AI
- **Data export** to BigQuery, CSV, and JSON
- **Environment-based configuration** using .env files

## Project Structure

```
packages/backend/
├── src/
│   ├── index.ts                 # Express server entry point
│   ├── config/
│   │   └── env.config.ts        # Environment configuration with Zod validation
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT/Firebase authentication
│   │   ├── error.middleware.ts  # Centralized error handling
│   │   └── logger.middleware.ts # Request logging
│   ├── routes/
│   │   ├── health.routes.ts     # Health checks for Kubernetes
│   │   ├── auth.routes.ts       # Authentication endpoints
│   │   ├── data.routes.ts       # CRUD operations
│   │   ├── ai.routes.ts         # AI features
│   │   ├── export.routes.ts     # Data export
│   │   └── storage.routes.ts    # File management
│   └── services/
│       ├── auth.service.ts      # Authentication logic
│       ├── data.service.ts      # Database abstraction layer
│       ├── storage.service.ts   # Cloud Storage operations
│       ├── ai.service.ts        # AI service integration
│       └── export.service.ts    # Export functionality
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Configuration

All configuration is managed via environment variables loaded from `.env` files. See `/.env.example` for all available options.

### Key Configuration Categories

**Server**
- `NODE_ENV` - Environment (development/staging/production/test)
- `PORT` - Server port (default: 8080)

**GCP**
- `GCP_PROJECT_ID` - Google Cloud project ID
- `GCP_REGION` - GCP region (default: us-central1)
- `GCP_SERVICE_ACCOUNT_KEY` - Base64 encoded service account key (optional, uses Workload Identity in GKE)

**Database**
- `DATABASE_TYPE` - firestore or postgres
- `FIRESTORE_PROJECT_ID` - Firestore project ID
- `FIRESTORE_DATABASE_ID` - Firestore database ID

**Authentication**
- `AUTH_PROVIDER` - firebase or gcp-identity
- `JWT_SECRET` - JWT signing secret (min 32 characters)
- `JWT_EXPIRATION` - Token expiration (default: 7d)

**Storage**
- `STORAGE_PROVIDER` - gcs or local
- `STORAGE_BUCKET` - GCS bucket name
- `STORAGE_MAX_FILE_SIZE` - Max file size in bytes

**AI Services**
- `ENABLE_AI_FEATURES` - Enable/disable AI features
- `GEMINI_API_KEY` - Google Gemini API key
- `GEMINI_MODEL` - Model name (default: gemini-pro)

**Feature Flags**
- `ENABLE_ANALYTICS` - Enable analytics
- `ENABLE_BIGQUERY_EXPORT` - Enable BigQuery export
- `ENABLE_XSIAM_INTEGRATION` - Enable XSIAM integration

## API Endpoints

### Health Checks

```
GET  /health            # Liveness probe
GET  /health/ready      # Readiness probe with dependency checks
GET  /health/startup    # Startup probe
GET  /health/version    # Version information
```

### Authentication

```
POST /api/auth/register           # Register new user
POST /api/auth/login              # Login with credentials
POST /api/auth/refresh            # Refresh access token
POST /api/auth/logout             # Logout and revoke tokens
GET  /api/auth/me                 # Get current user profile
PUT  /api/auth/profile            # Update user profile
POST /api/auth/reset-password     # Request password reset
POST /api/auth/verify-email       # Send email verification
```

### Data Management

```
GET    /api/data/:collection                # List documents
GET    /api/data/:collection/:id            # Get document by ID
POST   /api/data/:collection                # Create document
PUT    /api/data/:collection/:id            # Update document (full)
PATCH  /api/data/:collection/:id            # Update document (partial)
DELETE /api/data/:collection/:id            # Delete document
POST   /api/data/:collection/batch          # Batch create
PUT    /api/data/:collection/batch          # Batch update
DELETE /api/data/:collection/batch          # Batch delete
POST   /api/data/:collection/search         # Search documents
```

### AI Features

```
POST   /api/ai/chat                 # Chat with AI
POST   /api/ai/analyze              # Analyze content
POST   /api/ai/generate             # Generate content
POST   /api/ai/summarize            # Summarize text
GET    /api/ai/conversations        # Get conversation history
GET    /api/ai/conversations/:id    # Get specific conversation
DELETE /api/ai/conversations/:id    # Delete conversation
```

### Data Export

```
POST /api/export/bigquery     # Export to BigQuery
POST /api/export/csv          # Export to CSV
POST /api/export/json         # Export to JSON
GET  /api/export/jobs         # List export jobs
GET  /api/export/jobs/:id     # Get export job status
POST /api/export/schedule     # Schedule recurring export
```

### File Storage

```
POST   /api/storage/upload           # Upload file
GET    /api/storage/download/*       # Download file
GET    /api/storage/url/*            # Get signed URL
DELETE /api/storage/*                # Delete file
GET    /api/storage/list             # List files
GET    /api/storage/metadata/*       # Get file metadata
```

## Development

### Prerequisites

- Node.js 22+
- pnpm 8+
- GCP project with required APIs enabled
- `.env.local` file with development configuration

### Setup

```bash
# Install dependencies
pnpm install

# Create .env.local from example
cp ../../.env.example ../../.env.local
# Edit .env.local with your configuration

# Run development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### Local Development

The server runs on `http://localhost:8080` by default.

**Test health endpoint:**
```bash
curl http://localhost:8080/health
```

**Test with authentication:**
```bash
# Register a user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","displayName":"Test User"}'

# Use the token for authenticated requests
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Authentication

The backend supports two authentication providers:

### Firebase Auth (Recommended for GCP)

Set `AUTH_PROVIDER=firebase` in `.env`:

```typescript
// Client-side: Use Firebase SDK to get ID token
const idToken = await user.getIdToken();

// Server-side: Verify token automatically via middleware
// Token is verified using Firebase Admin SDK
```

### JWT Auth (Standalone)

Set `AUTH_PROVIDER=gcp-identity` for custom JWT-based auth:

```typescript
// Register/login returns JWT tokens
const { token, refreshToken } = await authService.login(email, password);

// Use token in Authorization header
headers: { Authorization: `Bearer ${token}` }
```

## Database Support

### Firestore (Default)

```env
DATABASE_TYPE=firestore
FIRESTORE_PROJECT_ID=your-project-id
FIRESTORE_DATABASE_ID=(default)
```

The `DataService` provides a unified interface for CRUD operations on Firestore collections.

### PostgreSQL (Future)

```env
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=cortex_dc
DATABASE_USER=cortex_app
DATABASE_PASSWORD=your-password
```

## Error Handling

The backend uses a centralized error handling system with custom error classes:

```typescript
throw new BadRequestError('Invalid input');        // 400
throw new UnauthorizedError('Not authenticated');   // 401
throw new ForbiddenError('Insufficient permissions'); // 403
throw new NotFoundError('Resource not found');      // 404
throw new InternalServerError('Server error');      // 500
```

All errors return a consistent JSON format:

```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "requestId": "uuid-v4",
    "details": { /* optional additional info */ }
  }
}
```

## Logging

Structured logging with correlation IDs:

**JSON format (production):**
```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "requestId": "abc-123",
  "method": "POST",
  "path": "/api/data/users",
  "statusCode": 201,
  "duration": "45ms",
  "userId": "user_123",
  "event": "request_completed"
}
```

**Text format (development):**
```
✓ POST /api/data/users 201 45ms [abc-123]
```

## Security Features

- **Helmet** for security headers
- **CORS** with configurable origins
- **Rate limiting** per IP address
- **JWT token verification**
- **Non-root container** (UID 1001)
- **Input validation** with Zod schemas
- **SQL injection protection** via parameterized queries
- **XSS protection** via input sanitization

## Deployment

### Docker

```bash
# Build image
docker build -f ../../Dockerfile.functions -t cortex-backend .

# Run container
docker run -p 8080:8080 --env-file .env.local cortex-backend
```

### Kubernetes (GKE)

The backend is deployed via Helm charts. See `/helm/cortex-dc/` for Kubernetes manifests.

```bash
# Deploy to GKE
helm upgrade --install cortex-dc ./helm/cortex-dc \
  -f ./helm/cortex-dc/values-production.yaml \
  --set functions.image.tag=v1.0.0
```

### Health Checks

Kubernetes uses these endpoints for container orchestration:

- **Liveness**: `/health` - Is the server running?
- **Readiness**: `/health/ready` - Can the server handle traffic? (checks DB, storage)
- **Startup**: `/health/startup` - Has the server finished starting?

## Performance

- **Async/await** for all I/O operations
- **Connection pooling** for database connections
- **Caching** with Redis (optional)
- **Compression** for responses
- **Efficient pagination** for list operations
- **Batch operations** for bulk updates

## Monitoring

The backend integrates with:

- **Google Cloud Logging** - Structured logs
- **Google Cloud Monitoring** - Metrics and alerts
- **Prometheus** - Custom metrics via `/metrics` endpoint (when enabled)
- **Sentry** - Error tracking and performance monitoring

## Migration from Firebase Functions

This backend replaces Firebase Cloud Functions with a unified Express.js API:

**Before (Firebase Functions):**
```typescript
// Multiple separate function deployments
export const createUser = functions.https.onCall(async (data, context) => { ... });
export const getUsers = functions.https.onCall(async (data, context) => { ... });
export const updateUser = functions.https.onCall(async (data, context) => { ... });
```

**After (Express API):**
```typescript
// Single unified API with RESTful routes
POST   /api/data/users        # Create user
GET    /api/data/users        # List users
PUT    /api/data/users/:id    # Update user
```

### Migration Benefits

1. **Better Performance** - Single long-running server vs cold starts
2. **Standard REST APIs** - Industry-standard patterns
3. **Easier Testing** - Standard HTTP testing tools
4. **Better Monitoring** - Unified logs and metrics
5. **Cost Effective** - Single instance vs per-function billing
6. **Portable** - Can run anywhere (GKE, Cloud Run, etc.)

## Troubleshooting

### Port already in use
```bash
# Find process using port 8080
lsof -i :8080
# Kill the process
kill -9 <PID>
```

### Firebase Admin initialization fails
- Ensure `GCP_PROJECT_ID` is set
- For local dev, use service account key
- For GKE, use Workload Identity (no key needed)

### Database connection errors
- Verify Firestore is enabled in GCP console
- Check `FIRESTORE_PROJECT_ID` matches your project
- Ensure service account has Firestore permissions

### AI features not working
- Set `ENABLE_AI_FEATURES=true`
- Provide valid `GEMINI_API_KEY`
- Check API quota in GCP console

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test src/services/auth.service.test.ts

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update this README for API changes
4. Use conventional commits
5. Run `pnpm type-check` before committing

## License

Private - Cortex DC Platform

---

**Next Steps:**

1. Implement unit tests for all services
2. Add integration tests for API endpoints
3. Set up E2E testing with real GCP services
4. Implement rate limiting per user
5. Add request validation schemas
6. Implement webhook support
7. Add GraphQL endpoint (optional)
8. Implement real-time updates with WebSockets
