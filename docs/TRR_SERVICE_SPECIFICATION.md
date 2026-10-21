# TRR Records Management Service - Technical Specification

**Service Name**: TRR Records Service
**Version**: 1.0.0
**Owner**: Platform Team
**Status**: Design

---

## Service Overview

### Purpose

The **TRR Records Management Service** is the central microservice responsible for managing Technical Resource Request (TRR) records throughout their lifecycle. It serves as the **primary data source** for all TRR-related operations and provides event-driven updates to downstream services.

### Key Responsibilities

1. **CRUD Operations**: Create, Read, Update, Delete TRR records
2. **Lifecycle Management**: Manage TRR status transitions (draft → submitted → in-progress → completed)
3. **Activity Appending**: Append engagement activities to existing TRRs (demos, scenarios, findings)
4. **Version Control**: Maintain full audit trail of all TRR changes
5. **Validation**: Enforce business rules and data integrity
6. **Search & Filtering**: Provide flexible querying capabilities
7. **Event Publishing**: Emit events for downstream consumers (analytics, AI, notifications)
8. **Caching**: Implement intelligent caching for frequently accessed records

---

## Architecture

### Technology Stack

- **Language**: TypeScript 5.3+
- **Runtime**: Node.js 22 LTS
- **Framework**: Express.js 4.19+
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Message Queue**: NATS Streaming
- **Validation**: Zod
- **Testing**: Jest + Supertest

### Dependencies

```json
{
  "dependencies": {
    "express": "^4.19.2",
    "@prisma/client": "^5.10.2",
    "ioredis": "^5.3.2",
    "nats": "^2.19.0",
    "winston": "^3.11.0",
    "zod": "^3.22.4",
    "jsonwebtoken": "^9.0.2",
    "helmet": "^7.1.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.11.16",
    "@types/express": "^4.17.21",
    "tsx": "^4.7.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.4"
  }
}
```

---

## Data Models

### TRR Record

**Prisma Schema**:

```prisma
model TRR {
  id                    String    @id @default(uuid()) @db.Uuid
  userId                String    @map("user_id") @db.Uuid
  organizationId        String    @map("organization_id") @db.Uuid

  // Basic Information
  title                 String    @db.VarChar(255)
  description           String?   @db.Text
  projectName           String?   @map("project_name") @db.VarChar(255)
  customerName          String?   @map("customer_name") @db.VarChar(255)

  // Status & Priority
  status                TRRStatus @default(DRAFT)
  priority              Priority  @default(MEDIUM)
  completionPercentage  Int       @default(0) @map("completion_percentage")

  // Relationships
  linkedPovId           String?   @map("linked_pov_id") @db.Uuid
  assignedTo            String[]  @default([]) @map("assigned_to") @db.Uuid[]

  // Timeline
  submittedAt           DateTime? @map("submitted_at")
  startedAt             DateTime? @map("started_at")
  dueDate               DateTime? @map("due_date") @db.Date
  completedAt           DateTime? @map("completed_at")

  // JSONB Fields
  scope                 Json?     @db.JsonB
  technicalRequirements Json?     @map("technical_requirements") @db.JsonB
  findings              Json?     @db.JsonB
  recommendations       Json?     @db.JsonB
  metadata              Json?     @db.JsonB

  // Audit
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  createdBy             String    @map("created_by") @db.Uuid
  version               Int       @default(1)

  // Relations
  activities            TRRActivity[]
  versions              TRRVersion[]

  @@index([userId, status])
  @@index([organizationId, createdAt(sort: Desc)])
  @@index([assignedTo], type: Gin)
  @@index([status, dueDate])
  @@map("trr_records")
}

enum TRRStatus {
  DRAFT
  SUBMITTED
  IN_PROGRESS
  REVIEW
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

### TRR Activity

```prisma
model TRRActivity {
  id                  String   @id @default(uuid()) @db.Uuid
  trrId               String   @map("trr_id") @db.Uuid
  trr                 TRR      @relation(fields: [trrId], references: [id], onDelete: Cascade)

  // Activity Details
  activityType        String   @map("activity_type") @db.VarChar(50)
  activityTitle       String   @map("activity_title") @db.VarChar(255)
  activityDescription String?  @map("activity_description") @db.Text
  activityData        Json     @map("activity_data") @db.JsonB

  // Participants
  performedBy         String   @map("performed_by") @db.Uuid
  participants        String[] @default([]) @db.Uuid[]

  // Timestamps
  occurredAt          DateTime @map("occurred_at")
  createdAt           DateTime @default(now()) @map("created_at")

  @@index([trrId, activityType])
  @@index([occurredAt(sort: Desc)])
  @@map("trr_activities")
}
```

### TRR Version

```prisma
model TRRVersion {
  id        String   @id @default(uuid()) @db.Uuid
  trrId     String   @map("trr_id") @db.Uuid
  trr       TRR      @relation(fields: [trrId], references: [id], onDelete: Cascade)

  version   Int
  changedBy String   @map("changed_by") @db.Uuid
  changedAt DateTime @default(now()) @map("changed_at")
  changes   Json     @db.JsonB  // JSON diff
  snapshot  Json     @db.JsonB  // Full snapshot

  @@index([trrId, version(sort: Desc)])
  @@map("trr_versions")
}
```

---

## API Endpoints

### Base URL

```
http://trr-service.cortex-dc.svc.cluster.local:8080/api/v1/trr
```

### Endpoints

#### 1. Create TRR

**Endpoint**: `POST /records`

**Request**:
```json
{
  "title": "Technical Risk Assessment - ACME Corp",
  "description": "Comprehensive TRR for ACME Corp POV",
  "projectName": "ACME Corp Security POV",
  "customerName": "ACME Corporation",
  "priority": "high",
  "linkedPovId": "550e8400-e29b-41d4-a716-446655440000",
  "dueDate": "2025-11-15",
  "scope": {
    "objectives": [
      "Validate ransomware detection capability",
      "Test incident response automation"
    ],
    "deliverables": [
      "Technical findings report",
      "Security recommendations"
    ]
  },
  "technicalRequirements": {
    "platform": "Cloud",
    "integrations": ["SIEM", "EDR"],
    "dataVolume": "50GB/day"
  }
}
```

**Response**: `201 Created`
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "title": "Technical Risk Assessment - ACME Corp",
  "status": "draft",
  "priority": "high",
  "completionPercentage": 0,
  "createdAt": "2025-10-20T10:30:00Z",
  "version": 1
}
```

**Validation Rules**:
- `title`: Required, 1-255 characters
- `priority`: Must be one of: `low`, `medium`, `high`, `critical`
- `dueDate`: Must be future date
- `linkedPovId`: Must reference existing POV (if provided)

**Events Published**:
- `trr.created`

---

#### 2. List TRRs

**Endpoint**: `GET /records`

**Query Parameters**:
- `userId`: Filter by user (default: current user)
- `status`: Filter by status (e.g., `draft`, `in-progress`)
- `priority`: Filter by priority
- `fromDate`: Filter by creation date (ISO 8601)
- `toDate`: Filter by creation date (ISO 8601)
- `search`: Full-text search in title/description
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `orderBy`: Sort field (default: `createdAt`)
- `order`: Sort order (`asc` or `desc`, default: `desc`)

**Example**:
```
GET /records?status=in-progress&priority=high&limit=10
```

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "title": "Technical Risk Assessment - ACME Corp",
      "status": "in-progress",
      "priority": "high",
      "completionPercentage": 35,
      "customerName": "ACME Corporation",
      "dueDate": "2025-11-15",
      "createdAt": "2025-10-20T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

#### 3. Get TRR by ID

**Endpoint**: `GET /records/:id`

**Response**: `200 OK`
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "title": "Technical Risk Assessment - ACME Corp",
  "description": "Comprehensive TRR for ACME Corp POV",
  "status": "in-progress",
  "priority": "high",
  "completionPercentage": 35,
  "projectName": "ACME Corp Security POV",
  "customerName": "ACME Corporation",
  "linkedPovId": "550e8400-e29b-41d4-a716-446655440000",
  "dueDate": "2025-11-15",
  "scope": {
    "objectives": ["..."],
    "deliverables": ["..."]
  },
  "technicalRequirements": {
    "platform": "Cloud",
    "integrations": ["SIEM", "EDR"]
  },
  "findings": [],
  "recommendations": [],
  "activities": [
    {
      "id": "a1b2c3d4",
      "activityType": "demo",
      "activityTitle": "Ransomware Detection Demo",
      "occurredAt": "2025-10-22T14:00:00Z"
    }
  ],
  "createdAt": "2025-10-20T10:30:00Z",
  "updatedAt": "2025-10-22T15:30:00Z",
  "version": 3
}
```

**Errors**:
- `404 Not Found`: TRR does not exist
- `403 Forbidden`: User does not have access

---

#### 4. Update TRR

**Endpoint**: `PUT /records/:id`

**Request**:
```json
{
  "title": "Updated Title",
  "status": "in-progress",
  "completionPercentage": 50,
  "findings": [
    {
      "id": "finding-1",
      "title": "Ransomware detection successful",
      "severity": "high",
      "description": "Successfully detected ransomware in test environment"
    }
  ]
}
```

**Response**: `200 OK`
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "title": "Updated Title",
  "status": "in-progress",
  "completionPercentage": 50,
  "version": 4,
  "updatedAt": "2025-10-23T09:00:00Z"
}
```

**Events Published**:
- `trr.updated`
- `trr.status.changed` (if status changed)

**Version Control**:
- Every update increments `version` field
- Full snapshot saved to `trr_versions` table
- JSON diff of changes saved

---

#### 5. Append Activity

**Endpoint**: `PATCH /records/:id/append`

**Request**:
```json
{
  "activityType": "demo",
  "activityTitle": "Customer Product Demo",
  "activityDescription": "Demonstrated ransomware detection capabilities",
  "activityData": {
    "scenario": "Ransomware Detection",
    "participants": ["john@acme.com", "jane@acme.com"],
    "outcomes": ["Successfully detected 5 ransomware variants"],
    "detectionsValidated": 5,
    "duration": 90
  },
  "occurredAt": "2025-10-22T14:00:00Z",
  "participants": ["user-uuid-1", "user-uuid-2"]
}
```

**Response**: `200 OK`
```json
{
  "activityId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "trrId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "activityType": "demo",
  "occurredAt": "2025-10-22T14:00:00Z",
  "createdAt": "2025-10-23T09:15:00Z"
}
```

**Events Published**:
- `trr.activity.appended`

**Activity Types**:
- `demo`: Product demonstration
- `scenario`: Scenario execution
- `finding`: Technical finding
- `meeting`: Meeting or call
- `validation`: Validation activity
- `custom`: Custom activity type

---

#### 6. Get Activity History

**Endpoint**: `GET /records/:id/history`

**Response**: `200 OK`
```json
{
  "trrId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "activities": [
    {
      "id": "activity-1",
      "activityType": "demo",
      "activityTitle": "Ransomware Detection Demo",
      "occurredAt": "2025-10-22T14:00:00Z",
      "performedBy": "user-uuid",
      "participants": ["john@acme.com"]
    }
  ],
  "total": 5
}
```

---

#### 7. Get Version History

**Endpoint**: `GET /records/:id/versions`

**Response**: `200 OK`
```json
{
  "trrId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "versions": [
    {
      "version": 4,
      "changedBy": "user-uuid",
      "changedAt": "2025-10-23T09:00:00Z",
      "changes": [
        {
          "field": "completionPercentage",
          "oldValue": 35,
          "newValue": 50
        }
      ]
    },
    {
      "version": 3,
      "changedBy": "user-uuid",
      "changedAt": "2025-10-22T15:30:00Z",
      "changes": [...]
    }
  ]
}
```

---

#### 8. Validate TRR

**Endpoint**: `POST /records/:id/validate`

**Response**: `200 OK`
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    "Due date is approaching in 3 days"
  ]
}
```

**Validation Checks**:
- All required fields present
- Status transitions valid
- Due date not in past
- Linked POV exists (if provided)
- Assigned users exist

---

#### 9. Delete TRR (Soft Delete)

**Endpoint**: `DELETE /records/:id`

**Response**: `204 No Content`

**Events Published**:
- `trr.deleted`

**Note**: This is a soft delete - record is marked as deleted but not removed from database.

---

## Event Schema

### Event: `trr.created`

```json
{
  "id": "event-uuid",
  "type": "trr.created",
  "aggregateId": "trr-uuid",
  "timestamp": "2025-10-20T10:30:00Z",
  "userId": "user-uuid",
  "payload": {
    "trrId": "trr-uuid",
    "title": "Technical Risk Assessment - ACME Corp",
    "status": "draft",
    "priority": "high"
  },
  "metadata": {
    "correlationId": "request-uuid",
    "source": "trr-service"
  }
}
```

### Event: `trr.activity.appended`

```json
{
  "id": "event-uuid",
  "type": "trr.activity.appended",
  "aggregateId": "trr-uuid",
  "timestamp": "2025-10-22T14:00:00Z",
  "userId": "user-uuid",
  "payload": {
    "trrId": "trr-uuid",
    "activityId": "activity-uuid",
    "activityType": "demo",
    "activityTitle": "Customer Product Demo"
  }
}
```

---

## Caching Strategy

### Cache Keys

- `trr:{id}`: Single TRR record (TTL: 5 minutes)
- `trr:user:{userId}`: User's TRR list (TTL: 2 minutes)
- `trr:list:{hash}`: List query result (TTL: 1 minute)

### Cache Invalidation

**On Create**:
- Invalidate: `trr:user:{userId}`

**On Update**:
- Invalidate: `trr:{id}`, `trr:user:{userId}`

**On Delete**:
- Invalidate: `trr:{id}`, `trr:user:{userId}`

**On Activity Append**:
- Invalidate: `trr:{id}`

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "TRR_NOT_FOUND",
    "message": "TRR with ID 'xyz' not found",
    "details": {},
    "timestamp": "2025-10-20T10:30:00Z",
    "requestId": "req-uuid"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `TRR_NOT_FOUND` | 404 | TRR does not exist |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | User lacks permission |
| `DUPLICATE_TRR` | 409 | TRR with same title exists |
| `INVALID_STATUS_TRANSITION` | 400 | Status transition not allowed |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `CACHE_ERROR` | 500 | Redis operation failed |

---

## Deployment

### Kubernetes Resources

**CPU**: 250m request, 500m limit
**Memory**: 256Mi request, 512Mi limit
**Replicas**: 3 (min), 10 (max)
**Autoscaling**: CPU >70%, Memory >80%

### Health Checks

**Liveness Probe**: `GET /health`
**Readiness Probe**: `GET /ready`
**Startup Probe**: `GET /health` (30 retries)

### Environment Variables

```env
DATABASE_URL=postgresql://user:pass@cloud-sql:5432/cortex_dc
REDIS_URL=redis://redis-service:6379
NATS_URL=nats://nats-service:4222
PORT=8080
NODE_ENV=production
LOG_LEVEL=info
JWT_PUBLIC_KEY=<public-key>
```

---

## Testing

### Unit Tests

- Test all service methods
- Mock Prisma client
- Test validation logic

### Integration Tests

- Test API endpoints with real database (test container)
- Test event publishing to NATS
- Test caching with Redis

### Load Tests

- Target: 500 RPS sustained
- P95 latency: <200ms
- Error rate: <1%

---

**Document End**
