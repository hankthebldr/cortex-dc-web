/**
 * Search API Endpoint
 * Full-text search across POVs, TRRs, Users, and Projects using OpenSearch
 *
 * Features:
 * - Multi-entity search with type filtering
 * - Fuzzy matching and autocomplete
 * - Result highlighting
 * - Pagination support
 * - Memgraph interaction tracking
 * - Fallback to database search if OpenSearch unavailable
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, openSearchService, memgraphService } from '@cortex/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SearchRequestBody {
  query: string;
  types?: string[]; // ['povs', 'trrs', 'users', 'projects']
  limit?: number;
  offset?: number;
  userId?: string; // For tracking user interactions
  filters?: Record<string, any>;
}

/**
 * POST /api/search - Advanced search with OpenSearch
 */
export async function POST(request: NextRequest) {
  try {
    const body: SearchRequestBody = await request.json();
    const { query, types, limit = 10, offset = 0, userId, filters } = body;

    // Validation
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required and must be a string' },
        { status: 400 }
      );
    }

    if (query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Try OpenSearch first, fallback to database if unavailable
    let results;
    let searchMethod = 'opensearch';

    if (openSearchService.isReady()) {
      results = await openSearchService.search({
        query: query.trim(),
        types,
        limit,
        offset,
        userId,
        filters
      });
    } else {
      console.warn('[Search API] OpenSearch not available, falling back to database search');
      searchMethod = 'database';
      results = await fallbackDatabaseSearch(query.trim(), types, limit);
    }

    // Track search interaction in Memgraph (non-blocking)
    if (userId && results.length > 0 && memgraphService.isReady()) {
      // Fire and forget - don't await
      memgraphService.trackInteraction({
        userId,
        action: 'search',
        entityType: 'Search',
        entityId: query,
        metadata: {
          query,
          types,
          resultCount: results.length,
          searchMethod,
          timestamp: new Date().toISOString()
        }
      }).catch(err => {
        console.warn('[Search API] Failed to track interaction:', err);
      });
    }

    return NextResponse.json({
      success: true,
      results,
      pagination: {
        total: results.length,
        limit,
        offset,
        hasMore: results.length === limit
      },
      query: {
        text: query,
        types: types || ['all'],
        filters
      },
      searchMethod
    });

  } catch (error) {
    console.error('[Search API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Search operation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/search - Lightweight search and autocomplete
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const types = searchParams.get('types')?.split(',') || ['povs', 'trrs', 'projects', 'scenarios'];
    const limitParam = searchParams.get('limit');
    const autocomplete = searchParams.get('autocomplete') === 'true';
    const userId = searchParams.get('userId');

    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], suggestions: [] });
    }

    // Autocomplete mode - return suggestions only
    if (autocomplete && openSearchService.isReady()) {
      const suggestions = await openSearchService.getSuggestions(
        query,
        types[0] || undefined,
        Math.min(limit, 10)
      );

      return NextResponse.json({
        success: true,
        suggestions,
        query
      });
    }

    // Full search mode
    let results;
    let searchMethod = 'opensearch';

    if (openSearchService.isReady()) {
      results = await openSearchService.search({
        query: query.trim(),
        types,
        limit,
        offset: 0
      });
    } else {
      searchMethod = 'database';
      results = await fallbackDatabaseSearch(query.trim(), types, limit);
    }

    // Track interaction
    if (userId && results.length > 0 && memgraphService.isReady()) {
      memgraphService.trackInteraction({
        userId,
        action: 'search',
        entityType: 'Search',
        entityId: query,
        metadata: { query, types, resultCount: results.length, searchMethod }
      }).catch(() => {}); // Silent fail
    }

    return NextResponse.json({
      results: results.slice(0, 50), // Limit total results
      query,
      total: results.length,
      searchMethod
    });

  } catch (error) {
    console.error('[Search API] GET error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Fallback database search when OpenSearch is unavailable
 */
async function fallbackDatabaseSearch(
  query: string,
  types: string[] | undefined,
  limit: number
): Promise<any[]> {
  const db = getDatabase();
  const results: any[] = [];
  const searchTypes = types || ['povs', 'trrs', 'projects', 'scenarios'];

  // Search POVs
  if (searchTypes.includes('povs') || searchTypes.includes('pov')) {
    try {
      const povs = await db.findMany('povs', {
        limit,
        orderBy: 'updatedAt',
        orderDirection: 'desc',
      });

      const filtered = povs.filter((pov: any) =>
        pov.title?.toLowerCase().includes(query.toLowerCase()) ||
        pov.description?.toLowerCase().includes(query.toLowerCase()) ||
        pov.tags?.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
      );

      filtered.forEach((pov: any) => {
        results.push({
          id: pov.id,
          type: 'povs',
          title: pov.title,
          description: pov.description,
          score: calculateScore(pov, query),
          metadata: {
            status: pov.status,
            projectId: pov.projectId,
            createdAt: pov.createdAt,
            tags: pov.tags,
          },
        });
      });
    } catch (error) {
      console.error('[Fallback Search] Error searching POVs:', error);
    }
  }

  // Search TRRs
  if (searchTypes.includes('trrs') || searchTypes.includes('trr')) {
    try {
      const trrs = await db.findMany('trrs', {
        limit,
        orderBy: 'updatedAt',
        orderDirection: 'desc',
      });

      const filtered = trrs.filter((trr: any) =>
        trr.title?.toLowerCase().includes(query.toLowerCase()) ||
        trr.description?.toLowerCase().includes(query.toLowerCase())
      );

      filtered.forEach((trr: any) => {
        results.push({
          id: trr.id,
          type: 'trrs',
          title: trr.title,
          description: trr.description,
          score: calculateScore(trr, query),
          metadata: {
            status: trr.status,
            projectId: trr.projectId,
            povId: trr.povId,
            createdAt: trr.createdAt,
          },
        });
      });
    } catch (error) {
      console.error('[Fallback Search] Error searching TRRs:', error);
    }
  }

  // Search Projects
  if (searchTypes.includes('projects') || searchTypes.includes('project')) {
    try {
      const projects = await db.findMany('projects', {
        limit,
        orderBy: 'updatedAt',
        orderDirection: 'desc',
      });

      const filtered = projects.filter((project: any) =>
        project.title?.toLowerCase().includes(query.toLowerCase()) ||
        project.description?.toLowerCase().includes(query.toLowerCase()) ||
        project.customer?.name?.toLowerCase().includes(query.toLowerCase())
      );

      filtered.forEach((project: any) => {
        results.push({
          id: project.id,
          type: 'projects',
          title: project.title,
          description: project.description,
          score: calculateScore(project, query),
          metadata: {
            status: project.status,
            customer: project.customer,
            createdAt: project.createdAt,
          },
        });
      });
    } catch (error) {
      console.error('[Fallback Search] Error searching Projects:', error);
    }
  }

  // Search Scenarios
  if (searchTypes.includes('scenarios') || searchTypes.includes('demo')) {
    try {
      const scenarios = await db.findMany('scenarios', {
        limit,
        orderBy: 'updatedAt',
        orderDirection: 'desc',
      });

      const filtered = scenarios.filter((scenario: any) =>
        scenario.title?.toLowerCase().includes(query.toLowerCase()) ||
        scenario.description?.toLowerCase().includes(query.toLowerCase())
      );

      filtered.forEach((scenario: any) => {
        results.push({
          id: scenario.id,
          type: 'scenarios',
          title: scenario.title,
          description: scenario.description,
          score: calculateScore(scenario, query),
          metadata: {
            status: scenario.status,
            povId: scenario.povId,
            createdAt: scenario.createdAt,
          },
        });
      });
    } catch (error) {
      console.error('[Fallback Search] Error searching Scenarios:', error);
    }
  }

  // Sort by relevance score
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Calculate relevance score for fallback search
 */
function calculateScore(item: any, query: string): number {
  const q = query.toLowerCase();
  let score = 0;

  // Title exact match: 10 points
  if (item.title?.toLowerCase() === q) score += 10;
  // Title starts with query: 5 points
  else if (item.title?.toLowerCase().startsWith(q)) score += 5;
  // Title contains query: 3 points
  else if (item.title?.toLowerCase().includes(q)) score += 3;

  // Description contains query: 2 points
  if (item.description?.toLowerCase().includes(q)) score += 2;

  // Tag match: 1 point per tag
  if (item.tags?.some((tag: string) => tag.toLowerCase().includes(q))) {
    score += 1;
  }

  return score;
}
