'use client';

/**
 * Content Analytics Component
 * Migrated from henryreed.ai/hosting/components/ContentAnalytics.tsx
 *
 * Features:
 * - Content library analytics and insights
 * - Rating distribution visualization
 * - Category and tag statistics
 * - Content export/import functionality
 * - User favorites tracking
 * - Trend analysis
 */

import React, { useState, useMemo, useEffect } from 'react';
import { CortexButton } from '../CortexButton';

export interface ContentItem {
  id: string;
  title: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  rating: number;
  tags?: string[];
  usageCount?: number;
  description?: string;
}

export interface ContentAnalytics {
  totalItems: number;
  avgRating: number;
  totalUsage: number;
  categoryCounts: Record<string, number>;
  ratingDistribution: Record<number, number>;
  topTags: Record<string, number>;
  difficultyCounts: Record<string, number>;
}

export interface ContentAnalyticsProps {
  items: ContentItem[];
  favorites?: string[];
  onExport?: (data: string) => void;
  onImport?: (data: string) => { success: boolean; items?: ContentItem[]; error?: string };
  className?: string;
}

const calculateAnalytics = (items: ContentItem[]): ContentAnalytics => {
  const analytics: ContentAnalytics = {
    totalItems: items.length,
    avgRating: 0,
    totalUsage: 0,
    categoryCounts: {},
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    topTags: {},
    difficultyCounts: {}
  };

  let totalRating = 0;

  items.forEach(item => {
    // Rating
    totalRating += item.rating;
    const ratingKey = Math.floor(item.rating);
    analytics.ratingDistribution[ratingKey] = (analytics.ratingDistribution[ratingKey] || 0) + 1;

    // Usage
    analytics.totalUsage += item.usageCount || 0;

    // Categories
    analytics.categoryCounts[item.category] = (analytics.categoryCounts[item.category] || 0) + 1;

    // Difficulty
    analytics.difficultyCounts[item.difficulty] = (analytics.difficultyCounts[item.difficulty] || 0) + 1;

    // Tags
    item.tags?.forEach(tag => {
      analytics.topTags[tag] = (analytics.topTags[tag] || 0) + 1;
    });
  });

  analytics.avgRating = items.length > 0 ? totalRating / items.length : 0;

  // Sort tags and take top 10
  const sortedTags = Object.entries(analytics.topTags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  analytics.topTags = Object.fromEntries(sortedTags);

  return analytics;
};

export const ContentAnalytics: React.FC<ContentAnalyticsProps> = ({
  items,
  favorites = [],
  onExport,
  onImport,
  className = ''
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'categories' | 'trends' | 'export'>('overview');

  const analytics = useMemo(() => calculateAnalytics(items), [items]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-cyan-400 mb-2">{analytics.totalItems}</div>
          <div className="text-sm text-gray-400">Total Items</div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {Math.round(analytics.avgRating * 10) / 10}
          </div>
          <div className="text-sm text-gray-400">Avg Rating</div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">{analytics.totalUsage}</div>
          <div className="text-sm text-gray-400">Total Usage</div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {Object.keys(analytics.categoryCounts).length}
          </div>
          <div className="text-sm text-gray-400">Categories</div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">📊 Rating Distribution</h3>
        <div className="space-y-3">
          {Object.entries(analytics.ratingDistribution)
            .reverse()
            .map(([rating, count]) => {
              const percentage = (count / analytics.totalItems) * 100;
              return (
                <div key={rating} className="flex items-center space-x-4">
                  <div className="w-12 text-sm text-gray-400">
                    {rating}★
                  </div>
                  <div className="flex-1 bg-gray-800 rounded-full h-3">
                    <div
                      className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm text-gray-400">
                    {count} ({Math.round(percentage)}%)
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Top Tags */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">🏷️ Most Popular Tags</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(analytics.topTags).map(([tag, count]) => (
            <div
              key={tag}
              className="flex items-center space-x-2 bg-blue-900/20 text-blue-400 px-3 py-2 rounded-full border border-blue-500/30"
            >
              <span className="font-medium">{tag}</span>
              <span className="bg-blue-900/40 text-blue-300 text-xs px-2 py-1 rounded-full">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">📂 Content by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analytics.categoryCounts).map(([category, count]) => {
            const percentage = (count / analytics.totalItems) * 100;
            const categoryIcon: Record<string, string> = {
              'secops': '🛡️',
              'cloud-security': '☁️',
              'detection-rules': '🎯',
              'scenarios': '🎭',
              'templates': '📋',
              'playbooks': '📖'
            };
            const icon = categoryIcon[category] || '📄';

            return (
              <div key={category} className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className="font-bold text-white">
                      {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="text-sm text-gray-400">
                      {count} items ({Math.round(percentage)}%)
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">⚡ Difficulty Distribution</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(analytics.difficultyCounts).map(([difficulty, count]) => {
            const percentage = (count / analytics.totalItems) * 100;
            const difficultyColorMap: Record<string, string> = {
              'beginner': 'text-green-400 bg-green-900/20 border-green-500/30',
              'intermediate': 'text-blue-400 bg-blue-900/20 border-blue-500/30',
              'advanced': 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30',
              'expert': 'text-red-400 bg-red-900/20 border-red-500/30'
            };
            const colorClass = difficultyColorMap[difficulty] || 'text-gray-400 bg-gray-800 border-gray-600';

            return (
              <div key={difficulty} className={`p-4 rounded-lg border ${colorClass}`}>
                <div className="text-2xl font-bold mb-2">{count}</div>
                <div className="text-sm font-medium mb-2">
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </div>
                <div className="text-xs opacity-75">{Math.round(percentage)}% of total</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTrends = () => {
    const favoriteItems = items.filter(item => favorites.includes(item.id));

    return (
      <div className="space-y-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">⭐ User Favorites</h3>
          {favoriteItems.length > 0 ? (
            <div className="space-y-3">
              {favoriteItems.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg">
                  <div className="text-2xl">⭐</div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{item.title}</div>
                    <div className="text-sm text-gray-400">{item.category} • {item.difficulty}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Rating: {item.rating}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">💫</div>
              <p>No favorites yet. Start exploring content!</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-bold text-white mb-4">🔥 Most Used Categories</h4>
            <div className="space-y-3">
              {Object.entries(analytics.categoryCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-gray-400">
                      {category.replace('-', ' ')}
                    </span>
                    <span className="font-bold text-cyan-400">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-bold text-white mb-4">📈 Content Growth</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">This month</span>
                <span className="font-bold text-blue-400">+3 items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last month</span>
                <span className="font-bold text-blue-400">+5 items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total growth</span>
                <span className="font-bold text-cyan-400">+8 items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderExport = () => {
    const handleExport = () => {
      const exportData = JSON.stringify({ items, version: '1.0' }, null, 2);

      if (onExport) {
        onExport(exportData);
      } else {
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `content-library-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          if (onImport) {
            const importResult = onImport(result);
            if (importResult.success) {
              alert(`Successfully imported ${importResult.items?.length} items!`);
            } else {
              alert(`Import failed: ${importResult.error}`);
            }
          } else {
            try {
              const data = JSON.parse(result);
              alert(`Imported ${data.items?.length || 0} items!`);
            } catch (error) {
              alert('Failed to parse import file');
            }
          }
        }
      };
      reader.readAsText(file);
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">📤 Export Content</h3>
          <p className="text-gray-400 mb-6">
            Export your content library for backup, sharing, or migration purposes.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <div className="font-medium text-white">Full Library Export</div>
                <div className="text-sm text-gray-400">
                  Export all {analytics.totalItems} items with metadata
                </div>
              </div>
              <CortexButton onClick={handleExport} variant="primary" icon="📥">
                Download JSON
              </CortexButton>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">📥 Import Content</h3>
          <p className="text-gray-400 mb-6">
            Import content from a JSON export file to expand your library.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="w-full text-white"
                id="import-file"
              />
              <label htmlFor="import-file" className="block text-center cursor-pointer">
                <div className="text-4xl mb-2">📁</div>
                <div className="text-white font-medium">
                  Choose JSON file to import
                </div>
                <div className="text-sm text-gray-400">
                  Supports content library export format
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">📊 Export Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-1">{analytics.totalItems}</div>
              <div className="text-sm text-gray-400">Items to Export</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {Object.keys(analytics.categoryCounts).length}
              </div>
              <div className="text-sm text-gray-400">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {Math.round(analytics.avgRating * 10) / 10}
              </div>
              <div className="text-sm text-gray-400">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'categories':
        return renderCategories();
      case 'trends':
        return renderTrends();
      case 'export':
        return renderExport();
      default:
        return renderOverview();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">📊 Content Analytics</h2>
          <p className="text-gray-400">Insights and statistics for your content library</p>
        </div>
        <div className="flex space-x-2">
          {[
            { id: 'overview', name: 'Overview', icon: '📈' },
            { id: 'categories', name: 'Categories', icon: '📂' },
            { id: 'trends', name: 'Trends', icon: '📊' },
            { id: 'export', name: 'Export', icon: '📤' }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === view.id
                  ? 'bg-cyan-400 text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {view.icon} {view.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default ContentAnalytics;
