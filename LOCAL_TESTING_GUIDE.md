# Local Testing Guide - Cortex DC Web

> Complete guide to testing the UI and record management locally

## Quick Start Options

### Option 1: Firebase Emulators (Recommended for UI Testing)

**Start the emulators and web app**:
```bash
# Terminal 1: Start Firebase emulators
pnpm run emulators

# Terminal 2: Start Next.js web app
pnpm run dev:web

# Terminal 3: Seed test data (optional)
pnpm run seed:users
```

**Access the app**:
- Web App: http://localhost:3000
- Firebase UI: http://localhost:4040

### Option 2: Self-Hosted Stack (Full System Testing)

**Start the infrastructure**:
```bash
# Start all services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f
```

**Start the web app**:
```bash
# Set environment
export DEPLOYMENT_MODE=self-hosted

# Start web app
pnpm run dev:web
```

---

## Test Scenarios

### Scenario 1: Create and Manage a POV

1. **Navigate to POV List**
   - Go to http://localhost:3000/pov
   - You should see a list of POVs (empty if first time)

2. **Create a New POV**
   - Click "New POV" button
   - Fill in the form:
     - Title: "Q4 Customer Demo POV"
     - Description: "Testing XSIAM deployment for Enterprise customer"
     - Priority: High
     - Objectives: Add 2-3 objectives
   - Click "Create"

3. **View POV Detail**
   - Navigate to the newly created POV
   - Verify all fields are populated
   - Check that default phases are created:
     - Phase 1: Planning (in_progress)
     - Phase 2: Execution (todo)
     - Phase 3: Validation (todo)

4. **Transition to Next Phase**
   - Click "Complete Phase" or "Next Phase" button
   - Verify phase 1 is marked as "done"
   - Verify phase 2 is now "in_progress"

5. **Add Test Plan**
   - Navigate to "Test Plan" tab
   - Add scenarios
   - Set timeline and milestones
   - Add resources

### Scenario 2: Create and Link a TRR

1. **Create TRR from POV**
   - From the POV detail page
   - Click "Create TRR" button
   - Fill in TRR details:
     - Title: "Security Risk Assessment"
     - Priority: Critical
   - Verify TRR is automatically linked to the POV

2. **Score Risk Categories**
   - Navigate to the TRR detail page
   - Score each category (0-10):
     - Technical Feasibility: 7
     - Security: 8
     - Performance: 6
     - Scalability: 7
   - Add descriptions and mitigation strategies

3. **Add Findings**
   - Click "Add Finding"
   - Fill in:
     - Title: "Authentication Gap"
     - Severity: High
     - Description: "MFA not enabled by default"
     - Category: Security
     - Recommendation: "Enable MFA in deployment template"

4. **Submit for Validation**
   - Click "Submit for Validation"
   - Verify status changes to "pending_validation"

5. **Approve TRR**
   - Click "Validate"
   - Add validation notes
   - Click "Approve"
   - Verify status changes to "approved"

### Scenario 3: Test Relationship Management

1. **View Relationship Graph**
   - Navigate to Project detail page
   - Click "Relationships" tab
   - Verify graph shows:
     - Project → POV connections
     - POV → TRR connections
     - POV → Scenario connections

2. **Validate Relationships**
   - Click "Validate Relationships"
   - Check for errors and warnings
   - Fix any broken references

### Scenario 4: Test Analytics

1. **User Analytics**
   - Navigate to Dashboard
   - Select "Personal Dashboard"
   - Verify metrics:
     - Total POVs
     - Active POVs
     - Completed TRRs
     - Recent activity

2. **Admin Analytics**
   - Navigate to Dashboard
   - Select "Admin Dashboard" (requires admin role)
   - Verify system metrics:
     - Total users
     - Active POVs
     - Pending TRRs
     - Project health

---

## Testing with CLI Scripts

### Test Script 1: Record Creation Workflow

Create `test-scripts/test-record-workflow.ts`:

```typescript
import { dynamicRecordService, relationshipManagementService } from '@cortex/db';

async function testRecordWorkflow() {
  console.log('Testing Record Management Workflow...\n');

  // Create Project
  console.log('1. Creating project...');
  const projectId = 'test-project-' + Date.now();

  // Create POV
  console.log('2. Creating POV...');
  const povResult = await dynamicRecordService.createPOV({
    title: 'Test POV - Q4 Demo',
    description: 'Testing POV creation and lifecycle',
    priority: 'high'
  }, projectId, {
    userId: 'test-user',
    autoPopulateDefaults: true,
    createRelationships: true
  });

  if (!povResult.success) {
    console.error('Failed to create POV:', povResult.error);
    return;
  }

  console.log('✓ POV created:', povResult.povId);

  // Create TRR
  console.log('\n3. Creating TRR...');
  const trrResult = await dynamicRecordService.createTRR({
    title: 'Security Risk Assessment',
    description: 'Comprehensive security review',
    priority: 'critical'
  }, projectId, povResult.povId, {
    userId: 'test-user',
    createRelationships: true
  });

  if (!trrResult.success) {
    console.error('Failed to create TRR:', trrResult.error);
    return;
  }

  console.log('✓ TRR created:', trrResult.trrId);

  // Verify relationships
  console.log('\n4. Verifying relationships...');
  const graph = await relationshipManagementService.getProjectRelationshipGraph(projectId);
  console.log('✓ POVs in project:', graph?.povs.length);
  console.log('✓ TRRs in project:', graph?.trrs.length);
  console.log('✓ POV → TRR links:', Object.keys(graph?.relationships.povToTRR || {}).length);

  // Transition POV phase
  console.log('\n5. Transitioning POV phase...');
  const phaseTransition = await dynamicRecordService.transitionPOVPhase(
    povResult.povId!,
    'test-user'
  );

  if (phaseTransition.success) {
    console.log('✓ POV transitioned to:', phaseTransition.nextPhase);
  }

  // Update TRR status
  console.log('\n6. Updating TRR status...');
  const statusUpdate = await dynamicRecordService.transitionTRRStatus(
    trrResult.trrId!,
    'in_review',
    'test-user'
  );

  if (statusUpdate.success) {
    console.log('✓ TRR status updated to: in_review');
  }

  console.log('\n✅ Workflow test completed successfully!');
  console.log('\nTest Summary:');
  console.log('- Project ID:', projectId);
  console.log('- POV ID:', povResult.povId);
  console.log('- TRR ID:', trrResult.trrId);
}

testRecordWorkflow().catch(console.error);
```

**Run the test**:
```bash
# Firebase mode
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 \
FIRESTORE_EMULATOR_HOST=localhost:8080 \
npx tsx test-scripts/test-record-workflow.ts

# Self-hosted mode
DEPLOYMENT_MODE=self-hosted \
DATABASE_URL=postgresql://cortex:cortex_secure_password@localhost:5432/cortex \
npx tsx test-scripts/test-record-workflow.ts
```

### Test Script 2: Analytics Testing

Create `test-scripts/test-analytics.ts`:

```typescript
import { analyticsService } from '@cortex/db';

async function testAnalytics() {
  console.log('Testing Analytics Service...\n');

  // Get user analytics
  console.log('1. Fetching user analytics...');
  const userAnalytics = await analyticsService.getUserAnalytics(
    'test-user',
    'month'
  );

  console.log('✓ User Metrics:');
  console.log('  - Total POVs:', userAnalytics.metrics.totalPOVs);
  console.log('  - Active POVs:', userAnalytics.metrics.activePOVs);
  console.log('  - Completed POVs:', userAnalytics.metrics.completedPOVs);
  console.log('  - Total TRRs:', userAnalytics.metrics.totalTRRs);
  console.log('  - Completed TRRs:', userAnalytics.metrics.completedTRRs);

  // Get admin analytics
  console.log('\n2. Fetching admin analytics...');
  const adminAnalytics = await analyticsService.getAdminAnalytics('month');

  console.log('✓ System Metrics:');
  console.log('  - Total Users:', adminAnalytics.systemMetrics.totalUsers);
  console.log('  - Active Users:', adminAnalytics.systemMetrics.activeUsers);
  console.log('  - Total POVs:', adminAnalytics.systemMetrics.totalPOVs);
  console.log('  - Active POVs:', adminAnalytics.systemMetrics.activePOVs);
  console.log('  - Total TRRs:', adminAnalytics.systemMetrics.totalTRRs);
  console.log('  - Pending TRRs:', adminAnalytics.systemMetrics.pendingTRRs);

  console.log('\n✅ Analytics test completed!');
}

testAnalytics().catch(console.error);
```

**Run the test**:
```bash
npx tsx test-scripts/test-analytics.ts
```

### Test Script 3: Relationship Validation

Create `test-scripts/test-relationships.ts`:

```typescript
import { relationshipManagementService } from '@cortex/db';

async function testRelationships(projectId: string) {
  console.log('Testing Relationship Management...\n');

  // Get relationship graph
  console.log('1. Getting relationship graph...');
  const graph = await relationshipManagementService.getProjectRelationshipGraph(projectId);

  if (!graph) {
    console.error('Project not found');
    return;
  }

  console.log('✓ Project:', graph.projectId);
  console.log('✓ POVs:', graph.povs.length);
  console.log('✓ TRRs:', graph.trrs.length);
  console.log('✓ Scenarios:', graph.scenarios.length);

  // Validate relationships
  console.log('\n2. Validating relationships...');
  const validation = await relationshipManagementService.validateRelationships(projectId);

  console.log('✓ Valid:', validation.valid);

  if (validation.errors.length > 0) {
    console.log('✗ Errors:');
    validation.errors.forEach(err => console.log('  -', err));
  }

  if (validation.warnings.length > 0) {
    console.log('⚠ Warnings:');
    validation.warnings.forEach(warn => console.log('  -', warn));
  }

  // Repair if needed
  if (!validation.valid) {
    console.log('\n3. Repairing relationships...');
    const repair = await relationshipManagementService.repairRelationships(projectId);
    console.log('✓ Fixed:', repair.fixed);

    if (repair.errors.length > 0) {
      console.log('✗ Errors during repair:');
      repair.errors.forEach(err => console.log('  -', err));
    }
  }

  console.log('\n✅ Relationship test completed!');
}

// Usage
const projectId = process.argv[2] || 'test-project-1';
testRelationships(projectId).catch(console.error);
```

**Run the test**:
```bash
npx tsx test-scripts/test-relationships.ts <project-id>
```

---

## UI Testing Checklist

### Authentication
- [ ] Login with test user
- [ ] Logout
- [ ] Reset password flow
- [ ] Register new user

### Dashboard
- [ ] View personal dashboard
- [ ] View team dashboard
- [ ] View admin dashboard (admin only)
- [ ] Navigate between dashboard views

### POV Management
- [ ] List all POVs
- [ ] Filter POVs by status
- [ ] Sort POVs by priority
- [ ] Create new POV
- [ ] Edit POV
- [ ] Delete POV
- [ ] View POV detail
- [ ] Transition POV phases
- [ ] Add test plan
- [ ] Add objectives
- [ ] Add success metrics

### TRR Management
- [ ] List all TRRs
- [ ] Filter TRRs by status
- [ ] Create new TRR
- [ ] Edit TRR
- [ ] Delete TRR
- [ ] View TRR detail
- [ ] Score risk categories
- [ ] Add findings
- [ ] Add evidence
- [ ] Submit for validation
- [ ] Approve/reject TRR

### Project Management
- [ ] List all projects
- [ ] Create new project
- [ ] Edit project
- [ ] View project detail
- [ ] Add team members
- [ ] View project timeline
- [ ] View relationship graph

### Scenario Management
- [ ] List scenarios
- [ ] Create scenario
- [ ] Link scenario to POV
- [ ] Generate Terraform from scenario
- [ ] Deploy scenario

---

## Common Issues and Solutions

### Issue 1: "Emulators not starting"
**Solution**:
```bash
# Kill any running emulators
pnpm run emulators:kill

# Clear emulator data
rm -rf emulator-data

# Restart emulators
pnpm run emulators
```

### Issue 2: "Cannot connect to database"
**Solution**:
```bash
# Check if services are running
docker-compose ps

# Restart specific service
docker-compose restart postgres

# View logs
docker-compose logs postgres
```

### Issue 3: "Type errors in packages"
**Solution**:
```bash
# Rebuild all packages
pnpm run build

# Type check specific package
pnpm --filter "@cortex/db" type-check
```

### Issue 4: "CORS errors"
**Solution**:
- Ensure `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS configuration in `next.config.js`
- Verify API routes are accessible

### Issue 5: "User not authenticated"
**Solution**:
```bash
# Firebase mode - ensure emulators are running
echo $FIREBASE_AUTH_EMULATOR_HOST

# Self-hosted mode - check Keycloak
curl http://localhost:8180/health
```

---

## Performance Testing

### Load Test POV Creation

```bash
# Create multiple POVs concurrently
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/povs \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Load Test POV '$i'",
      "description": "Performance testing",
      "priority": "medium",
      "projectId": "test-project-1"
    }' &
done
wait
```

### Load Test Analytics

```bash
# Fetch analytics repeatedly
for i in {1..20}; do
  curl http://localhost:3000/api/analytics/user/test-user &
done
wait
```

---

## Environment Setup

### Development Environment

Create `.env.local`:
```bash
# Mode
DEPLOYMENT_MODE=firebase

# Firebase Emulators
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Self-Hosted Environment

Create `.env.self-hosted.local`:
```bash
# Mode
DEPLOYMENT_MODE=self-hosted

# Database
DATABASE_URL=postgresql://cortex:cortex_secure_password@localhost:5432/cortex

# Keycloak
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180
NEXT_PUBLIC_KEYCLOAK_REALM=cortex
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=cortex-web

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin_password

# Redis
REDIS_URL=redis://:redis_password@localhost:6379

# NATS
NATS_URL=nats://localhost:4222
```

---

## Debugging Tips

### Enable Debug Logging

```bash
# Set log level
export LOG_LEVEL=debug

# Run with verbose output
pnpm run dev:web --verbose
```

### Inspect Database

**Firebase (Emulator)**:
- Open http://localhost:4040
- Navigate to Firestore tab
- Browse collections

**PostgreSQL**:
```bash
# Connect to database
docker exec -it cortex-postgres psql -U cortex -d cortex

# List tables
\dt

# Query POVs
SELECT * FROM povs;

# Query TRRs
SELECT * FROM trrs;
```

### Monitor Logs

**Next.js logs**:
```bash
# In dev mode, logs appear in terminal
pnpm run dev:web
```

**Docker logs**:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f keycloak
```

---

## Next Steps

1. ✅ Start local environment (emulators or docker-compose)
2. ✅ Run test scripts to verify backend
3. ✅ Open browser and test UI flows
4. ✅ Create POVs and TRRs through UI
5. ✅ Verify workflows and phase transitions
6. ✅ Test analytics dashboards
7. ✅ Review admin features
8. 🎯 Deploy to staging/production

---

**Happy Testing!**

For issues or questions, refer to:
- Main docs: `CLAUDE.md`
- Architecture: `ARCHITECTURE_DOCUMENTATION.md`
- Project status: `PROJECT_STATUS.md`
