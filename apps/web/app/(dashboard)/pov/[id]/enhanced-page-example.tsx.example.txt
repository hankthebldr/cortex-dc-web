/**
 * Enhanced POV Detail Page Example
 *
 * This example demonstrates integration of:
 * - Federated data access with access control
 * - Background AI suggestions
 * - AI content disclaimer modal
 * - Manager/team visibility
 *
 * Copy this file to app/(dashboard)/pov/[id]/page.tsx to use
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertTriangle,
  Download,
  Sparkles,
  Users,
  Lock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AIContentDisclaimerModal, useAIDisclaimerCheck } from '@/components/ai/AIContentDisclaimerModal';

// ============================================================================
// TYPES
// ============================================================================

interface POV {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'planning' | 'in_progress' | 'testing' | 'validating' | 'completed';
  projectId: string;
  ownerId: string;
  ownerName: string;
  groupIds: string[];
  phases: POVPhase[];
  objectives: POVObjective[];
  createdAt: Date;
  updatedAt: Date;
  aiEnhanced: boolean;
}

interface POVPhase {
  id: string;
  name: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
}

interface POVObjective {
  id: string;
  description: string;
  completed: boolean;
}

interface AISuggestion {
  id: string;
  enhancementType: 'content_suggestion' | 'risk_analysis' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  status: 'pending' | 'applied' | 'dismissed';
  createdAt: Date;
}

interface AccessInfo {
  scope: 'user' | 'group' | 'global';
  canEdit: boolean;
  canDelete: boolean;
  viewingAsManager: boolean;
}

interface Blueprint {
  id: string;
  povId: string;
  aiGenerated: boolean;
  aiConfidence: number;
  generatedAt: Date;
  fileSize: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EnhancedPOVDetailPage() {
  const params = useParams();
  const povId = params.id as string;

  // State
  const [pov, setPOV] = useState<POV | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [accessInfo, setAccessInfo] = useState<AccessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Disclaimer
  const [showBlueprintDisclaimer, setShowBlueprintDisclaimer] = useState(false);
  const hasBlueprintDisclaimerAccepted = useAIDisclaimerCheck('blueprint');

  // UI State
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [applyingSuggestion, setApplyingSuggestion] = useState<string | null>(null);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    loadPOVData();
    loadAISuggestions();
  }, [povId]);

  const loadPOVData = async () => {
    try {
      setLoading(true);

      // Fetch POV with access control
      const response = await fetch(`/api/povs/${povId}`);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view this POV.');
        }
        throw new Error('Failed to load POV');
      }

      const data = await response.json();

      setPOV(data.pov);
      setAccessInfo(data.accessInfo);
      setBlueprint(data.blueprint);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAISuggestions = async () => {
    try {
      const response = await fetch(`/api/ai/suggestions?entityType=pov&entityId=${povId}`);

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error('Failed to load AI suggestions:', err);
    }
  };

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleDownloadBlueprint = () => {
    if (!blueprint) return;

    if (hasBlueprintDisclaimerAccepted) {
      // User has accepted disclaimer before, download directly
      downloadBlueprintFile();
    } else {
      // Show disclaimer modal first
      setShowBlueprintDisclaimer(true);
    }
  };

  const downloadBlueprintFile = async () => {
    try {
      const response = await fetch(`/api/blueprints/${blueprint!.id}/download`);

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blueprint-${povId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download blueprint');
    }
  };

  const handleApplySuggestion = async (suggestionId: string) => {
    setApplyingSuggestion(suggestionId);

    try {
      const response = await fetch(`/api/ai/suggestions/${suggestionId}/apply`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to apply suggestion');
      }

      // Reload data
      await loadPOVData();
      await loadAISuggestions();
    } catch (err) {
      alert('Failed to apply suggestion');
    } finally {
      setApplyingSuggestion(null);
    }
  };

  const handleDismissSuggestion = async (suggestionId: string) => {
    try {
      await fetch(`/api/ai/suggestions/${suggestionId}/dismiss`, {
        method: 'POST'
      });

      // Remove from list
      setSuggestions(suggestions.filter(s => s.id !== suggestionId));
    } catch (err) {
      alert('Failed to dismiss suggestion');
    }
  };

  const handleUpdateStatus = async (newStatus: POV['status']) => {
    try {
      const response = await fetch(`/api/povs/${povId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Reload to get new AI suggestions for new stage
      await loadPOVData();
      await loadAISuggestions();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading POV...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 text-red-800 mb-2">
            <XCircle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Error Loading POV</h2>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!pov) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">POV not found</p>
      </div>
    );
  }

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Access Info Banner */}
        {accessInfo && (
          <div className="mb-4">
            {accessInfo.scope === 'global' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-800">
                  Viewing as Admin (Global Access)
                </span>
              </div>
            )}
            {accessInfo.viewingAsManager && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Viewing as Manager (Team POV from {pov.ownerName})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{pov.title}</h1>
                {pov.aiEnhanced && (
                  <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Enhanced
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-4">{pov.description}</p>

              {/* Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <select
                    value={pov.status}
                    onChange={(e) => handleUpdateStatus(e.target.value as POV['status'])}
                    disabled={!accessInfo?.canEdit}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="draft">Draft</option>
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="testing">Testing</option>
                    <option value="validating">Validating</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Owner:</span>
                  <span className="font-medium">{pov.ownerName}</span>
                </div>
              </div>
            </div>

            {/* Blueprint Download */}
            {blueprint && (
              <div>
                <button
                  onClick={handleDownloadBlueprint}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold flex items-center gap-2 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Download Blueprint
                </button>
                {blueprint.aiGenerated && (
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    AI Generated ({Math.round(blueprint.aiConfidence * 100)}% confidence)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Phases */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Phases</h2>
              <div className="space-y-3">
                {pov.phases.map((phase) => (
                  <div
                    key={phase.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{phase.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                        phase.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {phase.status}
                      </span>
                    </div>
                    {phase.startDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(phase.startDate).toLocaleDateString()} - {' '}
                        {phase.endDate ? new Date(phase.endDate).toLocaleDateString() : 'In Progress'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Objectives */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Objectives</h2>
              <div className="space-y-2">
                {pov.objectives.map((objective) => (
                  <div
                    key={objective.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    {objective.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0" />
                    )}
                    <span className={objective.completed ? 'text-gray-500 line-through' : 'text-gray-900'}>
                      {objective.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Suggestions Sidebar */}
          <div className="col-span-1">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Suggestions
                </h2>
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {showSuggestions ? 'Hide' : 'Show'}
                </button>
              </div>

              {showSuggestions && (
                <>
                  {pendingSuggestions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No suggestions at this time</p>
                      <p className="text-xs text-gray-400 mt-1">
                        AI is analyzing your POV in the background
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="bg-white rounded-lg p-4 border border-purple-200"
                        >
                          {/* Suggestion Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  suggestion.impact === 'high' ? 'bg-red-100 text-red-800' :
                                  suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {suggestion.impact.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {Math.round(suggestion.confidence * 100)}% confident
                                </span>
                              </div>
                              <h3 className="font-medium text-sm">{suggestion.title}</h3>
                            </div>
                          </div>

                          {/* Suggestion Content */}
                          <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>

                          {/* Suggestion Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApplySuggestion(suggestion.id)}
                              disabled={applyingSuggestion === suggestion.id}
                              className="flex-1 px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 disabled:bg-gray-400"
                            >
                              {applyingSuggestion === suggestion.id ? 'Applying...' : 'Apply'}
                            </button>
                            <button
                              onClick={() => handleDismissSuggestion(suggestion.id)}
                              className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50"
                            >
                              Dismiss
                            </button>
                          </div>

                          {/* Timestamp */}
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(suggestion.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Disclaimer Modal */}
      {blueprint && (
        <AIContentDisclaimerModal
          isOpen={showBlueprintDisclaimer}
          onClose={() => setShowBlueprintDisclaimer(false)}
          onAccept={() => {
            setShowBlueprintDisclaimer(false);
            downloadBlueprintFile();
          }}
          contentType="blueprint"
          aiConfidence={blueprint.aiConfidence}
          generatedDate={blueprint.generatedAt}
          title={pov.title}
        />
      )}
    </div>
  );
}
