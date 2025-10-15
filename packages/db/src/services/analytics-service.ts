/**
 * Analytics Service
 * Provides analytics for both user space and admin space
 * Tracks POV/TRR activity, user engagement, and system metrics
 */

import { getDatabase } from '../adapters/database.factory';

export interface UserAnalytics {
  userId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  metrics: {
    totalPOVs: number;
    activePOVs: number;
    completedPOVs: number;
    totalTRRs: number;
    completedTRRs: number;
    totalProjects: number;
    activeProjects: number;
    hoursLogged: number;
    tasksCompleted: number;
    collaborations: number;
  };
  trends: {
    povsCreated: number[];
    trrsSubmitted: number[];
    activityScore: number[];
    dates: string[];
  };
  topProjects: Array<{
    id: string;
    title: string;
    status: string;
    lastActivity: Date;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    action: string;
    timestamp: Date;
    entityTitle: string;
  }>;
}

export interface AdminAnalytics {
  period: 'week' | 'month' | 'quarter' | 'year';
  systemMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalPOVs: number;
    activePOVs: number;
    totalTRRs: number;
    pendingTRRs: number;
    totalProjects: number;
    activeProjects: number;
    storageUsed: number;
    apiCalls: number;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
  };
  userEngagement: {
    dailyActiveUsers: number[];
    weeklyActiveUsers: number[];
    dates: string[];
  };
  projectHealth: {
    good: number;
    warning: number;
    atRisk: number;
  };
  topUsers: Array<{
    userId: string;
    displayName: string;
    povsCreated: number;
    trrsCompleted: number;
    activityScore: number;
  }>;
  trendsOverTime: {
    povsPerWeek: number[];
    trrsPerWeek: number[];
    projectsPerWeek: number[];
    dates: string[];
  };
}

export class AnalyticsService {
  /**
   * Get user-specific analytics
   */
  async getUserAnalytics(
    userId: string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<UserAnalytics> {
    const db = getDatabase();
    const { startDate, endDate } = this.getPeriodDates(period);

    // Get user's POVs
    const povs = await db.findMany('povs', {
      filters: [{ field: 'owner', operator: '==', value: userId }],
    });

    const recentPOVs = povs.filter((pov: any) =>
      new Date(pov.createdAt) >= startDate && new Date(pov.createdAt) <= endDate
    );

    const activePOVs = povs.filter((pov: any) =>
      pov.status === 'in_progress' || pov.status === 'testing'
    );

    const completedPOVs = recentPOVs.filter((pov: any) =>
      pov.status === 'completed'
    );

    // Get user's TRRs
    const trrs = await db.findMany('trrs', {
      filters: [{ field: 'owner', operator: '==', value: userId }],
    });

    const recentTRRs = trrs.filter((trr: any) =>
      new Date(trr.createdAt) >= startDate && new Date(trr.createdAt) <= endDate
    );

    const completedTRRs = recentTRRs.filter((trr: any) =>
      trr.status === 'completed' || trr.status === 'approved'
    );

    // Get user's projects
    const projects = await db.findMany('projects', {
      filters: [{ field: 'owner', operator: '==', value: userId }],
    });

    const activeProjects = projects.filter((proj: any) =>
      proj.status === 'active'
    );

    // Calculate trends
    const trends = this.calculateTrends(recentPOVs, recentTRRs, period);

    // Get top projects
    const topProjects = projects
      .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map((proj: any) => ({
        id: proj.id,
        title: proj.title,
        status: proj.status,
        lastActivity: proj.updatedAt,
      }));

    // Get recent activity
    const recentActivity = await this.getUserRecentActivity(userId, 10);

    return {
      userId,
      period,
      metrics: {
        totalPOVs: povs.length,
        activePOVs: activePOVs.length,
        completedPOVs: completedPOVs.length,
        totalTRRs: trrs.length,
        completedTRRs: completedTRRs.length,
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        hoursLogged: 0, // TODO: Implement time tracking
        tasksCompleted: 0, // TODO: Get from tasks
        collaborations: 0, // TODO: Count team memberships
      },
      trends,
      topProjects,
      recentActivity,
    };
  }

  /**
   * Get admin-level analytics
   */
  async getAdminAnalytics(
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<AdminAnalytics> {
    const db = getDatabase();
    const { startDate, endDate } = this.getPeriodDates(period);

    // Get all users
    const users = await db.findMany('users');
    const newUsers = users.filter((user: any) =>
      new Date(user.createdAt) >= startDate && new Date(user.createdAt) <= endDate
    );

    // Get active users (users with activity in period)
    const activityLogs = await db.findMany('activityLogs', {
      filters: [{ field: 'timestamp', operator: '>=', value: startDate }],
    });

    const activeUserIds = new Set(activityLogs.map((log: any) => log.userId));

    // Get POVs
    const povs = await db.findMany('povs');
    const activePOVs = povs.filter((pov: any) =>
      pov.status === 'in_progress' || pov.status === 'testing'
    );

    // Get TRRs
    const trrs = await db.findMany('trrs');
    const pendingTRRs = trrs.filter((trr: any) =>
      trr.status === 'pending_validation' || trr.status === 'in_review'
    );

    // Get Projects
    const projects = await db.findMany('projects');
    const activeProjects = projects.filter((proj: any) =>
      proj.status === 'active'
    );

    // Calculate project health
    const projectHealth = {
      good: 0,
      warning: 0,
      atRisk: 0,
    };

    projects.forEach((proj: any) => {
      const health = this.calculateProjectHealth(proj);
      projectHealth[health]++;
    });

    // Get top users
    const topUsers = await this.getTopUsers(5);

    // Calculate trends
    const trendsOverTime = this.calculateSystemTrends(povs, trrs, projects, period);

    // Calculate user engagement
    const userEngagement = this.calculateUserEngagement(activityLogs, period);

    return {
      period,
      systemMetrics: {
        totalUsers: users.length,
        activeUsers: activeUserIds.size,
        newUsers: newUsers.length,
        totalPOVs: povs.length,
        activePOVs: activePOVs.length,
        totalTRRs: trrs.length,
        pendingTRRs: pendingTRRs.length,
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        storageUsed: 0, // TODO: Calculate from storage
        apiCalls: 0, // TODO: Track API calls
      },
      performance: {
        avgResponseTime: 0, // TODO: Implement performance tracking
        errorRate: 0,
        uptime: 99.9,
      },
      userEngagement,
      projectHealth,
      topUsers,
      trendsOverTime,
    };
  }

  /**
   * Get recent activity for a user
   */
  private async getUserRecentActivity(userId: string, limit: number = 10): Promise<any[]> {
    const db = getDatabase();

    try {
      const activities = await db.findMany('activityLogs', {
        filters: [{ field: 'userId', operator: '==', value: userId }],
        orderBy: 'timestamp',
        orderDirection: 'desc',
        limit,
      });

      return activities.map((activity: any) => ({
        id: activity.id,
        type: activity.entityType,
        action: activity.action,
        timestamp: activity.timestamp,
        entityTitle: activity.entityTitle || 'Unknown',
      }));
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  }

  /**
   * Get top performing users
   */
  private async getTopUsers(limit: number = 5): Promise<any[]> {
    const db = getDatabase();

    try {
      const users = await db.findMany('users');
      const userStats = await Promise.all(
        users.map(async (user: any) => {
          const povs = await db.findMany('povs', {
            filters: [{ field: 'owner', operator: '==', value: user.id }],
          });

          const trrs = await db.findMany('trrs', {
            filters: [{ field: 'owner', operator: '==', value: user.id }],
          });

          const completedTRRs = trrs.filter((trr: any) =>
            trr.status === 'completed' || trr.status === 'approved'
          );

          // Calculate activity score
          const activityScore = povs.length * 10 + completedTRRs.length * 20;

          return {
            userId: user.id,
            displayName: user.displayName || user.email,
            povsCreated: povs.length,
            trrsCompleted: completedTRRs.length,
            activityScore,
          };
        })
      );

      return userStats
        .sort((a, b) => b.activityScore - a.activityScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top users:', error);
      return [];
    }
  }

  /**
   * Calculate trends for a period
   */
  private calculateTrends(povs: any[], trrs: any[], period: string): any {
    const intervals = this.getIntervals(period);
    const povsCreated: number[] = new Array(intervals.length).fill(0);
    const trrsSubmitted: number[] = new Array(intervals.length).fill(0);
    const activityScore: number[] = new Array(intervals.length).fill(0);

    povs.forEach((pov: any) => {
      const index = this.getIntervalIndex(new Date(pov.createdAt), intervals);
      if (index >= 0 && index < intervals.length) {
        povsCreated[index]++;
        activityScore[index] += 10;
      }
    });

    trrs.forEach((trr: any) => {
      const index = this.getIntervalIndex(new Date(trr.createdAt), intervals);
      if (index >= 0 && index < intervals.length) {
        trrsSubmitted[index]++;
        activityScore[index] += 20;
      }
    });

    return {
      povsCreated,
      trrsSubmitted,
      activityScore,
      dates: intervals.map(d => d.toISOString().split('T')[0]),
    };
  }

  /**
   * Calculate system-wide trends
   */
  private calculateSystemTrends(povs: any[], trrs: any[], projects: any[], period: string): any {
    const intervals = this.getIntervals(period);
    const povsPerWeek: number[] = new Array(intervals.length).fill(0);
    const trrsPerWeek: number[] = new Array(intervals.length).fill(0);
    const projectsPerWeek: number[] = new Array(intervals.length).fill(0);

    povs.forEach((pov: any) => {
      const index = this.getIntervalIndex(new Date(pov.createdAt), intervals);
      if (index >= 0 && index < intervals.length) {
        povsPerWeek[index]++;
      }
    });

    trrs.forEach((trr: any) => {
      const index = this.getIntervalIndex(new Date(trr.createdAt), intervals);
      if (index >= 0 && index < intervals.length) {
        trrsPerWeek[index]++;
      }
    });

    projects.forEach((project: any) => {
      const index = this.getIntervalIndex(new Date(project.createdAt), intervals);
      if (index >= 0 && index < intervals.length) {
        projectsPerWeek[index]++;
      }
    });

    return {
      povsPerWeek,
      trrsPerWeek,
      projectsPerWeek,
      dates: intervals.map(d => d.toISOString().split('T')[0]),
    };
  }

  /**
   * Calculate user engagement metrics
   */
  private calculateUserEngagement(activityLogs: any[], period: string): any {
    const intervals = this.getIntervals(period);
    const dailyActiveUsers: number[] = new Array(intervals.length).fill(0);
    const weeklyActiveUsers: number[] = new Array(intervals.length).fill(0);

    intervals.forEach((date, index) => {
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const uniqueUsers = new Set(
        activityLogs
          .filter((log: any) => {
            const logDate = new Date(log.timestamp);
            return logDate >= dayStart && logDate < dayEnd;
          })
          .map((log: any) => log.userId)
      );

      dailyActiveUsers[index] = uniqueUsers.size;

      // For weekly, aggregate 7 days
      if (index >= 6) {
        const weekStart = new Date(intervals[index - 6]);
        const weekEnd = new Date(date);
        weekEnd.setDate(weekEnd.getDate() + 1);

        const weeklyUnique = new Set(
          activityLogs
            .filter((log: any) => {
              const logDate = new Date(log.timestamp);
              return logDate >= weekStart && logDate < weekEnd;
            })
            .map((log: any) => log.userId)
        );

        weeklyActiveUsers[index] = weeklyUnique.size;
      }
    });

    return {
      dailyActiveUsers,
      weeklyActiveUsers,
      dates: intervals.map(d => d.toISOString().split('T')[0]),
    };
  }

  /**
   * Calculate project health score
   */
  private calculateProjectHealth(project: any): 'good' | 'warning' | 'atRisk' {
    let score = 100;

    // Check if overdue
    if (project.endDate && new Date(project.endDate) < new Date() && project.status !== 'completed') {
      score -= 30;
    }

    // Check status
    if (project.status === 'on_hold') {
      score -= 20;
    }

    // Check priority
    if (project.priority === 'critical' || project.priority === 'high') {
      score -= 10;
    }

    if (score >= 80) return 'good';
    if (score >= 60) return 'warning';
    return 'atRisk';
  }

  /**
   * Get period date range
   */
  private getPeriodDates(period: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    return { startDate, endDate };
  }

  /**
   * Get time intervals for a period
   */
  private getIntervals(period: string): Date[] {
    const intervals: Date[] = [];
    const endDate = new Date();
    let count = 0;

    switch (period) {
      case 'week':
        count = 7;
        break;
      case 'month':
        count = 30;
        break;
      case 'quarter':
        count = 90;
        break;
      case 'year':
        count = 52; // weeks
        break;
    }

    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      intervals.push(date);
    }

    return intervals;
  }

  /**
   * Get interval index for a date
   */
  private getIntervalIndex(date: Date, intervals: Date[]): number {
    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i];
      const nextInterval = i < intervals.length - 1 ? intervals[i + 1] : new Date();

      if (date >= interval && date < nextInterval) {
        return i;
      }
    }

    return intervals.length - 1;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
