# Implementation Roadmap
## Cortex DC Web - Microservices Migration

**Version**: 1.0
**Created**: 2025-10-20
**Timeline**: 10 Weeks

---

## Overview

This document provides a **week-by-week implementation plan** for migrating the Cortex DC Web platform from Firebase to a microservices architecture on GKE, with primary focus on the **TRR Records Management System**.

---

## Phase 1: Foundation (Weeks 1-2)

### Week 1: Infrastructure Setup

#### Day 1-2: GKE Cluster Provisioning

**Tasks**:
- [ ] Review and finalize Terraform configurations
- [ ] Provision GKE cluster in `us-central1` region
  ```bash
  cd terraform/gke-cluster
  terraform init
  terraform plan
  terraform apply
  ```
- [ ] Configure kubectl context
- [ ] Create namespaces: `cortex-dc`, `monitoring`, `ingress`
- [ ] Set up node pools with autoscaling
- [ ] Configure network policies

**Deliverables**:
- GKE cluster operational with 3 nodes
- kubectl configured and tested
- Namespaces created

**Success Criteria**:
- `kubectl get nodes` shows 3 ready nodes
- All system pods running

---

#### Day 3-4: Database Setup

**Tasks**:
- [ ] Provision Cloud SQL PostgreSQL 15 instance
  - Machine type: `db-n1-standard-4`
  - Storage: 100GB SSD, auto-increase enabled
  - Backups: Daily at 3 AM UTC
  - Point-in-time recovery enabled
- [ ] Create read replica in different zone
- [ ] Configure PgBouncer for connection pooling
- [ ] Deploy PgBouncer on GKE:
  ```yaml
  # kubernetes/database/pgbouncer-deployment.yaml
  ```
- [ ] Run Prisma migrations:
  ```bash
  cd packages/db
  pnpm prisma migrate deploy
  ```
- [ ] Seed initial data (users, test TRRs)

**Deliverables**:
- Cloud SQL instance operational
- Read replica syncing
- Database schema deployed
- Connection pool tested

**Success Criteria**:
- Can connect from GKE pod to Cloud SQL via PgBouncer
- Migrations applied successfully
- Read replica lag <1 second

---

#### Day 5: Redis & NATS Deployment

**Tasks**:
- [ ] Deploy Redis cluster using Helm:
  ```bash
  helm repo add bitnami https://charts.bitnami.com/bitnami
  helm install redis bitnami/redis \
    --namespace cortex-dc \
    --set auth.enabled=true \
    --set replica.replicaCount=3
  ```
- [ ] Deploy NATS Streaming:
  ```bash
  helm install nats nats/nats \
    --namespace cortex-dc \
    --set jetstream.enabled=true
  ```
- [ ] Test Redis connectivity
- [ ] Test NATS pub/sub

**Deliverables**:
- Redis cluster with 3 replicas
- NATS streaming operational
- Test scripts verified

**Success Criteria**:
- Redis: `redis-cli ping` returns PONG
- NATS: Test message published and consumed

---

### Week 2: First Microservice (TRR Records Service)

#### Day 1-2: TRR Service Development

**Tasks**:
- [ ] Create service structure:
  ```bash
  mkdir -p packages/trr-service/src/{controllers,services,models,routes,middleware}
  cd packages/trr-service
  pnpm init
  ```
- [ ] Install dependencies:
  ```bash
  pnpm add express prisma @prisma/client ioredis nats winston
  pnpm add -D typescript @types/node @types/express tsx
  ```
- [ ] Implement core modules:
  - [ ] `src/models/trr.model.ts` - Data models
  - [ ] `src/services/trr.service.ts` - Business logic
  - [ ] `src/controllers/trr.controller.ts` - Request handlers
  - [ ] `src/routes/trr.routes.ts` - API routes
  - [ ] `src/middleware/auth.middleware.ts` - JWT validation
  - [ ] `src/middleware/error.middleware.ts` - Error handling
  - [ ] `src/index.ts` - Server entry point

**Code Samples**:

`src/models/trr.model.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTRRInput {
  title: string;
  description?: string;
  projectName?: string;
  customerName?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  linkedPovId?: string;
  dueDate?: Date;
  scope?: any;
  technicalRequirements?: any;
}

export class TRRModel {
  async create(userId: string, data: CreateTRRInput) {
    return prisma.tRR.create({
      data: {
        ...data,
        createdBy: userId,
        status: 'draft'
      }
    });
  }

  async findByUser(userId: string, filters?: any) {
    return prisma.tRR.findMany({
      where: {
        createdBy: userId,
        ...filters
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.tRR.findUnique({
      where: { id },
      include: {
        linkedPov: true
      }
    });
  }

  async update(id: string, data: Partial<CreateTRRInput>) {
    return prisma.tRR.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.tRR.delete({
      where: { id }
    });
  }
}
```

`src/services/trr.service.ts`:
```typescript
import { TRRModel, CreateTRRInput } from '../models/trr.model';
import { EventPublisher } from '../events/publisher';
import { CacheService } from '../cache/cache.service';

export class TRRService {
  private model: TRRModel;
  private events: EventPublisher;
  private cache: CacheService;

  constructor() {
    this.model = new TRRModel();
    this.events = new EventPublisher();
    this.cache = new CacheService();
  }

  async createTRR(userId: string, data: CreateTRRInput) {
    // Create TRR
    const trr = await this.model.create(userId, data);

    // Publish event
    await this.events.publish('trr.created', {
      trrId: trr.id,
      userId,
      timestamp: new Date()
    });

    // Invalidate user's TRR cache
    await this.cache.invalidate(`trr:user:${userId}`);

    return trr;
  }

  async getTRRsByUser(userId: string, filters?: any) {
    const cacheKey = `trr:user:${userId}`;

    // Check cache
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    // Query database
    const trrs = await this.model.findByUser(userId, filters);

    // Cache result (5 min TTL)
    await this.cache.set(cacheKey, trrs, 300);

    return trrs;
  }

  async appendActivity(trrId: string, userId: string, activity: any) {
    // Append activity to TRR
    // ... implementation

    // Publish event
    await this.events.publish('trr.activity.appended', {
      trrId,
      activityType: activity.type,
      userId,
      timestamp: new Date()
    });

    // Invalidate cache
    await this.cache.invalidate(`trr:${trrId}`);
  }
}
```

**Deliverables**:
- TRR Service codebase complete
- Unit tests written
- Local testing passed

**Success Criteria**:
- All CRUD endpoints working
- Event publishing functional
- Redis caching operational

---

#### Day 3: Containerization

**Tasks**:
- [ ] Create Dockerfile for TRR Service:
  ```dockerfile
  # packages/trr-service/Dockerfile
  FROM node:22-alpine AS deps
  WORKDIR /app
  COPY package.json pnpm-lock.yaml ./
  RUN corepack enable && pnpm install --frozen-lockfile

  FROM node:22-alpine AS builder
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  RUN corepack enable && pnpm build

  FROM node:22-alpine AS runner
  WORKDIR /app
  RUN addgroup --system --gid 1001 nodejs && \
      adduser --system --uid 1001 trrservice
  COPY --from=builder --chown=trrservice:nodejs /app/dist ./dist
  COPY --from=builder --chown=trrservice:nodejs /app/node_modules ./node_modules
  COPY --from=builder --chown=trrservice:nodejs /app/package.json ./
  USER trrservice
  EXPOSE 8080
  HEALTHCHECK --interval=30s --timeout=3s \
    CMD node -e "require('http').get('http://localhost:8080/health')"
  CMD ["node", "dist/index.js"]
  ```
- [ ] Build image:
  ```bash
  docker build -t trr-service:v1.0.0 -f packages/trr-service/Dockerfile .
  ```
- [ ] Test locally with Docker Compose
- [ ] Push to GCR:
  ```bash
  docker tag trr-service:v1.0.0 gcr.io/PROJECT_ID/trr-service:v1.0.0
  docker push gcr.io/PROJECT_ID/trr-service:v1.0.0
  ```

**Deliverables**:
- Docker image built and tagged
- Image pushed to GCR
- Local Docker Compose test passed

---

#### Day 4: Kubernetes Deployment

**Tasks**:
- [ ] Create Kubernetes manifests:
  - [ ] `kubernetes/trr-service/deployment.yaml`
  - [ ] `kubernetes/trr-service/service.yaml`
  - [ ] `kubernetes/trr-service/hpa.yaml`
  - [ ] `kubernetes/trr-service/configmap.yaml`
  - [ ] `kubernetes/trr-service/secret.yaml` (sealed secret)
- [ ] Deploy to GKE:
  ```bash
  kubectl apply -f kubernetes/trr-service/
  ```
- [ ] Verify pods running:
  ```bash
  kubectl get pods -n cortex-dc -l app=trr-service
  ```
- [ ] Test service internally:
  ```bash
  kubectl run curl --image=curlimages/curl -it --rm -- \
    curl http://trr-service.cortex-dc.svc.cluster.local:8080/health
  ```

**Deliverables**:
- TRR Service deployed on GKE
- 3 replicas running
- Health checks passing

**Success Criteria**:
- All pods show STATUS: Running
- Logs show successful startup
- Internal curl test returns 200 OK

---

#### Day 5: Dual-Write Implementation

**Tasks**:
- [ ] Implement dual-write logic in TRR Service:
  ```typescript
  async createTRR(userId: string, data: CreateTRRInput) {
    // Write to PostgreSQL (primary)
    const trr = await this.model.create(userId, data);

    // Also write to Firebase (temporary fallback)
    try {
      await admin.firestore().collection('trrs').doc(trr.id).set({
        ...data,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (err) {
      console.error('Firebase dual-write failed:', err);
      // Don't fail the request - PostgreSQL is source of truth
    }

    return trr;
  }
  ```
- [ ] Deploy updated service
- [ ] Monitor both databases for consistency
- [ ] Set up comparison job to validate data parity

**Deliverables**:
- Dual-write operational
- Validation script running
- Monitoring dashboard shows write counts

**Success Criteria**:
- 100% of TRR writes go to both databases
- Data consistency check passes
- No errors in logs

---

## Phase 2: Core Services (Weeks 3-5)

### Week 3: Authentication & API Gateway

#### Day 1-2: Keycloak Setup

**Tasks**:
- [ ] Deploy Keycloak on GKE using Helm:
  ```bash
  helm install keycloak bitnami/keycloak \
    --namespace cortex-dc \
    --set postgresql.enabled=false \
    --set externalDatabase.host=CLOUD_SQL_IP \
    --set externalDatabase.database=keycloak
  ```
- [ ] Configure Keycloak realm: `cortex-dc`
- [ ] Create OIDC client: `cortex-web-client`
- [ ] Import users from Firebase Auth:
  ```bash
  node scripts/migrate-users-to-keycloak.js
  ```
- [ ] Test authentication flow

**Deliverables**:
- Keycloak operational
- Realm configured
- Users migrated
- Login tested

---

#### Day 3-4: Auth Service Development

**Tasks**:
- [ ] Create Auth Service package
- [ ] Implement endpoints:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/logout`
  - `POST /api/v1/auth/refresh`
  - `GET /api/v1/auth/me`
  - `POST /api/v1/auth/validate` (internal)
- [ ] Integrate with Keycloak
- [ ] Implement JWT generation and validation
- [ ] Deploy to GKE

**Deliverables**:
- Auth Service deployed
- Login flow working
- JWT validation operational

---

#### Day 5: API Gateway (Kong)

**Tasks**:
- [ ] Deploy Kong on GKE:
  ```bash
  helm install kong kong/kong \
    --namespace cortex-dc \
    --set ingressController.enabled=true
  ```
- [ ] Configure routes for TRR Service and Auth Service
- [ ] Enable JWT plugin
- [ ] Enable rate limiting
- [ ] Test end-to-end flow:
  ```
  Client → Kong → Auth Service → JWT → Kong → TRR Service
  ```

**Deliverables**:
- Kong deployed and configured
- Routes tested
- Rate limiting verified

---

### Week 4: POV, User, and Engagement Services

#### Day 1-2: POV Management Service

**Tasks**:
- [ ] Create POV Service package (similar structure to TRR Service)
- [ ] Implement CRUD endpoints
- [ ] Add POV-to-TRR relationship logic
- [ ] Deploy to GKE
- [ ] Configure Kong routes

**Deliverables**:
- POV Service operational
- API tested

---

#### Day 3: User Management Service

**Tasks**:
- [ ] Create User Service package
- [ ] Implement user CRUD
- [ ] Implement user notes and preferences
- [ ] Deploy to GKE

**Deliverables**:
- User Service operational

---

#### Day 4: DC Engagement Service

**Tasks**:
- [ ] Create DC Engagement Service
- [ ] Migrate engagement tracking logic
- [ ] Implement analytics functions
- [ ] Deploy to GKE

**Deliverables**:
- Engagement Service operational

---

#### Day 5: Event Tracking Service

**Tasks**:
- [ ] Create Event Tracking Service
- [ ] Implement activity logging
- [ ] Implement login event tracking
- [ ] Set up NATS consumers for all event types
- [ ] Deploy to GKE

**Deliverables**:
- Event Tracking operational
- Events flowing through NATS

---

### Week 5: Frontend Migration & Traffic Shift

#### Day 1-2: BFF (Backend for Frontend) Service

**Tasks**:
- [ ] Create BFF package
- [ ] Implement aggregation endpoints:
  - `/api/dashboard/metrics` → calls TRR, POV, Engagement services
  - `/api/user/profile` → calls User, Auth services
- [ ] Deploy to GKE

**Deliverables**:
- BFF deployed
- Aggregation tested

---

#### Day 3-4: Frontend Updates

**Tasks**:
- [ ] Update Next.js app to call new APIs via Kong:
  ```typescript
  // lib/api-client.ts
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cortex-dc.example.com';

  export async function fetchTRRs(userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/trr/records`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return response.json();
  }
  ```
- [ ] Test all pages:
  - TRR list, create, detail
  - POV list, create, detail
  - Dashboard
  - User profile
- [ ] Deploy frontend to GKE (not Firebase Hosting)

**Deliverables**:
- Frontend calls new APIs
- All features working
- Frontend deployed on GKE

---

#### Day 5: Traffic Shift to 50%

**Tasks**:
- [ ] Configure load balancer to send 50% traffic to GKE, 50% to Firebase
- [ ] Monitor error rates, latency, throughput
- [ ] Compare PostgreSQL vs Firebase query performance
- [ ] Fix any issues

**Deliverables**:
- 50% traffic on GKE
- Error rate <1%
- Latency within SLA

---

## Phase 3: Advanced Services (Weeks 6-8)

### Week 6: AI Service

#### Day 1-3: AI Service Development

**Tasks**:
- [ ] Create AI Service package
- [ ] Implement Gemini AI integration:
  - TRR suggestions
  - POV analysis
  - Content generation
- [ ] Implement embeddings generation
- [ ] Set up pgvector for semantic search
- [ ] Deploy to GKE

**Deliverables**:
- AI Service operational
- Suggestions working
- Semantic search functional

---

#### Day 4-5: Search Service

**Tasks**:
- [ ] Create Search Service
- [ ] Implement full-text search with PostgreSQL `ts_vector`
- [ ] Implement semantic search with pgvector
- [ ] Index all TRRs, POVs, Users
- [ ] Deploy to GKE

**Deliverables**:
- Search Service operational
- Search tested across entities

---

### Week 7: Analytics Service

#### Day 1-3: Analytics Service Development

**Tasks**:
- [ ] Create Analytics Service
- [ ] Implement dashboard metrics calculations
- [ ] Implement BigQuery export:
  ```typescript
  async exportToBigQuery(dataType: 'trr' | 'pov' | 'engagement') {
    const data = await this.fetchData(dataType);
    const bigquery = new BigQuery();
    await bigquery.dataset('cortex_dc').table(dataType).insert(data);
  }
  ```
- [ ] Schedule periodic exports
- [ ] Deploy to GKE

**Deliverables**:
- Analytics Service operational
- Dashboard metrics accurate
- BigQuery export working

---

#### Day 4-5: Observability Stack

**Tasks**:
- [ ] Deploy Prometheus for metrics:
  ```bash
  helm install prometheus prometheus-community/kube-prometheus-stack \
    --namespace monitoring
  ```
- [ ] Deploy Grafana
- [ ] Create dashboards:
  - Service health (uptime, error rate)
  - Request rate and latency (P50, P95, P99)
  - Database queries (slow queries, connection pool)
  - Resource usage (CPU, memory, disk)
- [ ] Set up OpenTelemetry for distributed tracing
- [ ] Deploy Jaeger for trace visualization
- [ ] Configure alerts:
  - Error rate >5%
  - Latency P95 >500ms
  - Pod restarts >3 in 5 min
  - Database connections >80%

**Deliverables**:
- Prometheus scraping all services
- Grafana dashboards operational
- Traces visible in Jaeger
- Alerts configured

---

### Week 8: Full Traffic Migration

#### Day 1-2: 100% Traffic to GKE

**Tasks**:
- [ ] Gradually increase traffic: 50% → 75% → 90% → 100%
- [ ] Monitor at each step
- [ ] Stop writes to Firebase (read-only)
- [ ] Update DNS to point to GKE load balancer

**Deliverables**:
- 100% traffic on GKE
- Firebase in read-only mode
- Zero errors

---

#### Day 3-4: Data Migration Validation

**Tasks**:
- [ ] Run full data comparison script:
  ```bash
  node scripts/compare-firebase-postgres.js
  ```
- [ ] Verify 100% data parity
- [ ] Export Firebase data for archival
- [ ] Document any discrepancies

**Deliverables**:
- Data comparison report
- Firebase data archived
- Migration validated

---

#### Day 5: Firebase Decommission

**Tasks**:
- [ ] Archive Firebase data to Cloud Storage
- [ ] Delete Firebase Hosting
- [ ] Delete Cloud Functions
- [ ] Keep Firestore in read-only for 30 days (safety net)
- [ ] Update documentation to remove Firebase references

**Deliverables**:
- Firebase hosting/functions deleted
- Data archived
- Documentation updated

---

## Phase 4: Optimization (Weeks 9-10)

### Week 9: Performance Optimization

#### Day 1-2: Database Optimization

**Tasks**:
- [ ] Analyze slow queries:
  ```sql
  SELECT query, mean_exec_time, calls
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 20;
  ```
- [ ] Add missing indexes
- [ ] Optimize JSONB queries
- [ ] Configure query caching

**Deliverables**:
- All queries <100ms P95
- Indexes optimized

---

#### Day 3-4: Caching Strategy

**Tasks**:
- [ ] Implement multi-layer caching:
  - **L1**: Application in-memory cache (Node.js `lru-cache`)
  - **L2**: Redis cache
  - **L3**: PostgreSQL read replica
- [ ] Configure cache invalidation on writes
- [ ] Measure cache hit rates

**Deliverables**:
- Cache hit rate >80%
- Latency reduced by 30%

---

#### Day 5: Load Testing

**Tasks**:
- [ ] Run load tests with k6:
  ```javascript
  import http from 'k6/http';
  export let options = {
    stages: [
      { duration: '5m', target: 100 },
      { duration: '10m', target: 500 },
      { duration: '5m', target: 0 },
    ],
  };
  export default function () {
    http.get('https://cortex-dc.example.com/api/v1/trr/records');
  }
  ```
- [ ] Monitor during load test
- [ ] Verify autoscaling works
- [ ] Identify bottlenecks

**Deliverables**:
- Load test report
- System handles 500 RPS
- Autoscaling verified

---

### Week 10: Security & Documentation

#### Day 1-2: Security Audit

**Tasks**:
- [ ] Run security scan on Docker images:
  ```bash
  trivy image gcr.io/PROJECT_ID/trr-service:latest
  ```
- [ ] Fix vulnerabilities
- [ ] Penetration testing
- [ ] Review RBAC policies
- [ ] Enable Pod Security Standards

**Deliverables**:
- Zero critical vulnerabilities
- Pen test report

---

#### Day 3-4: Documentation

**Tasks**:
- [ ] Update README with new architecture
- [ ] Create API documentation (OpenAPI/Swagger)
- [ ] Write runbooks:
  - Service deployment
  - Database migration
  - Incident response
  - Rollback procedure
- [ ] Create architecture diagrams

**Deliverables**:
- Complete documentation
- Runbooks ready

---

#### Day 5: Go-Live Celebration

**Tasks**:
- [ ] Final smoke tests
- [ ] Announce migration complete
- [ ] Post-mortem meeting
- [ ] Celebrate team success

**Deliverables**:
- Migration complete
- Post-mortem documented
- Team celebration

---

## Success Metrics

### Performance Metrics

| Metric | Target | Current (Firebase) | Week 5 | Week 10 |
|--------|--------|--------------------|--------|---------|
| P95 Latency (TRR API) | <200ms | 350ms | 250ms | 180ms |
| Throughput | 500 RPS | 50 RPS | 300 RPS | 600 RPS |
| Error Rate | <1% | 2% | 1.5% | 0.5% |
| Cache Hit Rate | >80% | N/A | 60% | 85% |
| Database Query Time | <100ms | 200ms | 150ms | 80ms |

### Cost Metrics

| Resource | Monthly Cost (Estimated) |
|----------|--------------------------|
| GKE Cluster (3-10 nodes) | $500-$1,500 |
| Cloud SQL (Primary + Replica) | $400 |
| Cloud Load Balancer | $50 |
| Cloud Storage | $30 |
| Redis (3 replicas) | $100 |
| Monitoring (Prometheus/Grafana) | $50 |
| **Total** | **$1,130-$2,130/month** |

Compare to Firebase Costs: ~$800/month (current)

**Note**: GKE provides more control, scalability, and enterprise features.

---

## Risk Management

### Weekly Risk Review

At the end of each week:
1. Review completed tasks
2. Identify blockers
3. Assess risks
4. Adjust timeline if needed

### Escalation Path

- **Minor issues**: Team lead resolves
- **Moderate issues**: Engineering manager involved
- **Critical issues**: VP Engineering + stakeholders

---

## Appendix

### Tools & Technologies

| Category | Tool | Purpose |
|----------|------|---------|
| **Container Orchestration** | Kubernetes (GKE) | Service deployment |
| **API Gateway** | Kong | Routing, rate limiting |
| **Database** | PostgreSQL (Cloud SQL) | Primary data store |
| **Cache** | Redis | Caching layer |
| **Message Queue** | NATS | Event streaming |
| **Auth** | Keycloak | Identity management |
| **Monitoring** | Prometheus + Grafana | Metrics and dashboards |
| **Tracing** | Jaeger + OpenTelemetry | Distributed tracing |
| **CI/CD** | GitHub Actions | Automated deployments |
| **IaC** | Terraform | Infrastructure provisioning |

---

**Document End**
