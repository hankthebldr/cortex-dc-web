# Access Control & Federated Data System

## Overview

This system implements a sophisticated multi-tier access control model with:

- **Federated User Spaces**: Users see only their own data by default
- **Group-Based Permissions**: Managers see data from users in their groups
- **Admin Omniscience**: Admins have full visibility across all data
- **Audit Logging**: All access attempts are logged for security and compliance

---

## Architecture

### Access Levels

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN (Global Scope)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Can see ALL users, groups, and data                 │  │
│  │   Full CRUD operations on everything                  │  │
│  │   Access audit logs and system metrics                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          ▲
          │
┌─────────┴───────────────────────────────────────────────────┐
│               MANAGER (Group Scope)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Can see own data + data from managed groups         │  │
│  │   Can manage users in assigned groups                 │  │
│  │   Can view/edit group member contributions            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          ▲
          │
┌─────────┴───────────────────────────────────────────────────┐
│                  USER (Personal Scope)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Can see ONLY own data                               │  │
│  │   Full CRUD on own resources                          │  │
│  │   Cannot see other users' data                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Services

### 1. Access Control Service

Handles permissions and access checks.

```typescript
import { accessControlService } from '@cortex/db';

// Build access context for a user
const context = await accessControlService.buildAccessContext(userId);

// Check if user can access a resource
const { granted, reason } = await accessControlService.canAccess(
  context,
  'povs', // collection
  'pov-123', // resource ID
  'read' // action
);

if (!granted) {
  console.log(`Access denied: ${reason}`);
}
```

### 2. Group Management Service

Manages groups and team hierarchies.

```typescript
import { groupManagementService } from '@cortex/db';

// Create a group
const result = await groupManagementService.createGroup(context, {
  name: 'Engineering Team',
  managerId: 'user-123',
  initialMembers: ['user-456', 'user-789'],
  department: 'Engineering',
  tags: ['technical', 'product']
});

// Add member to group
await groupManagementService.addMember(context, groupId, userId);

// Get groups user can access
const groups = await groupManagementService.getAccessibleGroups(context);
```

### 3. Federated Data Service

High-level data operations with automatic access control.

```typescript
import { federatedDataService } from '@cortex/db';

// Query data (automatically filtered by access level)
const result = await federatedDataService.query('povs', context, {
  filters: [{ field: 'status', operator: '==', value: 'active' }],
  includeGroupData: true, // Managers will see group data
  limit: 50
});

console.log(`Scope: ${result.scope}`); // 'user', 'group', or 'global'
console.log(`Found ${result.data.length} POVs`);
```

---

## Usage Examples

### Example 1: Regular User Creating a POV

```typescript
import { federatedDataService, accessControlService } from '@cortex/db';

async function createPOV(userId: string, povData: any) {
  // Build access context
  const context = await accessControlService.buildAccessContext(userId);

  // Create POV (automatically owned by user)
  const result = await federatedDataService.create('povs', povData, context, {
    groupIds: context.groups // Share with user's groups
  });

  if (result.success) {
    console.log(`POV created: ${result.id}`);
    // User can now see and edit this POV
    // Group members can see it (if shared)
    // Manager can see it (if they manage the group)
  }
}
```

### Example 2: Manager Viewing Team's POVs

```typescript
async function viewTeamPOVs(managerId: string) {
  const context = await accessControlService.buildAccessContext(managerId);

  // Manager sees own POVs + group POVs
  const result = await federatedDataService.query('povs', context, {
    includeGroupData: true, // KEY: Include data from managed groups
    orderBy: 'createdAt',
    limit: 100
  });

  console.log(`Manager sees ${result.data.length} POVs`);
  console.log(`Scope: ${result.scope}`); // 'group'

  // Can also get specific team members
  const teamMembers = await accessControlService.getManagedUsers(context);
  console.log(`Managing ${teamMembers.length} users`);
}
```

### Example 3: Admin Viewing All Data

```typescript
async function adminViewAllPOVs(adminId: string) {
  const context = await accessControlService.buildAccessContext(adminId);

  // Admin sees EVERYTHING
  const result = await federatedDataService.query('povs', context, {
    orderBy: 'createdAt',
    limit: 1000
  });

  console.log(`Admin sees ${result.data.length} POVs`);
  console.log(`Scope: ${result.scope}`); // 'global'

  // Admin can also view access logs
  const logs = await accessControlService.getAccessLogs(context, {
    resource: 'povs',
    limit: 50
  });
}
```

### Example 4: Group-Based Data Isolation

```typescript
import { groupManagementService } from '@cortex/db';

async function setupTeamStructure() {
  // Admin creates groups
  const adminContext = await accessControlService.buildAccessContext(adminId);

  // Engineering team
  const engTeam = await groupManagementService.createGroup(adminContext, {
    name: 'Engineering',
    managerId: 'manager-1',
    initialMembers: ['dev-1', 'dev-2', 'dev-3'],
    department: 'Engineering'
  });

  // Sales team
  const salesTeam = await groupManagementService.createGroup(adminContext, {
    name: 'Sales',
    managerId: 'manager-2',
    initialMembers: ['sales-1', 'sales-2'],
    department: 'Sales'
  });

  // Now dev-1 can only see Engineering POVs
  // manager-1 can see all Engineering team POVs
  // manager-2 can see all Sales team POVs
  // Admin can see both teams
}
```

### Example 5: Sharing Data Across Groups

```typescript
async function sharePOVWithAnotherTeam(userId: string, povId: string) {
  const context = await accessControlService.buildAccessContext(userId);

  // Share with specific groups
  const result = await accessControlService.shareResource(
    context,
    'povs',
    povId,
    {
      groupIds: ['group-xyz'] // Another team's group
    }
  );

  if (result.success) {
    console.log('POV shared with other team');
    // Now both teams can see this POV
  }
}
```

---

## Data Model

### User Profile with Group Membership

```typescript
interface UserProfile {
  uid: string;
  email: string;
  role: 'user' | 'manager' | 'admin';
  teams: string[]; // Group IDs user belongs to
  manager?: string; // Manager's user ID
  department?: string;
}
```

### Group Structure

```typescript
interface Group {
  id: string;
  name: string;
  managerId: string; // User who manages this group
  memberIds: string[]; // All members
  parentGroupId?: string; // Hierarchical structure
  childGroupIds: string[];
  organizationId?: string;
}
```

### Data with Access Scope

```typescript
interface POV {
  id: string;
  ownerId: string; // Creator/owner
  groupIds: string[]; // Groups that can access
  sharedWithUsers?: string[]; // Individual shares
  // ... other POV fields
}
```

---

## Access Control Patterns

### Pattern 1: User Isolation (Default)

```typescript
// Regular users see ONLY their data
const userContext = await accessControlService.buildAccessContext(regularUserId);

// This query returns only POVs where ownerId === regularUserId
const myPOVs = await federatedDataService.query('povs', userContext);
```

### Pattern 2: Manager Group Scope

```typescript
// Managers see own data + managed group data
const managerContext = await accessControlService.buildAccessContext(managerId);

// This query returns:
// 1. POVs where ownerId === managerId
// 2. POVs where groupIds contains any of manager's managed groups
const teamPOVs = await federatedDataService.query('povs', managerContext, {
  includeGroupData: true // KEY setting
});
```

### Pattern 3: Admin Omniscience

```typescript
// Admins see ALL data
const adminContext = await accessControlService.buildAccessContext(adminId);

// This query returns ALL POVs (no filtering)
const allPOVs = await federatedDataService.query('povs', adminContext);
```

---

## Security Features

### 1. Audit Logging

All access attempts are logged:

```typescript
// Automatic logging on every access
await federatedDataService.getOne('povs', 'pov-123', context);

// Access log created:
{
  userId: 'user-123',
  action: 'read',
  resource: 'povs',
  resourceId: 'pov-123',
  accessGranted: true/false,
  reason: 'Owner access' | 'Group member access' | 'No access permission',
  timestamp: Date,
  metadata: {
    userRole: 'user' | 'manager' | 'admin',
    ipAddress: '...',
    userAgent: '...'
  }
}
```

### 2. Access Checks

Every operation checks permissions:

```typescript
// Before read
const canRead = await accessControlService.canAccess(
  context, 'povs', 'pov-123', 'read'
);

// Before write
const canWrite = await accessControlService.canAccess(
  context, 'povs', 'pov-123', 'write'
);

// Before delete
const canDelete = await accessControlService.canAccess(
  context, 'povs', 'pov-123', 'delete'
);
```

### 3. Automatic Ownership

Created data is automatically owned:

```typescript
// When user creates a POV
await federatedDataService.create('povs', povData, context);

// Automatically sets:
{
  ownerId: context.userId,
  createdBy: context.userId,
  groupIds: context.groups,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Performance Optimizations

### 1. Query Caching

```typescript
// First query - hits database
const result1 = await federatedDataService.query('povs', context);

// Second query - uses cache (5 min TTL)
const result2 = await federatedDataService.query('povs', context);

// Get cache stats
const stats = federatedDataService.getCacheStats();
console.log(`Cache size: ${stats.size}, TTL: ${stats.ttl}ms`);
```

### 2. Batch Operations

```typescript
// Create multiple POVs efficiently
const results = await federatedDataService.batchCreate(
  'povs',
  [pov1, pov2, pov3],
  context
);

console.log(`Created: ${results.success}, Failed: ${results.failed}`);
```

### 3. Access Statistics

```typescript
// Get overview of user's data access
const stats = await federatedDataService.getAccessStats(
  context,
  ['povs', 'trrs', 'projects']
);

console.log(stats);
// {
//   povs: {
//     userDataCount: 5,      // Own POVs
//     groupDataCount: 20,    // Group POVs (if manager)
//     totalAccessible: 25,
//     cacheHitRate: 0.75
//   },
//   trrs: { ... }
// }
```

---

## Migration from Direct Database Access

### Before (Direct Access - No Isolation)

```typescript
import { getDatabase } from '@cortex/db';

const db = getDatabase();
const povs = await db.findMany('povs', {}); // Gets ALL POVs!
```

### After (Federated Access - Automatic Isolation)

```typescript
import { federatedDataService, accessControlService } from '@cortex/db';

const context = await accessControlService.buildAccessContext(userId);
const result = await federatedDataService.query('povs', context);
// Gets only POVs user can access based on role
```

---

## Best Practices

### 1. Always Build Context First

```typescript
// ✅ GOOD
const context = await accessControlService.buildAccessContext(userId);
await federatedDataService.query('povs', context);

// ❌ BAD - Skip context building
const db = getDatabase();
await db.findMany('povs', {}); // No access control!
```

### 2. Use Federated Service for User Data

```typescript
// ✅ GOOD - Automatic access control
await federatedDataService.query('povs', context);

// ❌ BAD - Manual filtering (error-prone)
const povs = await db.findMany('povs', {
  filters: [{ field: 'ownerId', operator: '==', value: userId }]
});
```

### 3. Respect Group Boundaries

```typescript
// ✅ GOOD - Only managers get group data
const result = await federatedDataService.query('povs', context, {
  includeGroupData: context.role === 'manager' // Conditional
});

// ❌ BAD - Regular users shouldn't see group data
const result = await federatedDataService.query('povs', context, {
  includeGroupData: true // Always true
});
```

### 4. Log Sensitive Operations

```typescript
// Audit logs are automatic, but you can add custom logs
await accessControlService.logAccess({
  userId: context.userId,
  action: 'share',
  resource: 'povs',
  resourceId: povId,
  accessGranted: true,
  metadata: {
    userRole: context.role,
    customField: 'value'
  }
});
```

---

## Troubleshooting

### Issue: Manager Not Seeing Group Data

**Problem**: Manager can't see team members' POVs

**Solution**: Ensure `includeGroupData: true` is set

```typescript
const result = await federatedDataService.query('povs', context, {
  includeGroupData: true // Required for group scope
});
```

### Issue: User Seeing Data They Shouldn't

**Problem**: Data leaking across groups

**Solution**: Check group membership and ownership

```typescript
// Verify group membership
const groups = await groupManagementService.getAccessibleGroups(context);
console.log('User groups:', groups.map(g => g.id));

// Check POV ownership
const pov = await db.findOne('povs', povId);
console.log('POV owner:', pov.ownerId);
console.log('POV groups:', pov.groupIds);
```

### Issue: Performance Degradation

**Problem**: Slow queries for managers with large teams

**Solution**: Use pagination and caching

```typescript
const result = await federatedDataService.query('povs', context, {
  includeGroupData: true,
  limit: 50, // Paginate
  offset: 0
});

// Clear cache if data is stale
federatedDataService.clearCache();
```

---

## API Reference

### AccessControlService

- `buildAccessContext(userId)` - Build access context
- `canAccess(context, resource, resourceId, action)` - Check access
- `getAccessibleData(collection, context, options)` - Query with access control
- `getManagedUsers(context)` - Get users manager can see
- `logAccess(log)` - Log access attempt
- `getAccessLogs(context, filters)` - Get audit logs (admin only)
- `shareResource(context, resource, resourceId, shareWith)` - Share data

### GroupManagementService

- `createGroup(context, request)` - Create new group
- `getGroup(context, groupId)` - Get group with access check
- `getAccessibleGroups(context, filters)` - Get user's groups
- `addMember(context, groupId, userId)` - Add member to group
- `removeMember(context, groupId, userId)` - Remove member from group
- `transferManagement(context, groupId, newManagerId)` - Transfer management
- `getGroupMembers(context, groupId)` - Get all members
- `getGroupHierarchy(context, rootGroupId)` - Get hierarchical tree
- `deleteGroup(context, groupId, options)` - Delete group

### FederatedDataService

- `query(collection, context, options)` - Query with access control
- `getOne(collection, id, context)` - Get single item with check
- `create(collection, data, context, options)` - Create with ownership
- `update(collection, id, updates, context)` - Update with check
- `delete(collection, id, context)` - Delete with check
- `batchCreate(collection, items, context)` - Batch create
- `getAccessStats(context, collections)` - Get access statistics
- `clearCache()` - Clear query cache
- `getCacheStats()` - Get cache metrics

---

## Summary

This access control system provides:

✅ **Data Isolation**: Users see only their own data by default
✅ **Group Permissions**: Managers see data from managed groups
✅ **Admin Access**: Admins have full visibility
✅ **Audit Logging**: All access attempts logged
✅ **Performance**: Query caching and optimizations
✅ **Security**: Automatic access checks on all operations
✅ **Flexibility**: Easy to extend and customize

Use the **FederatedDataService** for all user-facing queries to ensure proper access control!
