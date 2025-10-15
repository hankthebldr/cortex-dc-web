/**
 * Recommendations API Endpoint
 * AI-powered personalized recommendations using Memgraph collaborative filtering
 *
 * Features:
 * - Personalized entity recommendations based on user behavior
 * - Collaborative filtering using similar user patterns
 * - Trending entity detection
 * - Confidence scoring for recommendations
 * - Support for POVs, TRRs, Projects, and Users
 */

import { NextRequest, NextResponse } from 'next/server';
import { memgraphService } from '@cortex/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface GetRecommendationsRequest {
  userId: string;
  limit?: number;
  entityType?: string;
  minConfidence?: number;
}

/**
 * GET /api/recommendations - Get personalized recommendations for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limitParam = searchParams.get('limit');
    const entityType = searchParams.get('entityType');
    const minConfidenceParam = searchParams.get('minConfidence');

    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const minConfidence = minConfidenceParam ? parseFloat(minConfidenceParam) : 0;

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'limit must be between 1 and 50' },
        { status: 400 }
      );
    }

    if (minConfidence < 0 || minConfidence > 1) {
      return NextResponse.json(
        { error: 'minConfidence must be between 0 and 1' },
        { status: 400 }
      );
    }

    // Check if Memgraph is ready
    if (!memgraphService.isReady()) {
      console.warn('[Recommendations API] Memgraph not ready, returning empty recommendations');
      return NextResponse.json({
        success: true,
        recommendations: [],
        message: 'Recommendation service not available',
        userId
      });
    }

    // Get recommendations from Memgraph
    const recommendations = await memgraphService.getRecommendations(userId, limit);

    // Filter by entity type if specified
    let filteredRecommendations = recommendations;
    if (entityType) {
      filteredRecommendations = recommendations.filter(
        rec => rec.entityType.toLowerCase() === entityType.toLowerCase()
      );
    }

    // Filter by minimum confidence
    if (minConfidence > 0) {
      filteredRecommendations = filteredRecommendations.filter(
        rec => rec.confidence >= minConfidence
      );
    }

    // Also get trending entities as fallback/supplement
    const trending = await memgraphService.getTrending(entityType, 7, 5);

    return NextResponse.json({
      success: true,
      userId,
      recommendations: filteredRecommendations,
      trending: trending.map(t => ({
        entityId: t.entityId,
        entityType: t.entityType,
        score: t.trendScore,
        reason: `Trending: ${t.interactionCount} interactions from ${t.uniqueUsers} users`,
        confidence: Math.min(t.uniqueUsers / 10, 1),
        metadata: {
          interactionCount: t.interactionCount,
          uniqueUsers: t.uniqueUsers
        }
      })),
      filters: {
        entityType: entityType || 'all',
        minConfidence,
        limit
      },
      total: filteredRecommendations.length
    });

  } catch (error) {
    console.error('[Recommendations API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations - Get batch recommendations for multiple users
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds, limit = 10, entityType, minConfidence = 0 } = body;

    // Validation
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds must be a non-empty array' },
        { status: 400 }
      );
    }

    if (userIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 users per batch request' },
        { status: 400 }
      );
    }

    if (!memgraphService.isReady()) {
      return NextResponse.json({
        success: true,
        recommendations: {},
        message: 'Recommendation service not available'
      });
    }

    // Get recommendations for each user
    const batchRecommendations: Record<string, any[]> = {};

    await Promise.all(
      userIds.map(async (userId: string) => {
        try {
          let recommendations = await memgraphService.getRecommendations(userId, limit);

          // Filter by entity type
          if (entityType) {
            recommendations = recommendations.filter(
              rec => rec.entityType.toLowerCase() === entityType.toLowerCase()
            );
          }

          // Filter by confidence
          if (minConfidence > 0) {
            recommendations = recommendations.filter(
              rec => rec.confidence >= minConfidence
            );
          }

          batchRecommendations[userId] = recommendations;
        } catch (error) {
          console.error(`[Recommendations API] Error for user ${userId}:`, error);
          batchRecommendations[userId] = [];
        }
      })
    );

    return NextResponse.json({
      success: true,
      recommendations: batchRecommendations,
      filters: {
        entityType: entityType || 'all',
        minConfidence,
        limit
      },
      userCount: userIds.length
    });

  } catch (error) {
    console.error('[Recommendations API] Batch error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate batch recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
