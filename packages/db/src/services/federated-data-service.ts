/**
 * Federated Data Service
 * Optimized data queries with built-in access control
 *
 * This service provides high-level data operations that automatically
 * apply access control based on user role and group membership.
 *
 * Features:
 * - Automatic data isolation
 * - Optimized queries for different access levels
 * - Caching for frequently accessed data
 * - Batch operations with access checks
 * - Audit logging
 */

import { getDatabase } from '../adapters/database.factory';
import {
  AccessContext,
  accessControlService,
  AccessControlService
} from './access-control-service';
import { UserRole } from '../types/auth';

// ============================================================================
// TYPES
// ============================================================================

export interface QueryOptions {
  filters?: any[];
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  includeGroupData?: boolean;
  includeOrganizationData?: boolean;
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  scope: 'user' | 'group' | 'organization' | 'global';
}

export interface DataAccessStats {
  userDataCount: number;
  groupDataCount: number;
  totalAccessible: number;
  cacheHitRate: number;
}

// ============================================================================
// FEDERATED DATA SERVICE
// ============================================================================

export class FederatedDataService {
  private accessControl: AccessControlService;
  private queryCache: Map<string, { data: any; timestamp: number }>;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.accessControl = accessControlService;
    this.queryCache = new Map();
  }

  /**
   * Query data with automatic access control
   * This is the main entry point for all data queries
   */
  async query<T>(
    collection: string,
    context: AccessContext,
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const cacheKey = this.getCacheKey(collection, context, options);

    // Check cache
    const cached = this.getFromCache<QueryResult<T>>(cacheKey);
    if (cached) {
      return cached;
    }

    let data: T[];
    let scope: QueryResult<T>['scope'];

    // Admin gets all data (global scope)
    if (context.role === UserRole.ADMIN) {
      data = await this.queryGlobal<T>(collection, options);
      scope = 'global';
    }
    // Manager gets group data (group scope)
    else if (context.role === UserRole.MANAGER && options.includeGroupData) {
      data = await this.queryGroupScope<T>(collection, context, options);
      scope = 'group';
    }
    // Regular user gets own data (user scope)
    else {
      data = await this.queryUserScope<T>(collection, context, options);
      scope = 'user';
    }

    const result: QueryResult<T> = {
      data,
      total: data.length,
      hasMore: options.limit ? data.length === options.limit : false,
      scope
    };

    // Cache the result
    this.setCache(cacheKey, result);

    return result;
  }

  /**
   * Get single item with access check
   */
  async getOne<T>(
    collection: string,
    id: string,
    context: AccessContext
  ): Promise<T | null> {
    const db = getDatabase();
    const item = await db.findOne<T>(collection, id);

    if (!item) {
      return null;
    }

    // Check access
    const access = await this.accessControl.canAccess(
      context,
      collection,
      id,
      'read'
    );

    if (!access.granted) {
      // Log denied access
      await this.accessControl.logAccess({
        userId: context.userId,
        action: 'read',
        resource: collection,
        resourceId: id,
        accessGranted: false,
        reason: access.reason,
        metadata: { userRole: context.role }
      });
      return null;
    }

    // Log successful access
    await this.accessControl.logAccess({
      userId: context.userId,
      action: 'read',
      resource: collection,
      resourceId: id,
      accessGranted: true,
      metadata: { userRole: context.role }
    });

    return item;
  }

  /**
   * Create item with automatic ownership assignment
   */
  async create<T>(
    collection: string,
    data: Partial<T>,
    context: AccessContext,
    options: {
      groupIds?: string[];
      shareWithGroups?: string[];
    } = {}
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const db = getDatabase();

    try {
      // Automatically set owner
      const itemData = {
        ...data,
        ownerId: context.userId,
        createdBy: context.userId,
        groupIds: options.groupIds || context.groups || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const id = await db.create<T>(collection, itemData);

      // Log creation
      await this.accessControl.logAccess({
        userId: context.userId,
        action: 'write',
        resource: collection,
        resourceId: id,
        accessGranted: true,
        metadata: { userRole: context.role }
      });

      // Invalidate cache
      this.invalidateCache(collection);

      return { success: true, id };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create item'
      };
    }
  }

  /**
   * Update item with access check
   */
  async update<T>(
    collection: string,
    id: string,
    updates: Partial<T>,
    context: AccessContext
  ): Promise<{ success: boolean; error?: string }> {
    // Check write access
    const access = await this.accessControl.canAccess(
      context,
      collection,
      id,
      'write'
    );

    if (!access.granted) {
      await this.accessControl.logAccess({
        userId: context.userId,
        action: 'write',
        resource: collection,
        resourceId: id,
        accessGranted: false,
        reason: access.reason,
        metadata: { userRole: context.role }
      });

      return {
        success: false,
        error: 'You do not have permission to update this item'
      };
    }

    const db = getDatabase();

    try {
      await db.update(collection, id, {
        ...updates,
        updatedAt: new Date(),
        updatedBy: context.userId
      });

      // Log update
      await this.accessControl.logAccess({
        userId: context.userId,
        action: 'write',
        resource: collection,
        resourceId: id,
        accessGranted: true,
        metadata: { userRole: context.role }
      });

      // Invalidate cache
      this.invalidateCache(collection);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update item'
      };
    }
  }

  /**
   * Delete item with access check
   */
  async delete(
    collection: string,
    id: string,
    context: AccessContext
  ): Promise<{ success: boolean; error?: string }> {
    // Check delete access
    const access = await this.accessControl.canAccess(
      context,
      collection,
      id,
      'delete'
    );

    if (!access.granted) {
      await this.accessControl.logAccess({
        userId: context.userId,
        action: 'delete',
        resource: collection,
        resourceId: id,
        accessGranted: false,
        reason: access.reason,
        metadata: { userRole: context.role }
      });

      return {
        success: false,
        error: 'You do not have permission to delete this item'
      };
    }

    const db = getDatabase();

    try {
      await db.delete(collection, id);

      // Log deletion
      await this.accessControl.logAccess({
        userId: context.userId,
        action: 'delete',
        resource: collection,
        resourceId: id,
        accessGranted: true,
        metadata: { userRole: context.role }
      });

      // Invalidate cache
      this.invalidateCache(collection);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete item'
      };
    }
  }

  /**
   * Batch create with automatic ownership
   */
  async batchCreate<T>(
    collection: string,
    items: Partial<T>[],
    context: AccessContext
  ): Promise<{ success: number; failed: number; ids: string[] }> {
    const results = {
      success: 0,
      failed: 0,
      ids: [] as string[]
    };

    for (const item of items) {
      const result = await this.create<T>(collection, item, context);
      if (result.success && result.id) {
        results.success++;
        results.ids.push(result.id);
      } else {
        results.failed++;
      }
    }

    return results;
  }

  /**
   * Get access statistics for user
   */
  async getAccessStats(
    context: AccessContext,
    collections: string[]
  ): Promise<Record<string, DataAccessStats>> {
    const stats: Record<string, DataAccessStats> = {};

    for (const collection of collections) {
      const userScope = await this.queryUserScope(collection, context, {});
      const groupScope = context.role === UserRole.MANAGER
        ? await this.queryGroupScope(collection, context, { includeGroupData: true })
        : [];

      stats[collection] = {
        userDataCount: userScope.length,
        groupDataCount: groupScope.length - userScope.length,
        totalAccessible: groupScope.length || userScope.length,
        cacheHitRate: 0 // TODO: implement cache metrics
      };
    }

    return stats;
  }

  /**
   * Search across collections with access control
   */
  async search<T>(
    collections: string[],
    searchTerm: string,
    context: AccessContext,
    options: QueryOptions = {}
  ): Promise<Map<string, T[]>> {
    const results = new Map<string, T[]>();

    for (const collection of collections) {
      const collectionResults = await this.query<T>(collection, context, {
        ...options,
        // Add search filter if your database supports it
        filters: [
          ...(options.filters || []),
          // This would need to be adapted based on your search implementation
        ]
      });

      results.set(collection, collectionResults.data);
    }

    return results;
  }

  // ============================================================================
  // PRIVATE METHODS - SCOPE-SPECIFIC QUERIES
  // ============================================================================

  /**
   * Query global scope (admin only)
   */
  private async queryGlobal<T>(
    collection: string,
    options: QueryOptions
  ): Promise<T[]> {
    const db = getDatabase();

    return await db.findMany<T>(collection, {
      filters: options.filters,
      orderBy: options.orderBy,
      orderDirection: options.orderDirection,
      limit: options.limit
    });
  }

  /**
   * Query group scope (manager)
   */
  private async queryGroupScope<T>(
    collection: string,
    context: AccessContext,
    options: QueryOptions
  ): Promise<T[]> {
    return await this.accessControl.getAccessibleData<T>(
      collection,
      context,
      {
        filters: options.filters,
        orderBy: options.orderBy,
        limit: options.limit,
        includeGroupData: true
      }
    );
  }

  /**
   * Query user scope (regular user)
   */
  private async queryUserScope<T>(
    collection: string,
    context: AccessContext,
    options: QueryOptions
  ): Promise<T[]> {
    const db = getDatabase();

    return await db.findMany<T>(collection, {
      filters: [
        ...(options.filters || []),
        {
          field: 'ownerId',
          operator: '==',
          value: context.userId
        }
      ],
      orderBy: options.orderBy,
      orderDirection: options.orderDirection,
      limit: options.limit
    });
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  private getCacheKey(
    collection: string,
    context: AccessContext,
    options: QueryOptions
  ): string {
    return `${collection}:${context.userId}:${context.role}:${JSON.stringify(options)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.queryCache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.queryCache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache(key: string, data: any): void {
    this.queryCache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Limit cache size
    if (this.queryCache.size > 1000) {
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }
  }

  private invalidateCache(collection?: string): void {
    if (collection) {
      // Invalidate collection-specific caches
      for (const key of this.queryCache.keys()) {
        if (key.startsWith(collection + ':')) {
          this.queryCache.delete(key);
        }
      }
    } else {
      // Clear entire cache
      this.queryCache.clear();
    }
  }

  /**
   * Clear cache manually
   */
  clearCache(): void {
    this.queryCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    ttl: number;
    oldestEntry?: number;
  } {
    let oldestTimestamp = Date.now();

    for (const entry of this.queryCache.values()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    }

    return {
      size: this.queryCache.size,
      ttl: this.cacheTTL,
      oldestEntry: oldestTimestamp
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const federatedDataService = new FederatedDataService();
export default federatedDataService;
