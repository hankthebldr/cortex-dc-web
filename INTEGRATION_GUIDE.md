# Integration Guide: Access Control, AI Enhancement, and User Management

This guide shows how to integrate the federated access control system, background AI orchestration, and AI content disclaimer modal into real-world workflows.

## Table of Contents

1. [Quick Start](#quick-start)
2. [User Authentication Flow](#user-authentication-flow)
3. [Data Access Patterns](#data-access-patterns)
4. [AI-Enhanced Workflows](#ai-enhanced-workflows)
5. [Complete Example: POV Creation](#complete-example-pov-creation)
6. [Complete Example: Blueprint Download](#complete-example-blueprint-download)
7. [Manager Dashboard](#manager-dashboard)
8. [Admin Operations](#admin-operations)

## Quick Start

### Install Dependencies

All necessary services are exported from `@cortex/db`:

```typescript
import {
  // Access Control
  accessControlService,
  federatedDataService,

  // Group Management
  groupManagementService,

  // Okta Integration
  oktaGroupSyncService,

  // Types
  type AccessContext,
  type Group,
  type UserProfile
} from '@cortex/db';

// AI Services
import {
  backgroundAIOrchestrator,
  type WorkflowContext,
  type AIEnhancement
} from '@cortex/ai';

// UI Components
import {
  AIContentDisclaimerModal,
  useAIDisclaimerCheck
} from '@/components/ai/AIContentDisclaimerModal';
```

## User Authentication Flow

### 1. Okta Login with Group Sync

When a user logs in via Okta, automatically sync their profile and group memberships:

```typescript
// apps/web/app/api/auth/callback/route.ts
import { oktaGroupSyncService } from '@cortex/db';
import { OktaUser } from '@cortex/db';

export async function GET(request: Request) {
  // Get Okta user data from OAuth callback
  const oktaUser: OktaUser = await getOktaUserFromCallback(request);

  // Sync user profile and groups
  const result = await oktaGroupSyncService.syncUserOnLogin(oktaUser);

  if (!result.success) {
    return new Response('Login failed', { status: 500 });
  }

  // Set session cookie
  const session = await createSession(result.userProfile!);

  return redirect('/dashboard');
}
```

### 2. Build Access Context for Every Request

In your middleware or API routes, build the access context:

```typescript
// apps/web/middleware.ts
import { accessControlService } from '@cortex/db';

export async function middleware(request: NextRequest) {
  const userId = await getUserIdFromSession(request);

  if (!userId) {
    return redirect('/login');
  }

  // Build access context
  const context = await accessControlService.buildAccessContext(userId);

  // Store in request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-access-context', JSON.stringify(context));

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}
```

### 3. Extract Context in API Routes

```typescript
// apps/web/app/api/povs/route.ts
import { federatedDataService } from '@cortex/db';
import type { AccessContext } from '@cortex/db';

export async function GET(request: Request) {
  // Extract context from headers
  const contextHeader = request.headers.get('x-access-context');
  const context: AccessContext = JSON.parse(contextHeader!);

  // Query with automatic access control
  const result = await federatedDataService.query('povs', context, {
    includeGroupData: true,  // Managers see team data
    limit: 20,
    orderBy: 'createdAt',
    orderDirection: 'desc'
  });

  return Response.json({
    povs: result.data,
    scope: result.scope,  // 'user', 'group', or 'global'
    total: result.total
  });
}
```

## Data Access Patterns

### Pattern 1: User Viewing Their Own Data

```typescript
// Regular user queries - sees only their own data
const userContext = await accessControlService.buildAccessContext('user-eng-001');

const myPOVs = await federatedDataService.query('povs', userContext);
// Returns only POVs owned by user-eng-001
// Scope: 'user'
```

### Pattern 2: Manager Viewing Team Data

```typescript
// Manager queries - sees team data
const managerContext = await accessControlService.buildAccessContext('manager-eng-001');

const teamPOVs = await federatedDataService.query('povs', managerContext, {
  includeGroupData: true  // KEY: Enable group scope
});
// Returns POVs from all users in managed groups
// Scope: 'group'
```

### Pattern 3: Admin Viewing All Data

```typescript
// Admin queries - sees everything
const adminContext = await accessControlService.buildAccessContext('admin-001');

const allPOVs = await federatedDataService.query('povs', adminContext);
// Returns all POVs in the system
// Scope: 'global'
```

### Pattern 4: Creating Data with Group Assignment

```typescript
const context = await accessControlService.buildAccessContext('user-eng-001');

// Automatically associates with user's groups
const result = await federatedDataService.create('povs', {
  title: 'New POV',
  description: 'Test POV',
  status: 'draft'
}, context, {
  groupIds: context.groups  // Associates with user's groups
});

// Manager can now see this POV when querying with includeGroupData: true
```

## AI-Enhanced Workflows

### Pattern 1: Enable AI for Workflow Stage

```typescript
import { backgroundAIOrchestrator } from '@cortex/ai';

// When POV moves to a new stage
async function onPOVStageChange(povId: string, newStage: string, userId: string) {
  // Notify AI orchestrator
  await backgroundAIOrchestrator.onWorkflowEvent({
    userId,
    workflowType: 'pov',
    workflowStage: newStage,
    entityId: povId,
    entityData: await getPOV(povId),
    metadata: {
      timestamp: new Date()
    }
  });

  // AI will process in background and generate suggestions
}
```

### Pattern 2: Check for AI Suggestions

```typescript
// In your component or API route
const suggestions = await backgroundAIOrchestrator.getSuggestionsForEntity(
  'pov',
  povId,
  userId
);

// Filter by type
const contentSuggestions = suggestions.filter(
  s => s.enhancementType === 'content_suggestion'
);

const riskAnalysis = suggestions.filter(
  s => s.enhancementType === 'risk_analysis'
);
```

### Pattern 3: Apply AI Suggestion

```typescript
async function applyAISuggestion(suggestionId: string, userId: string) {
  const result = await backgroundAIOrchestrator.applySuggestion(suggestionId, userId);

  if (!result.success) {
    console.error('Failed to apply suggestion:', result.error);
  }

  return result;
}
```

### Pattern 4: User AI Preferences

```typescript
// Enable/disable AI enhancements
await backgroundAIOrchestrator.setUserPreferences(userId, {
  enableBackgroundAI: true,
  enableNotifications: true,
  autoApplyHighConfidence: false,  // Don't auto-apply, just suggest
  confidenceThreshold: 0.8,
  enabledEnhancements: [
    'content_suggestion',
    'risk_analysis',
    'recommendation'
  ]
});
```

## Complete Example: POV Creation

This example shows a complete POV creation flow with access control and AI enhancement:

```typescript
// apps/web/app/api/povs/create/route.ts
import { federatedDataService, accessControlService } from '@cortex/db';
import { backgroundAIOrchestrator } from '@cortex/ai';

export async function POST(request: Request) {
  const data = await request.json();
  const contextHeader = request.headers.get('x-access-context');
  const context = JSON.parse(contextHeader!);

  // Step 1: Create POV with automatic access control
  const result = await federatedDataService.create('povs', {
    title: data.title,
    description: data.description,
    projectId: data.projectId,
    status: 'draft',
    phases: [],
    objectives: []
  }, context, {
    groupIds: context.groups  // Associate with user's teams
  });

  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  const povId = result.id!;

  // Step 2: Trigger AI enhancements
  await backgroundAIOrchestrator.onWorkflowEvent({
    userId: context.userId,
    workflowType: 'pov',
    workflowStage: 'draft',
    entityId: povId,
    entityData: data,
    metadata: {
      timestamp: new Date(),
      source: 'api'
    }
  });

  // Step 3: Return created POV
  return Response.json({
    id: povId,
    message: 'POV created successfully',
    aiEnhancementsEnabled: true
  });
}
```

### Frontend Component

```typescript
// apps/web/app/pov/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePOVPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/povs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create POV');
      }

      const result = await response.json();

      // Navigate to new POV
      router.push(`/pov/${result.id}`);
    } catch (error) {
      console.error('Error creating POV:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="POV Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create POV'}
      </button>
    </form>
  );
}
```

## Complete Example: Blueprint Download

This example shows AI-generated content with disclaimer modal:

```typescript
// apps/web/components/pov/BlueprintDownloadButton.tsx
'use client';

import { useState } from 'react';
import { AIContentDisclaimerModal, useAIDisclaimerCheck } from '@/components/ai/AIContentDisclaimerModal';

interface BlueprintDownloadButtonProps {
  povId: string;
  blueprintId: string;
  aiConfidence: number;
  generatedDate: Date;
}

export function BlueprintDownloadButton({
  povId,
  blueprintId,
  aiConfidence,
  generatedDate
}: BlueprintDownloadButtonProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Check if user has already accepted disclaimer for blueprints
  const hasAcceptedDisclaimer = useAIDisclaimerCheck('blueprint');

  const handleDownloadClick = () => {
    if (hasAcceptedDisclaimer) {
      // User has accepted before, download directly
      startDownload();
    } else {
      // Show disclaimer modal first
      setShowDisclaimer(true);
    }
  };

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
    startDownload();
  };

  const startDownload = async () => {
    setDownloading(true);

    try {
      const response = await fetch(`/api/blueprints/${blueprintId}/download`);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blueprint-${povId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDownloadClick}
        disabled={downloading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {downloading ? 'Downloading...' : 'Download Blueprint'}
      </button>

      <AIContentDisclaimerModal
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        onAccept={handleAcceptDisclaimer}
        contentType="blueprint"
        aiConfidence={aiConfidence}
        generatedDate={generatedDate}
        title={`POV Blueprint - ${povId}`}
      />
    </>
  );
}
```

### API Route for Blueprint Download

```typescript
// apps/web/app/api/blueprints/[id]/download/route.ts
import { federatedDataService, accessControlService } from '@cortex/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const contextHeader = request.headers.get('x-access-context');
  const context = JSON.parse(contextHeader!);

  // Check access to blueprint
  const accessCheck = await accessControlService.canAccess(
    context,
    'blueprints',
    params.id,
    'read'
  );

  if (!accessCheck.granted) {
    return Response.json(
      { error: 'Access denied', reason: accessCheck.reason },
      { status: 403 }
    );
  }

  // Get blueprint
  const blueprint = await federatedDataService.findById(
    'blueprints',
    params.id,
    context
  );

  if (!blueprint.success) {
    return Response.json({ error: 'Blueprint not found' }, { status: 404 });
  }

  // Generate PDF (or get from storage)
  const pdfBuffer = await generateBlueprintPDF(blueprint.data);

  // Log access for audit
  await accessControlService.logAccess({
    userId: context.userId,
    action: 'read',
    resource: 'blueprints',
    resourceId: params.id,
    accessGranted: true,
    metadata: {
      action: 'download',
      timestamp: new Date()
    }
  });

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="blueprint-${params.id}.pdf"`
    }
  });
}
```

## Manager Dashboard

Example of a manager dashboard that shows team data:

```typescript
// apps/web/app/dashboard/manager/page.tsx
import { federatedDataService, accessControlService } from '@cortex/db';
import { getUserFromSession } from '@/lib/auth';

export default async function ManagerDashboard() {
  const user = await getUserFromSession();
  const context = await accessControlService.buildAccessContext(user.uid);

  // Get team POVs (includes all managed groups)
  const teamPOVs = await federatedDataService.query('povs', context, {
    includeGroupData: true,
    orderBy: 'updatedAt',
    orderDirection: 'desc',
    limit: 50
  });

  // Get team TRRs
  const teamTRRs = await federatedDataService.query('trrs', context, {
    includeGroupData: true,
    orderBy: 'updatedAt',
    orderDirection: 'desc',
    limit: 50
  });

  // Get team statistics
  const stats = await federatedDataService.getStats(context, {
    includeGroupData: true
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Team Dashboard
        <span className="text-sm text-gray-500 ml-2">
          (Viewing {context.managedGroups.length} team{context.managedGroups.length !== 1 ? 's' : ''})
        </span>
      </h1>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Active POVs" value={stats.activePOVs} />
        <StatCard title="Team Members" value={stats.totalUsers} />
        <StatCard title="Pending TRRs" value={stats.pendingTRRs} />
        <StatCard title="This Month" value={stats.thisMonthActivity} />
      </div>

      {/* Team Activity */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Recent POVs</h2>
          <POVList povs={teamPOVs.data} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Recent TRRs</h2>
          <TRRList trrs={teamTRRs.data} />
        </div>
      </div>
    </div>
  );
}
```

## Admin Operations

### Creating Groups and Mappings

```typescript
// apps/web/app/admin/groups/page.tsx
'use client';

import { groupManagementService, oktaGroupSyncService } from '@cortex/db';

export default function AdminGroupsPage() {
  const handleCreateGroupMapping = async (
    oktaGroupId: string,
    oktaGroupName: string
  ) => {
    const context = await buildAdminContext();

    // Create internal group and map to Okta
    const result = await oktaGroupSyncService.createGroupMapping(
      context,
      oktaGroupId,
      oktaGroupName,
      {
        createGroup: true,  // Create new internal group
        managerId: 'manager-001',
        department: 'Engineering'
      }
    );

    if (!result.success) {
      alert(`Error: ${result.error}`);
      return;
    }

    alert(`Group created with ID: ${result.groupId}`);
  };

  return (
    <div>
      <h1>Group Management</h1>
      {/* Group management UI */}
    </div>
  );
}
```

### Viewing Access Audit Logs

```typescript
// apps/web/app/admin/audit/page.tsx
import { accessControlService } from '@cortex/db';

export default async function AuditLogsPage() {
  const context = await buildAdminContext();

  // Get recent access logs
  const logs = await accessControlService.getAuditLogs({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),  // Last 7 days
    endDate: new Date(),
    includeGranted: true,
    includeDenied: true
  });

  // Get denied access attempts (security concern)
  const deniedAccess = logs.filter(log => !log.accessGranted);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Access Audit Logs</h1>

      {deniedAccess.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-red-800 font-semibold mb-2">
            ⚠️ {deniedAccess.length} Denied Access Attempts
          </h2>
          <ul>
            {deniedAccess.map((log, i) => (
              <li key={i} className="text-sm text-red-700">
                User {log.userId} attempted to {log.action} {log.resource}/{log.resourceId}
              </li>
            ))}
          </ul>
        </div>
      )}

      <table className="w-full">
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td>{log.timestamp.toLocaleString()}</td>
              <td>{log.userId}</td>
              <td>{log.action}</td>
              <td>{log.resource}/{log.resourceId}</td>
              <td>
                {log.accessGranted ? (
                  <span className="text-green-600">✓ Granted</span>
                ) : (
                  <span className="text-red-600">✗ Denied</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Best Practices

### 1. Always Use Federated Data Service

❌ **Don't** use database directly:
```typescript
const povs = await db.findMany('povs', {});  // No access control!
```

✅ **Do** use federated service:
```typescript
const povs = await federatedDataService.query('povs', context);  // Access control enforced
```

### 2. Build Context Once Per Request

❌ **Don't** rebuild context multiple times:
```typescript
const context1 = await accessControlService.buildAccessContext(userId);
const povs = await federatedDataService.query('povs', context1);
const context2 = await accessControlService.buildAccessContext(userId);  // Duplicate!
const trrs = await federatedDataService.query('trrs', context2);
```

✅ **Do** reuse context:
```typescript
const context = await accessControlService.buildAccessContext(userId);
const povs = await federatedDataService.query('povs', context);
const trrs = await federatedDataService.query('trrs', context);
```

### 3. Always Show Disclaimer for AI Content

❌ **Don't** let users access AI content without acknowledgment:
```typescript
<button onClick={() => downloadBlueprint()}>Download</button>
```

✅ **Do** check disclaimer acceptance:
```typescript
const hasAccepted = useAIDisclaimerCheck('blueprint');

<button onClick={() => {
  if (hasAccepted) {
    downloadBlueprint();
  } else {
    setShowDisclaimer(true);
  }
}}>
  Download
</button>
```

### 4. Enable Group Data for Managers

❌ **Don't** forget `includeGroupData` for manager views:
```typescript
// Manager sees only their own POVs (like a regular user)
const povs = await federatedDataService.query('povs', managerContext);
```

✅ **Do** include group data:
```typescript
// Manager sees team POVs
const povs = await federatedDataService.query('povs', managerContext, {
  includeGroupData: true
});
```

### 5. Trigger AI at Appropriate Times

✅ **Good times to trigger AI**:
- When POV status changes (draft → planning → in_progress)
- When user completes a major section
- On scheduled intervals (nightly analysis)
- When user explicitly requests suggestions

❌ **Bad times to trigger AI**:
- On every keystroke
- On page load
- When user is inactive

## Testing Your Integration

### 1. Test Access Control

```bash
# Seed test users
pnpm run seed:users

# Start emulators
pnpm run emulators

# Run access control tests
cd packages/db
npx ts-node src/test-data/test-access-control.ts
```

### 2. Test AI Suggestions

```bash
# Start dev server
pnpm run dev

# Navigate to POV page
# Open browser console
# Check for AI suggestions:
console.log('Checking AI suggestions...');
const suggestions = await fetch('/api/ai/suggestions/pov-123');
console.log(await suggestions.json());
```

### 3. Test Disclaimer Modal

```bash
# Clear localStorage to reset disclaimer
localStorage.clear();

# Click download button
# Verify modal appears
# Check "I acknowledge" checkbox
# Verify download proceeds

# Click download again
# Verify modal does NOT appear (remembered for 30 days)
```

## Troubleshooting

### Issue: Manager sees only own data

**Problem**: Manager context not including group data

**Solution**: Ensure `includeGroupData: true` in query options:
```typescript
const result = await federatedDataService.query('povs', context, {
  includeGroupData: true  // Must be explicit
});
```

### Issue: AI suggestions not appearing

**Problem**: User preferences may have AI disabled

**Solution**: Check and update preferences:
```typescript
await backgroundAIOrchestrator.setUserPreferences(userId, {
  enableBackgroundAI: true,
  enableNotifications: true
});
```

### Issue: Disclaimer modal showing every time

**Problem**: localStorage not persisting

**Solution**: Check `rememberChoice` checkbox is being set:
```typescript
const [rememberChoice, setRememberChoice] = useState(false);

// In modal:
<input
  type="checkbox"
  checked={rememberChoice}
  onChange={(e) => setRememberChoice(e.target.checked)}
/>
```

### Issue: Access denied for manager viewing team data

**Problem**: User not assigned as group manager

**Solution**: Update group to set manager:
```typescript
await groupManagementService.setGroupManager(context, groupId, managerId);
```

## Next Steps

1. **Set up Okta**: Configure Okta groups and map to internal groups
2. **Migrate Existing Code**: Replace direct database calls with federated service
3. **Enable AI**: Configure AI preferences for users and workflows
4. **Test RBAC**: Run through test scenarios in `RBAC_TESTING_STRATEGY.md`
5. **Monitor Audit Logs**: Set up alerts for denied access attempts

## Related Documentation

- [ACCESS_CONTROL_GUIDE.md](./packages/db/ACCESS_CONTROL_GUIDE.md) - Detailed access control architecture
- [RBAC_TESTING_STRATEGY.md](./packages/db/RBAC_TESTING_STRATEGY.md) - Testing strategy and test cases
- [CLAUDE.md](./CLAUDE.md) - Repository overview and development guide

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the test cases in `RBAC_TESTING_STRATEGY.md`
3. Check audit logs for access denial reasons
4. Verify user groups and manager assignments in admin panel
