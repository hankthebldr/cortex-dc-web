'use client';

// Data service for analytics and engagement tracking
// Migrated from henryreed.ai/hosting/lib/data-service.ts
// Provides Firestore queries for DC engagements and OKRs

import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase-config';

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
  source: 'firestore' | 'mock' | 'empty';
};

export type BlueprintSummary = {
  engagements: number;
  scenariosExecuted: number;
  detectionsValidated: number;
  trrWins: number;
  trrLosses: number;
  avgCycleDays: number;
  source: 'firestore' | 'mock' | 'empty';
};

/**
 * Fetch analytics data from Firestore with optional filters
 * @param filters - Region, theatre, user, and time range filters
 * @returns Analytics data including engagement records and OKRs
 */
export async function fetchAnalytics(filters: AnalyticsFilters): Promise<AnalyticsResult> {
  const sinceDays = filters.sinceDays ?? 90;
  const since = new Date(Date.now() - sinceDays * 86400000);

  try {
    // Build base collection query
    const col = collection(db as any, 'dc_engagements');
    const constraints: any[] = [];

    // Add time range filter
    constraints.push(where('createdAt', '>=', Timestamp.fromDate(since)));

    // Add optional filters
    if (filters.region && filters.region !== 'GLOBAL') {
      constraints.push(where('region', '==', filters.region));
    }
    if (filters.theatre && filters.theatre !== 'all') {
      constraints.push(where('theatre', '==', filters.theatre));
    }
    if (filters.user && filters.user !== 'all') {
      constraints.push(where('user', '==', filters.user));
    }

    let q = query(col, ...constraints);
    let snap = await getDocs(q);

    // Fallback if query fails due to missing index
    if (snap.empty && constraints.length > 1) {
      console.warn('Query with filters returned empty, falling back to date-only filter');
      q = query(col, where('createdAt', '>=', Timestamp.fromDate(since)));
      snap = await getDocs(q);
    }

    // Transform Firestore documents to typed records
    const records: EngagementRecord[] = snap.docs.map((d) => {
      const v: any = d.data();
      const createdAt = v.createdAt?.toDate
        ? v.createdAt.toDate()
        : new Date(v.createdAt || Date.now());
      const completedAt = v.completedAt?.toDate
        ? v.completedAt.toDate()
        : v.completedAt
        ? new Date(v.completedAt)
        : null;

      // Calculate cycle days if not provided
      const cycleDays =
        v.cycleDays ??
        (completedAt
          ? Math.max(0, Math.round((completedAt.getTime() - createdAt.getTime()) / 86400000))
          : undefined);

      return {
        region: v.region || 'UNKNOWN',
        theatre: v.theatre || 'UNKNOWN',
        user: (v.user || 'unknown').toLowerCase(),
        location: v.location || 'N/A',
        customer: v.customer || 'unknown',
        createdAt,
        completedAt,
        scenariosExecuted: v.scenariosExecuted ?? 0,
        detectionsValidated: v.detectionsValidated ?? 0,
        trrOutcome: v.trrOutcome ?? null,
        cycleDays,
      };
    });

    // Fetch OKRs from separate collection
    const okrSnap = await getDocs(collection(db as any, 'dc_okrs'));
    const okrs = okrSnap.docs.map((d) => {
      const v: any = d.data();
      return {
        id: d.id,
        name: v.name || d.id,
        progress: Number(v.progress ?? 0),
      };
    });

    return {
      records,
      okrs,
      source: records.length ? 'firestore' : 'empty',
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
    const col = collection(db as any, 'dc_engagements');
    const q = query(
      col,
      where('customer', '==', customer),
      where('createdAt', '>=', Timestamp.fromDate(since))
    );

    const snap = await getDocs(q);

    // Transform documents to records
    const records: EngagementRecord[] = snap.docs.map((d) => {
      const v: any = d.data();
      const createdAt = v.createdAt?.toDate
        ? v.createdAt.toDate()
        : new Date(v.createdAt || Date.now());
      const completedAt = v.completedAt?.toDate
        ? v.completedAt.toDate()
        : v.completedAt
        ? new Date(v.completedAt)
        : null;

      const cycleDays =
        v.cycleDays ??
        (completedAt
          ? Math.max(0, Math.round((completedAt.getTime() - createdAt.getTime()) / 86400000))
          : undefined);

      return {
        region: v.region || 'UNKNOWN',
        theatre: v.theatre || 'UNKNOWN',
        user: (v.user || 'unknown').toLowerCase(),
        location: v.location || 'N/A',
        customer: v.customer || 'unknown',
        createdAt,
        completedAt,
        scenariosExecuted: v.scenariosExecuted ?? 0,
        detectionsValidated: v.detectionsValidated ?? 0,
        trrOutcome: v.trrOutcome ?? null,
        cycleDays,
      };
    });

    // Aggregate statistics
    const sum = (a: number, b: number) => a + b;
    const engagements = records.length;
    const scenariosExecuted = records.map((r) => r.scenariosExecuted ?? 0).reduce(sum, 0);
    const detectionsValidated = records.map((r) => r.detectionsValidated ?? 0).reduce(sum, 0);
    const trrWins = records.filter((r) => r.trrOutcome === 'win').length;
    const trrLosses = records.filter((r) => r.trrOutcome === 'loss').length;
    const avgCycleDays = records.length
      ? Math.round(records.map((r) => r.cycleDays ?? 0).reduce(sum, 0) / records.length)
      : 0;

    return {
      engagements,
      scenariosExecuted,
      detectionsValidated,
      trrWins,
      trrLosses,
      avgCycleDays,
      source: engagements ? 'firestore' : 'empty',
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
