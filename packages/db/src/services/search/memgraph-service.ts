/**
 * Memgraph Service
 * Graph database for user interaction tracking and AI-powered recommendations
 *
 * Features:
 * - User interaction tracking (views, clicks, searches)
 * - Relationship graph between users and entities
 * - Collaborative filtering recommendations
 * - Trending entity detection
 * - User similarity analysis
 * - AI-powered recommendation engine
 *
 * @see OPENSEARCH_MEMGRAPH_INTEGRATION_GUIDE.md for setup instructions
 */

import neo4j, { Driver, Session, Result } from 'neo4j-driver';

// ============================================================================
// INTERFACES
// ============================================================================

export interface Interaction {
  userId: string;
  action: string; // 'view', 'click', 'search_click', 'create', 'update', 'delete'
  entityType: string; // 'POV', 'TRR', 'User', 'Project'
  entityId: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface Recommendation {
  entityId: string;
  entityType: string;
  title?: string;
  score: number;
  reason: string;
  confidence: number; // 0-1
}

export interface TrendingEntity {
  entityId: string;
  entityType: string;
  interactionCount: number;
  uniqueUsers: number;
  trendScore: number;
}

export interface UserSimilarity {
  userId: string;
  similarityScore: number;
  commonInterests: number;
}

export interface InteractionStats {
  totalInteractions: number;
  uniqueUsers: number;
  uniqueEntities: number;
  topActions: Array<{ action: string; count: number }>;
  activityByDay: Array<{ date: string; count: number }>;
}

// ============================================================================
// MEMGRAPH SERVICE
// ============================================================================

export class MemgraphService {
  private driver: Driver | null = null;
  private isConnected = false;

  constructor() {
    // Driver will be initialized on connect()
  }

  /**
   * Connect to Memgraph database
   */
  async connect(): Promise<void> {
    try {
      const uri = process.env.MEMGRAPH_URI || 'bolt://localhost:7687';
      const user = process.env.MEMGRAPH_USER || '';
      const password = process.env.MEMGRAPH_PASSWORD || '';

      this.driver = neo4j.driver(
        uri,
        user && password ? neo4j.auth.basic(user, password) : neo4j.auth.none()
      );

      // Verify connectivity
      await this.driver.verifyConnectivity();
      this.isConnected = true;
      console.log('[Memgraph] Connected successfully');

      // Create constraints and indexes
      await this.createConstraintsAndIndexes();
    } catch (error) {
      console.error('[Memgraph] Connection failed:', error);
      this.isConnected = false;
      // Don't throw - allow app to run without graph features
    }
  }

  /**
   * Disconnect from Memgraph
   */
  async disconnect(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.isConnected = false;
      console.log('[Memgraph] Disconnected');
    }
  }

  /**
   * Check if connected to Memgraph
   */
  isReady(): boolean {
    return this.isConnected && this.driver !== null;
  }

  /**
   * Get a database session
   */
  private getSession(): Session {
    if (!this.driver) {
      throw new Error('Memgraph driver not initialized');
    }
    return this.driver.session();
  }

  /**
   * Create database constraints and indexes
   */
  private async createConstraintsAndIndexes(): Promise<void> {
    const session = this.getSession();

    try {
      // Note: Memgraph syntax may differ from Neo4j
      // These are example queries - adjust based on Memgraph documentation

      // Create indexes for better performance
      const indexQueries = [
        'CREATE INDEX ON :User(id);',
        'CREATE INDEX ON :POV(id);',
        'CREATE INDEX ON :TRR(id);',
        'CREATE INDEX ON :Project(id);',
        'CREATE INDEX ON :User(id);'
      ];

      for (const query of indexQueries) {
        try {
          await session.run(query);
        } catch (error: any) {
          // Index might already exist
          if (!error.message.includes('already exists')) {
            console.warn(`[Memgraph] Index creation warning:`, error.message);
          }
        }
      }

      console.log('[Memgraph] Constraints and indexes created');
    } catch (error) {
      console.error('[Memgraph] Error creating constraints:', error);
    } finally {
      await session.close();
    }
  }

  /**
   * Track a user interaction
   */
  async trackInteraction(interaction: Interaction): Promise<void> {
    if (!this.isReady()) {
      console.warn('[Memgraph] Service not ready, skipping interaction tracking');
      return;
    }

    const session = this.getSession();

    try {
      const { userId, action, entityType, entityId, metadata = {}, timestamp } = interaction;

      // Create query to merge user and entity, then create relationship
      const query = `
        MERGE (u:User {id: $userId})
        MERGE (e:${entityType} {id: $entityId})
        CREATE (u)-[r:${action.toUpperCase().replace(/-/g, '_')} {
          timestamp: datetime($timestamp),
          metadata: $metadata
        }]->(e)
        RETURN u, e, r
      `;

      await session.run(query, {
        userId,
        entityId,
        timestamp: (timestamp || new Date()).toISOString(),
        metadata: JSON.stringify(metadata)
      });

      console.log(`[Memgraph] Tracked interaction: ${userId} -[${action}]-> ${entityType}:${entityId}`);
    } catch (error) {
      console.error('[Memgraph] Error tracking interaction:', error);
    } finally {
      await session.close();
    }
  }

  /**
   * Get personalized recommendations for a user
   * Uses collaborative filtering based on similar users' interactions
   */
  async getRecommendations(userId: string, limit = 10): Promise<Recommendation[]> {
    if (!this.isReady()) return [];

    const session = this.getSession();

    try {
      // Find similar users based on common interactions
      // Then recommend entities that similar users interacted with
      const query = `
        MATCH (u:User {id: $userId})-[r1]->(e)
        MATCH (similar:User)-[r2]->(e)
        WHERE u <> similar

        WITH similar,
             COUNT(DISTINCT e) AS commonInterests,
             COUNT(r2) AS totalInteractions
        ORDER BY commonInterests DESC, totalInteractions DESC
        LIMIT 20

        MATCH (similar)-[r]->(recommended)
        WHERE NOT (u)-[]->(recommended)
          AND type(r) IN ['VIEW', 'CLICK', 'SEARCH_CLICK']

        WITH recommended,
             labels(recommended)[0] AS entityType,
             type(r) AS interactionType,
             COUNT(DISTINCT similar) AS userCount,
             COUNT(r) AS interactionCount,
             MAX(commonInterests) AS maxCommonInterests

        WITH recommended,
             entityType,
             userCount,
             interactionCount,
             maxCommonInterests,
             (userCount * 1.0 / 20.0) * (interactionCount * 1.0 / (userCount * 1.0)) * maxCommonInterests AS score,
             (userCount * 1.0 / 20.0) AS confidence

        RETURN
          recommended.id AS entityId,
          entityType,
          score,
          confidence,
          'Users similar to you also viewed this' AS reason,
          userCount,
          interactionCount
        ORDER BY score DESC
        LIMIT $limit
      `;

      const result = await session.run(query, { userId, limit });

      return result.records.map(record => ({
        entityId: record.get('entityId'),
        entityType: record.get('entityType'),
        score: record.get('score'),
        confidence: Math.min(record.get('confidence'), 1),
        reason: `${record.get('userCount')} similar users interacted with this ${record.get('interactionCount')} times`
      }));
    } catch (error) {
      console.error('[Memgraph] Error getting recommendations:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Get trending entities based on recent interactions
   */
  async getTrending(
    entityType?: string,
    days = 7,
    limit = 10
  ): Promise<TrendingEntity[]> {
    if (!this.isReady()) return [];

    const session = this.getSession();

    try {
      const typeFilter = entityType ? `:${entityType}` : '';

      const query = `
        MATCH (u:User)-[r]->(e${typeFilter})
        WHERE r.timestamp > datetime() - duration({days: $days})

        WITH e,
             labels(e)[0] AS entityType,
             COUNT(r) AS interactionCount,
             COUNT(DISTINCT u) AS uniqueUsers

        WITH e,
             entityType,
             interactionCount,
             uniqueUsers,
             (interactionCount * 1.0 * uniqueUsers * 1.0) / $days AS trendScore

        RETURN
          e.id AS entityId,
          entityType,
          interactionCount,
          uniqueUsers,
          trendScore
        ORDER BY trendScore DESC
        LIMIT $limit
      `;

      const result = await session.run(query, { days, limit });

      return result.records.map(record => ({
        entityId: record.get('entityId'),
        entityType: record.get('entityType'),
        interactionCount: record.get('interactionCount').toNumber(),
        uniqueUsers: record.get('uniqueUsers').toNumber(),
        trendScore: record.get('trendScore')
      }));
    } catch (error) {
      console.error('[Memgraph] Error getting trending:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Get user's interaction history
   */
  async getUserInteractions(userId: string, limit = 50): Promise<any[]> {
    if (!this.isReady()) return [];

    const session = this.getSession();

    try {
      const query = `
        MATCH (u:User {id: $userId})-[r]->(e)
        RETURN
          type(r) AS action,
          labels(e)[0] AS entityType,
          e.id AS entityId,
          r.timestamp AS timestamp,
          r.metadata AS metadata
        ORDER BY r.timestamp DESC
        LIMIT $limit
      `;

      const result = await session.run(query, { userId, limit });

      return result.records.map(record => ({
        action: record.get('action'),
        entityType: record.get('entityType'),
        entityId: record.get('entityId'),
        timestamp: record.get('timestamp'),
        metadata: this.parseJSON(record.get('metadata'))
      }));
    } catch (error) {
      console.error('[Memgraph] Error getting user interactions:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Find similar users based on interaction patterns
   */
  async findSimilarUsers(userId: string, limit = 10): Promise<UserSimilarity[]> {
    if (!this.isReady()) return [];

    const session = this.getSession();

    try {
      const query = `
        MATCH (u:User {id: $userId})-[r1]->(e)
        MATCH (similar:User)-[r2]->(e)
        WHERE u <> similar

        WITH similar,
             COUNT(DISTINCT e) AS commonInterests,
             COUNT(r1) AS userInteractions,
             COUNT(r2) AS similarInteractions

        WITH similar,
             commonInterests,
             commonInterests * 1.0 / (userInteractions + similarInteractions - commonInterests) AS jaccardSimilarity

        RETURN
          similar.id AS userId,
          jaccardSimilarity AS similarityScore,
          commonInterests
        ORDER BY similarityScore DESC
        LIMIT $limit
      `;

      const result = await session.run(query, { userId, limit });

      return result.records.map(record => ({
        userId: record.get('userId'),
        similarityScore: record.get('similarityScore'),
        commonInterests: record.get('commonInterests').toNumber()
      }));
    } catch (error) {
      console.error('[Memgraph] Error finding similar users:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Get interaction statistics
   */
  async getInteractionStats(): Promise<InteractionStats | null> {
    if (!this.isReady()) return null;

    const session = this.getSession();

    try {
      // Total interactions
      const totalQuery = 'MATCH ()-[r]->() RETURN COUNT(r) AS total';
      const totalResult = await session.run(totalQuery);
      const totalInteractions = totalResult.records[0].get('total').toNumber();

      // Unique users and entities
      const uniqueQuery = `
        MATCH (u:User)-[r]->(e)
        RETURN
          COUNT(DISTINCT u) AS uniqueUsers,
          COUNT(DISTINCT e) AS uniqueEntities
      `;
      const uniqueResult = await session.run(uniqueQuery);
      const uniqueUsers = uniqueResult.records[0].get('uniqueUsers').toNumber();
      const uniqueEntities = uniqueResult.records[0].get('uniqueEntities').toNumber();

      // Top actions
      const actionsQuery = `
        MATCH ()-[r]->()
        RETURN type(r) AS action, COUNT(r) AS count
        ORDER BY count DESC
        LIMIT 10
      `;
      const actionsResult = await session.run(actionsQuery);
      const topActions = actionsResult.records.map(record => ({
        action: record.get('action'),
        count: record.get('count').toNumber()
      }));

      // Activity by day (last 30 days)
      const activityQuery = `
        MATCH ()-[r]->()
        WHERE r.timestamp > datetime() - duration({days: 30})
        WITH date(r.timestamp) AS day, COUNT(r) AS count
        RETURN toString(day) AS date, count
        ORDER BY day
      `;
      const activityResult = await session.run(activityQuery);
      const activityByDay = activityResult.records.map(record => ({
        date: record.get('date'),
        count: record.get('count').toNumber()
      }));

      return {
        totalInteractions,
        uniqueUsers,
        uniqueEntities,
        topActions,
        activityByDay
      };
    } catch (error) {
      console.error('[Memgraph] Error getting stats:', error);
      return null;
    } finally {
      await session.close();
    }
  }

  /**
   * Delete all user interactions (for privacy/GDPR compliance)
   */
  async deleteUserData(userId: string): Promise<void> {
    if (!this.isReady()) return;

    const session = this.getSession();

    try {
      const query = `
        MATCH (u:User {id: $userId})-[r]-()
        DELETE r
        WITH u
        DELETE u
      `;

      await session.run(query, { userId });
      console.log(`[Memgraph] Deleted all data for user: ${userId}`);
    } catch (error) {
      console.error('[Memgraph] Error deleting user data:', error);
    } finally {
      await session.close();
    }
  }

  /**
   * Clear all data (use with caution!)
   */
  async clearAllData(): Promise<void> {
    if (!this.isReady()) return;

    const session = this.getSession();

    try {
      await session.run('MATCH (n) DETACH DELETE n');
      console.log('[Memgraph] Cleared all data');
    } catch (error) {
      console.error('[Memgraph] Error clearing data:', error);
    } finally {
      await session.close();
    }
  }

  /**
   * Parse JSON string safely
   */
  private parseJSON(jsonString: any): any {
    try {
      return JSON.parse(jsonString || '{}');
    } catch {
      return {};
    }
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const memgraphService = new MemgraphService();
export default memgraphService;
