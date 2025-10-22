/**
 * AI Suggestions API Route Example
 *
 * Demonstrates:
 * - Fetching AI suggestions for entities
 * - Applying AI suggestions
 * - Dismissing suggestions
 * - Access control for AI features
 *
 * Copy files from this directory to app/api/ai/ to use
 */

import { NextRequest, NextResponse } from 'next/server';
import { backgroundAIOrchestrator } from '@cortex/ai';
import { accessControlService, type AccessContext } from '@cortex/db';

// ============================================================================
// GET SUGGESTIONS
// ============================================================================

/**
 * GET /api/ai/suggestions?entityType=pov&entityId=123
 *
 * Fetches AI suggestions for a specific entity
 */
export async function GET(request: NextRequest) {
  try {
    // Get access context
    const contextHeader = request.headers.get('x-access-context');
    if (!contextHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const context: AccessContext = JSON.parse(contextHeader);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const status = searchParams.get('status') || 'pending';

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entityType and entityId are required' },
        { status: 400 }
      );
    }

    // Check if user can access this entity
    const accessCheck = await accessControlService.canAccess(
      context,
      entityType,
      entityId,
      'read'
    );

    if (!accessCheck.granted) {
      return NextResponse.json(
        { error: 'Access denied to entity' },
        { status: 403 }
      );
    }

    // Get suggestions from AI orchestrator
    const suggestions = await backgroundAIOrchestrator.getSuggestionsForEntity(
      entityType,
      entityId,
      context.userId
    );

    // Filter by status
    const filteredSuggestions = status
      ? suggestions.filter(s => s.status === status)
      : suggestions;

    // Sort by confidence and impact
    const sortedSuggestions = filteredSuggestions.sort((a, b) => {
      // First by impact (high > medium > low)
      const impactOrder = { high: 3, medium: 2, low: 1 };
      const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
      if (impactDiff !== 0) return impactDiff;

      // Then by confidence
      return b.confidence - a.confidence;
    });

    return NextResponse.json({
      suggestions: sortedSuggestions,
      count: sortedSuggestions.length,
      entityType,
      entityId
    });
  } catch (error: any) {
    console.error('Error fetching AI suggestions:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// APPLY SUGGESTION
// ============================================================================

/**
 * POST /api/ai/suggestions/[id]/apply
 *
 * Applies an AI suggestion
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const suggestionId = params.id;

    // Get access context
    const contextHeader = request.headers.get('x-access-context');
    if (!contextHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const context: AccessContext = JSON.parse(contextHeader);

    // Apply suggestion
    const result = await backgroundAIOrchestrator.applySuggestion(
      suggestionId,
      context.userId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Log AI action
    await accessControlService.logAccess({
      userId: context.userId,
      action: 'write',
      resource: 'ai-suggestions',
      resourceId: suggestionId,
      accessGranted: true,
      metadata: {
        action: 'applied',
        enhancementType: result.enhancementType,
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Suggestion applied successfully',
      result: result.data
    });
  } catch (error: any) {
    console.error('Error applying AI suggestion:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// DISMISS SUGGESTION
// ============================================================================

/**
 * POST /api/ai/suggestions/[id]/dismiss
 *
 * Dismisses an AI suggestion
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const suggestionId = params.id;

    // Get access context
    const contextHeader = request.headers.get('x-access-context');
    if (!contextHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const context: AccessContext = JSON.parse(contextHeader);

    // Dismiss suggestion
    const result = await backgroundAIOrchestrator.dismissSuggestion(
      suggestionId,
      context.userId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Log AI action
    await accessControlService.logAccess({
      userId: context.userId,
      action: 'write',
      resource: 'ai-suggestions',
      resourceId: suggestionId,
      accessGranted: true,
      metadata: {
        action: 'dismissed',
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Suggestion dismissed'
    });
  } catch (error: any) {
    console.error('Error dismissing AI suggestion:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// USER AI PREFERENCES
// ============================================================================

/**
 * GET /api/ai/preferences
 *
 * Get user's AI preferences
 */
export async function getPreferences(request: NextRequest) {
  try {
    const contextHeader = request.headers.get('x-access-context');
    if (!contextHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const context: AccessContext = JSON.parse(contextHeader);

    const preferences = await backgroundAIOrchestrator.getUserPreferences(
      context.userId
    );

    return NextResponse.json({
      preferences
    });
  } catch (error: any) {
    console.error('Error fetching AI preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ai/preferences
 *
 * Update user's AI preferences
 */
export async function updatePreferences(request: NextRequest) {
  try {
    const contextHeader = request.headers.get('x-access-context');
    if (!contextHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const context: AccessContext = JSON.parse(contextHeader);
    const preferences = await request.json();

    await backgroundAIOrchestrator.setUserPreferences(
      context.userId,
      preferences
    );

    return NextResponse.json({
      success: true,
      message: 'Preferences updated',
      preferences
    });
  } catch (error: any) {
    console.error('Error updating AI preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
