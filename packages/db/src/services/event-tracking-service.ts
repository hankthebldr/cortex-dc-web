/**
 * Event Tracking Service
 * Provides comprehensive event tracking for user actions, logins, and analytics
 * Supports both Firebase Firestore and PostgreSQL backends
 */

import { getDatabase } from '../adapters/database.factory';
import { redisCacheService, CacheKeys } from './redis-cache-service';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ActivityLogEvent {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  entityTitle?: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginEventData {
  userId: string;
  email: string;
  loginMethod: 'email' | 'google' | 'okta_saml' | 'okta_oauth';
  success: boolean;
  failureReason?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: Record<string, any>;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
}

export interface UserSessionData {
  userId: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}

export interface LoginAnalytics {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueUsers: number;
  loginsByMethod: Record<string, number>;
  loginsByDay: Array<{ date: string; count: number }>;
  recentLogins: LoginEventData[];
}

export interface UserActivityAnalytics {
  userId: string;
  totalActions: number;
  actionsByType: Record<string, number>;
  recentActivity: ActivityLogEvent[];
  lastActive: Date | null;
  sessionsCount: number;
}

// ============================================================================
// EVENT TRACKING SERVICE
// ============================================================================

export class EventTrackingService {
  /**
   * Log a user activity event
   */
  async logActivity(event: ActivityLogEvent): Promise<void> {
    try {
      const db = getDatabase();

      await db.create('activityLogs', {
        userId: event.userId,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        entityTitle: event.entityTitle,
        metadata: event.metadata,
        sessionId: event.sessionId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - we don't want to break user flows due to analytics failures
    }
  }

  /**
   * Log a user login event
   */
  async logLogin(event: LoginEventData): Promise<void> {
    try {
      const db = getDatabase();

      // Log the login event
      await db.create('loginEvents', {
        userId: event.userId,
        email: event.email,
        loginMethod: event.loginMethod,
        success: event.success,
        failureReason: event.failureReason,
        sessionId: event.sessionId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        location: event.location,
        deviceType: event.deviceType,
        browser: event.browser,
        os: event.os,
        timestamp: new Date(),
      });

      // If successful login, also log as activity
      if (event.success) {
        await this.logActivity({
          userId: event.userId,
          action: 'login',
          entityType: 'User',
          entityId: event.userId,
          metadata: {
            method: event.loginMethod,
            deviceType: event.deviceType,
          },
          sessionId: event.sessionId,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
        });
      }
    } catch (error) {
      console.error('Error logging login event:', error);
    }
  }

  /**
   * Create or update a user session
   */
  async createSession(session: UserSessionData): Promise<void> {
    try {
      const db = getDatabase();

      // Check if session already exists
      const existingSession = await db.findByField(
        'userSessions',
        'sessionId',
        session.sessionId
      );

      if (existingSession) {
        // Update existing session
        await db.update('userSessions', (existingSession as any).id, {
          lastActivity: new Date(),
          isActive: true,
        });
      } else {
        // Create new session
        await db.create('userSessions', {
          userId: session.userId,
          sessionId: session.sessionId,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          isActive: true,
          lastActivity: new Date(),
          createdAt: new Date(),
          expiresAt: session.expiresAt,
        });
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      const db = getDatabase();

      const session = await db.findByField('userSessions', 'sessionId', sessionId);

      if (session) {
        await db.update('userSessions', (session as any).id, {
          lastActivity: new Date(),
        });
      }
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  /**
   * End a user session
   */
  async endSession(sessionId: string): Promise<void> {
    try {
      const db = getDatabase();

      const session = await db.findByField('userSessions', 'sessionId', sessionId);

      if (session) {
        await db.update('userSessions', (session as any).id, {
          isActive: false,
        });
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  /**
   * Get login analytics for a time period (with Redis caching)
   */
  async getLoginAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<LoginAnalytics> {
    // Try cache first
    const cacheKey = CacheKeys.loginAnalytics(
      startDate.toISOString(),
      endDate.toISOString()
    );

    const cached = await redisCacheService.get<LoginAnalytics>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const db = getDatabase();

      // Get all login events in the period
      const loginEvents = await db.findMany('loginEvents', {
        filters: [
          { field: 'timestamp', operator: '>=', value: startDate },
          { field: 'timestamp', operator: '<=', value: endDate },
        ],
        orderBy: 'timestamp',
        orderDirection: 'desc',
      });

      // Calculate metrics
      const totalLogins = loginEvents.length;
      const successfulLogins = loginEvents.filter((e: any) => e.success).length;
      const failedLogins = totalLogins - successfulLogins;

      const uniqueUsers = new Set(loginEvents.map((e: any) => e.userId)).size;

      // Group by login method
      const loginsByMethod: Record<string, number> = {};
      loginEvents.forEach((event: any) => {
        loginsByMethod[event.loginMethod] = (loginsByMethod[event.loginMethod] || 0) + 1;
      });

      // Group by day
      const loginsByDay: Array<{ date: string; count: number }> = [];
      const dayMap = new Map<string, number>();

      loginEvents.forEach((event: any) => {
        const date = new Date(event.timestamp).toISOString().split('T')[0];
        dayMap.set(date, (dayMap.get(date) || 0) + 1);
      });

      dayMap.forEach((count, date) => {
        loginsByDay.push({ date, count });
      });

      loginsByDay.sort((a, b) => a.date.localeCompare(b.date));

      // Get recent logins (last 50)
      const recentLogins = loginEvents.slice(0, 50) as LoginEventData[];

      const analytics: LoginAnalytics = {
        totalLogins,
        successfulLogins,
        failedLogins,
        uniqueUsers,
        loginsByMethod,
        loginsByDay,
        recentLogins,
      };

      // Cache results for 10 minutes
      await redisCacheService.set(cacheKey, analytics, { ttl: 600 });

      return analytics;
    } catch (error) {
      console.error('Error getting login analytics:', error);
      return {
        totalLogins: 0,
        successfulLogins: 0,
        failedLogins: 0,
        uniqueUsers: 0,
        loginsByMethod: {},
        loginsByDay: [],
        recentLogins: [],
      };
    }
  }

  /**
   * Get user activity analytics (with Redis caching)
   */
  async getUserActivityAnalytics(userId: string): Promise<UserActivityAnalytics> {
    // Try cache first
    const cacheKey = CacheKeys.userActivity(userId);
    const cached = await redisCacheService.get<UserActivityAnalytics>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const db = getDatabase();

      // Get all activity logs for the user
      const activities = await db.findMany('activityLogs', {
        filters: [{ field: 'userId', operator: '==', value: userId }],
        orderBy: 'timestamp',
        orderDirection: 'desc',
      });

      // Calculate metrics
      const totalActions = activities.length;

      // Group by action type
      const actionsByType: Record<string, number> = {};
      activities.forEach((activity: any) => {
        actionsByType[activity.action] = (actionsByType[activity.action] || 0) + 1;
      });

      // Get recent activity (last 50)
      const recentActivity = activities.slice(0, 50) as ActivityLogEvent[];

      // Get last active timestamp
      const lastActive = activities.length > 0 ? new Date((activities[0] as any).timestamp) : null;

      // Get active sessions count
      const sessions = await db.findMany('userSessions', {
        filters: [
          { field: 'userId', operator: '==', value: userId },
          { field: 'isActive', operator: '==', value: true },
        ],
      });

      const analytics: UserActivityAnalytics = {
        userId,
        totalActions,
        actionsByType,
        recentActivity,
        lastActive,
        sessionsCount: sessions.length,
      };

      // Cache results for 5 minutes
      await redisCacheService.set(cacheKey, analytics, { ttl: 300 });

      return analytics;
    } catch (error) {
      console.error('Error getting user activity analytics:', error);
      return {
        userId,
        totalActions: 0,
        actionsByType: {},
        recentActivity: [],
        lastActive: null,
        sessionsCount: 0,
      };
    }
  }

  /**
   * Get recent activity logs for admin dashboard
   */
  async getRecentActivity(limit: number = 100): Promise<ActivityLogEvent[]> {
    try {
      const db = getDatabase();

      const activities = await db.findMany('activityLogs', {
        orderBy: 'timestamp',
        orderDirection: 'desc',
        limit,
      });

      return activities as ActivityLogEvent[];
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  /**
   * Get active user sessions
   */
  async getActiveSessions(userId?: string): Promise<any[]> {
    try {
      const db = getDatabase();

      const filters: any[] = [
        { field: 'isActive', operator: '==', value: true },
      ];

      if (userId) {
        filters.push({ field: 'userId', operator: '==', value: userId });
      }

      const sessions = await db.findMany('userSessions', {
        filters,
        orderBy: 'lastActivity',
        orderDirection: 'desc',
      });

      return sessions;
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const db = getDatabase();

      const expiredSessions = await db.findMany('userSessions', {
        filters: [
          { field: 'expiresAt', operator: '<', value: new Date() },
          { field: 'isActive', operator: '==', value: true },
        ],
      });

      for (const session of expiredSessions) {
        await db.update('userSessions', (session as any).id, {
          isActive: false,
        });
      }
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }
}

// Export singleton instance
export const eventTrackingService = new EventTrackingService();
export default eventTrackingService;
