# Microservices Refactoring Strategy
## Cortex DC Web Platform - Migration from Firebase POC to GKE Distributed Architecture

**Version**: 1.0
**Date**: 2025-10-20
**Status**: Draft for Review

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Target State Architecture](#target-state-architecture)
4. [Microservices Decomposition Strategy](#microservices-decomposition-strategy)
5. [TRR Records Management System](#trr-records-management-system)
6. [Data Architecture & Storage Strategy](#data-architecture--storage-strategy)
7. [Service-to-Service Communication](#service-to-service-communication)
8. [Authentication & Authorization](#authentication--authorization)
9. [API Gateway & Routing](#api-gateway--routing)
10. [Containerization & Docker Strategy](#containerization--docker-strategy)
11. [GKE Deployment Architecture](#gke-deployment-architecture)
12. [Migration Roadmap](#migration-roadmap)
13. [Risk Assessment & Mitigation](#risk-assessment--mitigation)

---

## Executive Summary

### Objective

Transform the Cortex DC Web platform from a Firebase-hosted POC monolith to a **distributed microservices architecture** deployed on **Google Kubernetes Engine (GKE)**, with a primary focus on implementing a robust **user-scoped TRR (Technical Resource Request) records management system**.

### Key Goals

1. **Modularize the monolithic codebase** into independently deployable microservices
2. **Implement a data-focused TRR records management system** that serves as the core for functionality, analytics, and AI operations
3. **Enable horizontal scalability** through containerization and Kubernetes orchestration
4. **Maintain backward compatibility** during migration with zero-downtime deployments
5. **Establish enterprise-grade observability** with comprehensive monitoring, logging, and tracing
6. **Optimize for GKE deployment** leveraging Google Cloud native services

### Success Metrics

- **Service Independence**: Each microservice can be deployed independently without affecting others
- **Zero Downtime**: Migration completed with <1 minute of planned downtime
- **Performance**: P95 latency <200ms for TRR record operations
- **Scalability**: System handles 10x current load without architectural changes
- **Data Integrity**: 100% data migration accuracy with audit trail

---

## Current State Analysis

### Existing Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Hosting                         │
│                   (henryreedai.web.app)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴──────────────┐
         │                          │
    ┌────▼────┐              ┌──────▼──────┐
    │ Next.js │              │   Cloud     │
    │ Web App │              │  Functions  │
    │ (apps/  │              │ (functions/)│
    │  web/)  │              │             │
    └────┬────┘              └──────┬──────┘
         │                          │
         └───────────┬──────────────┘
                     │
         ┌───────────▼──────────────┐
         │   Firebase Services      │
         ├──────────────────────────┤
         │ • Firestore Database     │
         │ • Firebase Auth          │
         │ • Cloud Storage          │
         │ • Firebase Extensions    │
         └──────────────────────────┘
```

### Current Codebase Structure

**Strengths**:
- ✅ Already uses a **monorepo structure** with pnpm workspaces
- ✅ **Multi-backend adapter pattern** implemented (Firestore/PostgreSQL)
- ✅ **Modular packages** already separated (`@cortex/db`, `@cortex/ui`, `@cortex/ai`, etc.)
- ✅ **Docker & Kubernetes configs** already present
- ✅ **Basic TRR functionality** exists with schema and API routes

**Limitations**:
- ❌ **Tightly coupled to Firebase** for hosting and functions
- ❌ **TRR system is basic** - lacks comprehensive records management
- ❌ **Monolithic deployment** - all packages deployed together
- ❌ **No service mesh** or inter-service communication patterns
- ❌ **Limited observability** and distributed tracing
- ❌ **Single database instance** without read replicas

### Firebase Dependencies Audit

| Service | Current Usage | Replacement Strategy |
|---------|---------------|---------------------|
| **Firebase Hosting** | Static web hosting | **GKE Ingress** + Cloud CDN |
| **Cloud Functions** | Serverless API endpoints | **Containerized Express APIs** on GKE |
| **Firestore** | Primary database | **PostgreSQL on Cloud SQL** with Prisma ORM |
| **Firebase Auth** | User authentication | **Keycloak** (already configured) on GKE |
| **Cloud Storage** | File storage | **MinIO** (S3-compatible) on GKE or Cloud Storage |
| **Firebase Extensions** | BigQuery export, GenAI | **Custom microservices** with direct integrations |

---

## Target State Architecture

### Microservices Architecture Diagram

```
                            ┌────────────────────────┐
                            │    Cloud CDN + LB      │
                            │  (External Traffic)    │
                            └───────────┬────────────┘
                                        │
                            ┌───────────▼────────────┐
                            │   Ingress Controller   │
                            │   (NGINX/Istio)        │
                            └───────────┬────────────┘
                                        │
        ┌───────────────────────────────┼────────────────────────────────┐
        │                               │        GKE Cluster             │
        │   ┌───────────────────────────▼───────────────────────┐        │
        │   │         API Gateway Service                       │        │
        │   │  (Kong/Ambassador/Custom Express Gateway)         │        │
        │   └───────┬────────────┬──────────┬────────┬──────────┘        │
        │           │            │          │        │                   │
        │   ┌───────▼───┐  ┌────▼────┐ ┌───▼──┐ ┌──▼────┐               │
        │   │   Auth    │  │  TRR    │ │ POV  │ │ User  │               │
        │   │  Service  │  │ Records │ │ Mgmt │ │ Mgmt  │  ┌──────────┐ │
        │   └─────┬─────┘  │ Service │ │ Svc  │ │ Svc   │  │Analytics │ │
        │         │        └────┬────┘ └───┬──┘ └───┬───┘  │ Service  │ │
        │         │             │          │        │      └─────┬────┘ │
        │   ┌─────▼─────┐  ┌────▼────┐ ┌──▼───┐ ┌──▼───┐   ┌───▼────┐ │
        │   │   DC      │  │   AI    │ │Event │ │Search│   │Metrics │ │
        │   │Engagement │  │ Service │ │Track │ │ Svc  │   │Service │ │
        │   │  Service  │  │(Gemini) │ │ Svc  │ └──────┘   └────────┘ │
        │   └───────────┘  └─────────┘ └──────┘                        │
        │                                                                │
        │   ┌────────────────────────────────────────────────┐          │
        │   │         Message Bus (NATS / RabbitMQ)          │          │
        │   └────────────────────────────────────────────────┘          │
        │                                                                │
        │   ┌────────────────────────────────────────────────┐          │
        │   │         Service Mesh (Istio / Linkerd)         │          │
        │   │  • mTLS • Traffic Management • Observability   │          │
        │   └────────────────────────────────────────────────┘          │
        └────────────────────────────────────────────────────────────────┘
                                        │
        ┌───────────────────────────────┼────────────────────────────────┐
        │                    Data & Infrastructure Layer                 │
        │                                                                 │
        │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
        │  │ Cloud SQL    │  │   Redis      │  │   MinIO      │         │
        │  │ (PostgreSQL) │  │  (Cache)     │  │ (S3 Storage) │         │
        │  │ • Primary    │  └──────────────┘  └──────────────┘         │
        │  │ • Read Replica                                              │
        │  └──────────────┘  ┌──────────────┐  ┌──────────────┐         │
        │                    │  Keycloak    │  │ Prometheus   │         │
        │                    │   (Auth)     │  │   + Grafana  │         │
        │                    └──────────────┘  └──────────────┘         │
        └─────────────────────────────────────────────────────────────────┘
```

### Service Mesh Benefits

- **Automatic mTLS** between services
- **Traffic management**: Canary deployments, A/B testing, circuit breaking
- **Observability**: Distributed tracing with OpenTelemetry
- **Resilience**: Retry logic, timeout management, rate limiting

---

## Microservices Decomposition Strategy

### Core Microservices

#### 1. **TRR Records Management Service** (Priority: CRITICAL)

**Purpose**: Central service for managing Technical Resource Request records as the primary data asset.

**Responsibilities**:
- CRUD operations for TRR records
- Record lifecycle management (draft → submitted → in-progress → completed)
- Append engagement activities to existing TRRs (demos, scenarios, findings)
- Version control and audit trail for all record changes
- Record validation and business rule enforcement
- Search and filtering capabilities
- Integration with analytics and AI services

**Technology Stack**:
- **Language**: TypeScript/Node.js
- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for frequently accessed records
- **Events**: Publishes to NATS for downstream consumers

**API Endpoints**:
```
POST   /api/v1/trr/records              # Create new TRR
GET    /api/v1/trr/records              # List TRRs (with filters)
GET    /api/v1/trr/records/:id          # Get single TRR
PUT    /api/v1/trr/records/:id          # Update TRR
PATCH  /api/v1/trr/records/:id/append   # Append activity/event
DELETE /api/v1/trr/records/:id          # Soft delete TRR
GET    /api/v1/trr/records/:id/history  # Get audit history
POST   /api/v1/trr/records/:id/validate # Validate TRR
```

**Database Schema**:
```sql
-- Core TRR table
CREATE TABLE trr_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL,

  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_name VARCHAR(255),
  customer_name VARCHAR(255),

  -- Status & Priority
  status VARCHAR(50) DEFAULT 'draft',
  priority VARCHAR(50) DEFAULT 'medium',
  completion_percentage INT DEFAULT 0,

  -- Relationships
  linked_pov_id UUID REFERENCES povs(id),
  assigned_to UUID[] DEFAULT '{}',

  -- Timeline
  submitted_at TIMESTAMP,
  started_at TIMESTAMP,
  due_date DATE,
  completed_at TIMESTAMP,

  -- JSONB Fields for flexibility
  scope JSONB,
  technical_requirements JSONB,
  findings JSONB,
  recommendations JSONB,
  metadata JSONB,

  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  version INT DEFAULT 1,

  -- Indexes
  INDEX idx_user_status (user_id, status),
  INDEX idx_org_created (organization_id, created_at DESC),
  INDEX idx_assigned (assigned_to) USING GIN,
  INDEX idx_metadata (metadata) USING GIN
);

-- Activity/Event append table
CREATE TABLE trr_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trr_id UUID NOT NULL REFERENCES trr_records(id) ON DELETE CASCADE,

  -- Activity details
  activity_type VARCHAR(50) NOT NULL, -- 'demo', 'scenario', 'finding', 'meeting', etc.
  activity_title VARCHAR(255),
  activity_description TEXT,
  activity_data JSONB,

  -- Participants
  performed_by UUID NOT NULL REFERENCES users(id),
  participants UUID[] DEFAULT '{}',

  -- Timestamps
  occurred_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_trr_type (trr_id, activity_type),
  INDEX idx_occurred (occurred_at DESC)
);

-- Version history for audit trail
CREATE TABLE trr_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trr_id UUID NOT NULL REFERENCES trr_records(id) ON DELETE CASCADE,
  version INT NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  changes JSONB NOT NULL, -- JSON diff of changes
  snapshot JSONB NOT NULL, -- Full record snapshot

  INDEX idx_trr_version (trr_id, version DESC)
);
```

**Events Published**:
- `trr.created`
- `trr.updated`
- `trr.activity.appended`
- `trr.status.changed`
- `trr.completed`

---

#### 2. **Authentication & Authorization Service**

**Purpose**: Centralized identity and access management.

**Responsibilities**:
- User authentication via Keycloak
- JWT token generation and validation
- Role-Based Access Control (RBAC)
- Permission management
- Session management
- SSO/SAML integration

**Technology Stack**:
- **Keycloak**: Identity provider
- **Express.js**: Token validation API
- **Redis**: Session storage

**API Endpoints**:
```
POST   /api/v1/auth/login              # User login
POST   /api/v1/auth/logout             # User logout
POST   /api/v1/auth/refresh            # Refresh token
GET    /api/v1/auth/me                 # Current user info
POST   /api/v1/auth/validate           # Validate token (internal)
GET    /api/v1/auth/permissions        # Get user permissions
```

---

#### 3. **POV Management Service**

**Purpose**: Manage Proof of Value engagements.

**Responsibilities**:
- POV CRUD operations
- Objective and success criteria management
- POV-to-TRR relationship management
- Timeline tracking
- Status workflows

**Technology Stack**:
- TypeScript/Node.js
- Express.js
- PostgreSQL with Prisma

**API Endpoints**:
```
POST   /api/v1/pov                     # Create POV
GET    /api/v1/pov                     # List POVs
GET    /api/v1/pov/:id                 # Get POV
PUT    /api/v1/pov/:id                 # Update POV
DELETE /api/v1/pov/:id                 # Delete POV
GET    /api/v1/pov/:id/trrs            # Get linked TRRs
```

---

#### 4. **DC Engagement Service**

**Purpose**: Track Domain Consultant engagement activities and metrics.

**Responsibilities**:
- Engagement record management
- Scenario execution tracking
- Detection validation tracking
- Engagement analytics
- OKR tracking

**Technology Stack**:
- TypeScript/Node.js
- Express.js
- PostgreSQL

**API Endpoints**:
```
POST   /api/v1/engagements             # Create engagement
GET    /api/v1/engagements             # List engagements
GET    /api/v1/engagements/:id         # Get engagement
PUT    /api/v1/engagements/:id         # Update engagement
GET    /api/v1/engagements/analytics   # Get analytics
GET    /api/v1/engagements/trends      # Get trends
```

---

#### 5. **AI Service**

**Purpose**: AI-powered features using Gemini and OpenAI.

**Responsibilities**:
- TRR content suggestions
- POV analysis and recommendations
- RAG (Retrieval-Augmented Generation)
- Semantic search with vector embeddings
- Content generation

**Technology Stack**:
- Python or TypeScript
- FastAPI or Express.js
- Gemini AI SDK
- OpenAI SDK
- Vector database (Pinecone or pgvector)

**API Endpoints**:
```
POST   /api/v1/ai/suggestions          # Get AI suggestions
POST   /api/v1/ai/analyze              # Analyze document
POST   /api/v1/ai/chat                 # Chat with AI
POST   /api/v1/ai/embeddings           # Generate embeddings
GET    /api/v1/ai/search               # Semantic search
```

---

#### 6. **Analytics Service**

**Purpose**: Data analytics and reporting.

**Responsibilities**:
- Dashboard metrics calculation
- Report generation
- Data aggregation
- BigQuery export
- Trend analysis

**Technology Stack**:
- TypeScript/Node.js or Python
- Express.js or FastAPI
- BigQuery client
- Redis for caching

**API Endpoints**:
```
GET    /api/v1/analytics/dashboard     # Dashboard metrics
GET    /api/v1/analytics/reports/:type # Generate report
POST   /api/v1/analytics/export        # Export to BigQuery
GET    /api/v1/analytics/trends        # Get trends
```

---

#### 7. **Event Tracking Service**

**Purpose**: Track user activities and system events.

**Responsibilities**:
- Activity logging
- Login event tracking
- User session management
- Audit trail management
- Event streaming

**Technology Stack**:
- TypeScript/Node.js
- Express.js
- PostgreSQL (time-series optimized)
- NATS for event streaming

**API Endpoints**:
```
POST   /api/v1/events/log              # Log event
GET    /api/v1/events/activity         # Get activity logs
GET    /api/v1/events/user/:id         # Get user activity
POST   /api/v1/events/login            # Track login
GET    /api/v1/events/sessions         # Get active sessions
```

---

#### 8. **User Management Service**

**Purpose**: User profile and team management.

**Responsibilities**:
- User CRUD operations
- User profile management
- Group/team management
- User preferences
- User notes and action items

**Technology Stack**:
- TypeScript/Node.js
- Express.js
- PostgreSQL

**API Endpoints**:
```
POST   /api/v1/users                   # Create user
GET    /api/v1/users                   # List users
GET    /api/v1/users/:id               # Get user
PUT    /api/v1/users/:id               # Update user
DELETE /api/v1/users/:id               # Delete user
GET    /api/v1/users/:id/notes         # Get user notes
POST   /api/v1/users/:id/notes         # Add note
```

---

#### 9. **Search Service**

**Purpose**: Full-text and semantic search across all entities.

**Responsibilities**:
- Index management
- Full-text search
- Semantic search with vectors
- Search result ranking
- Faceted search

**Technology Stack**:
- TypeScript/Node.js
- Express.js
- Elasticsearch or pgvector
- Redis cache

**API Endpoints**:
```
GET    /api/v1/search                  # Universal search
GET    /api/v1/search/trr              # Search TRRs
GET    /api/v1/search/pov              # Search POVs
GET    /api/v1/search/users            # Search users
POST   /api/v1/search/semantic         # Semantic search
```

---

#### 10. **Frontend BFF (Backend for Frontend)**

**Purpose**: Aggregation layer for Next.js frontend.

**Responsibilities**:
- Aggregate data from multiple services
- Transform backend responses for UI
- Handle frontend-specific logic
- SSR data fetching
- GraphQL gateway (optional)

**Technology Stack**:
- TypeScript/Node.js
- Express.js or Apollo Server
- GraphQL (optional)

---

### Supporting Services

#### 11. **API Gateway**

**Options**:
- **Kong** (recommended for GKE)
- **Ambassador**
- **Custom Express Gateway**

**Responsibilities**:
- Request routing
- Rate limiting
- API versioning
- Authentication verification
- Request/response transformation
- CORS handling

---

#### 12. **Notification Service** (Future)

**Purpose**: Multi-channel notifications.

**Responsibilities**:
- Email notifications
- Slack/Teams webhooks
- In-app notifications
- Push notifications

---

## TRR Records Management System

### Use Case: User-Scoped TRR Lifecycle

#### Scenario 1: Manual TRR Creation

```
User Flow:
1. User navigates to /trr/new
2. Fills in form: Title, Description, Customer, Project
3. Selects optional linked POV
4. Sets priority and due date
5. Clicks "Create TRR"

Backend Flow:
1. Frontend → API Gateway → TRR Records Service
2. Validate user permissions
3. Create TRR record in PostgreSQL
4. Publish "trr.created" event to NATS
5. Event Tracking Service consumes event and logs activity
6. Analytics Service updates metrics
7. Return TRR ID to frontend
```

#### Scenario 2: Import TRR from External System

```
User Flow:
1. User uploads CSV/JSON file with TRR data
2. System validates format
3. Displays preview with mapping
4. User confirms import

Backend Flow:
1. Frontend → API Gateway → TRR Records Service
2. Parse and validate import file
3. Batch create TRR records
4. Publish "trr.imported" events
5. Return import summary
```

#### Scenario 3: Append Demo Activity to Existing TRR

```
User Flow:
1. User opens TRR detail page
2. Clicks "Add Activity" → "Demo"
3. Fills in demo details:
   - Demo title
   - Scenario executed
   - Participants
   - Outcomes/findings
   - Attachments
4. Clicks "Save Activity"

Backend Flow:
1. Frontend → API Gateway → TRR Records Service
2. Validate TRR exists and user has permission
3. Insert record into trr_activities table:
   {
     trr_id: "uuid",
     activity_type: "demo",
     activity_title: "Customer Product Demo",
     activity_data: {
       scenario: "Ransomware Detection",
       participants: ["john@customer.com"],
       outcomes: ["Successfully detected threat"],
       detections_validated: 5
     },
     occurred_at: "2025-10-20T10:30:00Z"
   }
4. Update TRR completion_percentage if applicable
5. Create version snapshot in trr_versions table
6. Publish "trr.activity.appended" event
7. Event → AI Service analyzes activity for insights
8. Event → Analytics Service updates metrics
9. Return updated TRR to frontend
```

#### Scenario 4: TRR Analytics Query

```
Use Case: Admin wants to see all TRRs with >5 demo activities

Query Flow:
1. Frontend → API Gateway → Analytics Service
2. Analytics Service → TRR Records Service
3. Execute SQL query:
   SELECT t.*, COUNT(a.id) as demo_count
   FROM trr_records t
   LEFT JOIN trr_activities a ON a.trr_id = t.id AND a.activity_type = 'demo'
   GROUP BY t.id
   HAVING COUNT(a.id) > 5
   ORDER BY demo_count DESC
4. Cache result in Redis (TTL: 5 minutes)
5. Return to frontend
```

### TRR Data Model - Extended Schema

```typescript
// Core TRR Record
interface TRRRecord {
  id: string;
  userId: string;
  organizationId: string;

  // Basic Info
  title: string;
  description?: string;
  projectName?: string;
  customerName?: string;

  // Status & Priority
  status: 'draft' | 'submitted' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  completionPercentage: number;

  // Relationships
  linkedPovId?: string;
  assignedTo: string[];

  // Timeline
  submittedAt?: Date;
  startedAt?: Date;
  dueDate?: Date;
  completedAt?: Date;

  // Flexible JSONB fields
  scope?: {
    objectives: string[];
    deliverables: string[];
    exclusions?: string[];
  };
  technicalRequirements?: {
    platform: string;
    integrations: string[];
    dataVolume?: string;
  };
  findings?: Finding[];
  recommendations?: Recommendation[];
  metadata?: Record<string, any>;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

// Activity appended to TRR
interface TRRActivity {
  id: string;
  trrId: string;
  activityType: 'demo' | 'scenario' | 'finding' | 'meeting' | 'validation' | 'custom';
  activityTitle: string;
  activityDescription?: string;
  activityData: Record<string, any>;
  performedBy: string;
  participants: string[];
  occurredAt: Date;
  createdAt: Date;
}

// Version history
interface TRRVersion {
  id: string;
  trrId: string;
  version: number;
  changedBy: string;
  changedAt: Date;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  snapshot: TRRRecord;
}
```

---

## Data Architecture & Storage Strategy

### Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               Cloud SQL (PostgreSQL 15)                     │
│                                                              │
│  ┌──────────────────┐          ┌──────────────────┐         │
│  │  Primary Instance│          │  Read Replica 1  │         │
│  │  (Write Master)  │◄────────►│  (Read Only)     │         │
│  │                  │          │                  │         │
│  │  - TRR Records   │          │  - Analytics     │         │
│  │  - Users         │          │  - Reports       │         │
│  │  - POVs          │          │  - Dashboards    │         │
│  └────────┬─────────┘          └──────────────────┘         │
│           │                             │                   │
│           │  WAL Replication            │                   │
│           └─────────────────────────────┘                   │
│                                                              │
│  Connection Pooling: PgBouncer (1000 max connections)       │
│  Backup: Automated daily + PITR                             │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Redis Cluster   │
                    │  (Cache Layer)   │
                    │                  │
                    │  - TRR Cache     │
                    │  - Session Store │
                    │  - Rate Limiting │
                    └──────────────────┘
```

### Data Access Patterns

**Write Operations** (TRR Records Service):
- Direct writes to Cloud SQL Primary
- Invalidate Redis cache after write
- Publish event to NATS

**Read Operations**:
- Check Redis cache first (TTL: 5 min for TRRs)
- On cache miss → Query Read Replica
- Update cache asynchronously

**Analytics Queries**:
- Always use Read Replica
- Cache aggregated results (TTL: 15 min)
- Use BigQuery for historical analysis

### Data Migration Strategy

**Phase 1: Dual Write** (Week 1-2)
- Keep Firebase as primary
- Start writing to PostgreSQL in parallel
- Compare data consistency

**Phase 2: Dual Read** (Week 3-4)
- Gradually shift reads to PostgreSQL
- Firebase as fallback
- Monitor error rates

**Phase 3: Full Migration** (Week 5-6)
- PostgreSQL as primary
- Decommission Firebase writes
- Archive Firebase data

---

## Service-to-Service Communication

### Synchronous Communication (REST)

**When to Use**:
- User-facing operations requiring immediate response
- Data retrieval queries
- Operations requiring strong consistency

**Example**: Frontend fetches TRR record
```
Frontend → API Gateway → TRR Records Service (REST GET)
```

**Protocol**: HTTP/2 with gRPC for internal services (optional)

### Asynchronous Communication (Event-Driven)

**When to Use**:
- Background processing
- Analytics updates
- Audit logging
- Notifications

**Event Bus**: NATS Streaming

**Example**: TRR activity appended
```
TRR Records Service publishes "trr.activity.appended" event
├─→ Analytics Service (updates metrics)
├─→ Event Tracking Service (logs activity)
├─→ AI Service (analyzes content)
└─→ Search Service (re-indexes)
```

**Event Schema**:
```typescript
interface Event {
  id: string;
  type: string; // "trr.activity.appended"
  aggregateId: string; // TRR ID
  timestamp: Date;
  userId: string;
  payload: Record<string, any>;
  metadata?: {
    correlationId?: string;
    causationId?: string;
  };
}
```

### Service Discovery

**Options**:
1. **Kubernetes DNS** (Recommended for simplicity)
   - Service name: `trr-service.cortex-dc.svc.cluster.local`

2. **Consul** (For advanced service mesh)
   - Dynamic service registration
   - Health checking
   - Load balancing

---

## Authentication & Authorization

### Flow Diagram

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. POST /auth/login
     ▼
┌─────────────────┐
│  API Gateway    │
└────┬────────────┘
     │ 2. Forward to Auth Service
     ▼
┌─────────────────┐       ┌──────────────┐
│  Auth Service   │◄─────►│  Keycloak    │
└────┬────────────┘   3.  └──────────────┘
     │ Validate credentials
     │ 4. Issue JWT
     ▼
┌─────────────────┐
│  Client         │ (stores JWT in httpOnly cookie)
└────┬────────────┘
     │ 5. Subsequent requests with JWT
     ▼
┌─────────────────┐
│  API Gateway    │
└────┬────────────┘
     │ 6. Validate JWT (local or call Auth Service)
     │ 7. Extract user ID and permissions
     ▼
┌─────────────────┐
│  TRR Service    │ (receives user context in header)
└─────────────────┘
```

### JWT Token Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["user", "dc_consultant"],
  "permissions": [
    "trr:create",
    "trr:read:own",
    "trr:update:own",
    "pov:create"
  ],
  "org_id": "org-uuid",
  "iat": 1634567890,
  "exp": 1634571490
}
```

### Authorization Middleware

Each service validates permissions:

```typescript
// Middleware in TRR Records Service
async function authorize(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  // Validate JWT signature
  const decoded = jwt.verify(token, publicKey);

  // Check permissions
  if (!decoded.permissions.includes('trr:create')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  req.user = decoded;
  next();
}
```

---

## API Gateway & Routing

### API Gateway Configuration (Kong)

```yaml
# kong.yaml
services:
  - name: trr-service
    url: http://trr-service.cortex-dc.svc.cluster.local:8080
    routes:
      - name: trr-routes
        paths:
          - /api/v1/trr
        strip_path: false
        plugins:
          - name: rate-limiting
            config:
              minute: 100
          - name: jwt
            config:
              key_claim_name: kid
          - name: cors
            config:
              origins: ["*"]

  - name: auth-service
    url: http://auth-service.cortex-dc.svc.cluster.local:8080
    routes:
      - name: auth-routes
        paths:
          - /api/v1/auth
        plugins:
          - name: rate-limiting
            config:
              minute: 20
```

### Request Flow

```
1. Client → https://cortex-dc.example.com/api/v1/trr/records
2. Cloud Load Balancer → GKE Ingress
3. Ingress → Kong API Gateway
4. Kong:
   - Validate JWT
   - Check rate limits
   - Add correlation ID
   - Route to trr-service
5. TRR Service processes request
6. Response → Client
```

---

## Containerization & Docker Strategy

### Docker Multi-Stage Build Example (TRR Service)

```dockerfile
# Dockerfile.trr-service
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 trrservice

# Copy built application
COPY --from=builder --chown=trrservice:nodejs /app/dist ./dist
COPY --from=builder --chown=trrservice:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=trrservice:nodejs /app/package.json ./

USER trrservice
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/index.js"]
```

### Docker Compose for Local Development

```yaml
# docker-compose.microservices.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: cortex_dc
      POSTGRES_USER: cortex
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cortex"]
      interval: 10s

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s

  nats:
    image: nats:2.9-alpine
    ports:
      - "4222:4222"
      - "8222:8222"
    command: "-js -m 8222"
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:8222/healthz"]
      interval: 10s

  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: cortex
      KC_DB_PASSWORD: dev_password
    ports:
      - "8180:8080"
    depends_on:
      - postgres

  trr-service:
    build:
      context: .
      dockerfile: packages/trr-service/Dockerfile
    environment:
      DATABASE_URL: postgresql://cortex:dev_password@postgres:5432/cortex_dc
      REDIS_URL: redis://redis:6379
      NATS_URL: nats://nats:4222
      PORT: 8080
    ports:
      - "8081:8080"
    depends_on:
      - postgres
      - redis
      - nats

  auth-service:
    build:
      context: .
      dockerfile: packages/auth-service/Dockerfile
    environment:
      KEYCLOAK_URL: http://keycloak:8080
      REDIS_URL: redis://redis:6379
      PORT: 8080
    ports:
      - "8082:8080"
    depends_on:
      - keycloak
      - redis

  api-gateway:
    image: kong:3.4-alpine
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/kong.yaml
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
    volumes:
      - ./kong.yaml:/kong/kong.yaml
    ports:
      - "8000:8000"
      - "8443:8443"
      - "8001:8001"

volumes:
  postgres_data:
```

---

## GKE Deployment Architecture

### Cluster Configuration

```yaml
# gke-cluster.yaml (Terraform)
resource "google_container_cluster" "cortex_dc" {
  name     = "cortex-dc-cluster"
  location = "us-central1"

  # Use regional cluster for HA
  node_locations = [
    "us-central1-a",
    "us-central1-b",
    "us-central1-c"
  ]

  # Initial node count (will be managed by node pools)
  remove_default_node_pool = true
  initial_node_count       = 1

  # Networking
  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  # Enable features
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  addons_config {
    http_load_balancing {
      disabled = false
    }
    horizontal_pod_autoscaling {
      disabled = false
    }
  }

  # Logging and monitoring
  logging_service    = "logging.googleapis.com/kubernetes"
  monitoring_service = "monitoring.googleapis.com/kubernetes"
}

# Application node pool
resource "google_container_node_pool" "app_nodes" {
  name       = "app-node-pool"
  cluster    = google_container_cluster.cortex_dc.name
  location   = google_container_cluster.cortex_dc.location

  # Autoscaling
  autoscaling {
    min_node_count = 3
    max_node_count = 10
  }

  node_config {
    machine_type = "n2-standard-4"
    disk_size_gb = 100
    disk_type    = "pd-standard"

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      workload = "application"
    }

    tags = ["cortex-dc-app"]
  }
}
```

### Kubernetes Manifests

#### TRR Service Deployment

```yaml
# kubernetes/trr-service/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trr-service
  namespace: cortex-dc
  labels:
    app: trr-service
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: trr-service
  template:
    metadata:
      labels:
        app: trr-service
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: trr-service-sa

      # Pod anti-affinity for HA
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchLabels:
                    app: trr-service
                topologyKey: kubernetes.io/hostname

      containers:
        - name: trr-service
          image: gcr.io/PROJECT_ID/trr-service:latest
          imagePullPolicy: Always

          ports:
            - name: http
              containerPort: 8080
              protocol: TCP

          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-secret
                  key: url
            - name: REDIS_URL
              value: "redis://redis-service:6379"
            - name: NATS_URL
              value: "nats://nats-service:4222"
            - name: PORT
              value: "8080"
            - name: NODE_ENV
              value: "production"
            - name: LOG_LEVEL
              value: "info"

          # Resource limits
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"

          # Health checks
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3

          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 2

          # Startup probe for slow starts
          startupProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 0
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 30

          # Security context
          securityContext:
            runAsNonRoot: true
            runAsUser: 1001
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - ALL
            readOnlyRootFilesystem: true

          volumeMounts:
            - name: tmp
              mountPath: /tmp

      volumes:
        - name: tmp
          emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: trr-service
  namespace: cortex-dc
  labels:
    app: trr-service
spec:
  type: ClusterIP
  ports:
    - port: 8080
      targetPort: 8080
      protocol: TCP
      name: http
  selector:
    app: trr-service
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: trr-service-hpa
  namespace: cortex-dc
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: trr-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

#### Ingress Configuration

```yaml
# kubernetes/ingress/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cortex-dc-ingress
  namespace: cortex-dc
  annotations:
    kubernetes.io/ingress.class: "gce"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    ingress.gcp.kubernetes.io/pre-shared-cert: "cortex-dc-cert"
    networking.gke.io/managed-certificates: "cortex-dc-cert"
spec:
  tls:
    - hosts:
        - cortex-dc.example.com
      secretName: cortex-dc-tls
  rules:
    - host: cortex-dc.example.com
      http:
        paths:
          - path: /api/v1/trr
            pathType: Prefix
            backend:
              service:
                name: trr-service
                port:
                  number: 8080
          - path: /api/v1/auth
            pathType: Prefix
            backend:
              service:
                name: auth-service
                port:
                  number: 8080
          - path: /api/v1/pov
            pathType: Prefix
            backend:
              service:
                name: pov-service
                port:
                  number: 8080
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-frontend
                port:
                  number: 3000
```

---

## Migration Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Goal**: Establish infrastructure and deploy first microservice.

**Tasks**:
1. ✅ Set up GKE cluster with Terraform
2. ✅ Deploy Cloud SQL (PostgreSQL) with read replica
3. ✅ Deploy Redis cluster
4. ✅ Deploy NATS streaming
5. ✅ Deploy Keycloak
6. ✅ Set up CI/CD pipeline (GitHub Actions)
7. ✅ Deploy TRR Records Service (pilot microservice)
8. ✅ Implement dual-write to Firebase + PostgreSQL

**Deliverables**:
- GKE cluster running
- TRR Service handling 10% of traffic
- Monitoring dashboards operational

---

### Phase 2: Core Services (Weeks 3-5)

**Goal**: Deploy all core microservices.

**Tasks**:
1. ✅ Deploy Auth Service
2. ✅ Deploy POV Management Service
3. ✅ Deploy User Management Service
4. ✅ Deploy DC Engagement Service
5. ✅ Deploy Event Tracking Service
6. ✅ Deploy API Gateway (Kong)
7. ✅ Migrate database reads to PostgreSQL
8. ✅ Implement service mesh (Istio)

**Deliverables**:
- All core services deployed
- 50% of traffic on GKE
- Firebase as fallback

---

### Phase 3: Advanced Services (Weeks 6-8)

**Goal**: Deploy AI, Analytics, and Search services.

**Tasks**:
1. ✅ Deploy AI Service
2. ✅ Deploy Analytics Service
3. ✅ Deploy Search Service
4. ✅ Implement event-driven architecture with NATS
5. ✅ Migrate frontend to BFF pattern
6. ✅ 100% traffic on GKE
7. ✅ Decommission Firebase functions

**Deliverables**:
- Full microservices architecture operational
- Firebase retired except for archive
- Performance meets SLA

---

### Phase 4: Optimization (Weeks 9-10)

**Goal**: Optimize performance and observability.

**Tasks**:
1. ✅ Implement distributed tracing with OpenTelemetry
2. ✅ Optimize database queries and add indexes
3. ✅ Implement caching strategy
4. ✅ Load testing and performance tuning
5. ✅ Security audit and penetration testing
6. ✅ Documentation and runbooks

**Deliverables**:
- P95 latency <200ms
- 99.9% uptime
- Complete documentation

---

## Risk Assessment & Mitigation

### Risk Matrix

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Data loss during migration** | Critical | Low | Dual-write strategy, automated validation, rollback plan |
| **Performance degradation** | High | Medium | Load testing, gradual rollout, auto-scaling |
| **Service dependencies failure** | High | Medium | Circuit breakers, retry logic, fallback mechanisms |
| **Database connection pool exhaustion** | High | Medium | PgBouncer, connection limits, monitoring alerts |
| **Cost overruns** | Medium | Medium | Budget alerts, resource quotas, cost optimization |
| **Team skill gaps** | Medium | Low | Training, pair programming, documentation |
| **Vendor lock-in (GCP)** | Low | Low | Use Kubernetes primitives, avoid GCP-specific APIs |

### Rollback Plan

**Trigger Conditions**:
- Error rate >5%
- P95 latency >500ms
- Data inconsistency detected

**Rollback Steps**:
1. Switch traffic back to Firebase via DNS/load balancer
2. Stop writes to PostgreSQL
3. Analyze failure cause
4. Fix and re-deploy
5. Gradual rollout again

---

## Next Steps

### Immediate Actions (Week 1)

1. **Review and approve** this strategy document
2. **Provision GKE cluster** using Terraform scripts
3. **Set up CI/CD pipeline** in GitHub Actions
4. **Create TRR Service package** structure in monorepo:
   ```
   packages/
   └── trr-service/
       ├── src/
       │   ├── controllers/
       │   ├── services/
       │   ├── models/
       │   ├── routes/
       │   └── index.ts
       ├── Dockerfile
       ├── package.json
       └── tsconfig.json
   ```
5. **Deploy PostgreSQL** on Cloud SQL
6. **Run data migration** dry-run from Firebase to PostgreSQL

### Questions for Stakeholders

1. **Budget**: What is the monthly GKE budget limit?
2. **Timeline**: Is the 10-week timeline acceptable?
3. **Downtime**: Can we schedule 1-hour maintenance window for final cutover?
4. **Data Retention**: How long should we keep Firebase data as backup?
5. **Monitoring**: Do we have existing Grafana/Prometheus setup to integrate?

---

## Appendix

### Glossary

- **TRR**: Technical Resource Request Record
- **POV**: Proof of Value
- **GKE**: Google Kubernetes Engine
- **NATS**: Neural Autonomic Transport System (message queue)
- **mTLS**: Mutual TLS (authentication)
- **HPA**: Horizontal Pod Autoscaler
- **PgBouncer**: PostgreSQL connection pooler
- **BFF**: Backend for Frontend

### References

- [Google Kubernetes Engine Best Practices](https://cloud.google.com/kubernetes-engine/docs/best-practices)
- [Microservices Patterns by Chris Richardson](https://microservices.io/patterns/index.html)
- [NATS Documentation](https://docs.nats.io/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Document End**
