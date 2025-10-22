/**
 * POV Detail API Route Example
 *
 * Demonstrates:
 * - Access control with federated data service
 * - Checking user permissions
 * - Returning access info for UI
 * - Integration with AI suggestions
 *
 * Copy this to app/api/povs/[id]/route.ts to use
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  federatedDataService,
  accessControlService,
  type AccessContext,
  type UserProfile
} from '@cortex/db';

// ============================================================================
// GET POV BY ID
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const povId = params.id;

    // Step 1: Get access context from middleware
    const contextHeader = request.headers.get('x-access-context');
    if (!contextHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const context: AccessContext = JSON.parse(contextHeader);

    // Step 2: Check if user can access this POV
    const accessCheck = await accessControlService.canAccess(
      context,
      'povs',
      povId,
      'read'
    );

    if (!accessCheck.granted) {
      // Log denied access attempt
      await accessControlService.logAccess({
        userId: context.userId,
        action: 'read',
        resource: 'povs',
        resourceId: povId,
        accessGranted: false,
        metadata: {
          reason: accessCheck.reason,
          timestamp: new Date()
        }
      });

      return NextResponse.json(
        {
          error: 'Access denied',
          reason: accessCheck.reason
        },
        { status: 403 }
      );
    }

    // Step 3: Fetch POV with access control
    const povResult = await federatedDataService.findById(
      'povs',
      povId,
      context
    );

    if (!povResult.success || !povResult.data) {
      return NextResponse.json(
        { error: 'POV not found' },
        { status: 404 }
      );
    }

    const pov = povResult.data;

    // Step 4: Get owner information
    const ownerResult = await federatedDataService.findById(
      'users',
      pov.ownerId,
      context
    );

    const ownerName = ownerResult.success && ownerResult.data
      ? (ownerResult.data as UserProfile).displayName
      : 'Unknown';

    // Step 5: Get blueprint if exists
    const blueprintResult = await federatedDataService.query(
      'blueprints',
      context,
      {
        filters: [
          {
            field: 'povId',
            operator: '==',
            value: povId
          }
        ],
        limit: 1
      }
    );

    const blueprint = blueprintResult.data.length > 0
      ? blueprintResult.data[0]
      : null;

    // Step 6: Determine access info for UI
    const accessInfo = {
      scope: povResult.scope || 'user',
      canEdit: await canUserEdit(context, pov),
      canDelete: await canUserDelete(context, pov),
      viewingAsManager: context.role === 'MANAGER' &&
                        pov.ownerId !== context.userId &&
                        context.managedGroups.some(gid =>
                          pov.groupIds?.includes(gid)
                        )
    };

    // Step 7: Log successful access
    await accessControlService.logAccess({
      userId: context.userId,
      action: 'read',
      resource: 'povs',
      resourceId: povId,
      accessGranted: true,
      metadata: {
        scope: accessInfo.scope,
        viewingAsManager: accessInfo.viewingAsManager,
        timestamp: new Date()
      }
    });

    // Step 8: Return POV with metadata
    return NextResponse.json({
      pov: {
        ...pov,
        ownerName
      },
      blueprint,
      accessInfo
    });
  } catch (error: any) {
    console.error('Error fetching POV:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// UPDATE POV STATUS
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const povId = params.id;
    const updates = await request.json();

    // Get access context
    const contextHeader = request.headers.get('x-access-context');
    if (!contextHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const context: AccessContext = JSON.parse(contextHeader);

    // Check write permission
    const accessCheck = await accessControlService.canAccess(
      context,
      'povs',
      povId,
      'write'
    );

    if (!accessCheck.granted) {
      return NextResponse.json(
        { error: 'Access denied', reason: accessCheck.reason },
        { status: 403 }
      );
    }

    // Get current POV
    const povResult = await federatedDataService.findById('povs', povId, context);
    if (!povResult.success) {
      return NextResponse.json({ error: 'POV not found' }, { status: 404 });
    }

    const oldStatus = povResult.data.status;
    const newStatus = updates.status;

    // Update POV
    const updateResult = await federatedDataService.update(
      'povs',
      povId,
      updates,
      context
    );

    if (!updateResult.success) {
      return NextResponse.json(
        { error: updateResult.error },
        { status: 400 }
      );
    }

    // If status changed, trigger AI workflow event
    if (oldStatus !== newStatus) {
      // Import AI orchestrator (would be from @cortex/ai in real implementation)
      const { backgroundAIOrchestrator } = await import('@cortex/ai');

      await backgroundAIOrchestrator.onWorkflowEvent({
        userId: context.userId,
        workflowType: 'pov',
        workflowStage: newStatus,
        entityId: povId,
        entityData: {
          ...povResult.data,
          ...updates
        },
        metadata: {
          previousStage: oldStatus,
          timestamp: new Date()
        }
      });
    }

    // Log update
    await accessControlService.logAccess({
      userId: context.userId,
      action: 'write',
      resource: 'povs',
      resourceId: povId,
      accessGranted: true,
      metadata: {
        updates,
        statusChange: oldStatus !== newStatus ? { from: oldStatus, to: newStatus } : null,
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      pov: {
        ...povResult.data,
        ...updates
      }
    });
  } catch (error: any) {
    console.error('Error updating POV:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE POV
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const povId = params.id;

    // Get access context
    const contextHeader = request.headers.get('x-access-context');
    if (!contextHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const context: AccessContext = JSON.parse(contextHeader);

    // Check delete permission
    const accessCheck = await accessControlService.canAccess(
      context,
      'povs',
      povId,
      'delete'
    );

    if (!accessCheck.granted) {
      return NextResponse.json(
        { error: 'Access denied', reason: accessCheck.reason },
        { status: 403 }
      );
    }

    // Delete POV
    const deleteResult = await federatedDataService.delete('povs', povId, context);

    if (!deleteResult.success) {
      return NextResponse.json(
        { error: deleteResult.error },
        { status: 400 }
      );
    }

    // Log deletion
    await accessControlService.logAccess({
      userId: context.userId,
      action: 'delete',
      resource: 'povs',
      resourceId: povId,
      accessGranted: true,
      metadata: {
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'POV deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting POV:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function canUserEdit(context: AccessContext, pov: any): Promise<boolean> {
  // Admins can always edit
  if (context.role === 'ADMIN') {
    return true;
  }

  // Owners can edit their own POVs
  if (pov.ownerId === context.userId) {
    return true;
  }

  // Managers can edit POVs from their managed groups
  if (context.role === 'MANAGER') {
    return context.managedGroups.some(gid => pov.groupIds?.includes(gid));
  }

  return false;
}

async function canUserDelete(context: AccessContext, pov: any): Promise<boolean> {
  // Only admins and owners can delete
  if (context.role === 'ADMIN') {
    return true;
  }

  if (pov.ownerId === context.userId) {
    return true;
  }

  return false;
}
