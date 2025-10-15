# Cortex DC Web - Complete Architecture Documentation

> Comprehensive architecture documentation generated on 2025-10-14

## Table of Contents
1. [System Overview](#system-overview)
2. [Kubernetes Deployment Architecture](#kubernetes-deployment-architecture)
3. [Service-Level Architecture](#service-level-architecture)
4. [Record Management Workflows](#record-management-workflows)
5. [Data Pipelines](#data-pipelines)
6. [Local Development Setup](#local-development-setup)

---

## System Overview

Cortex DC Web is a multi-mode deployment platform for Domain Consultant engagement tracking, featuring:
- **Deployment Modes**: Firebase (default) or Self-Hosted (PostgreSQL + Keycloak + MinIO)
- **Core Entities**: Projects, POVs (Proof of Value), TRRs (Technical Risk Reviews)
- **Architecture Pattern**: Adapter-based multi-backend support
- **Deployment Targets**: Kubernetes, Docker Compose, or Firebase

---

## 1. Kubernetes Deployment Architecture

```mermaid
graph TB
    subgraph "External Traffic"
        Internet[Internet Traffic]
        LB[Load Balancer / Ingress]
    end

    subgraph "Kubernetes Cluster - cortex-dc namespace"
        subgraph "Frontend Layer"
            Web1[Next.js Web Pod 1]
            Web2[Next.js Web Pod 2]
            Web3[Next.js Web Pod 3]
            WebSvc[Web Service<br/>ClusterIP:3000]
        end

        subgraph "Backend Layer"
            Func1[Functions Pod 1<br/>Node 22]
            Func2[Functions Pod 2<br/>Node 22]
            Func3[Functions Pod 3<br/>Node 22]
            FuncSvc[Functions Service<br/>ClusterIP:8080]
        end

        subgraph "API Layer"
            API1[API Server Pod 1]
            API2[API Server Pod 2]
            APISvc[API Service<br/>ClusterIP:8080]
        end

        subgraph "Configuration"
            ConfigMap[ConfigMap<br/>functions-config]
            Secrets[Secrets<br/>GCP Credentials<br/>API Keys]
        end

        subgraph "Storage"
            PVC[Persistent Volume Claims]
        end
    end

    subgraph "External Services"
        subgraph "Firebase Mode"
            Firestore[(Firestore)]
            FireAuth[Firebase Auth]
            FireStorage[Firebase Storage]
        end

        subgraph "Self-Hosted Mode"
            Postgres[(PostgreSQL)]
            Keycloak[Keycloak Auth]
            MinIO[MinIO Storage]
            Redis[(Redis Cache)]
            NATS[NATS Queue]
        end
    end

    subgraph "Monitoring"
        Prometheus[Prometheus]
        Grafana[Grafana]
    end

    Internet --> LB
    LB --> WebSvc
    WebSvc --> Web1 & Web2 & Web3
    Web1 & Web2 & Web3 --> FuncSvc
    FuncSvc --> Func1 & Func2 & Func3
    Web1 & Web2 & Web3 --> APISvc
    APISvc --> API1 & API2

    Func1 & Func2 & Func3 --> ConfigMap
    Func1 & Func2 & Func3 --> Secrets
    API1 & API2 --> ConfigMap
    API1 & API2 --> Secrets

    %% Firebase connections
    Func1 & Func2 & Func3 -.->|Firebase Mode| Firestore
    API1 & API2 -.->|Firebase Mode| Firestore
    Web1 & Web2 & Web3 -.->|Firebase Mode| FireAuth
    Func1 & Func2 & Func3 -.->|Firebase Mode| FireStorage

    %% Self-hosted connections
    API1 & API2 -.->|Self-Hosted| Postgres
    API1 & API2 -.->|Self-Hosted| Keycloak
    API1 & API2 -.->|Self-Hosted| MinIO
    API1 & API2 -.->|Self-Hosted| Redis
    API1 & API2 -.->|Self-Hosted| NATS

    %% Monitoring
    Func1 & Func2 & Func3 --> Prometheus
    API1 & API2 --> Prometheus
    Prometheus --> Grafana

    style Web1 fill:#4285f4
    style Web2 fill:#4285f4
    style Web3 fill:#4285f4
    style Func1 fill:#34a853
    style Func2 fill:#34a853
    style Func3 fill:#34a853
    style API1 fill:#fbbc04
    style API2 fill:#fbbc04
    style Firestore fill:#ea4335
    style Postgres fill:#336791
```

### Kubernetes Components

#### Deployments
- **functions-microservice**: 3 replicas, rolling updates, pod anti-affinity
- **web-app**: 3 replicas, Next.js 14
- **api-server**: 2+ replicas (self-hosted mode)

#### Services
- **functions-service**: ClusterIP on port 80 → 8080
- **functions-service-headless**: For service discovery
- **web-service**: ClusterIP on port 3000
- **api-service**: ClusterIP on port 8080

#### Configuration
- **ConfigMap**: `functions-config` - app version, log level, CORS, feature flags
- **Secrets**: GCP credentials, API keys, Firebase config

---

## 2. Service-Level Architecture

```mermaid
graph LR
    subgraph "Client Applications"
        Browser[Web Browser]
        Mobile[Mobile App]
    end

    subgraph "Next.js Web App - Port 3000"
        UI[UI Components]
        RSC[React Server Components]
        API_Routes[API Routes]
    end

    subgraph "Data Adapter Layer"
        DBFactory{Database Factory<br/>DEPLOYMENT_MODE}
        AuthFactory{Auth Factory}
        StorageFactory{Storage Factory}
    end

    subgraph "Firebase Adapters"
        FirestoreAdapter[Firestore Adapter]
        FirebaseAuthAdapter[Firebase Auth Adapter]
        FirebaseStorageAdapter[Firebase Storage Adapter]
    end

    subgraph "Self-Hosted Adapters"
        PostgresAdapter[Postgres Adapter]
        KeycloakAdapter[Keycloak Adapter]
        MinIOAdapter[MinIO Adapter]
    end

    subgraph "Service Layer"
        DataService[Data Service]
        RelationshipService[Relationship Management]
        DynamicRecordService[Dynamic Record Service]
        AnalyticsService[Analytics Service]
        UserMgmtService[User Management]
        TerraformService[Terraform Generation]
        ValidationService[Database Validation]
    end

    subgraph "Storage Backends"
        Firestore[(Firestore)]
        Postgres[(PostgreSQL)]
        MinIO[(MinIO)]
        FireStorage[(Firebase Storage)]
        Redis[(Redis)]
    end

    Browser --> UI
    Mobile --> API_Routes
    UI --> RSC
    RSC --> API_Routes

    API_Routes --> DataService
    API_Routes --> RelationshipService
    API_Routes --> DynamicRecordService
    API_Routes --> AnalyticsService

    DataService --> DBFactory
    RelationshipService --> DBFactory
    DynamicRecordService --> DBFactory
    AnalyticsService --> DBFactory
    UserMgmtService --> AuthFactory

    DBFactory -->|Firebase Mode| FirestoreAdapter
    DBFactory -->|Self-Hosted Mode| PostgresAdapter
    AuthFactory -->|Firebase Mode| FirebaseAuthAdapter
    AuthFactory -->|Self-Hosted Mode| KeycloakAdapter
    StorageFactory -->|Firebase Mode| FirebaseStorageAdapter
    StorageFactory -->|Self-Hosted Mode| MinIOAdapter

    FirestoreAdapter --> Firestore
    PostgresAdapter --> Postgres
    MinIOAdapter --> MinIO
    FirebaseStorageAdapter --> FireStorage
    PostgresAdapter --> Redis

    style DBFactory fill:#fbbc04
    style AuthFactory fill:#fbbc04
    style StorageFactory fill:#fbbc04
    style DataService fill:#34a853
    style RelationshipService fill:#34a853
    style DynamicRecordService fill:#34a853
```

### Service Descriptions

#### Core Services (`packages/db/src/services/`)

1. **Data Service** (`data-service.ts`)
   - CRUD operations across all entities
   - Query building and filtering
   - Pagination support

2. **Relationship Management Service** (`relationship-management-service.ts`)
   - Associates TRRs with POVs
   - Associates POVs with Projects and Scenarios
   - Validates relationship integrity
   - Repairs broken references
   - Generates relationship graphs

3. **Dynamic Record Service** (`dynamic-record-service.ts`)
   - Auto-creates POVs with default phases
   - Auto-creates TRRs with risk assessment templates
   - Manages lifecycle transitions
   - Logs activity and lifecycle events
   - Auto-populates related records

4. **Analytics Service** (`analytics-service.ts`)
   - User-specific analytics (POVs, TRRs, projects)
   - Admin analytics (system-wide metrics)
   - Trend calculations
   - User engagement tracking
   - Project health scoring

5. **Terraform Generation Service** (`terraform-generation-service.ts`)
   - Generates IaC from demo scenarios
   - Supports multiple cloud providers

6. **Database Validation Service** (`database-validation-service.ts`)
   - Cross-backend validation
   - Schema enforcement

---

## 3. Record Management Workflows

```mermaid
stateDiagram-v2
    [*] --> Draft: Create Record

    state "POV Workflow" as POVFlow {
        Draft --> Planning: Initialize
        Planning --> InProgress: Start Execution
        InProgress --> Testing: Begin Testing
        Testing --> Validating: Submit for Validation
        Validating --> Completed: Approve
        Validating --> AtRisk: Issues Found
        AtRisk --> InProgress: Remediate
        InProgress --> Cancelled: Cancel
        Planning --> Cancelled: Cancel
    }

    state "TRR Workflow" as TRRFlow {
        Draft --> InReview: Submit for Review
        InReview --> PendingValidation: Request Validation
        PendingValidation --> Validated: Validate
        Validated --> Approved: Approve
        Validated --> Rejected: Reject
        Rejected --> Draft: Revise
        Approved --> Completed: Complete
    }

    Completed --> [*]
    Cancelled --> [*]
```

### Workflow Details

#### POV Lifecycle
1. **Planning Phase**
   - Define objectives
   - Create test plan
   - Assign resources
   - Link scenarios

2. **In Progress Phase**
   - Execute test plan
   - Track milestones
   - Log activities
   - Update metrics

3. **Testing Phase**
   - Run scenarios
   - Collect results
   - Document outcomes

4. **Validating Phase**
   - Review results
   - Validate success metrics
   - Prepare signoff

5. **Completed/At Risk**
   - Finalize documentation
   - Calculate ROI
   - Archive or remediate

#### TRR Management Flow

```mermaid
graph TD
    A[Create TRR] --> B[Define Risk Categories]
    B --> C[Technical Feasibility]
    B --> D[Security]
    B --> E[Performance]
    B --> F[Scalability]

    C & D & E & F --> G[Score Each Category 0-10]
    G --> H[Add Findings]
    H --> I[Attach Evidence]
    I --> J[Provide Mitigation]
    J --> K[Submit for Review]
    K --> L{Validation}
    L -->|Pass| M[Approve & Sign Off]
    L -->|Fail| N[Return for Revision]
    N --> H
    M --> O[Complete TRR]

    style A fill:#4285f4
    style M fill:#34a853
    style N fill:#ea4335
    style O fill:#34a853
```

### Record Management API

The platform provides these methods for record management:

```typescript
// Create POV with auto-population
const result = await dynamicRecordService.createPOV({
  title: "Customer X POV",
  description: "Test XSIAM deployment",
  priority: "high"
}, projectId, {
  userId: currentUser.id,
  autoPopulateDefaults: true,
  createRelationships: true
});

// Create TRR for a POV
const trrResult = await dynamicRecordService.createTRR({
  title: "Security Risk Review",
  priority: "critical"
}, projectId, povId, {
  userId: currentUser.id
});

// Transition POV through phases
await dynamicRecordService.transitionPOVPhase(povId, userId);

// Update TRR status
await dynamicRecordService.transitionTRRStatus(
  trrId,
  "pending_validation",
  userId
);

// Associate TRR with POV
await relationshipManagementService.associateTRRWithPOV(
  trrId,
  povId
);
```

---

## 4. Data Pipelines

```mermaid
graph TB
    subgraph "User Data Space"
        UserActions[User Actions]
        UserPOVs[(User POVs)]
        UserTRRs[(User TRRs)]
        UserProjects[(User Projects)]
        UserActivity[(Activity Logs)]
        UserScenarios[(Scenarios)]
    end

    subgraph "System Processing Layer"
        ValidationQueue[Validation Queue]
        AnalyticsEngine[Analytics Engine]
        RelationshipEngine[Relationship Engine]
        NotificationEngine[Notification Engine]
    end

    subgraph "Admin Data Space"
        SystemMetrics[(System Metrics)]
        AdminAnalytics[(Admin Analytics)]
        AuditLogs[(Audit Logs)]
        UserManagement[(User Management)]
        LifecycleEvents[(Lifecycle Events)]
        RelationshipLogs[(Relationship Logs)]
    end

    subgraph "Data Segregation Rules"
        UserScope[User Scope<br/>owner = userId]
        TeamScope[Team Scope<br/>userId IN team]
        AdminScope[Admin Scope<br/>role = admin]
    end

    UserActions --> UserActivity
    UserActions --> UserPOVs
    UserActions --> UserTRRs
    UserActions --> UserProjects
    UserActions --> UserScenarios

    UserPOVs --> ValidationQueue
    UserTRRs --> ValidationQueue
    UserActivity --> AnalyticsEngine
    UserPOVs --> RelationshipEngine
    UserTRRs --> RelationshipEngine

    ValidationQueue --> AuditLogs
    AnalyticsEngine --> SystemMetrics
    AnalyticsEngine --> AdminAnalytics
    RelationshipEngine --> RelationshipLogs
    RelationshipEngine --> LifecycleEvents

    UserScope -.->|Filter| UserPOVs
    UserScope -.->|Filter| UserTRRs
    UserScope -.->|Filter| UserProjects
    TeamScope -.->|Filter| UserProjects
    AdminScope -.->|Access| SystemMetrics
    AdminScope -.->|Access| AdminAnalytics
    AdminScope -.->|Access| UserManagement

    style UserActions fill:#4285f4
    style SystemMetrics fill:#ea4335
    style AdminAnalytics fill:#ea4335
    style UserScope fill:#34a853
    style AdminScope fill:#fbbc04
```

### Data Pipeline Details

#### User Space Pipeline
```
User Action → Activity Log → User Analytics
           ↓
       User Record (POV/TRR/Project)
           ↓
    Relationship Validation
           ↓
    Lifecycle Event Log
           ↓
    Admin Aggregation
```

**Data Scope**:
- POVs where `owner = userId` OR `userId IN team`
- TRRs where `owner = userId` OR `userId IN reviewers`
- Projects where `owner = userId` OR `userId IN team`
- Scenarios linked to user's POVs

**Access Pattern**:
```typescript
// User queries are automatically scoped
const userPOVs = await db.findMany('povs', {
  filters: [
    { field: 'owner', operator: '==', value: currentUser.id }
  ]
});

// Analytics are user-specific
const analytics = await analyticsService.getUserAnalytics(
  currentUser.id,
  'month'
);
```

#### Admin Space Pipeline
```
All User Actions → System Aggregation
                ↓
         System Metrics
                ↓
        Admin Dashboard
                ↓
         Reporting & Alerts
```

**Data Scope**:
- ALL POVs, TRRs, Projects (no ownership filter)
- System-wide activity logs
- Performance metrics
- User engagement data
- Project health scores

**Access Pattern**:
```typescript
// Admin queries have no ownership filters
const allPOVs = await db.findMany('povs', {
  // No user filter - admin sees all
});

// System-wide analytics
const adminAnalytics = await analyticsService.getAdminAnalytics('month');

// Top users across platform
const topUsers = await analyticsService.getTopUsers(10);
```

#### Data Flow Summary

| Data Type | User Space | Admin Space |
|-----------|------------|-------------|
| POVs | Owner/Team filtered | All records |
| TRRs | Owner/Reviewer filtered | All records |
| Projects | Owner/Team filtered | All records |
| Activity Logs | Own actions only | All user actions |
| Analytics | Personal metrics | System metrics |
| Relationship Logs | Related to own records | All relationships |
| Lifecycle Events | Related to own records | All events |

---

## 5. Component Architecture

```mermaid
graph TB
    subgraph "Frontend Components"
        Dashboard[Dashboard Page]
        POVList[POV List]
        POVDetail[POV Detail Page]
        TRRList[TRR List]
        TRRDetail[TRR Detail Page]
        ProjectList[Project List]
    end

    subgraph "Dashboard Components"
        PersonalDash[Personal Dashboard]
        TeamDash[Team Dashboard]
        AdminDash[Admin Dashboard]
    end

    subgraph "Shared Components"
        DataTable[Data Table]
        Timeline[Timeline Component]
        StatusBadge[Status Badge]
        MetricsCard[Metrics Card]
        Charts[Chart Components]
    end

    subgraph "API Integration"
        APIClient[API Client]
        SWRHooks[SWR Hooks]
        useAPI[useAPI Hook]
    end

    Dashboard --> PersonalDash
    Dashboard --> TeamDash
    Dashboard --> AdminDash

    POVDetail --> Timeline
    POVDetail --> StatusBadge
    POVDetail --> MetricsCard

    TRRDetail --> DataTable
    TRRDetail --> StatusBadge
    TRRDetail --> Charts

    PersonalDash --> APIClient
    TeamDash --> APIClient
    AdminDash --> APIClient

    APIClient --> useAPI
    useAPI --> SWRHooks

    style Dashboard fill:#4285f4
    style APIClient fill:#34a853
```

---

## 6. Local Development Setup

### Quick Start (Firebase Mode - Emulators)

```bash
# 1. Install dependencies
pnpm install

# 2. Start Firebase emulators with data persistence
pnpm run emulators

# 3. In a new terminal, start Next.js dev server
pnpm run dev:web

# 4. Seed test data (optional)
pnpm run seed:users
pnpm run seed:data
```

**Access Points**:
- Web App: http://localhost:3000
- Firebase Emulator UI: http://localhost:4040
- Firestore: localhost:8080
- Auth: localhost:9099

### Full Stack Testing (Self-Hosted Mode)

```bash
# 1. Start all infrastructure services
docker-compose up -d postgres keycloak minio redis nats

# 2. Wait for services to be healthy (check logs)
docker-compose logs -f

# 3. Set environment to self-hosted
export DEPLOYMENT_MODE=self-hosted
export DATABASE_URL=postgresql://cortex:cortex_secure_password@localhost:5432/cortex

# 4. Start the web app
pnpm run dev:web

# 5. Start functions (optional)
pnpm run dev:functions
```

**Access Points**:
- Web App: http://localhost:3000
- PostgreSQL: localhost:5432
- Keycloak: http://localhost:8180
- MinIO Console: http://localhost:9001
- Redis: localhost:6379
- NATS: localhost:4222

### Testing Record Management Workflows

Create a test script `test-record-management.ts`:

```typescript
import { dynamicRecordService } from '@cortex/db';
import { relationshipManagementService } from '@cortex/db';

async function testRecordWorkflow() {
  // 1. Create a project
  const projectId = 'test-project-' + Date.now();

  // 2. Create a POV
  const povResult = await dynamicRecordService.createPOV({
    title: 'Test POV',
    description: 'Testing POV workflow',
    priority: 'high'
  }, projectId, {
    userId: 'test-user',
    autoPopulateDefaults: true,
    createRelationships: true
  });

  console.log('Created POV:', povResult.povId);

  // 3. Create a TRR for the POV
  if (povResult.povId) {
    const trrResult = await dynamicRecordService.createTRR({
      title: 'Test TRR',
      description: 'Testing TRR workflow',
      priority: 'critical'
    }, projectId, povResult.povId, {
      userId: 'test-user',
      createRelationships: true
    });

    console.log('Created TRR:', trrResult.trrId);

    // 4. Get relationship graph
    const graph = await relationshipManagementService.getProjectRelationshipGraph(projectId);
    console.log('Relationship Graph:', graph);

    // 5. Transition POV to next phase
    const transition = await dynamicRecordService.transitionPOVPhase(
      povResult.povId,
      'test-user'
    );
    console.log('Phase Transition:', transition);

    // 6. Update TRR status
    const statusUpdate = await dynamicRecordService.transitionTRRStatus(
      trrResult.trrId!,
      'in_review',
      'test-user'
    );
    console.log('Status Update:', statusUpdate);
  }
}

testRecordWorkflow().catch(console.error);
```

Run the test:
```bash
# With Firebase emulators
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 \
FIRESTORE_EMULATOR_HOST=localhost:8080 \
npx tsx test-record-management.ts

# With self-hosted
DEPLOYMENT_MODE=self-hosted \
DATABASE_URL=postgresql://cortex:cortex_secure_password@localhost:5432/cortex \
npx tsx test-record-management.ts
```

### UI Testing Workflow

1. **Login Page** (`/login`)
   - Test user authentication
   - Verify Firebase/Keycloak integration

2. **Dashboard** (`/`)
   - Personal Dashboard: See your POVs, TRRs
   - Team Dashboard: See team's work
   - Admin Dashboard: System-wide view (admin only)

3. **POV Management** (`/pov`)
   - List all POVs: `/pov`
   - Create new POV: `/pov/new`
   - View POV detail: `/pov/[id]`
   - Transition phases
   - Add test plans

4. **TRR Management** (`/trr`)
   - List all TRRs: `/trr`
   - Create new TRR: `/trr/new`
   - View TRR detail: `/trr/[id]`
   - Add findings
   - Score risk categories
   - Submit for validation

### Environment Configuration

Create `.env.local`:

```bash
# Deployment Mode
DEPLOYMENT_MODE=firebase  # or 'self-hosted'

# Firebase (Firebase Mode)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cortex-dc-portal
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080

# PostgreSQL (Self-Hosted Mode)
DATABASE_URL=postgresql://cortex:cortex_secure_password@localhost:5432/cortex

# Keycloak (Self-Hosted Mode)
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180
NEXT_PUBLIC_KEYCLOAK_REALM=cortex
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=cortex-web

# MinIO (Self-Hosted Mode)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin_password

# Redis (Self-Hosted Mode)
REDIS_URL=redis://:redis_password@localhost:6379

# NATS (Self-Hosted Mode)
NATS_URL=nats://localhost:4222
```

### Smoke Test Plan

Run these tests to verify the system:

1. **Database Connection**
   ```bash
   pnpm run test:db-connection
   ```

2. **Record Creation**
   - Create a project
   - Create a POV
   - Create a TRR
   - Verify relationships

3. **Record Management**
   - Update POV phase
   - Update TRR status
   - Add findings to TRR
   - Score risk categories

4. **Analytics**
   - Fetch user analytics
   - Fetch admin analytics
   - Verify metric calculations

5. **UI Navigation**
   - Login
   - View dashboard
   - Navigate to POV list
   - Create new POV
   - View POV detail
   - Navigate to TRR list
   - Create new TRR
   - View TRR detail

---

## Key Architecture Principles

1. **Adapter Pattern**: All data access goes through adapters, enabling multi-backend support
2. **Service Layer**: Business logic is centralized in services
3. **Relationship Management**: Dedicated service ensures data integrity
4. **Dynamic Records**: Records are auto-populated with sensible defaults
5. **Lifecycle Management**: All transitions are logged and tracked
6. **User vs Admin Separation**: Clear data scope boundaries
7. **Analytics Pipeline**: Continuous aggregation for insights

## Next Steps

1. Test the UI locally with emulators
2. Create POVs and TRRs through the UI
3. Verify workflows and phase transitions
4. Test relationship management
5. Review analytics dashboards
6. Explore admin features
7. Test self-hosted mode deployment

---

**Generated**: 2025-10-14
**Version**: 1.0.0
**Platform**: Cortex DC Web
