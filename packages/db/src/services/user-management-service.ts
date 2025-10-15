/**
 * User Management Service (Refactored)
 * Uses database adapter for multi-backend support
 *
 * CHANGES FROM ORIGINAL:
 * - Removed direct Firebase Firestore imports
 * - Uses getDatabase() adapter instead of direct 'db' access
 * - Removed Firebase Functions httpsCallable (use REST API)
 * - Removed onSnapshot subscriptions (not portable, use polling/websockets instead)
 * - Simplified to work with any backend (Firebase, Postgres, etc.)
 */

import { getDatabase } from '../adapters/database.factory';
import type { DatabaseAdapter } from '../adapters/database.adapter';
import type { UserProfile as AuthUserProfile } from '../types/auth';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * @deprecated Use UserProfile from '../types/auth' instead
 * This interface is kept for backward compatibility
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  role: 'user' | 'admin' | 'analyst' | 'manager';
  organizationId?: string | null;
  department?: string | null;
  permissions: string[];
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  metadata: {
    createdAt: Date;
    lastActive: Date;
    loginCount: number;
    emailVerified: boolean;
    providerData: any[];
  };
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}

export interface CreateUserRequest {
  email: string;
  displayName: string;
  role?: string;
  department?: string;
  organizationId?: string;
  theme?: 'light' | 'dark';
  notifications?: boolean;
  language?: string;
}

export interface UpdateUserRequest {
  uid?: string;
  displayName?: string;
  department?: string;
  role?: string;
  status?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
  };
}

export interface UserActivity {
  id?: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: any;
  timestamp: Date;
}

export interface UserSettings {
  userId: string;
  dashboard: {
    layout: string;
    widgets: string[];
  };
  notifications: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
    frequency: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
  };
  createdAt: Date;
}

export interface Notification {
  id?: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
}

// ============================================================================
// USER MANAGEMENT SERVICE CLASS
// ============================================================================

export class UserManagementService {
  private db: DatabaseAdapter;

  constructor() {
    this.db = getDatabase();
  }

  // ============================================================================
  // USER PROFILE OPERATIONS
  // ============================================================================

  /**
   * Create a new user profile
   * NOTE: In most cases, user profiles are created automatically by authentication
   * service. This method is for admin operations or migrations.
   */
  async createUser(userData: CreateUserRequest): Promise<{
    success: boolean;
    profile?: UserProfile;
    error?: string
  }> {
    try {
      const userProfile: Omit<UserProfile, 'uid'> = {
        email: userData.email,
        displayName: userData.displayName,
        photoURL: null,
        role: (userData.role as any) || 'user',
        organizationId: userData.organizationId || null,
        department: userData.department || null,
        permissions: [],
        preferences: {
          theme: userData.theme || 'light',
          notifications: userData.notifications ?? true,
          language: userData.language || 'en'
        },
        metadata: {
          createdAt: new Date(),
          lastActive: new Date(),
          loginCount: 0,
          emailVerified: false,
          providerData: []
        },
        status: 'active'
      };

      const userId = await this.db.create<UserProfile>('users', userProfile);

      return {
        success: true,
        profile: {
          uid: userId,
          ...userProfile
        }
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: error.message || 'Failed to create user'
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUser(updates: UpdateUserRequest): Promise<{
    success: boolean;
    error?: string
  }> {
    try {
      const userId = updates.uid;
      if (!userId) {
        throw new Error('User ID is required for update');
      }

      // Remove uid from updates
      const { uid, ...updateData } = updates;

      await this.db.update('users', userId, {
        ...updateData,
        'metadata.lastModified': new Date()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: error.message || 'Failed to update user'
      };
    }
  }

  /**
   * Get user profile by UID
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const user = await this.db.findOne<UserProfile>('users', uid);
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Get all users with optional filters
   */
  async getUsers(filters?: {
    role?: string;
    status?: string;
    organizationId?: string;
    limit?: number;
  }): Promise<UserProfile[]> {
    try {
      const queryFilters: any[] = [];

      // Build filters array
      if (filters?.role) {
        queryFilters.push({
          field: 'role',
          operator: '==',
          value: filters.role
        });
      }
      if (filters?.status) {
        queryFilters.push({
          field: 'status',
          operator: '==',
          value: filters.status
        });
      }
      if (filters?.organizationId) {
        queryFilters.push({
          field: 'organizationId',
          operator: '==',
          value: filters.organizationId
        });
      }

      const users = await this.db.findMany<UserProfile>('users', {
        filters: queryFilters,
        orderBy: 'metadata.createdAt',
        orderDirection: 'desc',
        limit: filters?.limit
      });

      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Subscribe to users collection changes
   *
   * NOTE: Real-time subscriptions are not portable across all backends.
   * For self-hosted deployments, consider using:
   * - WebSocket connections for real-time updates
   * - Polling with SWR (recommended for most cases)
   * - Server-Sent Events (SSE)
   *
   * This method is deprecated for self-hosted mode.
   *
   * @deprecated Use polling or WebSocket-based updates instead
   */
  subscribeToUsers(
    callback: (users: UserProfile[]) => void,
    filters?: {
      role?: string;
      status?: string;
      organizationId?: string;
      limit?: number;
    }
  ): () => void {
    console.warn(
      '⚠️  subscribeToUsers: Real-time subscriptions are Firebase-specific. ' +
      'Consider using polling or WebSocket for self-hosted deployments.'
    );

    // Implement polling as fallback
    const intervalId = setInterval(async () => {
      const users = await this.getUsers(filters);
      callback(users);
    }, 5000); // Poll every 5 seconds

    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  // ============================================================================
  // ACTIVITY TRACKING
  // ============================================================================

  /**
   * Get user activity logs
   */
  async getUserActivity(userId?: string, limitCount: number = 50): Promise<UserActivity[]> {
    try {
      const queryFilters: any[] = [];

      if (userId) {
        queryFilters.push({
          field: 'userId',
          operator: '==',
          value: userId
        });
      }

      const activities = await this.db.findMany<UserActivity>('activityLogs', {
        filters: queryFilters,
        orderBy: 'timestamp',
        orderDirection: 'desc',
        limit: limitCount
      });

      return activities;
    } catch (error) {
      console.error('Error fetching activity:', error);
      return [];
    }
  }

  /**
   * Subscribe to activity logs
   *
   * @deprecated Use polling or WebSocket-based updates instead
   */
  subscribeToActivity(
    callback: (activities: UserActivity[]) => void,
    userId?: string,
    limitCount: number = 50
  ): () => void {
    console.warn(
      '⚠️  subscribeToActivity: Real-time subscriptions are Firebase-specific. ' +
      'Consider using polling or WebSocket for self-hosted deployments.'
    );

    const intervalId = setInterval(async () => {
      const activities = await this.getUserActivity(userId, limitCount);
      callback(activities);
    }, 5000);

    return () => clearInterval(intervalId);
  }

  /**
   * Log user activity
   */
  async logActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): Promise<void> {
    try {
      await this.db.create<UserActivity>('activityLogs', {
        ...activity,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // ============================================================================
  // USER SETTINGS
  // ============================================================================

  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const settings = await this.db.findOne<UserSettings>('userSettings', userId);
      return settings;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<boolean> {
    try {
      await this.db.update('userSettings', userId, settings);
      return true;
    } catch (error) {
      console.error('Error updating user settings:', error);
      return false;
    }
  }

  /**
   * Create default user settings
   */
  async createDefaultUserSettings(userId: string): Promise<UserSettings> {
    const defaultSettings: UserSettings = {
      userId,
      dashboard: {
        layout: 'grid',
        widgets: ['recent-activity', 'notifications', 'quick-actions']
      },
      notifications: {
        email: true,
        browser: true,
        mobile: false,
        frequency: 'realtime'
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 3600 // 1 hour
      },
      createdAt: new Date()
    };

    await this.db.create<UserSettings>('userSettings', defaultSettings);
    return defaultSettings;
  }

  // ============================================================================
  // ORGANIZATION MANAGEMENT
  // ============================================================================

  /**
   * Get organization members
   */
  async getOrganizationMembers(organizationId: string): Promise<UserProfile[]> {
    return this.getUsers({ organizationId });
  }

  /**
   * Add user to organization
   */
  async addUserToOrganization(userId: string, organizationId: string): Promise<boolean> {
    try {
      // Update user's organization
      await this.db.update('users', userId, {
        organizationId,
        'metadata.lastModified': new Date()
      });

      // Update organization member list
      const org = await this.db.findOne<any>('organizations', organizationId);

      if (org) {
        const currentMembers = org.members || [];
        if (!currentMembers.includes(userId)) {
          await this.db.update('organizations', organizationId, {
            members: [...currentMembers, userId],
            memberCount: currentMembers.length + 1,
            lastUpdated: new Date()
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error adding user to organization:', error);
      return false;
    }
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(userId: string, organizationId: string): Promise<boolean> {
    try {
      // Remove user's organization
      await this.db.update('users', userId, {
        organizationId: null,
        'metadata.lastModified': new Date()
      });

      // Update organization member list
      const org = await this.db.findOne<any>('organizations', organizationId);

      if (org) {
        const currentMembers = org.members || [];
        const updatedMembers = currentMembers.filter((id: string) => id !== userId);
        await this.db.update('organizations', organizationId, {
          members: updatedMembers,
          memberCount: updatedMembers.length,
          lastUpdated: new Date()
        });
      }

      return true;
    } catch (error) {
      console.error('Error removing user from organization:', error);
      return false;
    }
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limitCount: number = 20): Promise<Notification[]> {
    try {
      const notifications = await this.db.findMany<Notification>('notifications', {
        filters: [{
          field: 'userId',
          operator: '==',
          value: userId
        }],
        orderBy: 'createdAt',
        orderDirection: 'desc',
        limit: limitCount
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<boolean> {
    try {
      await this.db.update('notifications', notificationId, {
        read: true,
        readAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Create notification
   */
  async createNotification(notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }): Promise<boolean> {
    try {
      await this.db.create<Notification>('notifications', {
        ...notification,
        read: false,
        createdAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  /**
   * Bulk mark notifications as read
   */
  async markAllNotificationsRead(userId: string): Promise<boolean> {
    try {
      const notifications = await this.getUserNotifications(userId, 100);
      const unreadNotifications = notifications.filter(n => !n.read);

      for (const notification of unreadNotifications) {
        if (notification.id) {
          await this.markNotificationRead(notification.id);
        }
      }

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisWeek: number;
    usersByRole: Record<string, number>;
    usersByStatus: Record<string, number>;
  }> {
    try {
      const users = await this.getUsers();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        newUsersThisWeek: users.filter(u =>
          u.metadata.createdAt &&
          new Date(u.metadata.createdAt) > weekAgo
        ).length,
        usersByRole: {} as Record<string, number>,
        usersByStatus: {} as Record<string, number>
      };

      // Count by role
      users.forEach(user => {
        stats.usersByRole[user.role] = (stats.usersByRole[user.role] || 0) + 1;
        stats.usersByStatus[user.status] = (stats.usersByStatus[user.status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisWeek: 0,
        usersByRole: {},
        usersByStatus: {}
      };
    }
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(
    userIds: string[],
    updates: Partial<Pick<UserProfile, 'role' | 'status' | 'organizationId'>>
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        await this.db.update('users', userId, {
          ...updates,
          'metadata.lastModified': new Date()
        });
        success++;
      } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Export users data
   */
  async exportUsers(filters?: {
    role?: string;
    status?: string;
    organizationId?: string;
  }): Promise<UserProfile[]> {
    return this.getUsers(filters);
  }

  /**
   * Delete user (admin only)
   * WARNING: This permanently deletes the user profile
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await this.db.delete('users', userId);

      // Also delete related data
      await this.db.delete('userSettings', userId);

      // Note: Activity logs and notifications are typically retained for audit purposes
      // If you want to delete them, add those operations here

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}

// Create singleton instance
export const userManagementService = new UserManagementService();
export default userManagementService;
