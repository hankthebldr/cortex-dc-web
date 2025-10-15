# Cortex DC Web Platform - Kubernetes-Ready Architecture
**Backend, API, and Data Pipeline Architecture for Container-Native Systems**

**Status**: Production-Ready K8s Deployment
**Last Updated**: 2025-10-15
**Version**: 2.0
**Target**: GKE/Kubernetes with Self-Hosted Infrastructure

---

## Overview

**Business Goal**: Accelerate Domain Consultant engagement tracking with sub-second API responses, 99.9% uptime, and seamless deployment across Firebase and self-hosted Kubernetes environments.

### Measurable Success Criteria (KPIs/SLOs)

| Metric | Target | Current | Measurement |
|--------|--------|---------|-------------|
| **API P95 Latency** | < 200ms | TBD | OpenTelemetry traces |
| **Database Query P95** | < 50ms | TBD | PostgreSQL logs + OTel |
| **Uptime** | 99.9% | TBD | Kubernetes liveness/readiness |
| **Error Rate** | < 0.1% | TBD | Error tracking middleware |
| **Time to Deploy** | < 5 min | ~15 min | CI/CD pipeline metrics |
| **Lighthouse Performance** | > 90 | TBD | CI Lighthouse job |
| **Core Web Vitals** | All Green | TBD | Real User Monitoring |
| **Container Startup** | < 30s | TBD | Kubernetes startup probes |

---

## System Diagram

```mermaid
flowchart TB
  subgraph Edge["🌐 Edge Layer"]
    DNS[DNS] --> Ingress[NGINX Ingress Controller]
    Ingress --> TLS[TLS Termination]
  end

  TLS --> APIGW[API Gateway / Load Balancer]

  subgraph Application["🚀 Application Services (K8s Pods)"]
    APIGW --> Web[Next.js Web App<br/>Port 3000<br/>3 replicas]
    APIGW --> Functions[Cloud Functions Microservice<br/>Port 8081<br/>2 replicas]
    APIGW --> API[Express API Server<br/>Port 8080<br/>3 replicas]
  end

  subgraph Data["💾 Data Layer (StatefulSets)"]
    Web --> PG[(PostgreSQL 16<br/>Primary + 2 Replicas)]
    API --> PG
    Functions --> PG

    Web --> Redis[(Redis 7<br/>Cache + Sessions)]
    API --> Redis

    API --> Vec[(pgvector<br/>Embeddings Store)]
  end

  subgraph Storage["📦 Object Storage"]
    Web --> MinIO[(MinIO<br/>S3-Compatible)]
    API --> MinIO
  end

  subgraph Auth["🔐 Authentication"]
    Web --> KC[Keycloak<br/>OIDC/OAuth2]
    API --> KC
  end

  subgraph EventBus["📨 Event Bus"]
    API --> NATS[NATS JetStream<br/>Event Streaming]
    NATS --> W1[Transform Worker<br/>ETL Pipeline]
    NATS --> W2[AI Worker<br/>Embeddings + Eval]
    W1 --> PG
    W2 --> Vec
  end

  subgraph Observability["📊 Observability (Platform)"]
    Web --> OTel[OpenTelemetry Collector]
    API --> OTel
    Functions --> OTel
    W1 --> OTel
    W2 --> OTel

    OTel --> Prom[Prometheus]
    OTel --> Loki[Loki Logs]
    Prom --> Grafana[Grafana Dashboards]
    Loki --> Grafana
  end

  subgraph Security["🛡️ Security"]
    SecMgr[Google Secret Manager / Vault]
    WAF[Cloud Armor / WAF]
  end

  subgraph CI_CD["⚙️ CI/CD Pipeline"]
    GH[GitHub Actions] --> GCR[Artifact Registry]
    GCR --> GKE[GKE Deployment]
  end

  WAF --> Ingress
  API --> SecMgr
  Functions --> SecMgr

  classDef edge fill:#e1f5ff,stroke:#0288d1,stroke-width:2px
  classDef app fill:#fff3e0,stroke:#f57c00,stroke-width:2px
  classDef data fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
  classDef obs fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  classDef sec fill:#ffebee,stroke:#c62828,stroke-width:2px

  class Edge edge
  class Application,EventBus app
  class Data,Storage data
  class Observability obs
  class Security,CI_CD sec
```

### CI/CD Pipeline Flow

```mermaid
flowchart LR
  Dev[👨‍💻 Developer] --> PR[Pull Request]
  PR --> CI{CI Pipeline}

  CI --> Lint[Lint & Format]
  CI --> Type[Type Check]
  CI --> Unit[Unit Tests]
  CI --> Int[Integration Tests]

  Lint --> Sec[Security Scan]
  Type --> Sec
  Unit --> Sec
  Int --> Sec

  Sec --> Trivy[Trivy Scan]
  Sec --> Hadolint[Hadolint]
  Sec --> Gitleaks[Gitleaks]

  Trivy --> Build[Docker Build]
  Hadolint --> Build
  Gitleaks --> Build

  Build --> SBOM[Generate SBOM]
  SBOM --> Push[Push to GCR]

  Push --> Deploy{Deploy Stage}

  Deploy --> Canary[Canary Deploy 10%]
  Canary --> Smoke[Smoke Tests]
  Smoke --> Rollout[Full Rollout]

  Rollout --> Monitor[Monitor SLOs]
  Monitor --> Done[✅ Complete]

  Monitor --> Rollback[🔄 Auto-Rollback]
  Rollback -.-> Canary
```

---

## API Spec (OpenAPI/GraphQL Summary)

### REST API Endpoints

**Base URL**: `https://api.cortex-dc.henryreed.ai`

#### Authentication & Users (`/api/auth`, `/api/users`)
- `POST /api/auth/register` - User registration (zod: `UserRegistrationSchema`)
- `POST /api/auth/login` - User login (returns JWT)
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/:id` - Update user profile

#### Projects (`/api/projects`)
- `GET /api/projects` - List projects (pagination, filtering)
  - Query params: `?page=1&limit=20&status=active&sortBy=createdAt:desc`
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Soft delete project

#### POVs (Proof of Value) (`/api/povs`)
- `GET /api/povs` - List POVs with filters
- `POST /api/povs` - Create POV (linked to project)
- `GET /api/povs/:id` - Get POV details
- `PATCH /api/povs/:id` - Update POV status/phases
- `POST /api/povs/:id/phases` - Add phase to POV
- `GET /api/povs/:id/metrics` - Get POV success metrics

#### TRRs (Technical Risk Review) (`/api/trrs`)
- `GET /api/trrs` - List TRRs with filters
- `POST /api/trrs` - Create TRR
- `GET /api/trrs/:id` - Get TRR with findings
- `PATCH /api/trrs/:id` - Update TRR status
- `POST /api/trrs/:id/findings` - Add risk finding
- `POST /api/trrs/:id/validate` - Validate and sign off

#### Analytics (`/api/analytics`)
- `GET /api/analytics/dashboard` - User dashboard metrics
- `GET /api/analytics/admin` - Admin-level analytics
- `GET /api/analytics/projects/:id` - Project-specific metrics

#### Health & Monitoring
- `GET /api/health` - Basic health check
- `GET /api/healthz` - Kubernetes liveness probe
- `GET /api/readyz` - Kubernetes readiness probe
- `GET /api/metrics` - Prometheus metrics endpoint

### Request/Response Schemas (Zod)

**Error Response Model**:
```typescript
{
  error: {
    code: string;        // "VALIDATION_ERROR", "NOT_FOUND", "UNAUTHORIZED", etc.
    message: string;     // Human-readable message
    details?: unknown;   // Additional error context
    retryable: boolean;  // Can client retry?
    timestamp: string;   // ISO 8601
  }
}
```

**Pagination Model**:
```typescript
{
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}
```

### API Versioning Strategy
- **URL Versioning**: `/api/v1/projects`, `/api/v2/projects`
- **Deprecation Policy**: 6 months notice, deprecation headers
- **Backward Compatibility**: Non-breaking changes within major version

### Rate Limiting
- **Authenticated**: 1000 req/min per user
- **Anonymous**: 60 req/min per IP
- **Admin**: 5000 req/min
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Data Model (SQL Schemas)

### Core Tables (PostgreSQL 16)

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Indexes
  INDEX idx_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_created_at (created_at DESC)
);
```

#### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  customer_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(customer_name, ''))
  ) STORED,

  -- Indexes
  INDEX idx_projects_owner (owner_id),
  INDEX idx_projects_status (status),
  INDEX idx_projects_customer (customer_name),
  INDEX idx_projects_dates (start_date, end_date),
  INDEX idx_projects_search (search_vector) USING GIN
);
```

#### POVs Table
```sql
CREATE TABLE povs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning', 'in_progress', 'testing', 'validating', 'completed', 'failed')),
  phase VARCHAR(50) NOT NULL DEFAULT 'discovery'
    CHECK (phase IN ('discovery', 'design', 'implementation', 'testing', 'validation', 'handoff')),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  start_date DATE,
  end_date DATE,
  objectives JSONB DEFAULT '[]'::jsonb,
  success_criteria JSONB DEFAULT '[]'::jsonb,
  test_plan JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Indexes
  INDEX idx_povs_project (project_id),
  INDEX idx_povs_owner (owner_id),
  INDEX idx_povs_status (status),
  INDEX idx_povs_phase (phase),
  INDEX idx_povs_dates (start_date, end_date)
);
```

#### TRRs Table
```sql
CREATE TABLE trrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  pov_id UUID REFERENCES povs(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_review', 'validated', 'rejected', 'archived')),
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 10),
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  validated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  validated_at TIMESTAMP WITH TIME ZONE,
  findings JSONB DEFAULT '[]'::jsonb, -- [{severity, category, description, mitigation}]
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Indexes
  INDEX idx_trrs_project (project_id),
  INDEX idx_trrs_pov (pov_id),
  INDEX idx_trrs_status (status),
  INDEX idx_trrs_risk_score (risk_score),
  INDEX idx_trrs_reviewer (reviewer_id)
);
```

### Vector Store (pgvector Extension)

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  document_type VARCHAR(50) NOT NULL, -- 'project', 'pov', 'trr', 'content'
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Vector similarity index (HNSW for fast approximate search)
  INDEX idx_embeddings_vector ON document_embeddings
    USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64),
  INDEX idx_embeddings_document (document_id),
  INDEX idx_embeddings_type (document_type)
);
```

### Migrations Strategy

**Tool**: Custom SQL migrations (ordered by timestamp)

**Location**: `packages/db/migrations/`

**Naming**: `YYYYMMDDHHMMSS_description.sql`

**Example**:
```
001_20251015120000_create_users_table.sql
002_20251015120100_create_projects_table.sql
003_20251015120200_add_fulltext_search.sql
```

**Rollback**: Each migration has corresponding `_down.sql` file

### Data Retention & Partitioning

**Time-Series Partitioning** (for analytics tables):
```sql
CREATE TABLE user_activity_log (
  id UUID NOT NULL,
  user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Monthly partitions
CREATE TABLE user_activity_log_2025_10
  PARTITION OF user_activity_log
  FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
```

**Retention Policy**:
- User activity logs: 90 days
- Audit logs: 2 years
- Deleted records (soft delete): 30 days

---

## Pipelines & Transforms (Event-Driven Architecture)

### Event Topics (NATS JetStream)

#### Streams & Subjects
```
cortex.projects.created
cortex.projects.updated
cortex.projects.deleted

cortex.povs.created
cortex.povs.updated
cortex.povs.status_changed
cortex.povs.phase_changed

cortex.trrs.created
cortex.trrs.finding_added
cortex.trrs.validated

cortex.analytics.user_action
cortex.analytics.metric_recorded

cortex.ai.embedding_requested
cortex.ai.embedding_completed
```

### Consumer Groups & Workers

#### Transform Worker (ETL Pipeline)
**Purpose**: Process domain events and update analytics/derived data

**Concurrency**: 3 workers per topic

**Topics Consumed**:
- `cortex.projects.*`
- `cortex.povs.*`
- `cortex.trrs.*`

**Processing Logic**:
1. Receive event from NATS
2. Validate event schema (zod)
3. Transform to analytics format
4. Write to analytics tables
5. Publish derived events
6. ACK message

**Idempotency**: Event ID stored in `processed_events` table

**Retry Policy**:
- Max attempts: 5
- Backoff: Exponential (1s, 2s, 4s, 8s, 16s)
- DLQ: `cortex.dlq.transform_worker`

#### AI Embedding Worker
**Purpose**: Generate vector embeddings for semantic search

**Concurrency**: 2 workers

**Topics Consumed**:
- `cortex.ai.embedding_requested`

**Processing Logic**:
1. Receive embedding request
2. Fetch document content
3. Chunk text (512 tokens with 50-token overlap)
4. Call OpenAI embedding API (batched)
5. Store vectors in pgvector
6. Publish completion event

**Rate Limiting**: 3000 tokens/min (OpenAI tier limit)

**Error Handling**:
- Transient errors (rate limit): Retry with exponential backoff
- Permanent errors (invalid content): Move to DLQ

### Dead Letter Queue (DLQ) Design

**DLQ Stream**: `cortex.dlq.*`

**Monitoring**: Alert when DLQ depth > 10

**Reprocessing**: Manual review + replay to original topic

---

## AI Augmentation (RAG Pipeline)

### Retrieval-Augmented Generation (RAG) Graph

```mermaid
flowchart LR
  Query[User Query] --> Embed[Embed Query<br/>OpenAI API]
  Embed --> Search[Vector Search<br/>pgvector cosine similarity]
  Search --> Rerank[Rerank Results<br/>Cross-encoder]
  Rerank --> Context[Build Context]
  Context --> Prompt[Format Prompt]
  Prompt --> LLM[LLM Inference<br/>Gemini/GPT-4]
  LLM --> Response[Augmented Response]

  Response --> Safety[Safety Filter<br/>PII + Toxicity]
  Safety --> User[Return to User]
```

### Embedding Job (Offline Batch)

**Schedule**: Every 6 hours

**Process**:
1. Query for new/updated documents
2. Chunk content (recursive text splitter)
3. Generate embeddings (batch 100 at a time)
4. Upsert to `document_embeddings` table
5. Log embedding coverage metrics

**Monitoring**:
- Embedding freshness: < 12 hours
- Coverage: > 95% of active documents

### Prompt/Response Schemas

**Prompt Template** (zod):
```typescript
const PromptSchema = z.object({
  systemPrompt: z.string(),
  userQuery: z.string(),
  context: z.array(z.object({
    source: z.string(),
    content: z.string(),
    relevance: z.number().min(0).max(1)
  })),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4096).default(1024)
});
```

**Response Schema**:
```typescript
const AIResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  latencyMs: z.number(),
  tokensUsed: z.number()
});
```

### Evaluation Harness (Golden Test Sets)

**Location**: `packages/ai/eval/golden-sets/`

**Test Cases**: 50+ query/expected-answer pairs

**Metrics**:
- Answer relevance (LLM-as-judge)
- Citation accuracy
- Latency P95 < 3s
- Cost per query < $0.05

**Red Team Tests**:
- Prompt injection attempts
- PII leakage checks
- Hallucination detection
- Bias evaluation

---

## Security Plan (OWASP ASVS Level 2)

### Authentication & Authorization (OAuth2/OIDC)

**Provider**: Keycloak (self-hosted) or Firebase Auth

**Flow**: Authorization Code with PKCE

**Token Strategy**:
- Access Token: JWT, 15-minute expiry
- Refresh Token: Opaque, 7-day expiry, HTTP-only cookie
- Claims: `sub`, `email`, `role`, `iat`, `exp`

**RBAC Matrix**:

| Resource | Admin | User | Viewer |
|----------|-------|------|--------|
| Read Projects | ✅ | ✅ (own) | ✅ (assigned) |
| Create Projects | ✅ | ✅ | ❌ |
| Update Projects | ✅ | ✅ (own) | ❌ |
| Delete Projects | ✅ | ❌ | ❌ |
| View Analytics | ✅ (all) | ✅ (own) | ❌ |
| Manage Users | ✅ | ❌ | ❌ |

### Secrets Management

**Production**: Google Secret Manager

**Development**: Docker secrets / `.env.local` (gitignored)

**Rotation Policy**: 90 days for DB passwords, 30 days for API keys

**Secrets**:
- Database credentials
- Keycloak client secrets
- MinIO access keys
- OpenAI API key
- JWT signing key

### Rate Limiting & WAF

**Implementation**: Express middleware + Redis

**Limits**:
- Global: 10,000 req/min per service
- Per-user: 1,000 req/min
- Per-IP: 60 req/min (unauthenticated)
- Burst allowance: 20 requests

**WAF** (Google Cloud Armor):
- SQL injection protection
- XSS protection
- Rate-based banning (5xx errors)
- Geo-blocking (if required)

### Security Headers (Helmet.js)

```typescript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://*.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
})
```

### Supply Chain Security

**SBOM Generation**: CycloneDX format via Anchore

**Image Scanning**: Trivy (Critical + High vulnerabilities)

**Dependency Scanning**: Snyk + GitHub Dependabot

**Base Images**: Distroless or Alpine (non-root user)

---

## Infrastructure as Code (Terraform Modules)

### Module Structure

```
terraform/
├── modules/
│   ├── gke-cluster/       # GKE cluster with node pools
│   ├── vpc-network/       # VPC, subnets, firewall rules
│   ├── artifact-registry/ # Docker image registry
│   ├── cloud-sql/         # Managed PostgreSQL (Cloud SQL)
│   ├── cloud-storage/     # GCS buckets (alternative to MinIO)
│   ├── secret-manager/    # Google Secret Manager
│   ├── monitoring/        # Prometheus, Grafana, Loki
│   └── cdn/               # Cloud CDN + Load Balancer
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   └── production/
└── backend.tf             # Remote state (GCS)
```

### Sample Module: GKE Cluster

**File**: `terraform/modules/gke-cluster/main.tf`

```hcl
resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.region

  # VPC-native cluster
  network    = var.network_id
  subnetwork = var.subnet_id

  # Auto-scaling node pool
  initial_node_count = 1
  remove_default_node_pool = true

  # Security
  master_auth {
    client_certificate_config {
      issue_client_certificate = false
    }
  }

  # Workload Identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Binary Authorization
  enable_binary_authorization = true

  # Logging & Monitoring
  logging_service    = "logging.googleapis.com/kubernetes"
  monitoring_service = "monitoring.googleapis.com/kubernetes"

  maintenance_policy {
    daily_maintenance_window {
      start_time = "03:00"
    }
  }

  release_channel {
    channel = "REGULAR"
  }
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "${var.cluster_name}-node-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = var.node_count

  autoscaling {
    min_node_count = var.min_nodes
    max_node_count = var.max_nodes
  }

  node_config {
    machine_type = var.machine_type
    disk_size_gb = 100
    disk_type    = "pd-ssd"

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }

    labels = {
      env     = var.environment
      managed = "terraform"
    }

    tags = ["cortex-dc", var.environment]
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }
}
```

### Variables (terraform.tfvars)

```hcl
# Development Environment
project_id   = "cortex-dc-portal"
region       = "us-central1"
environment  = "dev"
cluster_name = "cortex-dc-dev"

# Node Pool
machine_type = "e2-standard-4"
node_count   = 2
min_nodes    = 1
max_nodes    = 5

# Database
db_tier             = "db-custom-2-7680"
db_disk_size        = 50
db_backup_enabled   = true
db_backup_time      = "03:00"
```

### State Management

**Backend**: Google Cloud Storage

```hcl
terraform {
  backend "gcs" {
    bucket  = "cortex-dc-terraform-state"
    prefix  = "env/production"
  }
}
```

**State Locking**: GCS native locking

**Workspace Strategy**: Separate state files per environment

---

## Kubernetes Deployment (Helm Charts)

### Helm Chart Structure

```
helm/cortex-dc/
├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-staging.yaml
├── values-production.yaml
└── templates/
    ├── namespace.yaml
    ├── configmap.yaml
    ├── secrets.yaml
    ├── web/
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   ├── hpa.yaml
    │   ├── pdb.yaml
    │   └── ingress.yaml
    ├── api/
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   ├── hpa.yaml
    │   └── pdb.yaml
    ├── functions/
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   └── hpa.yaml
    ├── postgres/
    │   ├── statefulset.yaml
    │   ├── service.yaml
    │   └── pvc.yaml
    ├── redis/
    │   ├── statefulset.yaml
    │   └── service.yaml
    └── monitoring/
        ├── servicemonitor.yaml
        └── prometheusrule.yaml
```

### Enhanced Deployment with Probes

**File**: `helm/cortex-dc/templates/web/deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-web
  namespace: {{ .Values.namespace }}
  labels:
    app: cortex-web
    version: {{ .Chart.AppVersion }}
spec:
  replicas: {{ .Values.web.replicaCount }}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: cortex-web
  template:
    metadata:
      labels:
        app: cortex-web
        version: {{ .Chart.AppVersion }}
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/api/metrics"
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
    spec:
      serviceAccountName: cortex-web-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001

      containers:
      - name: web
        image: "{{ .Values.web.image.repository }}:{{ .Values.web.image.tag }}"
        imagePullPolicy: {{ .Values.web.image.pullPolicy }}

        ports:
        - name: http
          containerPort: 3000
          protocol: TCP

        envFrom:
        - configMapRef:
            name: {{ .Release.Name }}-web-config
        - secretRef:
            name: {{ .Release.Name }}-secrets

        resources:
          requests:
            memory: {{ .Values.web.resources.requests.memory }}
            cpu: {{ .Values.web.resources.requests.cpu }}
          limits:
            memory: {{ .Values.web.resources.limits.memory }}
            cpu: {{ .Values.web.resources.limits.cpu }}

        # Startup probe: allows 60s for cold start
        startupProbe:
          httpGet:
            path: /api/health
            port: http
          initialDelaySeconds: 0
          periodSeconds: 5
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 12  # 12 * 5s = 60s max startup time

        # Liveness probe: restart if unresponsive
        livenessProbe:
          httpGet:
            path: /api/healthz
            port: http
          initialDelaySeconds: 15
          periodSeconds: 20
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 3

        # Readiness probe: remove from load balancer if not ready
        readinessProbe:
          httpGet:
            path: /api/readyz
            port: http
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 3

        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: false
          runAsNonRoot: true
          runAsUser: 1001
          capabilities:
            drop:
            - ALL

      # Pod anti-affinity: spread across nodes
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - cortex-web
              topologyKey: kubernetes.io/hostname

      terminationGracePeriodSeconds: 30
```

### Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ .Release.Name }}-web-hpa
  namespace: {{ .Values.namespace }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ .Release.Name }}-web
  minReplicas: {{ .Values.web.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.web.autoscaling.maxReplicas }}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: {{ .Values.web.autoscaling.targetCPU }}
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: {{ .Values.web.autoscaling.targetMemory }}
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 2
        periodSeconds: 30
      selectPolicy: Max
```

### Pod Disruption Budget (PDB)

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: {{ .Release.Name }}-web-pdb
  namespace: {{ .Values.namespace }}
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: cortex-web
```

### Values (Production)

**File**: `helm/cortex-dc/values-production.yaml`

```yaml
namespace: cortex-dc

web:
  replicaCount: 3
  image:
    repository: gcr.io/cortex-dc-portal/cortex-web
    tag: "latest"
    pullPolicy: Always
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "1Gi"
      cpu: "1000m"
  autoscaling:
    minReplicas: 3
    maxReplicas: 10
    targetCPU: 70
    targetMemory: 80

api:
  replicaCount: 3
  image:
    repository: gcr.io/cortex-dc-portal/cortex-api
    tag: "latest"
  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "1Gi"
      cpu: "1000m"
  autoscaling:
    minReplicas: 3
    maxReplicas: 15
    targetCPU: 70

postgres:
  enabled: true
  storageClass: "pd-ssd"
  storageSize: "100Gi"
  replicaCount: 3
  resources:
    requests:
      memory: "2Gi"
      cpu: "1000m"
    limits:
      memory: "4Gi"
      cpu: "2000m"

redis:
  enabled: true
  storageSize: "10Gi"
  resources:
    requests:
      memory: "256Mi"
      cpu: "100m"
    limits:
      memory: "512Mi"
      cpu: "500m"

ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
  hosts:
  - host: cortex-dc.henryreed.ai
    paths:
    - path: /
      pathType: Prefix
  tls:
  - secretName: cortex-dc-tls
    hosts:
    - cortex-dc.henryreed.ai
```

---

## GitHub Actions CI/CD Pipeline

### Enhanced Pipeline with Policy Checks

**File**: `.github/workflows/k8s-deploy.yml`

```yaml
name: Kubernetes CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  GCP_PROJECT: cortex-dc-portal
  GKE_CLUSTER: cortex-dc-cluster
  GKE_ZONE: us-central1-a
  IMAGE_TAG: ${{ github.sha }}

jobs:
  # Stage 1: Lint & Type Check
  lint-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8.15.1

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linters
        run: pnpm run lint

      - name: Run type checks
        run: pnpm run type-check

  # Stage 2: Unit & Integration Tests
  test:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    needs: lint-typecheck
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: cortex_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8.15.1

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests
        run: pnpm run test
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/cortex_test
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: unittests

  # Stage 3: Security Scanning
  security-scan:
    name: Security Scanning
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy filesystem scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # Stage 4: Build Docker Images
  build:
    name: Build & Push Images
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.event_name == 'push'
    permissions:
      contents: read
      id-token: write
    strategy:
      matrix:
        service: [web, api, functions]
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Authenticate to GCP
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Configure Docker for GCR
        run: gcloud auth configure-docker gcr.io

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./apps/${{ matrix.service }}/Dockerfile
          push: true
          tags: |
            gcr.io/${{ env.GCP_PROJECT }}/cortex-${{ matrix.service }}:${{ env.IMAGE_TAG }}
            gcr.io/${{ env.GCP_PROJECT }}/cortex-${{ matrix.service }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Generate SBOM
        uses: anchore/sbom-action@v0
        with:
          image: gcr.io/${{ env.GCP_PROJECT }}/cortex-${{ matrix.service }}:${{ env.IMAGE_TAG }}
          format: cyclonedx-json
          output-file: sbom-${{ matrix.service }}.json

      - name: Upload SBOM
        uses: actions/upload-artifact@v4
        with:
          name: sbom-${{ matrix.service }}
          path: sbom-${{ matrix.service }}.json

  # Stage 5: Deploy to GKE
  deploy:
    name: Deploy to GKE
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      id-token: write
    environment:
      name: production
      url: https://cortex-dc.henryreed.ai
    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to GCP
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Get GKE credentials
        run: |
          gcloud container clusters get-credentials ${{ env.GKE_CLUSTER }} \
            --zone ${{ env.GKE_ZONE }} \
            --project ${{ env.GCP_PROJECT }}

      - name: Install Helm
        uses: azure/setup-helm@v4
        with:
          version: 'v3.14.0'

      - name: Deploy with Helm (Canary)
        run: |
          helm upgrade --install cortex-dc-canary ./helm/cortex-dc \
            --namespace cortex-dc \
            --create-namespace \
            --values helm/cortex-dc/values-production.yaml \
            --set web.image.tag=${{ env.IMAGE_TAG }} \
            --set api.image.tag=${{ env.IMAGE_TAG }} \
            --set functions.image.tag=${{ env.IMAGE_TAG }} \
            --set web.replicaCount=1 \
            --set canary.enabled=true \
            --wait \
            --timeout=5m

      - name: Run smoke tests
        run: |
          kubectl run smoke-test-${{ github.run_id }} \
            --image=curlimages/curl:latest \
            --rm -i --restart=Never \
            --namespace=cortex-dc \
            -- curl -f http://cortex-dc-web:3000/api/health

      - name: Full rollout
        if: success()
        run: |
          helm upgrade --install cortex-dc ./helm/cortex-dc \
            --namespace cortex-dc \
            --values helm/cortex-dc/values-production.yaml \
            --set web.image.tag=${{ env.IMAGE_TAG }} \
            --set api.image.tag=${{ env.IMAGE_TAG }} \
            --set functions.image.tag=${{ env.IMAGE_TAG }} \
            --wait \
            --timeout=10m

      - name: Verify rollout
        run: |
          kubectl rollout status deployment/cortex-dc-web -n cortex-dc --timeout=5m
          kubectl rollout status deployment/cortex-dc-api -n cortex-dc --timeout=5m

      - name: Rollback on failure
        if: failure()
        run: |
          helm rollback cortex-dc -n cortex-dc
```

---

## Testing Strategy

### Test Pyramid

```
         /\
        /  \ E2E Tests (5%)
       /____\ Playwright, Cypress
      /      \
     / Integ. \ Integration Tests (15%)
    /  Tests   \ Supertest, Testcontainers
   /____________\
  /              \
 /   Unit Tests   \ Unit Tests (80%)
/       (Jest)     \ Vitest, Jest
/___________________\
```

### Unit Tests (Vitest/Jest)

**Coverage Thresholds**:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**Example**: `packages/db/src/services/__tests__/project-service.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectService } from '../project-service';
import { mockDatabase } from '../../__mocks__/database-adapter';

describe('ProjectService', () => {
  let projectService: ProjectService;

  beforeEach(() => {
    projectService = new ProjectService(mockDatabase);
  });

  it('should create project with valid data', async () => {
    const projectData = {
      name: 'Test Project',
      customerName: 'Acme Corp',
      ownerId: 'user-123'
    };

    const project = await projectService.create(projectData);

    expect(project).toHaveProperty('id');
    expect(project.name).toBe('Test Project');
    expect(project.status).toBe('planning');
  });

  it('should throw validation error for invalid data', async () => {
    const invalidData = { name: '' }; // Missing required fields

    await expect(projectService.create(invalidData))
      .rejects
      .toThrow('Validation error');
  });
});
```

### Integration Tests (Testcontainers)

**Purpose**: Test database queries, API routes with real services

**Example**: `packages/db/__tests__/integration/database.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { getDatabase } from '../../src/adapters/database.factory';

describe('PostgreSQL Database Integration', () => {
  let container: PostgreSqlContainer;
  let connectionString: string;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withExposedPorts(5432)
      .start();

    connectionString = container.getConnectionUri();
    process.env.DATABASE_URL = connectionString;
  });

  afterAll(async () => {
    await container.stop();
  });

  it('should connect to database', async () => {
    const db = getDatabase();
    const result = await db.raw('SELECT 1 as value');
    expect(result[0].value).toBe(1);
  });

  it('should create and query projects', async () => {
    const db = getDatabase();

    const project = await db.create('projects', {
      name: 'Integration Test Project',
      customerName: 'Test Corp',
      ownerId: 'test-user-id'
    });

    const retrieved = await db.findOne('projects', project.id);

    expect(retrieved).toBeDefined();
    expect(retrieved.name).toBe('Integration Test Project');
  });
});
```

### Contract Tests (OpenAPI Validation)

**Tool**: openapi-validator-middleware

**Purpose**: Ensure API responses match OpenAPI spec

### E2E Tests (Playwright)

**Location**: `tests/e2e/specs/`

**Test Matrix**:
- Browsers: Chrome, Firefox, Safari
- Viewports: Desktop, Mobile
- Authentication: Authenticated, Unauthenticated

**Example**: `tests/e2e/specs/project-workflow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/users';

test.describe('Project Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', TEST_USERS.admin.email);
    await page.fill('[name="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create new project', async ({ page }) => {
    await page.click('text=New Project');
    await page.fill('[name="name"]', 'E2E Test Project');
    await page.fill('[name="customerName"]', 'Test Customer');
    await page.click('button:has-text("Create")');

    await expect(page.locator('text=Project created successfully')).toBeVisible();
    await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+/);
  });

  test('should display project list with filters', async ({ page }) => {
    await page.goto('/projects');
    await page.selectOption('[name="status"]', 'active');

    await expect(page.locator('[data-testid="project-card"]')).toHaveCount.greaterThan(0);
  });
});
```

### Load Tests (k6)

**Tool**: Grafana k6

**Scenarios**:
1. **Smoke Test**: 1 VU, 1 minute
2. **Load Test**: 10 VUs, 5 minutes
3. **Stress Test**: Ramp 0→100 VUs over 10 minutes
4. **Spike Test**: Sudden jump to 200 VUs

**Example**: `tests/load/project-api.js`

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up
    { duration: '3m', target: 10 },  // Steady
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% requests < 200ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function () {
  const res = http.get('https://api.cortex-dc.henryreed.ai/api/projects');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

---

## Runbooks & SLOs

### Service Level Objectives

| SLI | SLO Target | Error Budget (30d) | Alert Threshold |
|-----|------------|-------------------|-----------------|
| API Availability | 99.9% | 43 min downtime | < 99.5% |
| API P95 Latency | < 200ms | N/A | > 300ms for 5 min |
| Database Query P95 | < 50ms | N/A | > 100ms for 5 min |
| Error Rate | < 0.1% | 0.3% (30 errors/10k req) | > 0.5% for 5 min |
| Container Restart Rate | < 1/hour | 720 restarts/30d | > 5/hour |

### Alerts

**Critical** (PagerDuty):
- API down (0 healthy pods)
- Database unreachable
- Error rate > 5%
- Disk usage > 90%

**Warning** (Slack):
- Error rate > 0.5%
- Latency P95 > 300ms
- Memory usage > 80%
- Pod restart rate > 5/hour

### Dashboards (Grafana)

1. **Overview Dashboard**
   - Request rate (req/s)
   - Error rate (%)
   - Latency (P50, P95, P99)
   - Active users

2. **Service Health Dashboard**
   - Pod status
   - Container restarts
   - Resource usage (CPU, Memory)
   - Network I/O

3. **Database Dashboard**
   - Query performance
   - Connection pool
   - Slow query log
   - Cache hit rate

### Runbook: High API Latency

**Alert**: API P95 latency > 300ms for 5 minutes

**Investigation**:
1. Check Grafana dashboard for latency spikes
2. Query slow query log: `kubectl logs -n cortex-dc deployment/cortex-dc-api --tail=100 | grep "slow query"`
3. Check database CPU/memory: `kubectl top pods -n cortex-dc | grep postgres`
4. Check Redis cache hit rate
5. Check for N+1 queries in recent deployments

**Remediation**:
- If DB overload: Scale read replicas
- If cache miss: Warm cache, increase TTL
- If N+1 queries: Deploy hotfix with query optimization
- If traffic spike: Increase HPA max replicas

**Rollback Procedure**:
```bash
helm rollback cortex-dc -n cortex-dc
kubectl rollout status deployment/cortex-dc-web -n cortex-dc
```

---

## Implementation Plan

### Folder Structure

```
cortex-dc-web/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── docker-build-push.yml
│       ├── k8s-deploy.yml
│       └── security-scan.yml
├── apps/
│   └── web/
│       ├── Dockerfile
│       ├── app/
│       │   ├── (auth)/
│       │   ├── (dashboard)/
│       │   ├── api/
│       │   │   ├── health/route.ts
│       │   │   ├── healthz/route.ts
│       │   │   ├── readyz/route.ts
│       │   │   └── metrics/route.ts
│       │   └── layout.tsx
│       └── package.json
├── packages/
│   ├── db/
│   │   ├── src/
│   │   │   ├── adapters/
│   │   │   │   ├── database.factory.ts
│   │   │   │   ├── postgres.adapter.ts
│   │   │   │   └── firestore.adapter.ts
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── migrations/
│   │   └── package.json
│   ├── api-server/
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── instrumentation.ts (OpenTelemetry)
│   │   └── package.json
│   ├── ai/
│   │   ├── src/
│   │   │   ├── rag/
│   │   │   ├── embeddings/
│   │   │   └── eval/
│   │   └── package.json
│   └── workers/
│       ├── transform-worker/
│       ├── ai-worker/
│       └── package.json
├── functions/
│   ├── Dockerfile
│   ├── src/
│   └── k8s/
├── kubernetes/
│   ├── kustomization.yaml
│   ├── namespaces/
│   ├── web/
│   ├── api/
│   ├── functions/
│   ├── database/
│   └── monitoring/
├── helm/
│   └── cortex-dc/
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── values-dev.yaml
│       ├── values-production.yaml
│       └── templates/
├── terraform/
│   ├── modules/
│   │   ├── gke-cluster/
│   │   ├── vpc-network/
│   │   ├── artifact-registry/
│   │   ├── cloud-sql/
│   │   └── secret-manager/
│   └── environments/
│       ├── dev/
│       ├── staging/
│       └── production/
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── load/
├── scripts/
│   ├── bootstrap-local.sh
│   ├── start-local-dev.sh
│   └── init-postgres.sh
├── docker-compose.yml
├── Makefile
└── ARCHITECTURE_K8S_READY.md
```

### Coding Standards

**TypeScript**:
- Strict mode enabled
- ESLint with Airbnb base + custom rules
- Prettier for formatting
- No `any` types (except in legacy code)

**Git Commit Convention**:
```
feat(web): add project search filter
fix(api): resolve N+1 query in POV endpoint
docs(readme): update local setup instructions
chore(deps): upgrade Next.js to 14.2
```

**Branch Strategy**:
- `main` → production
- `develop` → staging
- `feature/*` → feature branches
- `hotfix/*` → production hotfixes

### Delivery Phases

**Phase 1: Infrastructure (Week 1)**
- ✅ Terraform modules for GKE, VPC, Cloud SQL
- ✅ Kubernetes namespaces, RBAC, secrets
- ✅ Helm charts for web, api, functions
- ✅ CI/CD pipeline (lint, test, build, deploy)

**Phase 2: Observability (Week 2)**
- 🔄 OpenTelemetry instrumentation in all services
- 🔄 Prometheus + Grafana dashboards
- 🔄 Loki log aggregation
- 🔄 Alerts + runbooks

**Phase 3: API & Data (Week 3)**
- 🔄 PostgreSQL schema + migrations
- 🔄 REST API endpoints with OpenAPI spec
- 🔄 Database adapters (Postgres + Firestore)
- 🔄 Rate limiting + security middleware

**Phase 4: Event Pipelines (Week 4)**
- ⏳ NATS JetStream setup
- ⏳ Transform worker for analytics
- ⏳ AI worker for embeddings
- ⏳ DLQ handling

**Phase 5: AI Augmentation (Week 5)**
- ⏳ RAG pipeline with pgvector
- ⏳ Embedding batch jobs
- ⏳ Prompt/response evaluation
- ⏳ Safety filters

**Phase 6: Testing & Hardening (Week 6)**
- ⏳ E2E test suite (Playwright)
- ⏳ Load tests (k6)
- ⏳ Security audits (Trivy, Snyk)
- ⏳ Performance optimization

**Phase 7: Production Launch (Week 7)**
- ⏳ Production deployment
- ⏳ Smoke tests + monitoring
- ⏳ Documentation + training
- ⏳ Post-launch review

---

## Local Testing Bootstrap Script

**Purpose**: One-command local environment setup for frontend demo

**File**: `scripts/bootstrap-local.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Cortex DC - Local Development Bootstrap"
echo "==========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker Desktop.${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm not found. Installing...${NC}"
    npm install -g pnpm@8
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"

# Environment selection
echo ""
echo "Select deployment mode:"
echo "1) Firebase (emulators)"
echo "2) Self-hosted (Docker Compose)"
read -p "Enter choice [1-2]: " mode_choice

if [ "$mode_choice" == "1" ]; then
    DEPLOYMENT_MODE="firebase"
    echo -e "${GREEN}✅ Firebase mode selected${NC}"
elif [ "$mode_choice" == "2" ]; then
    DEPLOYMENT_MODE="self-hosted"
    echo -e "${GREEN}✅ Self-hosted mode selected${NC}"
else
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
fi

# Install dependencies
echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pnpm install --frozen-lockfile

# Setup environment files
echo -e "${YELLOW}⚙️  Setting up environment...${NC}"

if [ "$DEPLOYMENT_MODE" == "firebase" ]; then
    cat > .env.local <<EOF
DEPLOYMENT_MODE=firebase
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
NEXT_PUBLIC_DEPLOYMENT_MODE=firebase
EOF
    echo -e "${GREEN}✅ Firebase .env.local created${NC}"

    # Start Firebase emulators in background
    echo -e "${YELLOW}🔥 Starting Firebase emulators...${NC}"
    firebase emulators:start --import=./emulator-data --export-on-exit &
    EMULATOR_PID=$!

    # Wait for emulators to be ready
    echo -e "${YELLOW}⏳ Waiting for emulators to start...${NC}"
    sleep 15

else
    cat > .env.local <<EOF
DEPLOYMENT_MODE=self-hosted
DATABASE_URL=postgresql://cortex:cortex_secure_password@localhost:5432/cortex
KEYCLOAK_URL=http://localhost:8180
KEYCLOAK_REALM=cortex
KEYCLOAK_CLIENT_ID=cortex-web
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin_password
REDIS_URL=redis://:redis_password@localhost:6379
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_API_URL=http://localhost:8080
EOF
    echo -e "${GREEN}✅ Self-hosted .env.local created${NC}"

    # Start Docker Compose services
    echo -e "${YELLOW}🐳 Starting Docker Compose services...${NC}"
    docker-compose up -d postgres keycloak minio minio-init redis nats

    # Wait for services to be healthy
    echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
    sleep 20

    echo -e "${GREEN}✅ Services started${NC}"
fi

# Build packages
echo -e "${YELLOW}🔨 Building packages...${NC}"
pnpm --filter "@cortex/utils" build
pnpm --filter "@cortex/db" build

# Seed test data
echo -e "${YELLOW}🌱 Seeding test data...${NC}"
if [ "$DEPLOYMENT_MODE" == "firebase" ]; then
    pnpm run seed:e2e:firebase || true
else
    # Wait for web server to start before seeding
    echo -e "${YELLOW}⏳ Web server needs to be running for API-based seeding.${NC}"
    echo -e "${YELLOW}📝 Please run 'pnpm dev' in another terminal, then run 'pnpm seed:e2e'${NC}"
fi

# Start dev server
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "🎉 Ready to start development!"
echo ""
echo "Next steps:"
if [ "$DEPLOYMENT_MODE" == "firebase" ]; then
    echo "  1. Web app:       pnpm dev (already running on http://localhost:3000)"
    echo "  2. Emulator UI:   http://localhost:4040"
    echo "  3. Run tests:     pnpm test:e2e"
else
    echo "  1. Web app:       pnpm dev"
    echo "  2. Access app:    http://localhost:3000"
    echo "  3. Keycloak:      http://localhost:8180 (admin/admin_password)"
    echo "  4. MinIO:         http://localhost:9001 (minioadmin/minioadmin_password)"
    echo "  5. Run tests:     pnpm test:e2e"
fi
echo ""
echo "🛑 To stop services:"
if [ "$DEPLOYMENT_MODE" == "firebase" ]; then
    echo "  make emulators-kill"
else
    echo "  docker-compose down"
fi
echo ""
echo "📖 Documentation: README.md, CLAUDE.md"
echo ""
```

### Make Target for Local Demo

Add to `Makefile`:

```makefile
##@ Quick Start

demo: ## Bootstrap local environment and start demo
	@echo "$(GREEN)Starting Cortex DC Local Demo...$(NC)"
	@./scripts/bootstrap-local.sh
	@echo "$(GREEN)✅ Demo environment ready!$(NC)"
	@echo "$(CYAN)Opening browser in 5 seconds...$(NC)"
	@sleep 5
	@open http://localhost:3000 || xdg-open http://localhost:3000 || echo "Please open http://localhost:3000"
```

---

## Success Validation Checklist

### Local Testing ✅
- [ ] Run `make demo` successfully bootstraps environment
- [ ] Web app accessible at `http://localhost:3000`
- [ ] Health endpoints return 200 OK
- [ ] User can register, login, and navigate
- [ ] Projects can be created and listed
- [ ] Hot reload works (edit file, see changes)

### Kubernetes Deployment ✅
- [ ] Terraform provisions infrastructure without errors
- [ ] Helm deploy succeeds with all pods running
- [ ] Liveness/readiness probes pass
- [ ] HPA scales pods based on CPU/memory
- [ ] Rolling update works without downtime
- [ ] Canary deployment validates before full rollout
- [ ] Rollback works on failed deployment

### CI/CD Pipeline ✅
- [ ] All CI jobs pass (lint, type, test, security)
- [ ] Docker images build and push to registry
- [ ] SBOM generated for all images
- [ ] Security scans pass (Trivy < 5 CRITICAL/HIGH)
- [ ] Automated deployment to staging on PR merge
- [ ] Production deployment requires manual approval

### Observability ✅
- [ ] OpenTelemetry traces visible in Grafana
- [ ] Prometheus metrics scraped every 15s
- [ ] Logs aggregated in Loki
- [ ] Dashboards show real-time service health
- [ ] Alerts fire when SLOs violated
- [ ] Runbooks linked from alert notifications

### Performance ✅
- [ ] API P95 latency < 200ms under load
- [ ] Lighthouse score > 90 for all pages
- [ ] Core Web Vitals green (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Database queries < 50ms P95
- [ ] No memory leaks after 24h runtime

---

## Conclusion

This architecture delivers a **production-ready, Kubernetes-native platform** with:

✅ **Local Development**: One-command bootstrap for instant demo
✅ **Container-Native**: Dockerized services with multi-stage builds
✅ **K8s-Optimized**: HPA, PDB, proper probes, affinity rules
✅ **Observable**: OpenTelemetry traces, Prometheus metrics, Grafana dashboards
✅ **Secure**: OWASP ASVS, secrets management, SBOM, image scanning
✅ **Automated**: GitHub Actions CI/CD with canary deployments
✅ **Resilient**: Event-driven architecture with DLQs and retries
✅ **AI-Augmented**: RAG pipeline with vector search and evaluations

**Key Differentiators**:
- Adapter pattern enables Firebase → Self-hosted migration
- E2E tests work across both deployment modes
- Infrastructure as Code (Terraform) for reproducibility
- OpenTelemetry for unified observability
- Helm charts for environment-specific configuration

**Next Actions**:
1. Run `./scripts/bootstrap-local.sh` to validate local demo
2. Deploy to staging with `helm upgrade --install`
3. Configure monitoring alerts and runbooks
4. Load test with k6 to validate SLOs
5. Security audit with Trivy + penetration testing

---

**Document Version**: 2.0
**Last Updated**: 2025-10-15
**Maintained By**: Backend Architecture Team
**Review Cycle**: Quarterly or after major releases
