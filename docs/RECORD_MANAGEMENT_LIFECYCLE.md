# Record Management & Data Lifecycle Guide

## Table of Contents
1. [Overview](#overview)
2. [Record Management Architecture](#record-management-architecture)
3. [Data Lifecycle](#data-lifecycle)
4. [Project Management](#project-management)
5. [Implementation Guide](#implementation-guide)
6. [Best Practices](#best-practices)

---

## Overview

This application uses a **record-based architecture** where all business entities (Projects, POVs, TRRs, Tasks, etc.) follow a consistent lifecycle pattern:

```
Create → Read → Update → Archive → Restore → Delete
    ↓       ↓       ↓        ↓         ↓        ↓
  Audit   Track   Version  Preserve  Recover  Purge
```

---

## Record Management Architecture

### Core Concepts

#### 1. Entity Hierarchy

```
Organization
 └── Users
 └── Projects
      ├── POVs (Proof of Value)
      │    ├── Scenarios
      │    ├── Test Cases
      │    └── Outcomes
      ├── TRRs (Technical Resource Requests)
      │    ├── Findings
      │    ├── Recommendations
      │    └── Approvals
      └── Tasks
           └── Subtasks
```

#### 2. Base Record Schema

All records share common fields:

```typescript
interface BaseRecord {
  // Identity
  id: string;
  organizationId: string;

  // Ownership
  createdBy: string;
  lastModifiedBy: string;
  owner?: string;
  team?: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;        // Soft delete
  archivedAt?: Date;       // Archive timestamp

  // Versioning
  version: number;

  // Metadata
  tags?: string[];
  metadata?: Record<string, any>;
}
```

#### 3. Record States

```typescript
type RecordState =
  | 'draft'           // Initial creation, not finalized
  | 'active'          // In use, operational
  | 'pending'         // Awaiting action/approval
  | 'in_progress'     // Work in progress
  | 'completed'       // Finished successfully
  | 'archived'        // Preserved but not active
  | 'deleted';        // Soft deleted
```

---

## Data Lifecycle

### Phase 1: Creation

**Creating a New Record:**

```typescript
// 1. User initiates creation
function createTRR(data: CreateTRRInput) {
  // 2. Validate input
  const validated = CreateTRRSchema.parse(data);

  // 3. Enrich with metadata
  const record = {
    ...validated,
    id: generateId(),
    createdBy: currentUser.uid,
    lastModifiedBy: currentUser.uid,
    organizationId: currentUser.organizationId,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    status: 'draft',
  };

  // 4. Save to database
  await db.create('trrs', record);

  // 5. Create audit log
  await createAuditLog({
    action: 'create',
    entityType: 'trr',
    entityId: record.id,
    userId: currentUser.uid,
    changes: record,
  });

  // 6. Trigger webhooks/events
  await publishEvent('trr.created', record);

  return record;
}
```

**What Happens:**
- Unique ID generated
- User context attached (createdBy, organizationId)
- Timestamps recorded
- Version number initialized
- Audit trail started
- Events published for integrations

### Phase 2: Reading & Querying

**Fetching Records:**

```typescript
// Single record
function getTRR(id: string, userId: string) {
  // 1. Fetch with authorization
  const trr = await db.findOne('trrs', id);

  // 2. Check ownership
  if (trr.createdBy !== userId && !trr.team?.includes(userId)) {
    throw new UnauthorizedError();
  }

  // 3. Track access
  await logAccess({
    userId,
    entityType: 'trr',
    entityId: id,
    action: 'view',
  });

  return trr;
}

// List with filters
function listTRRs(filters: TRRFilters) {
  return db.findMany('trrs', {
    filters: [
      { field: 'createdBy', operator: '==', value: userId },
      { field: 'status', operator: 'in', value: filters.statuses },
      { field: 'deletedAt', operator: '==', value: null }, // Exclude deleted
    ],
    orderBy: 'createdAt',
    orderDirection: 'desc',
    limit: filters.limit || 50,
    offset: (filters.page - 1) * (filters.limit || 50),
  });
}
```

**Querying Over Time:**

```typescript
// Get record history
function getTRRHistory(id: string) {
  return db.findMany('audit_logs', {
    filters: [
      { field: 'entityType', operator: '==', value: 'trr' },
      { field: 'entityId', operator: '==', value: id },
    ],
    orderBy: 'timestamp',
    orderDirection: 'desc',
  });
}

// Get record at specific time
function getTRRAtTime(id: string, timestamp: Date) {
  const history = await getTRRHistory(id);

  // Replay changes up to timestamp
  let record = {};
  for (const log of history.reverse()) {
    if (log.timestamp <= timestamp) {
      record = { ...record, ...log.changes };
    }
  }

  return record;
}

// Get records changed in date range
function getTRRsChangedBetween(start: Date, end: Date) {
  return db.findMany('trrs', {
    filters: [
      { field: 'updatedAt', operator: '>=', value: start },
      { field: 'updatedAt', operator: '<=', value: end },
    ],
  });
}
```

### Phase 3: Updating

**Updating a Record:**

```typescript
function updateTRR(id: string, updates: UpdateTRRInput, userId: string) {
  // 1. Fetch current state
  const current = await getTRR(id, userId);

  // 2. Validate updates
  const validated = UpdateTRRSchema.parse(updates);

  // 3. Calculate changes
  const changes = diff(current, validated);

  // 4. Update record
  const updated = await db.update('trrs', id, {
    ...validated,
    lastModifiedBy: userId,
    updatedAt: new Date(),
    version: current.version + 1,
  });

  // 5. Create audit log
  await createAuditLog({
    action: 'update',
    entityType: 'trr',
    entityId: id,
    userId,
    before: current,
    after: updated,
    changes,
  });

  // 6. Trigger events
  await publishEvent('trr.updated', { id, changes });

  return updated;
}
```

**Change Tracking:**

```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'archive' | 'restore';
  entityType: string;
  entityId: string;
  before?: any;
  after?: any;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ip?: string;
  userAgent?: string;
}
```

### Phase 4: Archiving

**Archiving vs Deleting:**

```typescript
// Archive (preserve data, make inactive)
function archiveTRR(id: string, userId: string) {
  return db.update('trrs', id, {
    archivedAt: new Date(),
    lastModifiedBy: userId,
    status: 'archived',
  });
}

// Restore from archive
function restoreTRR(id: string, userId: string) {
  return db.update('trrs', id, {
    archivedAt: null,
    lastModifiedBy: userId,
    status: 'active',
  });
}

// Soft delete (can be recovered)
function deleteTRR(id: string, userId: string) {
  return db.update('trrs', id, {
    deletedAt: new Date(),
    lastModifiedBy: userId,
  });
}

// Hard delete (permanent)
function permanentlyDeleteTRR(id: string, userId: string) {
  // Only allowed for superadmins
  if (!isSuperAdmin(userId)) {
    throw new UnauthorizedError();
  }

  // Archive audit logs first
  await archiveAuditLogs('trr', id);

  // Delete record
  return db.delete('trrs', id);
}
```

### Phase 5: Analytics & Reporting

**Lifecycle Analytics:**

```typescript
interface RecordLifecycleMetrics {
  totalRecords: number;
  activeRecords: number;
  archivedRecords: number;
  deletedRecords: number;

  avgTimeToCompletion: number;  // ms
  completionRate: number;        // percentage

  createdThisWeek: number;
  createdThisMonth: number;
  createdThisYear: number;

  updatesThisWeek: number;
  mostActiveUsers: { userId: string; count: number }[];

  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
}

function getLifecycleMetrics(entityType: string): RecordLifecycleMetrics {
  // Aggregate from records and audit logs
  const records = await db.findMany(entityType, {});
  const logs = await db.findMany('audit_logs', {
    filters: [{ field: 'entityType', operator: '==', value: entityType }],
  });

  return calculateMetrics(records, logs);
}
```

---

## Project Management

### Project Lifecycle

```typescript
interface Project extends BaseRecord {
  title: string;
  description: string;
  customer: {
    name: string;
    industry: string;
    size: 'startup' | 'small' | 'medium' | 'enterprise';
    contact: {
      name: string;
      email: string;
      role: string;
    };
  };
  status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';

  // Timeline
  startDate: Date;
  endDate?: Date;
  milestones: Milestone[];

  // Value tracking
  estimatedValue?: number;
  actualValue?: number;

  // Relations
  povIds: string[];
  trrIds: string[];
  taskIds: string[];

  // Team
  owner: string;
  team: string[];
}
```

### Project Management Features

#### 1. Project Creation & Setup

```typescript
async function createProject(data: CreateProjectInput) {
  // 1. Create project record
  const project = await db.create('projects', {
    ...data,
    status: 'draft',
    createdBy: currentUser.uid,
    organizationId: currentUser.organizationId,
  });

  // 2. Create default milestones
  await createDefaultMilestones(project.id);

  // 3. Set up team permissions
  await setupTeamPermissions(project.id, data.team);

  // 4. Initialize tracking
  await initializeProjectTracking(project.id);

  return project;
}
```

#### 2. Milestone Tracking

```typescript
interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
  dependencies: string[];  // Other milestone IDs
  deliverables: string[];
  owner?: string;
}

function trackMilestoneProgress(projectId: string) {
  const milestones = await getMilestones(projectId);

  return milestones.map(m => ({
    ...m,
    progress: calculateMilestoneProgress(m),
    daysRemaining: differenceInDays(m.dueDate, new Date()),
    isBlocked: hasBlockedDependencies(m),
  }));
}
```

#### 3. Resource Management

```typescript
interface Resource {
  type: 'personnel' | 'equipment' | 'software' | 'budget';
  name: string;
  allocation: number;     // hours/units
  utilized: number;       // actual usage
  cost?: number;
}

function trackResourceUtilization(projectId: string) {
  const resources = await getProjectResources(projectId);

  return {
    personnel: {
      allocated: sum(resources, 'personnel', 'allocation'),
      utilized: sum(resources, 'personnel', 'utilized'),
      efficiency: calculateEfficiency(resources, 'personnel'),
    },
    budget: {
      allocated: sum(resources, 'budget', 'cost'),
      spent: sum(resources, 'budget', 'utilized'),
      remaining: calculateRemaining(resources, 'budget'),
    },
  };
}
```

#### 4. Timeline Visualization

```typescript
interface TimelineEvent {
  id: string;
  projectId: string;
  type: 'milestone' | 'pov' | 'trr' | 'task' | 'meeting';
  title: string;
  date: Date;
  duration?: number;  // days
  status: string;
  metadata?: any;
}

function getProjectTimeline(projectId: string): TimelineEvent[] {
  const events = await db.findMany('timeline_events', {
    filters: [{ field: 'projectId', operator: '==', value: projectId }],
    orderBy: 'date',
  });

  return events;
}
```

#### 5. Progress Tracking

```typescript
interface ProjectProgress {
  overall: number;              // 0-100%
  byPhase: Record<string, number>;
  byType: {
    povs: { total: number; completed: number; percentage: number };
    trrs: { total: number; completed: number; percentage: number };
    tasks: { total: number; completed: number; percentage: number };
  };
  timeline: {
    daysElapsed: number;
    daysRemaining: number;
    percentTimeElapsed: number;
  };
  velocity: {
    itemsPerWeek: number;
    trend: 'up' | 'down' | 'stable';
  };
}

function calculateProjectProgress(projectId: string): ProjectProgress {
  const project = await getProject(projectId);
  const povs = await getPOVs(projectId);
  const trrs = await getTRRs(projectId);
  const tasks = await getTasks(projectId);

  return {
    overall: calculateOverallProgress(project, povs, trrs, tasks),
    byPhase: calculatePhaseProgress(project),
    byType: {
      povs: calculateTypeProgress(povs),
      trrs: calculateTypeProgress(trrs),
      tasks: calculateTypeProgress(tasks),
    },
    timeline: calculateTimelineProgress(project),
    velocity: calculateVelocity(project),
  };
}
```

---

## Implementation Guide

### 1. Setting Up a New Entity

**Step 1: Define Schema**

```typescript
// packages/db/src/schemas/entity.ts
import { z } from 'zod';

export const EntitySchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  title: z.string().min(1).max(200),
  status: z.enum(['draft', 'active', 'completed']),
  createdBy: z.string(),
  lastModifiedBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
  version: z.number(),
});

export const CreateEntitySchema = EntitySchema.omit({
  id: true,
  createdBy: true,
  lastModifiedBy: true,
  createdAt: true,
  updatedAt: true,
  version: true,
});

export type Entity = z.infer<typeof EntitySchema>;
export type CreateEntityInput = z.infer<typeof CreateEntitySchema>;
```

**Step 2: Create API Routes**

```typescript
// packages/api-server/src/routes/entity.routes.ts
import { Router } from 'express';
import { getDatabase } from '@cortex/db/src/adapters/database.factory';
import { validateCreateEntity, validateUpdateEntity } from '@cortex/db/src/schemas/entity';

const router = Router();

// List
router.get('/', async (req, res) => {
  const db = getDatabase();
  const entities = await db.findMany('entities', {
    filters: [
      { field: 'createdBy', operator: '==', value: req.user?.uid },
      { field: 'deletedAt', operator: '==', value: null },
    ],
  });
  res.json({ data: entities });
});

// Get one
router.get('/:id', async (req, res) => {
  const db = getDatabase();
  const entity = await db.findOne('entities', req.params.id);

  if (!entity) {
    return res.status(404).json({ error: 'Not found' });
  }

  if (entity.createdBy !== req.user?.uid) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({ data: entity });
});

// Create
router.post('/', async (req, res) => {
  const validation = validateCreateEntity(req.body);

  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }

  const db = getDatabase();
  const now = new Date();

  const entity = await db.create('entities', {
    ...validation.data,
    createdBy: req.user?.uid,
    lastModifiedBy: req.user?.uid,
    createdAt: now,
    updatedAt: now,
    version: 1,
  });

  res.status(201).json({ data: entity });
});

// Update
router.put('/:id', async (req, res) => {
  const db = getDatabase();
  const existing = await db.findOne('entities', req.params.id);

  if (!existing || existing.createdBy !== req.user?.uid) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const validation = validateUpdateEntity(req.body);

  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }

  const updated = await db.update('entities', req.params.id, {
    ...validation.data,
    lastModifiedBy: req.user?.uid,
    updatedAt: new Date(),
    version: existing.version + 1,
  });

  res.json({ data: updated });
});

// Delete (soft)
router.delete('/:id', async (req, res) => {
  const db = getDatabase();
  const existing = await db.findOne('entities', req.params.id);

  if (!existing || existing.createdBy !== req.user?.uid) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await db.update('entities', req.params.id, {
    deletedAt: new Date(),
    lastModifiedBy: req.user?.uid,
  });

  res.status(204).send();
});

export const entityRoutes = router;
```

**Step 3: Create UI Components**

```typescript
// packages/ui/src/components/entity/EntityList.tsx
'use client';

import { useEntities } from '@/lib/hooks/use-api';
import { DataTable } from '../primitives/DataTable';

export function EntityList() {
  const { data: entities, isLoading } = useEntities();

  const columns = [
    { key: 'title', title: 'Title', sortable: true },
    { key: 'status', title: 'Status', sortable: true },
    { key: 'createdAt', title: 'Created', sortable: true, render: (val) => new Date(val).toLocaleDateString() },
  ];

  return (
    <DataTable
      data={entities}
      columns={columns}
      loading={isLoading}
      searchable
      exportable
    />
  );
}
```

**Step 4: Add to Navigation**

```typescript
// apps/web/app/layout.tsx
const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'POVs', href: '/pov', icon: Target },
  { name: 'TRRs', href: '/trr', icon: FileText },
  { name: 'Entities', href: '/entities', icon: Database }, // NEW
];
```

### 2. Tracking Changes Over Time

**Implement Audit Logging:**

```typescript
// packages/db/src/services/audit-service.ts
export async function createAuditLog(log: CreateAuditLogInput) {
  const db = getDatabase();

  return db.create('audit_logs', {
    ...log,
    timestamp: new Date(),
    id: generateId(),
  });
}

export async function getEntityHistory(entityType: string, entityId: string) {
  const db = getDatabase();

  return db.findMany('audit_logs', {
    filters: [
      { field: 'entityType', operator: '==', value: entityType },
      { field: 'entityId', operator: '==', value: entityId },
    ],
    orderBy: 'timestamp',
    orderDirection: 'desc',
  });
}

export async function getEntityAtTime(
  entityType: string,
  entityId: string,
  timestamp: Date
) {
  const history = await getEntityHistory(entityType, entityId);

  // Reconstruct entity state at given time
  let state = {};
  for (const log of history.reverse()) {
    if (log.timestamp <= timestamp) {
      if (log.action === 'create') {
        state = log.after;
      } else if (log.action === 'update') {
        state = { ...state, ...log.changes };
      }
    }
  }

  return state;
}
```

**Display History in UI:**

```typescript
// packages/ui/src/components/entity/EntityHistory.tsx
export function EntityHistory({ entityId, entityType }) {
  const { data: history } = useEntityHistory(entityType, entityId);

  return (
    <div className="space-y-4">
      {history.map((log) => (
        <div key={log.id} className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {getActionIcon(log.action)}
          </div>
          <div className="flex-1">
            <p className="font-medium">{log.action}</p>
            <p className="text-sm text-gray-600">
              by {log.userName} on {formatDate(log.timestamp)}
            </p>
            {log.changes && (
              <div className="mt-2">
                {log.changes.map((change) => (
                  <div key={change.field} className="text-sm">
                    <span className="font-medium">{change.field}:</span>
                    <span className="text-red-600 line-through">
                      {change.oldValue}
                    </span>
                    →
                    <span className="text-green-600">
                      {change.newValue}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Best Practices

### 1. Always Use Soft Deletes

```typescript
// ✅ Good
await db.update('entities', id, { deletedAt: new Date() });

// ❌ Bad
await db.delete('entities', id);
```

### 2. Track All Changes

```typescript
// Before update
const before = await db.findOne('entities', id);

// After update
const after = await db.update('entities', id, updates);

// Log change
await createAuditLog({
  action: 'update',
  entityType: 'entity',
  entityId: id,
  userId: currentUser.uid,
  before,
  after,
  changes: diff(before, after),
});
```

### 3. Version Everything

```typescript
// Increment version on update
await db.update('entities', id, {
  ...updates,
  version: current.version + 1,
  updatedAt: new Date(),
});
```

### 4. Use Optimistic Locking

```typescript
// Check version before update
if (updates.version !== current.version) {
  throw new ConflictError('Entity was modified by another user');
}
```

### 5. Provide Time-Travel Queries

```typescript
// Query as of specific date
const snapshot = await getEntityAtTime('entity', id, new Date('2025-01-01'));
```

---

## Summary

This architecture provides:

✅ **Complete audit trail** - Every change is logged
✅ **Time travel** - View data at any point in history
✅ **Soft deletes** - Data can be recovered
✅ **Version control** - Prevent conflicting updates
✅ **User isolation** - Data scoped to organizations/users
✅ **Project management** - Track progress, resources, timelines
✅ **Analytics** - Understand data lifecycle patterns

All records follow this pattern, making the system predictable, auditable, and maintainable.
