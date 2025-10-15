/**
 * Access Control Service
 * Implements federated user spaces with hierarchical permissions
 *
 * Access Model:
 * - USER: See only own data (federated user space)
 * - MANAGER: See own data + data from managed groups/teams
 * - ADMIN: See all data (collective admin space)
 *
 * Features:
 * - Data isolation by user/group
 * - Group-based access for managers
 * - Audit logging for sensitive operations
 * - Query optimization for access patterns
 */

import { getDatabase } from '../adapters/database.factory';
import { UserRole, UserProfile } from '../types/auth';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AccessContext {
  userId: string;
  role: UserRole;
  groups: string[];
  managedGroups: string[];
  organizationId?: string;
}

export interface DataScope {
  ownerIds: string[]; // User IDs that can access this data
  groupIds: string[]; // Group IDs that can access this data
  isPublic: boolean; // Whether data is publicly accessible
  organizationId?: string;
}

export interface AccessQuery {
  collection: string;
  userId: string;
  role: UserRole;
  filters?: Record<string, any>;
  includeGroups?: boolean;
  includeOrganization?: boolean;
}

export interface Group {
  id: string;
  name: string;
  managerId: string;
  memberIds: string[];
  parentGroupId?: string;
  organizationId?: string;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
}

export interface AccessAuditLog {
  id?: string;
  userId: string;
  action: 'read' | 'write' | 'delete' | 'share';
  resource: string;
  resourceId: string;
  accessGranted: boolean;
  reason?: string;
  metadata: {
    userRole: UserRole;
    ipAddress?: string;
    userAgent?: string;
  };
  timestamp: Date;
}

// ============================================================================
// ACCESS CONTROL SERVICE
// ============================================================================

export class AccessControlService {
  /**
   * Build access context for a user
   * This gathers all groups and permissions for efficient querying
   */
  async buildAccessContext(userId: string): Promise<AccessContext> {
    const db = getDatabase();

    // Get user profile
    const user = await db.findOne<UserProfile>('users', userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get groups the user belongs to
    const memberGroups = await db.findMany<Group>('groups', {
      filters: [
        {
          field: 'memberIds',
          operator: 'array-contains',
          value: userId
        }
      ]
    });

    // Get groups the user manages
    const managedGroups = await db.findMany<Group>('groups', {
      filters: [
        {
          field: 'managerId',
          operator: '==',
          value: userId
        }
      ]
    });

    return {
      userId,
      role: user.role,
      groups: memberGroups.map(g => g.id),
      managedGroups: managedGroups.map(g => g.id),
      organizationId: user.department // or organizationId if you have that field
    };
  }

  /**
   * Check if user can access a specific resource
   */
  async canAccess(
    context: AccessContext,
    resource: string,
    resourceId: string,
    action: 'read' | 'write' | 'delete' = 'read'
  ): Promise<{ granted: boolean; reason?: string }> {
    // Admins have full access
    if (context.role === UserRole.ADMIN) {
      return { granted: true, reason: 'Admin access' };
    }

    const db = getDatabase();
    const data = await db.findOne<any>(resource, resourceId);

    if (!data) {
      return { granted: false, reason: 'Resource not found' };
    }

    // Check ownership
    if (data.ownerId === context.userId || data.createdBy === context.userId) {
      return { granted: true, reason: 'Owner access' };
    }

    // Check if user is in data's allowed groups
    if (data.groupIds && context.groups.some((gid: string) => data.groupIds.includes(gid))) {
      return { granted: true, reason: 'Group member access' };
    }

    // Managers can access data from their managed groups
    if (context.role === UserRole.MANAGER) {
      if (data.groupIds && context.managedGroups.some((gid: string) => data.groupIds.includes(gid))) {
        return { granted: true, reason: 'Manager access to group data' };
      }
    }

    // Check if data belongs to same organization
    if (data.organizationId && data.organizationId === context.organizationId) {
      // Organization-level access rules could go here
      // For now, deny by default
    }

    return { granted: false, reason: 'No access permission' };
  }

  /**
   * Apply access filters to a query based on user role
   * This is the core of data isolation
   */
  applyAccessFilters(
    collection: string,
    context: AccessContext,
    baseFilters: any[] = []
  ): any[] {
    // Admins see everything
    if (context.role === UserRole.ADMIN) {
      return baseFilters;
    }

    const accessFilters = [...baseFilters];

    // Managers see their own data + managed group data
    if (context.role === UserRole.MANAGER && context.managedGroups.length > 0) {
      // This is a simplified version - in practice you'd use OR logic
      // For now, we'll query own data and aggregate group data separately
      return [
        ...accessFilters,
        {
          field: 'ownerId',
          operator: '==',
          value: context.userId
        }
      ];
    }

    // Regular users see only their own data
    return [
      ...accessFilters,
      {
        field: 'ownerId',
        operator: '==',
        value: context.userId
      }
    ];
  }

  /**
   * Get all data accessible to user (federated query)
   * This handles the complex logic of fetching from multiple scopes
   */
  async getAccessibleData<T>(
    collection: string,
    context: AccessContext,
    options: {
      filters?: any[];
      orderBy?: string;
      limit?: number;
      includeGroupData?: boolean;
    } = {}
  ): Promise<T[]> {
    const db = getDatabase();

    // Admins get all data
    if (context.role === UserRole.ADMIN) {
      return await db.findMany<T>(collection, {
        filters: options.filters,
        orderBy: options.orderBy,
        limit: options.limit
      });
    }

    const results: T[] = [];

    // Get user's own data
    const ownData = await db.findMany<T>(collection, {
      filters: [
        ...(options.filters || []),
        { field: 'ownerId', operator: '==', value: context.userId }
      ],
      orderBy: options.orderBy,
      limit: options.limit
    });
    results.push(...ownData);

    // Managers get data from managed groups
    if (context.role === UserRole.MANAGER && options.includeGroupData) {
      for (const groupId of context.managedGroups) {
        const groupData = await db.findMany<T>(collection, {
          filters: [
            ...(options.filters || []),
            { field: 'groupIds', operator: 'array-contains', value: groupId }
          ],
          orderBy: options.orderBy,
          limit: options.limit
        });
        results.push(...groupData);
      }
    }

    // Deduplicate by id
    const uniqueResults = Array.from(
      new Map(results.map(item => [(item as any).id, item])).values()
    );

    return uniqueResults;
  }

  /**
   * Get group members that manager can see
   */
  async getManagedUsers(context: AccessContext): Promise<UserProfile[]> {
    if (context.role === UserRole.ADMIN) {
      // Admins see all users
      const db = getDatabase();
      return await db.findMany<UserProfile>('users', {});
    }

    if (context.role === UserRole.MANAGER && context.managedGroups.length > 0) {
      // Get all members of managed groups
      const db = getDatabase();
      const groups = await db.findMany<Group>('groups', {
        filters: [
          {
            field: 'id',
            operator: 'in',
            value: context.managedGroups
          }
        ]
      });

      const memberIds = new Set<string>();
      groups.forEach(group => {
        group.memberIds.forEach(id => memberIds.add(id));
      });

      if (memberIds.size === 0) {
        return [];
      }

      // Fetch user profiles
      const users: UserProfile[] = [];
      for (const userId of Array.from(memberIds)) {
        const user = await db.findOne<UserProfile>('users', userId);
        if (user) {
          users.push(user);
        }
      }

      return users;
    }

    // Regular users can't see other users
    return [];
  }

  /**
   * Log access audit trail
   */
  async logAccess(log: Omit<AccessAuditLog, 'id' | 'timestamp'>): Promise<void> {
    const db = getDatabase();

    try {
      await db.create<AccessAuditLog>('accessLogs', {
        ...log,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to log access:', error);
      // Don't throw - logging failures shouldn't break access
    }
  }

  /**
   * Get access audit logs (admin only)
   */
  async getAccessLogs(
    context: AccessContext,
    filters: {
      userId?: string;
      resource?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {}
  ): Promise<AccessAuditLog[]> {
    if (context.role !== UserRole.ADMIN) {
      throw new Error('Only admins can view access logs');
    }

    const db = getDatabase();
    const dbFilters: any[] = [];

    if (filters.userId) {
      dbFilters.push({
        field: 'userId',
        operator: '==',
        value: filters.userId
      });
    }

    if (filters.resource) {
      dbFilters.push({
        field: 'resource',
        operator: '==',
        value: filters.resource
      });
    }

    if (filters.startDate) {
      dbFilters.push({
        field: 'timestamp',
        operator: '>=',
        value: filters.startDate
      });
    }

    if (filters.endDate) {
      dbFilters.push({
        field: 'timestamp',
        operator: '<=',
        value: filters.endDate
      });
    }

    return await db.findMany<AccessAuditLog>('accessLogs', {
      filters: dbFilters,
      orderBy: 'timestamp',
      orderDirection: 'desc',
      limit: filters.limit || 100
    });
  }

  /**
   * Share data with specific users or groups
   */
  async shareResource(
    context: AccessContext,
    resource: string,
    resourceId: string,
    shareWith: {
      userIds?: string[];
      groupIds?: string[];
    }
  ): Promise<{ success: boolean; error?: string }> {
    // Check if user can share (must own or be admin)
    const access = await this.canAccess(context, resource, resourceId, 'write');

    if (!access.granted && context.role !== UserRole.ADMIN) {
      return {
        success: false,
        error: 'You do not have permission to share this resource'
      };
    }

    const db = getDatabase();
    const data = await db.findOne<any>(resource, resourceId);

    if (!data) {
      return { success: false, error: 'Resource not found' };
    }

    // Update access scope
    const updates: any = {};

    if (shareWith.userIds) {
      updates.sharedWithUsers = [
        ...(data.sharedWithUsers || []),
        ...shareWith.userIds
      ];
    }

    if (shareWith.groupIds) {
      updates.groupIds = [
        ...(data.groupIds || []),
        ...shareWith.groupIds
      ];
    }

    await db.update(resource, resourceId, updates);

    // Log the share action
    await this.logAccess({
      userId: context.userId,
      action: 'share',
      resource,
      resourceId,
      accessGranted: true,
      metadata: {
        userRole: context.role
      }
    });

    return { success: true };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const accessControlService = new AccessControlService();
export default accessControlService;
