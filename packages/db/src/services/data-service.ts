/**
 * Data Service for Analytics and Engagement Tracking (Refactored)
 * Uses database adapter for multi-backend support
 *
 * CHANGES FROM ORIGINAL:
 * - Removed direct Firebase Firestore imports
 * - Uses getDatabase() adapter instead of direct 'db' access
 * - Removed Firebase Timestamp - uses standard Date objects
 * - Works with any backend (Firebase, Postgres, etc.)
 *
 * NOTE: Can be used on both client and server
 */

import { getDatabase } from '../adapters/database.factory';
import type { DatabaseAdapter } from '../adapters/database.adapter';

export type AnalyticsFilters = {
  region?: string; // AMER | EMEA | APJ | GLOBAL
  theatre?: string | null;
  user?: string | null;
  sinceDays?: number; // default 90
};

export type EngagementRecord = {
  region: string;
  theatre: string;
  user: string;
  location: string;
  customer: string;
  createdAt: Date;
  completedAt?: Date | null;
  scenariosExecuted?: number;
  detectionsValidated?: number;
  trrOutcome?: 'win' | 'loss' | null;
  cycleDays?: number; // if missing, computed from dates
};

export type AnalyticsResult = {
  records: EngagementRecord[];
  okrs: { id: string; name: string; progress: number }[];
  source: 'database' | 'mock' | 'empty';
};

export type BlueprintSummary = {
  engagements: number;
  scenariosExecuted: number;
  detectionsValidated: number;
  trrWins: number;
  trrLosses: number;
  avgCycleDays: number;
  source: 'database' | 'mock' | 'empty';
};

/**
 * Fetch analytics data from database with optional filters
 * @param filters - Region, theatre, user, and time range filters
 * @returns Analytics data including engagement records and OKRs
 */
export async function fetchAnalytics(filters: AnalyticsFilters): Promise<AnalyticsResult> {
  const sinceDays = filters.sinceDays ?? 90;
  const since = new Date(Date.now() - sinceDays * 86400000);

  try {
    const db = getDatabase();

    // Build query filters
    const queryFilters: any[] = [];

    // Add time range filter
    queryFilters.push({
      field: 'createdAt',
      operator: '>=',
      value: since
    });

    // Add optional filters
    if (filters.region && filters.region !== 'GLOBAL') {
      queryFilters.push({
        field: 'region',
        operator: '==',
        value: filters.region
      });
    }
    if (filters.theatre && filters.theatre !== 'all') {
      queryFilters.push({
        field: 'theatre',
        operator: '==',
        value: filters.theatre
      });
    }
    if (filters.user && filters.user !== 'all') {
      queryFilters.push({
        field: 'user',
        operator: '==',
        value: filters.user
      });
    }

    // Execute query
    let engagements = await db.findMany('dc_engagements', {
      filters: queryFilters,
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });

    // Fallback if query fails or returns empty due to missing index
    if (engagements.length === 0 && queryFilters.length > 1) {
      console.warn('Query with filters returned empty, falling back to date-only filter');
      engagements = await db.findMany('dc_engagements', {
        filters: [queryFilters[0]], // Just the date filter
        orderBy: 'createdAt',
        orderDirection: 'desc'
      });
    }

    // Transform database documents to typed records
    const records: EngagementRecord[] = engagements.map((doc: any) => {
      // Handle date conversion (supports both Firestore Timestamp and Date objects)
      const createdAt = doc.createdAt instanceof Date
        ? doc.createdAt
        : doc.createdAt?.toDate
        ? doc.createdAt.toDate()
        : new Date(doc.createdAt || Date.now());

      const completedAt = doc.completedAt instanceof Date
        ? doc.completedAt
        : doc.completedAt?.toDate
        ? doc.completedAt.toDate()
        : doc.completedAt
        ? new Date(doc.completedAt)
        : null;

      // Calculate cycle days if not provided
      const cycleDays = doc.cycleDays ??
        (completedAt
          ? Math.max(0, Math.round((completedAt.getTime() - createdAt.getTime()) / 86400000))
          : undefined);

      return {
        region: doc.region || 'UNKNOWN',
        theatre: doc.theatre || 'UNKNOWN',
        user: (doc.user || 'unknown').toLowerCase(),
        location: doc.location || 'N/A',
        customer: doc.customer || 'unknown',
        createdAt,
        completedAt,
        scenariosExecuted: doc.scenariosExecuted ?? 0,
        detectionsValidated: doc.detectionsValidated ?? 0,
        trrOutcome: doc.trrOutcome ?? null,
        cycleDays,
      };
    });

    // Fetch OKRs from separate collection
    const okrsData = await db.findMany('dc_okrs', {});
    const okrs = okrsData.map((doc: any) => ({
      id: doc.id || doc._id,
      name: doc.name || doc.id || doc._id,
      progress: Number(doc.progress ?? 0),
    }));

    return {
      records,
      okrs,
      source: records.length ? 'database' : 'empty',
    };
  } catch (e) {
    console.error('Error fetching analytics:', e);
    // Fall back to empty data; caller can inject mock data if needed
    return { records: [], okrs: [], source: 'mock' };
  }
}

/**
 * Fetch summary statistics for a specific customer
 * Used for Badass Blueprint generation and customer reports
 * @param customer - Customer name to filter by
 * @param sinceDays - Number of days to look back (default 90)
 * @returns Aggregated statistics for the customer
 */
export async function fetchBlueprintSummary(
  customer: string,
  sinceDays: number = 90
): Promise<BlueprintSummary> {
  const since = new Date(Date.now() - sinceDays * 86400000);

  try {
    const db = getDatabase();

    // Query engagements for the customer
    const engagements = await db.findMany('dc_engagements', {
      filters: [
        {
          field: 'customer',
          operator: '==',
          value: customer
        },
        {
          field: 'createdAt',
          operator: '>=',
          value: since
        }
      ]
    });

    // Transform documents to records
    const records: EngagementRecord[] = engagements.map((doc: any) => {
      // Handle date conversion
      const createdAt = doc.createdAt instanceof Date
        ? doc.createdAt
        : doc.createdAt?.toDate
        ? doc.createdAt.toDate()
        : new Date(doc.createdAt || Date.now());

      const completedAt = doc.completedAt instanceof Date
        ? doc.completedAt
        : doc.completedAt?.toDate
        ? doc.completedAt.toDate()
        : doc.completedAt
        ? new Date(doc.completedAt)
        : null;

      const cycleDays = doc.cycleDays ??
        (completedAt
          ? Math.max(0, Math.round((completedAt.getTime() - createdAt.getTime()) / 86400000))
          : undefined);

      return {
        region: doc.region || 'UNKNOWN',
        theatre: doc.theatre || 'UNKNOWN',
        user: (doc.user || 'unknown').toLowerCase(),
        location: doc.location || 'N/A',
        customer: doc.customer || 'unknown',
        createdAt,
        completedAt,
        scenariosExecuted: doc.scenariosExecuted ?? 0,
        detectionsValidated: doc.detectionsValidated ?? 0,
        trrOutcome: doc.trrOutcome ?? null,
        cycleDays,
      };
    });

    // Aggregate statistics
    const sum = (a: number, b: number) => a + b;
    const engagementsCount = records.length;
    const scenariosExecuted = records.map((r) => r.scenariosExecuted ?? 0).reduce(sum, 0);
    const detectionsValidated = records.map((r) => r.detectionsValidated ?? 0).reduce(sum, 0);
    const trrWins = records.filter((r) => r.trrOutcome === 'win').length;
    const trrLosses = records.filter((r) => r.trrOutcome === 'loss').length;
    const avgCycleDays = records.length
      ? Math.round(records.map((r) => r.cycleDays ?? 0).reduce(sum, 0) / records.length)
      : 0;

    return {
      engagements: engagementsCount,
      scenariosExecuted,
      detectionsValidated,
      trrWins,
      trrLosses,
      avgCycleDays,
      source: engagementsCount ? 'database' : 'empty',
    };
  } catch (e) {
    console.error('Error fetching blueprint summary:', e);
    return {
      engagements: 0,
      scenariosExecuted: 0,
      detectionsValidated: 0,
      trrWins: 0,
      trrLosses: 0,
      avgCycleDays: 0,
      source: 'mock',
    };
  }
}

/**
 * Fetch engagement records for a specific user
 * @param userId - User identifier
 * @param sinceDays - Number of days to look back
 * @returns User's engagement records
 */
export async function fetchUserEngagements(
  userId: string,
  sinceDays: number = 90
): Promise<EngagementRecord[]> {
  const result = await fetchAnalytics({
    user: userId,
    sinceDays,
  });
  return result.records;
}

/**
 * Fetch engagement records for a specific region
 * @param region - Region code (AMER, EMEA, APJ, GLOBAL)
 * @param sinceDays - Number of days to look back
 * @returns Region's engagement records
 */
export async function fetchRegionEngagements(
  region: string,
  sinceDays: number = 90
): Promise<EngagementRecord[]> {
  const result = await fetchAnalytics({
    region,
    sinceDays,
  });
  return result.records;
}

/**
 * Calculate win rate from engagement records
 * @param records - Engagement records to analyze
 * @returns Win rate as percentage (0-100)
 */
export function calculateWinRate(records: EngagementRecord[]): number {
  const trrRecords = records.filter((r) => r.trrOutcome !== null);
  if (trrRecords.length === 0) return 0;

  const wins = trrRecords.filter((r) => r.trrOutcome === 'win').length;
  return Math.round((wins / trrRecords.length) * 100);
}

/**
 * Calculate average cycle days from engagement records
 * @param records - Engagement records to analyze
 * @returns Average cycle days
 */
export function calculateAvgCycleDays(records: EngagementRecord[]): number {
  const withCycleDays = records.filter((r) => r.cycleDays !== undefined);
  if (withCycleDays.length === 0) return 0;

  const total = withCycleDays.reduce((sum, r) => sum + (r.cycleDays ?? 0), 0);
  return Math.round(total / withCycleDays.length);
}

/**
 * Get top performing users
 * @param records - Engagement records to analyze
 * @param limit - Number of top users to return
 * @returns Top users by engagement count
 */
export function getTopPerformingUsers(
  records: EngagementRecord[],
  limit: number = 10
): Array<{ user: string; engagements: number; winRate: number }> {
  const userMap = new Map<string, { engagements: number; wins: number; total: number }>();

  records.forEach((record) => {
    const user = record.user;
    const stats = userMap.get(user) || { engagements: 0, wins: 0, total: 0 };

    stats.engagements++;
    if (record.trrOutcome) {
      stats.total++;
      if (record.trrOutcome === 'win') {
        stats.wins++;
      }
    }

    userMap.set(user, stats);
  });

  const topUsers = Array.from(userMap.entries())
    .map(([user, stats]) => ({
      user,
      engagements: stats.engagements,
      winRate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.engagements - a.engagements)
    .slice(0, limit);

  return topUsers;
}

/**
 * Get engagement trends over time
 * @param records - Engagement records to analyze
 * @returns Daily engagement counts
 */
export function getEngagementTrends(
  records: EngagementRecord[]
): Array<{ date: string; count: number }> {
  const dateMap = new Map<string, number>();

  records.forEach((record) => {
    const date = record.createdAt.toISOString().split('T')[0];
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });

  const trends = Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return trends;
}
