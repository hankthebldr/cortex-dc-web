/**
 * Okta Group Synchronization Service
 * Syncs Okta groups with internal access control groups
 *
 * Features:
 * - Maps Okta groups to internal groups
 * - Syncs user group memberships from Okta
 * - Handles manager assignment from Okta attributes
 * - Automatic synchronization on login
 * - Manual sync operations for admins
 */

import { getDatabase } from '../adapters/database.factory';
import { UserProfile, UserRole } from '../types/auth';
import { Group, groupManagementService } from './group-management-service';
import { AccessContext } from './access-control-service';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface OktaGroup {
  id: string;
  name: string;
  description?: string;
  profile: {
    managerId?: string;
    department?: string;
    region?: string;
  };
}

export interface OktaUser {
  id: string;
  profile: {
    email: string;
    firstName: string;
    lastName: string;
    login: string;
    managerId?: string;
    department?: string;
    title?: string;
    role?: string;
  };
  groups: string[]; // Okta group IDs
}

export interface GroupMapping {
  oktaGroupId: string;
  oktaGroupName: string;
  internalGroupId: string;
  managerId?: string;
  syncEnabled: boolean;
  lastSynced: Date;
}

export interface SyncResult {
  success: boolean;
  usersProcessed: number;
  groupsProcessed: number;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// OKTA GROUP SYNC SERVICE
// ============================================================================

export class OktaGroupSyncService {
  /**
   * Sync user from Okta on login
   * This is called automatically when user authenticates
   */
  async syncUserOnLogin(oktaUser: OktaUser): Promise<{
    success: boolean;
    userProfile?: UserProfile;
    error?: string;
  }> {
    try {
      const db = getDatabase();

      // Get or create user profile
      let userProfile = await db.findOne<UserProfile>('users', oktaUser.id);

      if (!userProfile) {
        // Create new user profile
        userProfile = await this.createUserFromOkta(oktaUser);
      } else {
        // Update existing profile
        userProfile = await this.updateUserFromOkta(oktaUser, userProfile);
      }

      // Sync group memberships
      await this.syncUserGroups(oktaUser);

      return {
        success: true,
        userProfile
      };
    } catch (error: any) {
      console.error('Error syncing user from Okta:', error);
      return {
        success: false,
        error: error.message || 'Failed to sync user'
      };
    }
  }

  /**
   * Create user profile from Okta data
   */
  private async createUserFromOkta(oktaUser: OktaUser): Promise<UserProfile> {
    const db = getDatabase();

    // Determine role from Okta profile
    const role = this.mapOktaRoleToInternalRole(oktaUser.profile.role);

    const userProfile: Omit<UserProfile, 'id'> = {
      uid: oktaUser.id,
      email: oktaUser.profile.email,
      displayName: `${oktaUser.profile.firstName} ${oktaUser.profile.lastName}`,
      role,
      status: 'active' as any,
      department: oktaUser.profile.department,
      title: oktaUser.profile.title,
      manager: oktaUser.profile.managerId,
      teams: [], // Will be populated by group sync
      preferences: {
        theme: 'system' as any,
        notifications: {
          email: true,
          inApp: true,
          desktop: false
        },
        dashboard: {
          layout: 'grid' as any
        }
      },
      permissions: this.getDefaultPermissionsForRole(role),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const createdUser = await db.create<UserProfile>('users', userProfile as any);

    return createdUser;
  }

  /**
   * Update user profile from Okta data
   */
  private async updateUserFromOkta(
    oktaUser: OktaUser,
    existingProfile: UserProfile
  ): Promise<UserProfile> {
    const db = getDatabase();

    const updates: Partial<UserProfile> = {
      email: oktaUser.profile.email,
      displayName: `${oktaUser.profile.firstName} ${oktaUser.profile.lastName}`,
      department: oktaUser.profile.department,
      title: oktaUser.profile.title,
      manager: oktaUser.profile.managerId,
      updatedAt: new Date()
    };

    // Update role if changed
    const newRole = this.mapOktaRoleToInternalRole(oktaUser.profile.role);
    if (newRole !== existingProfile.role) {
      updates.role = newRole;
      updates.permissions = this.getDefaultPermissionsForRole(newRole);
    }

    await db.update('users', oktaUser.id, updates);

    return {
      ...existingProfile,
      ...updates
    };
  }

  /**
   * Sync user's group memberships from Okta
   */
  private async syncUserGroups(oktaUser: OktaUser): Promise<void> {
    const db = getDatabase();

    // Get group mappings
    const mappings = await db.findMany<GroupMapping>('groupMappings', {
      filters: [
        {
          field: 'syncEnabled',
          operator: '==',
          value: true
        }
      ]
    });

    const internalGroupIds: string[] = [];

    // Map Okta groups to internal groups
    for (const oktaGroupId of oktaUser.groups) {
      const mapping = mappings.find(m => m.oktaGroupId === oktaGroupId);

      if (mapping) {
        internalGroupIds.push(mapping.internalGroupId);

        // Add user to group if not already a member
        const group = await db.findOne<Group>('groups', mapping.internalGroupId);
        if (group && !group.memberIds.includes(oktaUser.id)) {
          await db.update('groups', mapping.internalGroupId, {
            memberIds: [...group.memberIds, oktaUser.id],
            'metadata.memberCount': group.memberIds.length + 1,
            'metadata.updatedAt': new Date()
          });
        }
      }
    }

    // Update user's teams
    await db.update('users', oktaUser.id, {
      teams: internalGroupIds,
      updatedAt: new Date()
    });
  }

  /**
   * Create or update group mapping
   */
  async createGroupMapping(
    context: AccessContext,
    oktaGroupId: string,
    oktaGroupName: string,
    options: {
      createGroup?: boolean;
      existingGroupId?: string;
      managerId?: string;
      department?: string;
    } = {}
  ): Promise<{ success: boolean; groupId?: string; error?: string }> {
    // Only admins can create mappings
    if (context.role !== UserRole.ADMIN) {
      return {
        success: false,
        error: 'Only admins can create group mappings'
      };
    }

    const db = getDatabase();

    try {
      let internalGroupId = options.existingGroupId;

      // Create internal group if needed
      if (options.createGroup && !internalGroupId) {
        const result = await groupManagementService.createGroup(context, {
          name: oktaGroupName,
          managerId: options.managerId || context.userId,
          department: options.department,
          tags: ['okta-synced']
        });

        if (!result.success) {
          return {
            success: false,
            error: result.error
          };
        }

        internalGroupId = result.groupId!;
      }

      if (!internalGroupId) {
        return {
          success: false,
          error: 'Internal group ID required'
        };
      }

      // Create mapping
      await db.create<GroupMapping>('groupMappings', {
        oktaGroupId,
        oktaGroupName,
        internalGroupId,
        managerId: options.managerId,
        syncEnabled: true,
        lastSynced: new Date()
      });

      return {
        success: true,
        groupId: internalGroupId
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create mapping'
      };
    }
  }

  /**
   * Sync all groups from Okta (admin operation)
   */
  async syncAllGroups(
    context: AccessContext,
    oktaGroups: OktaGroup[]
  ): Promise<SyncResult> {
    if (context.role !== UserRole.ADMIN) {
      return {
        success: false,
        usersProcessed: 0,
        groupsProcessed: 0,
        errors: ['Only admins can perform full sync'],
        warnings: []
      };
    }

    const result: SyncResult = {
      success: true,
      usersProcessed: 0,
      groupsProcessed: 0,
      errors: [],
      warnings: []
    };

    for (const oktaGroup of oktaGroups) {
      try {
        // Check if mapping exists
        const db = getDatabase();
        const existingMappings = await db.findMany<GroupMapping>('groupMappings', {
          filters: [
            {
              field: 'oktaGroupId',
              operator: '==',
              value: oktaGroup.id
            }
          ]
        });

        if (existingMappings.length === 0) {
          // Create new mapping and group
          const mapResult = await this.createGroupMapping(
            context,
            oktaGroup.id,
            oktaGroup.name,
            {
              createGroup: true,
              managerId: oktaGroup.profile.managerId,
              department: oktaGroup.profile.department
            }
          );

          if (!mapResult.success) {
            result.errors.push(`Failed to map group ${oktaGroup.name}: ${mapResult.error}`);
            continue;
          }
        }

        result.groupsProcessed++;
      } catch (error: any) {
        result.errors.push(`Error processing group ${oktaGroup.name}: ${error.message}`);
      }
    }

    result.success = result.errors.length === 0;
    return result;
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    totalMappings: number;
    enabledMappings: number;
    lastSyncTimes: { groupName: string; lastSynced: Date }[];
  }> {
    const db = getDatabase();

    const allMappings = await db.findMany<GroupMapping>('groupMappings', {});

    return {
      totalMappings: allMappings.length,
      enabledMappings: allMappings.filter(m => m.syncEnabled).length,
      lastSyncTimes: allMappings.map(m => ({
        groupName: m.oktaGroupName,
        lastSynced: m.lastSynced
      }))
    };
  }

  /**
   * Disable group sync
   */
  async disableGroupSync(
    context: AccessContext,
    oktaGroupId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (context.role !== UserRole.ADMIN) {
      return {
        success: false,
        error: 'Only admins can disable group sync'
      };
    }

    const db = getDatabase();

    try {
      const mappings = await db.findMany<GroupMapping>('groupMappings', {
        filters: [
          {
            field: 'oktaGroupId',
            operator: '==',
            value: oktaGroupId
          }
        ]
      });

      for (const mapping of mappings) {
        if (mapping.id) {
          await db.update('groupMappings', mapping.id, {
            syncEnabled: false
          });
        }
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to disable sync'
      };
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private mapOktaRoleToInternalRole(oktaRole?: string): UserRole {
    if (!oktaRole) return UserRole.USER;

    const roleMap: Record<string, UserRole> = {
      'admin': UserRole.ADMIN,
      'administrator': UserRole.ADMIN,
      'manager': UserRole.MANAGER,
      'team-lead': UserRole.MANAGER,
      'user': UserRole.USER,
      'member': UserRole.USER
    };

    return roleMap[oktaRole.toLowerCase()] || UserRole.USER;
  }

  private getDefaultPermissionsForRole(role: UserRole): any {
    // Import from auth types
    const { ROLE_PERMISSIONS } = require('../types/auth');
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[UserRole.USER];
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const oktaGroupSyncService = new OktaGroupSyncService();
export default oktaGroupSyncService;
