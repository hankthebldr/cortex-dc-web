/**
 * Interactions API Endpoint
 * Track user interactions with entities for Memgraph analytics
 *
 * Features:
 * - Track view, click, search_click, create, update, delete actions
 * - Support for POV, TRR, User, Project entity types
 * - User interaction history retrieval
 * - Trending entities detection
 * - User similarity analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { memgraphService } from '@cortex/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TrackInteractionRequest {
  userId: string;
  action: 'view' | 'click' | 'search_click' | 'create' | 'update' | 'delete';
  entityType: 'POV' | 'TRR' | 'User' | 'Project' | 'Search';
  entityId: string;
  metadata?: Record<string, any>;
}

interface GetInteractionsRequest {
  userId: string;
  limit?: number;
}

interface GetTrendingRequest {
  entityType?: string;
  days?: number;
  limit?: number;
}

interface GetSimilarUsersRequest {
  userId: string;
  limit?: number;
}

/**
 * POST /api/interactions - Track a new interaction
 */
export async function POST(request: NextRequest) {
  try {
    const body: TrackInteractionRequest = await request.json();
    const { userId, action, entityType, entityId, metadata } = body;

    // Validation
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required and must be a string' },
        { status: 400 }
      );
    }

    if (!action || !['view', 'click', 'search_click', 'create', 'update', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be one of: view, click, search_click, create, update, delete' },
        { status: 400 }
      );
    }

    if (!entityType || !['POV', 'TRR', 'User', 'Project', 'Search'].includes(entityType)) {
      return NextResponse.json(
        { error: 'entityType must be one of: POV, TRR, User, Project, Search' },
        { status: 400 }
      );
    }

    if (!entityId || typeof entityId !== 'string') {
      return NextResponse.json(
        { error: 'entityId is required and must be a string' },
        { status: 400 }
      );
    }

    // Check if Memgraph is ready
    if (!memgraphService.isReady()) {
      console.warn('[Interactions API] Memgraph not ready, interaction not tracked');
      return NextResponse.json(
        {
          success: false,
          error: 'Interaction tracking service not available'
        },
        { status: 503 }
      );
    }

    // Track interaction
    await memgraphService.trackInteraction({
      userId,
      action,
      entityType,
      entityId,
      timestamp: new Date(),
      metadata: metadata || {}
    });

    return NextResponse.json({
      success: true,
      message: 'Interaction tracked successfully',
      interaction: {
        userId,
        action,
        entityType,
        entityId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Interactions API] Error tracking interaction:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track interaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/interactions - Get interactions, trending entities, or similar users
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (!memgraphService.isReady()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Interaction service not available'
        },
        { status: 503 }
      );
    }

    // Get user interaction history
    if (action === 'history') {
      const userId = searchParams.get('userId');
      const limitParam = searchParams.get('limit');
      const limit = limitParam ? parseInt(limitParam, 10) : 50;

      if (!userId) {
        return NextResponse.json(
          { error: 'userId parameter is required for action=history' },
          { status: 400 }
        );
      }

      const interactions = await memgraphService.getUserInteractions(userId, limit);

      return NextResponse.json({
        success: true,
        userId,
        interactions,
        total: interactions.length
      });
    }

    // Get trending entities
    if (action === 'trending') {
      const entityType = searchParams.get('entityType') || undefined;
      const daysParam = searchParams.get('days');
      const limitParam = searchParams.get('limit');

      const days = daysParam ? parseInt(daysParam, 10) : 7;
      const limit = limitParam ? parseInt(limitParam, 10) : 10;

      const trending = await memgraphService.getTrending(entityType, days, limit);

      return NextResponse.json({
        success: true,
        trending,
        filters: {
          entityType: entityType || 'all',
          days,
          limit
        }
      });
    }

    // Get similar users
    if (action === 'similar') {
      const userId = searchParams.get('userId');
      const limitParam = searchParams.get('limit');
      const limit = limitParam ? parseInt(limitParam, 10) : 10;

      if (!userId) {
        return NextResponse.json(
          { error: 'userId parameter is required for action=similar' },
          { status: 400 }
        );
      }

      const similarUsers = await memgraphService.findSimilarUsers(userId, limit);

      return NextResponse.json({
        success: true,
        userId,
        similarUsers,
        total: similarUsers.length
      });
    }

    // Get interaction statistics
    if (action === 'stats') {
      const stats = await memgraphService.getInteractionStats();

      return NextResponse.json({
        success: true,
        stats
      });
    }

    // Invalid action
    return NextResponse.json(
      {
        error: 'Invalid action parameter. Must be one of: history, trending, similar, stats'
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('[Interactions API] GET error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve interactions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/interactions - Delete user data (GDPR compliance)
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    if (!memgraphService.isReady()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Interaction service not available'
        },
        { status: 503 }
      );
    }

    await memgraphService.deleteUserData(userId);

    return NextResponse.json({
      success: true,
      message: `All interaction data deleted for user: ${userId}`
    });

  } catch (error) {
    console.error('[Interactions API] DELETE error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
