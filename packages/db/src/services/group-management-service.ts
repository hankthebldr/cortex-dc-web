/**
 * Group Management Service
 * Manages groups, teams, and organizational hierarchies
 *
 * Features:
 * - Hierarchical group structure
 * - Manager assignment
 * - Member management
 * - Group-based permissions
 * - Organization alignment
 */

import { getDatabase } from '../adapters/database.factory';
import { UserRole, UserProfile } from '../types/auth';
import { AccessContext, accessControlService } from './access-control-service';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Group {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  memberIds: string[];
  parentGroupId?: string;
  childGroupIds: string[];
  organizationId?: string;
  department?: string;
  region?: string;
  tags: string[];
  settings: {
    allowMemberInvites: boolean;
    autoApproveJoins: boolean;
    visibility: 'public' | 'private' | 'organization';
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    memberCount: number;
  };
}

export interface GroupMembership {
  id?: string;
  groupId: string;
  userId: string;
  role: 'member' | 'manager' | 'admin';
  joinedAt: Date;
  addedBy: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  managerId: string;
  parentGroupId?: string;
  organizationId?: string;
  department?: string;
  region?: string;
  tags?: string[];
  initialMembers?: string[];
  settings?: Partial<Group['settings']>;
}

// ============================================================================
// GROUP MANAGEMENT SERVICE
// ============================================================================

export class GroupManagementService {
  /**
   * Create a new group
   */
  async createGroup(
    context: AccessContext,
    request: CreateGroupRequest
  ): Promise<{ success: boolean; groupId?: string; error?: string }> {
    // Only managers and admins can create groups
    if (context.role === UserRole.USER) {
      return {
        success: false,
        error: 'Only managers and admins can create groups'
      };
    }

    const db = getDatabase();

    try {
      const groupData: Omit<Group, 'id'> = {
        name: request.name,
        description: request.description,
        managerId: request.managerId,
        memberIds: request.initialMembers || [],
        parentGroupId: request.parentGroupId,
        childGroupIds: [],
        organizationId: request.organizationId,
        department: request.department,
        region: request.region,
        tags: request.tags || [],
        settings: {
          allowMemberInvites: request.settings?.allowMemberInvites ?? false,
          autoApproveJoins: request.settings?.autoApproveJoins ?? false,
          visibility: request.settings?.visibility ?? 'organization'
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: context.userId,
          memberCount: (request.initialMembers || []).length
        }
      };

      const createdGroup = await db.create<Group>('groups', groupData);
      const groupId = createdGroup.id;

      // Update parent group if specified
      if (request.parentGroupId) {
        const parentGroup = await db.findOne<Group>('groups', request.parentGroupId);
        if (parentGroup) {
          await db.update('groups', request.parentGroupId, {
            childGroupIds: [...parentGroup.childGroupIds, groupId],
            'metadata.updatedAt': new Date()
          });
        }
      }

      // Create membership records
      const allMembers = [request.managerId, ...(request.initialMembers || [])];
      for (const userId of allMembers) {
        await this.addMembershipRecord(groupId, userId, context.userId);
      }

      return { success: true, groupId };
    } catch (error: any) {
      console.error('Error creating group:', error);
      return {
        success: false,
        error: error.message || 'Failed to create group'
      };
    }
  }

  /**
   * Get group by ID with access check
   */
  async getGroup(
    context: AccessContext,
    groupId: string
  ): Promise<Group | null> {
    const db = getDatabase();
    const group = await db.findOne<Group>('groups', groupId);

    if (!group) {
      return null;
    }

    // Check access
    const hasAccess = await this.canAccessGroup(context, group);
    if (!hasAccess) {
      return null;
    }

    return group;
  }

  /**
   * Get all groups accessible to user
   */
  async getAccessibleGroups(
    context: AccessContext,
    filters?: {
      organizationId?: string;
      department?: string;
      managedOnly?: boolean;
    }
  ): Promise<Group[]> {
    const db = getDatabase();

    // Admins see all groups
    if (context.role === UserRole.ADMIN) {
      const dbFilters: any[] = [];

      if (filters?.organizationId) {
        dbFilters.push({
          field: 'organizationId',
          operator: '==',
          value: filters.organizationId
        });
      }

      if (filters?.department) {
        dbFilters.push({
          field: 'department',
          operator: '==',
          value: filters.department
        });
      }

      return await db.findMany<Group>('groups', { filters: dbFilters });
    }

    const groups: Group[] = [];

    // Managers see groups they manage
    if (context.role === UserRole.MANAGER || filters?.managedOnly) {
      const managedGroups = await db.findMany<Group>('groups', {
        filters: [
          {
            field: 'managerId',
            operator: '==',
            value: context.userId
          }
        ]
      });
      groups.push(...managedGroups);
    }

    // Get groups user is a member of
    if (!filters?.managedOnly) {
      const memberGroups = await db.findMany<Group>('groups', {
        filters: [
          {
            field: 'memberIds',
            operator: 'array-contains',
            value: context.userId
          }
        ]
      });
      groups.push(...memberGroups);
    }

    // Deduplicate
    const uniqueGroups = Array.from(
      new Map(groups.map(g => [g.id, g])).values()
    );

    return uniqueGroups;
  }

  /**
   * Add member to group
   */
  async addMember(
    context: AccessContext,
    groupId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    const db = getDatabase();
    const group = await db.findOne<Group>('groups', groupId);

    if (!group) {
      return { success: false, error: 'Group not found' };
    }

    // Check if user can add members
    if (
      context.role !== UserRole.ADMIN &&
      group.managerId !== context.userId &&
      !group.settings.allowMemberInvites
    ) {
      return {
        success: false,
        error: 'You do not have permission to add members to this group'
      };
    }

    // Check if already a member
    if (group.memberIds.includes(userId)) {
      return { success: false, error: 'User is already a member' };
    }

    try {
      // Add to group
      await db.update('groups', groupId, {
        memberIds: [...group.memberIds, userId],
        'metadata.memberCount': group.memberIds.length + 1,
        'metadata.updatedAt': new Date()
      });

      // Create membership record
      await this.addMembershipRecord(groupId, userId, context.userId);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to add member'
      };
    }
  }

  /**
   * Remove member from group
   */
  async removeMember(
    context: AccessContext,
    groupId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    const db = getDatabase();
    const group = await db.findOne<Group>('groups', groupId);

    if (!group) {
      return { success: false, error: 'Group not found' };
    }

    // Check permissions
    if (
      context.role !== UserRole.ADMIN &&
      group.managerId !== context.userId &&
      context.userId !== userId // Users can remove themselves
    ) {
      return {
        success: false,
        error: 'You do not have permission to remove members from this group'
      };
    }

    // Can't remove the manager
    if (userId === group.managerId) {
      return {
        success: false,
        error: 'Cannot remove group manager. Transfer management first.'
      };
    }

    try {
      const updatedMembers = group.memberIds.filter(id => id !== userId);

      await db.update('groups', groupId, {
        memberIds: updatedMembers,
        'metadata.memberCount': updatedMembers.length,
        'metadata.updatedAt': new Date()
      });

      // Remove membership record
      await this.removeMembershipRecord(groupId, userId);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to remove member'
      };
    }
  }

  /**
   * Transfer group management
   */
  async transferManagement(
    context: AccessContext,
    groupId: string,
    newManagerId: string
  ): Promise<{ success: boolean; error?: string }> {
    const db = getDatabase();
    const group = await db.findOne<Group>('groups', groupId);

    if (!group) {
      return { success: false, error: 'Group not found' };
    }

    // Only current manager or admin can transfer
    if (
      context.role !== UserRole.ADMIN &&
      group.managerId !== context.userId
    ) {
      return {
        success: false,
        error: 'Only the current manager or admin can transfer management'
      };
    }

    // New manager must be a member
    if (!group.memberIds.includes(newManagerId)) {
      return {
        success: false,
        error: 'New manager must be a member of the group'
      };
    }

    try {
      await db.update('groups', groupId, {
        managerId: newManagerId,
        'metadata.updatedAt': new Date()
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to transfer management'
      };
    }
  }

  /**
   * Get all members of a group
   */
  async getGroupMembers(
    context: AccessContext,
    groupId: string
  ): Promise<UserProfile[]> {
    const group = await this.getGroup(context, groupId);

    if (!group) {
      return [];
    }

    const db = getDatabase();
    const members: UserProfile[] = [];

    for (const userId of group.memberIds) {
      const user = await db.findOne<UserProfile>('users', userId);
      if (user) {
        members.push(user);
      }
    }

    return members;
  }

  /**
   * Get hierarchical group tree
   */
  async getGroupHierarchy(
    context: AccessContext,
    rootGroupId?: string
  ): Promise<Group[]> {
    const groups = await this.getAccessibleGroups(context);

    if (rootGroupId) {
      // Filter to descendants of root
      return this.filterGroupHierarchy(groups, rootGroupId);
    }

    return groups;
  }

  /**
   * Delete group
   */
  async deleteGroup(
    context: AccessContext,
    groupId: string,
    options: {
      deleteChildren?: boolean;
      reassignData?: boolean;
      newOwnerId?: string;
    } = {}
  ): Promise<{ success: boolean; error?: string }> {
    const db = getDatabase();
    const group = await db.findOne<Group>('groups', groupId);

    if (!group) {
      return { success: false, error: 'Group not found' };
    }

    // Only admins or group manager can delete
    if (
      context.role !== UserRole.ADMIN &&
      group.managerId !== context.userId
    ) {
      return {
        success: false,
        error: 'Only admin or group manager can delete the group'
      };
    }

    try {
      // Handle child groups
      if (group.childGroupIds.length > 0) {
        if (options.deleteChildren) {
          for (const childId of group.childGroupIds) {
            await this.deleteGroup(context, childId, options);
          }
        } else {
          // Orphan child groups (remove parent reference)
          for (const childId of group.childGroupIds) {
            await db.update('groups', childId, {
              parentGroupId: undefined,
              'metadata.updatedAt': new Date()
            });
          }
        }
      }

      // Update parent group
      if (group.parentGroupId) {
        const parent = await db.findOne<Group>('groups', group.parentGroupId);
        if (parent) {
          await db.update('groups', group.parentGroupId, {
            childGroupIds: parent.childGroupIds.filter(id => id !== groupId),
            'metadata.updatedAt': new Date()
          });
        }
      }

      // Delete group
      await db.delete('groups', groupId);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete group'
      };
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async canAccessGroup(context: AccessContext, group: Group): Promise<boolean> {
    // Admins can access all groups
    if (context.role === UserRole.ADMIN) {
      return true;
    }

    // Managers of the group can access
    if (group.managerId === context.userId) {
      return true;
    }

    // Members can access
    if (group.memberIds.includes(context.userId)) {
      return true;
    }

    // Public groups are accessible
    if (group.settings.visibility === 'public') {
      return true;
    }

    // Organization groups accessible to org members
    if (
      group.settings.visibility === 'organization' &&
      group.organizationId === context.organizationId
    ) {
      return true;
    }

    return false;
  }

  private async addMembershipRecord(
    groupId: string,
    userId: string,
    addedBy: string
  ): Promise<void> {
    const db = getDatabase();

    await db.create<GroupMembership>('groupMemberships', {
      groupId,
      userId,
      role: 'member',
      joinedAt: new Date(),
      addedBy
    });
  }

  private async removeMembershipRecord(
    groupId: string,
    userId: string
  ): Promise<void> {
    const db = getDatabase();

    const memberships = await db.findMany<GroupMembership>('groupMemberships', {
      filters: [
        { field: 'groupId', operator: '==', value: groupId },
        { field: 'userId', operator: '==', value: userId }
      ]
    });

    for (const membership of memberships) {
      if (membership.id) {
        await db.delete('groupMemberships', membership.id);
      }
    }
  }

  private filterGroupHierarchy(groups: Group[], rootId: string): Group[] {
    const result: Group[] = [];
    const visited = new Set<string>();

    const traverse = (groupId: string) => {
      if (visited.has(groupId)) return;
      visited.add(groupId);

      const group = groups.find(g => g.id === groupId);
      if (!group) return;

      result.push(group);

      for (const childId of group.childGroupIds) {
        traverse(childId);
      }
    };

    traverse(rootId);
    return result;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const groupManagementService = new GroupManagementService();
export default groupManagementService;
