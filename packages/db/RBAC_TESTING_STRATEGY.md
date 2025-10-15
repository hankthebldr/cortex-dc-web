# RBAC & Data Visibility Testing Strategy

## Overview

This document outlines the testing strategy for Role-Based Access Control (RBAC) and data visibility with Okta group association.

---

## Test Environment Setup

### 1. Mock Data

Located in: `src/test-data/mock-users-with-groups.ts`

**User Hierarchy**:
```
Admin (admin-001)
├── Engineering Manager (manager-eng-001)
│   ├── Backend Engineer (user-eng-001)
│   ├── Frontend Engineer (user-eng-002)
│   └── Full Stack Engineer (user-eng-003)
├── Sales Manager (manager-sales-001)
│   ├── Enterprise Sales (user-sales-001)
│   └── SMB Sales (user-sales-002)
└── Operations Manager (manager-ops-001)
    └── Support Engineer (user-ops-001)

Isolated User (user-isolated-001) - No team/manager
```

**Group Structure**:
```
Organization: cortex-org
├── Engineering Department
│   ├── Backend Engineering (group-eng-backend)
│   │   └── Members: user-eng-001, user-eng-003
│   └── Frontend Engineering (group-eng-frontend)
│       └── Members: user-eng-002, user-eng-003
├── Sales Department
│   ├── Enterprise Sales (group-sales-enterprise)
│   │   └── Members: user-sales-001
│   └── SMB Sales (group-sales-smb)
│       └── Members: user-sales-002
└── Operations Department
    └── Customer Support (group-ops-support)
        └── Members: user-ops-001
```

---

## Test Categories

### Category 1: User Data Isolation Tests

**Objective**: Verify users can only see their own data

#### Test 1.1: Regular User Sees Only Own POVs

```typescript
import { federatedDataService, accessControlService } from '@cortex/db';
import { mockUsers } from './test-data/mock-users-with-groups';

async function testUserDataIsolation() {
  // Setup: Create POVs for different users
  const davidContext = await accessControlService.buildAccessContext('user-eng-001');
  const eveContext = await accessControlService.buildAccessContext('user-eng-002');

  // David creates a POV
  await federatedDataService.create('povs', {
    title: 'David POV',
    status: 'active'
  }, davidContext);

  // Eve creates a POV
  await federatedDataService.create('povs', {
    title: 'Eve POV',
    status: 'active'
  }, eveContext);

  // Test: David queries POVs
  const davidPOVs = await federatedDataService.query('povs', davidContext);

  // Assertions
  assert(davidPOVs.scope === 'user', 'Scope should be user');
  assert(davidPOVs.data.length === 1, 'Should see only 1 POV');
  assert(davidPOVs.data[0].title === 'David POV', 'Should be own POV');
  assert(davidPOVs.data[0].ownerId === 'user-eng-001', 'Owner should be David');

  console.log('✓ Test 1.1 PASSED: User sees only own data');
}
```

#### Test 1.2: Isolated User Has No Cross-Team Access

```typescript
async function testIsolatedUser() {
  const isolatedContext = await accessControlService.buildAccessContext('user-isolated-001');

  // Create POV
  await federatedDataService.create('povs', {
    title: 'Isolated POV',
    status: 'active'
  }, isolatedContext);

  // Query POVs
  const povs = await federatedDataService.query('povs', isolatedContext);

  // Assertions
  assert(povs.data.length === 1, 'Should see only own POV');
  assert(isolatedContext.groups.length === 0, 'Should have no groups');
  assert(isolatedContext.managedGroups.length === 0, 'Should manage no groups');

  console.log('✓ Test 1.2 PASSED: Isolated user completely isolated');
}
```

---

### Category 2: Manager Group Scope Tests

**Objective**: Verify managers can see their team's data

#### Test 2.1: Manager Sees Team Data

```typescript
async function testManagerGroupScope() {
  // Setup: Team members create POVs
  const davidContext = await accessControlService.buildAccessContext('user-eng-001');
  const eveContext = await accessControlService.buildAccessContext('user-eng-002');
  const frankContext = await accessControlService.buildAccessContext('user-eng-003');

  await federatedDataService.create('povs', {
    title: 'David Backend POV',
    status: 'active'
  }, davidContext);

  await federatedDataService.create('povs', {
    title: 'Eve Frontend POV',
    status: 'active'
  }, eveContext);

  await federatedDataService.create('povs', {
    title: 'Frank Fullstack POV',
    status: 'active'
  }, frankContext);

  // Test: Manager queries POVs with group data
  const managerContext = await accessControlService.buildAccessContext('manager-eng-001');
  const managerPOVs = await federatedDataService.query('povs', managerContext, {
    includeGroupData: true // KEY: Enable group scope
  });

  // Assertions
  assert(managerPOVs.scope === 'group', 'Scope should be group');
  assert(managerPOVs.data.length === 3, 'Should see all 3 team POVs');
  assert(managerContext.managedGroups.length === 2, 'Should manage 2 groups');

  const titles = managerPOVs.data.map(p => p.title);
  assert(titles.includes('David Backend POV'), 'Should see David POV');
  assert(titles.includes('Eve Frontend POV'), 'Should see Eve POV');
  assert(titles.includes('Frank Fullstack POV'), 'Should see Frank POV');

  console.log('✓ Test 2.1 PASSED: Manager sees all team data');
}
```

#### Test 2.2: Manager Cannot See Other Team's Data

```typescript
async function testManagerCrossTeamIsolation() {
  // Setup: Sales user creates POV
  const salesContext = await accessControlService.buildAccessContext('user-sales-001');
  await federatedDataService.create('povs', {
    title: 'Sales POV',
    status: 'active'
  }, salesContext);

  // Test: Engineering manager queries
  const engManagerContext = await accessControlService.buildAccessContext('manager-eng-001');
  const engPOVs = await federatedDataService.query('povs', engManagerContext, {
    includeGroupData: true
  });

  // Assertions
  const titles = engPOVs.data.map(p => p.title);
  assert(!titles.includes('Sales POV'), 'Should NOT see Sales team POV');

  console.log('✓ Test 2.2 PASSED: Manager isolated from other teams');
}
```

#### Test 2.3: Manager Can View Managed Users

```typescript
async function testManagerViewUsers() {
  const managerContext = await accessControlService.buildAccessContext('manager-eng-001');

  const managedUsers = await accessControlService.getManagedUsers(managerContext);

  // Assertions
  assert(managedUsers.length === 3, 'Should see 3 team members');

  const userIds = managedUsers.map(u => u.uid);
  assert(userIds.includes('user-eng-001'), 'Should see David');
  assert(userIds.includes('user-eng-002'), 'Should see Eve');
  assert(userIds.includes('user-eng-003'), 'Should see Frank');
  assert(!userIds.includes('user-sales-001'), 'Should NOT see Sales user');

  console.log('✓ Test 2.3 PASSED: Manager sees only managed users');
}
```

---

### Category 3: Admin Omniscience Tests

**Objective**: Verify admins can see all data

#### Test 3.1: Admin Sees All Data

```typescript
async function testAdminGlobalScope() {
  // Setup: Multiple users create POVs
  const users = [
    'user-eng-001',
    'user-eng-002',
    'user-sales-001',
    'user-ops-001',
    'user-isolated-001'
  ];

  for (const userId of users) {
    const context = await accessControlService.buildAccessContext(userId);
    await federatedDataService.create('povs', {
      title: `POV by ${userId}`,
      status: 'active'
    }, context);
  }

  // Test: Admin queries all POVs
  const adminContext = await accessControlService.buildAccessContext('admin-001');
  const allPOVs = await federatedDataService.query('povs', adminContext);

  // Assertions
  assert(allPOVs.scope === 'global', 'Scope should be global');
  assert(allPOVs.data.length >= 5, 'Should see at least 5 POVs');

  console.log('✓ Test 3.1 PASSED: Admin sees all data');
}
```

#### Test 3.2: Admin Can View All Users

```typescript
async function testAdminViewAllUsers() {
  const adminContext = await accessControlService.buildAccessContext('admin-001');

  const allUsers = await accessControlService.getManagedUsers(adminContext);

  // Assertions
  assert(allUsers.length >= 10, 'Should see all users');

  console.log('✓ Test 3.2 PASSED: Admin sees all users');
}
```

#### Test 3.3: Admin Can Access Any Resource

```typescript
async function testAdminAccessControl() {
  // Setup: User creates private POV
  const userContext = await accessControlService.buildAccessContext('user-eng-001');
  const result = await federatedDataService.create('povs', {
    title: 'Private POV',
    status: 'active'
  }, userContext);

  // Test: Admin accesses user's POV
  const adminContext = await accessControlService.buildAccessContext('admin-001');
  const access = await accessControlService.canAccess(
    adminContext,
    'povs',
    result.id!,
    'read'
  );

  // Assertions
  assert(access.granted === true, 'Admin should have access');
  assert(access.reason === 'Admin access', 'Reason should be admin access');

  console.log('✓ Test 3.3 PASSED: Admin can access any resource');
}
```

---

### Category 4: Okta Integration Tests

**Objective**: Verify Okta group sync works correctly

#### Test 4.1: User Login Syncs Groups

```typescript
import { oktaGroupSyncService } from '@cortex/db';

async function testOktaLoginSync() {
  const oktaUser = {
    id: 'user-new-001',
    profile: {
      email: 'new.user@cortex.example.com',
      firstName: 'New',
      lastName: 'User',
      login: 'new.user',
      managerId: 'manager-eng-001',
      department: 'Engineering',
      title: 'Engineer',
      role: 'user'
    },
    groups: ['okta-00backend'] // Okta group ID
  };

  // Test: Sync user on login
  const result = await oktaGroupSyncService.syncUserOnLogin(oktaUser);

  // Assertions
  assert(result.success === true, 'Sync should succeed');
  assert(result.userProfile, 'User profile should be created');
  assert(result.userProfile.teams.includes('group-eng-backend'), 'Should be in backend group');

  console.log('✓ Test 4.1 PASSED: Okta login syncs groups');
}
```

#### Test 4.2: Group Mapping Works

```typescript
async function testOktaGroupMapping() {
  const adminContext = await accessControlService.buildAccessContext('admin-001');

  // Create mapping
  const result = await oktaGroupSyncService.createGroupMapping(
    adminContext,
    'okta-00newteam',
    'New Engineering Team',
    {
      createGroup: true,
      managerId: 'manager-eng-001',
      department: 'Engineering'
    }
  );

  // Assertions
  assert(result.success === true, 'Mapping should be created');
  assert(result.groupId, 'Group ID should be returned');

  console.log('✓ Test 4.2 PASSED: Group mapping works');
}
```

#### Test 4.3: Manager Assigned from Okta

```typescript
async function testOktaManagerAssignment() {
  const oktaUser = {
    id: 'user-new-002',
    profile: {
      email: 'another.user@cortex.example.com',
      firstName: 'Another',
      lastName: 'User',
      login: 'another.user',
      managerId: 'manager-sales-001', // Manager from Okta
      department: 'Sales',
      title: 'Sales Rep',
      role: 'user'
    },
    groups: ['okta-00enterprise']
  };

  const result = await oktaGroupSyncService.syncUserOnLogin(oktaUser);

  // Assertions
  assert(result.userProfile?.manager === 'manager-sales-001', 'Manager should be set from Okta');

  console.log('✓ Test 4.3 PASSED: Manager assigned from Okta');
}
```

---

### Category 5: Access Audit Tests

**Objective**: Verify all access is logged

#### Test 5.1: Read Access Logged

```typescript
async function testReadAccessLogging() {
  const userContext = await accessControlService.buildAccessContext('user-eng-001');

  // Create POV
  const result = await federatedDataService.create('povs', {
    title: 'Test POV',
    status: 'active'
  }, userContext);

  // Access POV
  await federatedDataService.getOne('povs', result.id!, userContext);

  // Check logs (admin only)
  const adminContext = await accessControlService.buildAccessContext('admin-001');
  const logs = await accessControlService.getAccessLogs(adminContext, {
    userId: 'user-eng-001',
    resource: 'povs',
    limit: 10
  });

  // Assertions
  assert(logs.length > 0, 'Access should be logged');
  assert(logs[0].action === 'read', 'Action should be read');
  assert(logs[0].accessGranted === true, 'Access should be granted');

  console.log('✓ Test 5.1 PASSED: Read access logged');
}
```

#### Test 5.2: Denied Access Logged

```typescript
async function testDeniedAccessLogging() {
  // Setup: User A creates POV
  const userAContext = await accessControlService.buildAccessContext('user-eng-001');
  const result = await federatedDataService.create('povs', {
    title: 'User A POV',
    status: 'active'
  }, userAContext);

  // Test: User B tries to access
  const userBContext = await accessControlService.buildAccessContext('user-eng-002');
  await federatedDataService.getOne('povs', result.id!, userBContext);

  // Check logs
  const adminContext = await accessControlService.buildAccessContext('admin-001');
  const logs = await accessControlService.getAccessLogs(adminContext, {
    userId: 'user-eng-002',
    resource: 'povs'
  });

  // Find the denied access log
  const deniedLog = logs.find(l => l.resourceId === result.id);

  // Assertions
  assert(deniedLog, 'Denied access should be logged');
  assert(deniedLog.accessGranted === false, 'Access should be denied');

  console.log('✓ Test 5.2 PASSED: Denied access logged');
}
```

---

## Test Execution

### Manual Testing

```bash
# Run all RBAC tests
pnpm test:rbac

# Run specific category
pnpm test:rbac:isolation
pnpm test:rbac:manager
pnpm test:rbac:admin
pnpm test:rbac:okta
pnpm test:rbac:audit
```

### Automated Test Suite

Create `test-rbac.ts`:

```typescript
import { testUserDataIsolation, testIsolatedUser } from './tests/isolation';
import { testManagerGroupScope, testManagerCrossTeamIsolation } from './tests/manager';
import { testAdminGlobalScope, testAdminViewAllUsers } from './tests/admin';
import { testOktaLoginSync, testOktaGroupMapping } from './tests/okta';
import { testReadAccessLogging, testDeniedAccessLogging } from './tests/audit';

async function runAllTests() {
  console.log('Starting RBAC Test Suite\n');

  const tests = [
    // Category 1: User Isolation
    { name: 'User Data Isolation', fn: testUserDataIsolation },
    { name: 'Isolated User', fn: testIsolatedUser },

    // Category 2: Manager Scope
    { name: 'Manager Group Scope', fn: testManagerGroupScope },
    { name: 'Manager Cross-Team Isolation', fn: testManagerCrossTeamIsolation },

    // Category 3: Admin Omniscience
    { name: 'Admin Global Scope', fn: testAdminGlobalScope },
    { name: 'Admin View All Users', fn: testAdminViewAllUsers },

    // Category 4: Okta Integration
    { name: 'Okta Login Sync', fn: testOktaLoginSync },
    { name: 'Okta Group Mapping', fn: testOktaGroupMapping },

    // Category 5: Audit Logging
    { name: 'Read Access Logging', fn: testReadAccessLogging },
    { name: 'Denied Access Logging', fn: testDeniedAccessLogging }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test.fn();
      passed++;
    } catch (error) {
      console.error(`✗ Test FAILED: ${test.name}`, error);
      failed++;
    }
  }

  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
}

runAllTests();
```

---

## Expected Results

### User Data Visibility Matrix

| Role | User | Can See | Cannot See |
|------|------|---------|------------|
| ADMIN | admin-001 | ALL data from ALL users | Nothing hidden |
| MANAGER | manager-eng-001 | Own data + Backend team + Frontend team | Sales, Ops, Isolated |
| MANAGER | manager-sales-001 | Own data + Enterprise + SMB teams | Engineering, Ops, Isolated |
| USER | user-eng-001 | ONLY own data | Everyone else's data |
| USER | user-isolated-001 | ONLY own data | Everyone else's data |

### Group Access Matrix

| User | Role | Groups | Can Access Users |
|------|------|--------|------------------|
| admin-001 | ADMIN | - | ALL |
| manager-eng-001 | MANAGER | 2 | user-eng-001, user-eng-002, user-eng-003 |
| manager-sales-001 | MANAGER | 2 | user-sales-001, user-sales-002 |
| user-eng-001 | USER | 1 | None |
| user-isolated-001 | USER | 0 | None |

---

## Compliance & Security

### Security Assertions

- ✅ Users cannot access data they don't own
- ✅ Managers can only see data from managed groups
- ✅ Cross-team data is isolated
- ✅ All access attempts are logged
- ✅ Okta groups correctly map to internal groups
- ✅ Manager assignments from Okta are respected

### Compliance Checklist

- [ ] GDPR: Users can only see their own personal data
- [ ] SOC 2: All access is audited
- [ ] RBAC: Roles correctly enforce permissions
- [ ] Data Isolation: No unauthorized cross-user access
- [ ] Group Isolation: No unauthorized cross-team access

---

## Troubleshooting Test Failures

### Common Issues

**Issue**: Manager seeing too much data
**Fix**: Check `includeGroupData: true` is not set for regular users

**Issue**: User seeing other users' data
**Fix**: Verify ownerId is set correctly on data creation

**Issue**: Okta groups not syncing
**Fix**: Check group mappings in `groupMappings` collection

**Issue**: Admin not seeing all data
**Fix**: Verify role is exactly `UserRole.ADMIN`

---

## Next Steps

1. **Implement Test Suite**: Create automated tests based on this strategy
2. **Load Testing**: Test with 1000+ users and 100+ groups
3. **Performance Testing**: Ensure queries scale with group count
4. **Security Audit**: External penetration testing
5. **Documentation**: User-facing RBAC documentation

---

**Last Updated**: 2025-10-14
**Version**: 1.0.0
