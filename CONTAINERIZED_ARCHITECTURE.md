# Containerized Architecture - Self-Hosted Alternative to Firebase

**Document Version:** 1.0
**Created:** October 13, 2025
**Purpose:** Replace Firebase services with containerized, Kubernetes-ready alternatives

---

## Executive Summary

This document outlines the migration from Firebase to a fully containerized, self-hosted architecture suitable for on-premise deployments, Kubernetes orchestration, and environments requiring data sovereignty.

### Current Firebase Dependencies

| Firebase Service | Current Usage | Replacement |
|------------------|---------------|-------------|
| Firebase Authentication | User auth, OAuth, SAML | Keycloak |
| Firestore | Document database | PostgreSQL + Prisma ORM |
| Cloud Functions | Serverless backend | Node.js Express API |
| Cloud Storage | File storage | MinIO (S3-compatible) |
| Firebase Admin SDK | Server-side ops | Custom admin API |

---

## Proposed Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     KUBERNETES CLUSTER                        │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  Frontend    │    │  API Server  │    │  Auth Server │   │
│  │  (Next.js)   │◄───┤  (Express)   │◄───┤  (Keycloak)  │   │
│  │  Port: 3000  │    │  Port: 8080  │    │  Port: 8180  │   │
│  └──────────────┘    └──────┬───────┘    └──────────────┘   │
│                               │                                │
│                      ┌────────┴────────┐                      │
│                      │                 │                      │
│              ┌───────▼────────┐ ┌─────▼─────────┐           │
│              │  PostgreSQL    │ │  MinIO (S3)   │           │
│              │  (Database)    │ │  (Storage)    │           │
│              │  Port: 5432    │ │  Port: 9000   │           │
│              └────────────────┘ └───────────────┘           │
│                                                                │
│              ┌────────────────┐ ┌───────────────┐           │
│              │  Redis         │ │  NATS/RabbitMQ│           │
│              │  (Cache)       │ │  (Queue)      │           │
│              │  Port: 6379    │ │  Port: 4222   │           │
│              └────────────────┘ └───────────────┘           │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Authentication: Keycloak

**Replacement for:** Firebase Authentication

**Features:**
- ✅ OAuth 2.0 / OpenID Connect
- ✅ SAML 2.0 support
- ✅ Social login (Google, Microsoft, etc.)
- ✅ Role-based access control (RBAC)
- ✅ User federation
- ✅ Multi-factor authentication
- ✅ Admin UI for user management

**Docker Image:** `quay.io/keycloak/keycloak:latest`

**Configuration:**
```yaml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    command: start-dev
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: ${KEYCLOAK_DB_PASSWORD}
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
    ports:
      - "8180:8080"
    depends_on:
      - postgres
```

**Integration Points:**
- Frontend uses Keycloak JS adapter
- Backend validates JWT tokens
- Custom claims stored in Keycloak user attributes

---

### 2. Database: PostgreSQL + Prisma

**Replacement for:** Firestore

**Why PostgreSQL:**
- ✅ ACID compliance
- ✅ Relational data modeling
- ✅ Advanced querying (SQL)
- ✅ JSON/JSONB support (document-like features)
- ✅ Full-text search
- ✅ Mature ecosystem
- ✅ Excellent performance

**Docker Image:** `postgres:16-alpine`

**Schema Design:**
```sql
-- Users table (from Keycloak)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POVs table
CREATE TABLE povs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    customer VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    assigned_to VARCHAR(255),
    objectives JSONB,
    success_criteria JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TRRs table
CREATE TABLE trrs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_name VARCHAR(255),
    project_id VARCHAR(100),
    linked_pov_id UUID REFERENCES povs(id),
    due_date DATE,
    assigned_to VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'medium',
    scope JSONB,
    technical_requirements JSONB,
    findings JSONB,
    recommendations JSONB,
    completion_percentage INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_povs_created_by ON povs(created_by);
CREATE INDEX idx_povs_status ON povs(status);
CREATE INDEX idx_trrs_created_by ON trrs(created_by);
CREATE INDEX idx_trrs_linked_pov ON trrs(linked_pov_id);
CREATE INDEX idx_trrs_status ON trrs(status);
```

**Prisma ORM:**
```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String   @id @default(uuid())
  keycloakId   String   @unique @map("keycloak_id")
  email        String   @unique
  displayName  String?  @map("display_name")
  role         String   @default("user")
  povs         POV[]
  trrs         TRR[]
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("users")
}

model POV {
  id               String   @id @default(uuid())
  name             String
  customer         String
  industry         String?
  description      String?
  status           String   @default("pending")
  priority         String   @default("medium")
  startDate        DateTime? @map("start_date")
  endDate          DateTime? @map("end_date")
  assignedTo       String?   @map("assigned_to")
  objectives       Json?
  successCriteria  Json?     @map("success_criteria")
  createdBy        String    @map("created_by")
  creator          User      @relation(fields: [createdBy], references: [id])
  trrs             TRR[]
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  @@map("povs")
}

model TRR {
  id                     String   @id @default(uuid())
  name                   String
  description            String?
  projectName            String?  @map("project_name")
  projectId              String?  @map("project_id")
  linkedPovId            String?  @map("linked_pov_id")
  linkedPov              POV?     @relation(fields: [linkedPovId], references: [id])
  dueDate                DateTime? @map("due_date")
  assignedTo             String?  @map("assigned_to")
  status                 String   @default("pending")
  priority               String   @default("medium")
  scope                  Json?
  technicalRequirements  Json?    @map("technical_requirements")
  findings               Json?
  recommendations        Json?
  completionPercentage   Int      @default(0) @map("completion_percentage")
  createdBy              String   @map("created_by")
  creator                User     @relation(fields: [createdBy], references: [id])
  createdAt              DateTime @default(now()) @map("created_at")
  updatedAt              DateTime @updatedAt @map("updated_at")

  @@map("trrs")
}
```

---

### 3. Object Storage: MinIO

**Replacement for:** Cloud Storage

**Why MinIO:**
- ✅ S3-compatible API
- ✅ High performance
- ✅ Kubernetes-native
- ✅ Erasure coding
- ✅ Encryption at rest
- ✅ Versioning support

**Docker Image:** `minio/minio:latest`

**Configuration:**
```yaml
services:
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    ports:
      - "9000:9000"  # API
      - "9001:9001"  # Console
    volumes:
      - minio_data:/data
```

**Buckets:**
- `cortex-documents` - POV/TRR documents
- `cortex-uploads` - User uploads
- `cortex-exports` - Export files

---

### 4. API Server: Express + TypeScript

**Replacement for:** Cloud Functions

**Why Express:**
- ✅ Full control over routing
- ✅ Middleware ecosystem
- ✅ WebSocket support
- ✅ Easy to containerize
- ✅ TypeScript support

**Structure:**
```
packages/api-server/
├── src/
│   ├── server.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── pov.routes.ts
│   │   ├── trr.routes.ts
│   │   └── users.routes.ts
│   ├── controllers/
│   │   ├── pov.controller.ts
│   │   └── trr.controller.ts
│   ├── services/
│   │   ├── database.service.ts
│   │   ├── storage.service.ts
│   │   └── keycloak.service.ts
│   └── utils/
│       └── jwt.util.ts
├── Dockerfile
└── package.json
```

---

### 5. Caching: Redis

**Purpose:** Session storage, API caching, rate limiting

**Docker Image:** `redis:7-alpine`

**Use Cases:**
- JWT token blacklist
- API response caching
- Rate limiting counters
- Session storage

---

### 6. Message Queue: NATS (or RabbitMQ)

**Purpose:** Async job processing, event-driven architecture

**Docker Image:** `nats:latest` or `rabbitmq:3-management`

**Use Cases:**
- Email notifications
- Report generation
- Data exports
- Webhook processing

---

## Docker Compose Configuration

Create `docker-compose.yml`:

```yaml
version: '3.9'

services:
  # Database
  postgres:
    image: postgres:16-alpine
    container_name: cortex-postgres
    environment:
      POSTGRES_DB: cortex
      POSTGRES_USER: cortex
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cortex"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Authentication
  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    container_name: cortex-keycloak
    command: start-dev
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: ${KEYCLOAK_DB_PASSWORD}
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
      KC_HOSTNAME: localhost
      KC_HTTP_PORT: 8180
    ports:
      - "8180:8180"
    depends_on:
      postgres:
        condition: service_healthy

  # Object Storage
  minio:
    image: minio/minio:latest
    container_name: cortex-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    ports:
      - "9000:9000"  # API
      - "9001:9001"  # Console
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # Cache
  redis:
    image: redis:7-alpine
    container_name: cortex-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Message Queue
  nats:
    image: nats:latest
    container_name: cortex-nats
    command: "--jetstream --store_dir=/data"
    ports:
      - "4222:4222"  # Client connections
      - "8222:8222"  # HTTP monitoring
    volumes:
      - nats_data:/data

  # API Server
  api-server:
    build:
      context: ./packages/api-server
      dockerfile: Dockerfile
    container_name: cortex-api
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://cortex:${POSTGRES_PASSWORD}@postgres:5432/cortex
      KEYCLOAK_URL: http://keycloak:8180
      KEYCLOAK_REALM: cortex
      KEYCLOAK_CLIENT_ID: cortex-api
      KEYCLOAK_CLIENT_SECRET: ${KEYCLOAK_CLIENT_SECRET}
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      NATS_URL: nats://nats:4222
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - keycloak
      - redis
      - minio
      - nats

  # Frontend (Next.js)
  frontend:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    container_name: cortex-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080
      NEXT_PUBLIC_KEYCLOAK_URL: http://localhost:8180
      NEXT_PUBLIC_KEYCLOAK_REALM: cortex
      NEXT_PUBLIC_KEYCLOAK_CLIENT_ID: cortex-web
    ports:
      - "3000:3000"
    depends_on:
      - api-server

volumes:
  postgres_data:
  minio_data:
  redis_data:
  nats_data:

networks:
  default:
    name: cortex-network
```

---

## Kubernetes Deployment

### Directory Structure

```
kubernetes/
├── namespaces/
│   └── cortex-namespace.yaml
├── config/
│   ├── configmap.yaml
│   └── secrets.yaml
├── databases/
│   ├── postgres-deployment.yaml
│   ├── postgres-service.yaml
│   └── postgres-pvc.yaml
├── auth/
│   ├── keycloak-deployment.yaml
│   └── keycloak-service.yaml
├── storage/
│   ├── minio-deployment.yaml
│   ├── minio-service.yaml
│   └── minio-pvc.yaml
├── cache/
│   ├── redis-deployment.yaml
│   └── redis-service.yaml
├── api/
│   ├── api-deployment.yaml
│   └── api-service.yaml
├── frontend/
│   ├── frontend-deployment.yaml
│   └── frontend-service.yaml
├── ingress/
│   └── ingress.yaml
└── kustomization.yaml
```

### Sample Deployment: API Server

`kubernetes/api/api-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cortex-api
  namespace: cortex
  labels:
    app: cortex-api
    component: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cortex-api
  template:
    metadata:
      labels:
        app: cortex-api
    spec:
      containers:
      - name: api
        image: cortex/api-server:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: cortex-secrets
              key: database-url
        - name: KEYCLOAK_URL
          valueFrom:
            configMapKeyRef:
              name: cortex-config
              key: keycloak-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: cortex-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: cortex-api
  namespace: cortex
spec:
  selector:
    app: cortex-api
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
  type: ClusterIP
```

### Ingress Configuration

`kubernetes/ingress/ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cortex-ingress
  namespace: cortex
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - cortex.yourdomain.com
    - api.cortex.yourdomain.com
    - auth.cortex.yourdomain.com
    secretName: cortex-tls
  rules:
  - host: cortex.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: cortex-frontend
            port:
              number: 80
  - host: api.cortex.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: cortex-api
            port:
              number: 80
  - host: auth.cortex.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: keycloak
            port:
              number: 8080
```

---

## Migration Path

### Phase 1: Set Up Infrastructure (Week 1)

1. **Deploy PostgreSQL**
   - Create database schema
   - Run Prisma migrations
   - Import existing Firestore data

2. **Deploy Keycloak**
   - Configure realms and clients
   - Set up OAuth providers
   - Migrate user accounts

3. **Deploy MinIO**
   - Create buckets
   - Configure access policies
   - Migrate existing files

### Phase 2: Build Abstraction Layer (Week 2)

1. **Create database abstraction**
   ```typescript
   // packages/db/src/adapters/database.adapter.ts
   export interface DatabaseAdapter {
     findMany<T>(collection: string, filter: any): Promise<T[]>;
     findOne<T>(collection: string, id: string): Promise<T | null>;
     create<T>(collection: string, data: any): Promise<T>;
     update<T>(collection: string, id: string, data: any): Promise<T>;
     delete(collection: string, id: string): Promise<void>;
   }

   export class FirestoreAdapter implements DatabaseAdapter {
     // Existing Firestore implementation
   }

   export class PostgresAdapter implements DatabaseAdapter {
     // New PostgreSQL implementation
   }
   ```

2. **Create auth abstraction**
   ```typescript
   // packages/db/src/adapters/auth.adapter.ts
   export interface AuthAdapter {
     signIn(email: string, password: string): Promise<AuthResult>;
     signOut(): Promise<void>;
     getCurrentUser(): Promise<User | null>;
     verifyToken(token: string): Promise<TokenPayload>;
   }

   export class FirebaseAuthAdapter implements AuthAdapter {
     // Existing Firebase Auth
   }

   export class KeycloakAuthAdapter implements AuthAdapter {
     // New Keycloak implementation
   }
   ```

### Phase 3: Update Application (Week 3)

1. **Update environment configuration**
2. **Switch adapters based on env**
3. **Test both Firebase and self-hosted modes**

### Phase 4: Deploy and Test (Week 4)

1. **Deploy to staging Kubernetes cluster**
2. **Run comprehensive tests**
3. **Performance benchmarking**
4. **Security audit**

---

## Environment Configuration

`.env.example`:

```bash
# Deployment Mode
DEPLOYMENT_MODE=self-hosted  # or 'firebase'

# PostgreSQL
DATABASE_URL=postgresql://cortex:password@localhost:5432/cortex
POSTGRES_USER=cortex
POSTGRES_PASSWORD=changeme
POSTGRES_DB=cortex

# Keycloak
KEYCLOAK_URL=http://localhost:8180
KEYCLOAK_REALM=cortex
KEYCLOAK_CLIENT_ID=cortex-api
KEYCLOAK_CLIENT_SECRET=changeme
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=changeme

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=changeme
MINIO_USE_SSL=false

# Redis
REDIS_URL=redis://:changeme@localhost:6379
REDIS_PASSWORD=changeme

# NATS
NATS_URL=nats://localhost:4222

# Application
NODE_ENV=production
API_PORT=8080
API_URL=http://localhost:8080
```

---

## Benefits of Containerized Architecture

### 1. Data Sovereignty ✅
- All data stays on-premise
- No external dependencies
- Compliance with data regulations

### 2. Cost Control ✅
- No per-request pricing
- No bandwidth charges
- Predictable infrastructure costs

### 3. Customization ✅
- Full control over configuration
- Custom authentication flows
- Tailored database schema

### 4. Performance ✅
- Low latency (local network)
- No API rate limits
- Optimized for workload

### 5. Portability ✅
- Run on any cloud provider
- Run on-premise
- Easy migration between environments

### 6. Security ✅
- Network isolation
- Custom security policies
- Audit logs

---

## Next Steps

1. ✅ Review this architecture
2. ⏳ Create abstraction layer
3. ⏳ Build Dockerfiles
4. ⏳ Create Kubernetes manifests
5. ⏳ Implement database migrations
6. ⏳ Test in development
7. ⏳ Deploy to staging
8. ⏳ Production rollout

---

**Document Status:** Draft - Ready for Review
**Next Review:** After architecture approval
**Owner:** Development Team
