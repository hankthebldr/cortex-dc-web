/**
 * Content Library Service - Migrated from henryreed.ai
 *
 * Advanced content management service providing:
 * - Favorites management
 * - Usage statistics tracking
 * - Content export/import (JSON)
 * - Advanced search and filtering
 * - Content analytics
 * - Recommendation engine
 *
 * Uses local storage for persistence with SSR-safe implementations.
 */

import type {
  ContentItem,
  ContentExportData,
  ContentUsageStats,
  ContentFilters,
  ContentAnalytics,
} from '../types/content-item';

/**
 * Content Library Service Class
 *
 * Singleton service for managing content library operations including
 * favorites, usage tracking, search, analytics, and recommendations.
 */
export class ContentLibraryService {
  private static instance: ContentLibraryService;
  private favorites: Set<string> = new Set();
  private usageStats: Map<string, ContentUsageStats> = new Map();
  private readonly STORAGE_PREFIX = 'cortex_dc_content_';

  /**
   * Get singleton instance
   */
  static getInstance(): ContentLibraryService {
    if (!ContentLibraryService.instance) {
      ContentLibraryService.instance = new ContentLibraryService();
    }
    return ContentLibraryService.instance;
  }

  // ===== Favorites Management =====

  /**
   * Toggle favorite status for a content item
   *
   * @param itemId - Content item identifier
   * @returns True if now favorited, false if unfavorited
   */
  toggleFavorite(itemId: string): boolean {
    if (this.favorites.has(itemId)) {
      this.favorites.delete(itemId);
      this.saveFavorites();
      return false;
    } else {
      this.favorites.add(itemId);
      this.saveFavorites();
      return true;
    }
  }

  /**
   * Check if item is favorited
   *
   * @param itemId - Content item identifier
   * @returns True if favorited
   */
  isFavorite(itemId: string): boolean {
    return this.favorites.has(itemId);
  }

  /**
   * Get all favorite item IDs
   *
   * @returns Array of favorited item IDs
   */
  getFavorites(): string[] {
    return Array.from(this.favorites);
  }

  /**
   * Save favorites to local storage
   */
  private saveFavorites(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `${this.STORAGE_PREFIX}favorites`,
        JSON.stringify(Array.from(this.favorites))
      );
    }
  }

  /**
   * Load favorites from local storage
   */
  loadFavorites(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${this.STORAGE_PREFIX}favorites`);
      if (saved) {
        try {
          const favArray = JSON.parse(saved);
          this.favorites = new Set(favArray);
        } catch (e) {
          console.warn('Failed to load favorites:', e);
        }
      }
    }
  }

  // ===== Usage Statistics =====

  /**
   * Track content view
   *
   * @param itemId - Content item identifier
   */
  trackView(itemId: string): void {
    const current = this.usageStats.get(itemId) || {
      views: 0,
      uses: 0,
      lastAccessed: new Date(),
    };
    current.views += 1;
    current.lastAccessed = new Date();
    this.usageStats.set(itemId, current);
    this.saveUsageStats();
  }

  /**
   * Track content usage (download/execution)
   *
   * @param itemId - Content item identifier
   */
  trackUsage(itemId: string): void {
    const current = this.usageStats.get(itemId) || {
      views: 0,
      uses: 0,
      lastAccessed: new Date(),
    };
    current.uses += 1;
    current.lastAccessed = new Date();
    this.usageStats.set(itemId, current);
    this.saveUsageStats();
  }

  /**
   * Get usage statistics for an item
   *
   * @param itemId - Content item identifier
   * @returns Usage statistics
   */
  getUsageStats(itemId: string): ContentUsageStats {
    return (
      this.usageStats.get(itemId) || {
        views: 0,
        uses: 0,
        lastAccessed: new Date(),
      }
    );
  }

  /**
   * Save usage stats to local storage
   */
  private saveUsageStats(): void {
    if (typeof window !== 'undefined') {
      const statsObject = Object.fromEntries(
        Array.from(this.usageStats.entries()).map(([key, value]) => [
          key,
          {
            ...value,
            lastAccessed: value.lastAccessed.toISOString(),
          },
        ])
      );
      localStorage.setItem(`${this.STORAGE_PREFIX}usage`, JSON.stringify(statsObject));
    }
  }

  /**
   * Load usage stats from local storage
   */
  loadUsageStats(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${this.STORAGE_PREFIX}usage`);
      if (saved) {
        try {
          const statsObject = JSON.parse(saved);
          this.usageStats = new Map(
            Object.entries(statsObject).map(([key, value]: [string, any]) => [
              key,
              {
                ...value,
                lastAccessed: new Date(value.lastAccessed),
              },
            ])
          );
        } catch (e) {
          console.warn('Failed to load usage stats:', e);
        }
      }
    }
  }

  // ===== Content Export/Import =====

  /**
   * Export content items to JSON
   *
   * @param items - Content items to export
   * @returns JSON string
   */
  exportContent(items: ContentItem[]): string {
    const exportData: ContentExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      items: items,
      metadata: {
        totalItems: items.length,
        categories: [...new Set(items.map((item) => item.category))],
        avgRating: items.reduce((sum, item) => sum + item.rating, 0) / items.length || 0,
      },
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import content items from JSON
   *
   * @param jsonData - JSON string to import
   * @returns Import result with validated items or error
   */
  importContent(jsonData: string): {
    success: boolean;
    items?: ContentItem[];
    error?: string;
  } {
    try {
      const importData = JSON.parse(jsonData);

      // Validate structure
      if (!importData.items || !Array.isArray(importData.items)) {
        return { success: false, error: 'Invalid format: missing items array' };
      }

      // Validate each item
      const validatedItems: ContentItem[] = [];
      for (const item of importData.items) {
        if (this.validateContentItem(item)) {
          validatedItems.push(item);
        } else {
          console.warn('Skipped invalid item:', item.id);
        }
      }

      return { success: true, items: validatedItems };
    } catch (error) {
      return {
        success: false,
        error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Validate content item structure
   */
  private validateContentItem(item: any): boolean {
    const requiredFields = [
      'id',
      'title',
      'description',
      'category',
      'difficulty',
      'tags',
      'author',
      'version',
    ];
    return requiredFields.every((field) => item[field] !== undefined);
  }

  // ===== Search and Filtering =====

  /**
   * Search content items by query
   *
   * @param items - Content items to search
   * @param query - Search query
   * @returns Filtered content items
   */
  searchContent(items: ContentItem[], query: string): ContentItem[] {
    if (!query.trim()) return items;

    const searchTerms = query
      .toLowerCase()
      .split(' ')
      .filter((term) => term.length > 0);

    return items.filter((item) => {
      const searchableText = [
        item.title,
        item.description,
        item.author,
        item.subcategory || '',
        ...item.tags,
        ...(item.metadata.platforms || []),
        ...(item.metadata.mitreAttck || []),
      ]
        .join(' ')
        .toLowerCase();

      return searchTerms.every((term) => searchableText.includes(term));
    });
  }

  /**
   * Filter content items with advanced filters
   *
   * @param items - Content items to filter
   * @param filters - Filter criteria
   * @returns Filtered content items
   */
  filterContent(items: ContentItem[], filters: ContentFilters): ContentItem[] {
    return items.filter((item) => {
      // Category filter
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(item.category)) return false;
      }

      // Difficulty filter
      if (filters.difficulties && filters.difficulties.length > 0) {
        if (!filters.difficulties.includes(item.difficulty)) return false;
      }

      // Rating filter
      if (filters.minRating && item.rating < filters.minRating) {
        return false;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) =>
          item.tags.some((itemTag) => itemTag.toLowerCase().includes(tag.toLowerCase()))
        );
        if (!hasMatchingTag) return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const itemDate = new Date(item.lastUpdated);
        if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }

  // ===== Content Analytics =====

  /**
   * Generate analytics for content items
   *
   * @param items - Content items to analyze
   * @returns Analytics data
   */
  getContentAnalytics(items: ContentItem[]): ContentAnalytics {
    const analytics: ContentAnalytics = {
      totalItems: items.length,
      categoryCounts: {},
      difficultyCounts: {},
      avgRating: 0,
      totalUsage: 0,
      topTags: {},
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    if (items.length === 0) return analytics;

    items.forEach((item) => {
      // Category counts
      analytics.categoryCounts[item.category] =
        (analytics.categoryCounts[item.category] || 0) + 1;

      // Difficulty counts
      analytics.difficultyCounts[item.difficulty] =
        (analytics.difficultyCounts[item.difficulty] || 0) + 1;

      // Rating calculations
      analytics.avgRating += item.rating;
      const ratingFloor = Math.floor(item.rating);
      if (ratingFloor >= 1 && ratingFloor <= 5) {
        analytics.ratingDistribution[ratingFloor as keyof typeof analytics.ratingDistribution]++;
      }

      // Usage totals
      analytics.totalUsage += item.usageCount;

      // Tag frequency
      item.tags.forEach((tag) => {
        analytics.topTags[tag] = (analytics.topTags[tag] || 0) + 1;
      });
    });

    analytics.avgRating = analytics.avgRating / items.length;

    // Sort top tags
    const sortedTags = Object.entries(analytics.topTags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    analytics.topTags = Object.fromEntries(sortedTags);

    return analytics;
  }

  // ===== Content Recommendations =====

  /**
   * Generate content recommendations based on current item
   *
   * Uses scoring algorithm considering:
   * - Category match
   * - Difficulty similarity
   * - Tag overlap
   * - MITRE ATT&CK technique overlap
   * - Platform overlap
   * - Item rating
   *
   * @param currentItem - Current content item
   * @param allItems - All available content items
   * @param limit - Maximum number of recommendations
   * @returns Recommended content items
   */
  getRecommendations(
    currentItem: ContentItem,
    allItems: ContentItem[],
    limit: number = 5
  ): ContentItem[] {
    const recommendations = allItems
      .filter((item) => item.id !== currentItem.id)
      .map((item) => {
        let score = 0;

        // Same category bonus (3 points)
        if (item.category === currentItem.category) score += 3;

        // Similar difficulty (up to 2 points)
        const difficultyOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
        const currentLevel = difficultyOrder.indexOf(currentItem.difficulty);
        const itemLevel = difficultyOrder.indexOf(item.difficulty);
        const difficultyDistance = Math.abs(currentLevel - itemLevel);
        score += Math.max(0, 2 - difficultyDistance);

        // Tag overlap (1 point per common tag)
        const commonTags = item.tags.filter((tag) => currentItem.tags.includes(tag));
        score += commonTags.length;

        // MITRE ATT&CK overlap (0.5 points per technique)
        if (item.metadata.mitreAttck && currentItem.metadata.mitreAttck) {
          const commonTechniques = item.metadata.mitreAttck.filter((tech) =>
            currentItem.metadata.mitreAttck?.includes(tech)
          );
          score += commonTechniques.length * 0.5;
        }

        // Platform overlap (0.3 points per platform)
        if (item.metadata.platforms && currentItem.metadata.platforms) {
          const commonPlatforms = item.metadata.platforms.filter((platform) =>
            currentItem.metadata.platforms?.includes(platform)
          );
          score += commonPlatforms.length * 0.3;
        }

        // Rating bonus (up to 1 point)
        score += item.rating * 0.2;

        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((rec) => rec.item);

    return recommendations;
  }

  // ===== Initialization =====

  /**
   * Initialize service by loading saved data
   */
  initialize(): void {
    this.loadFavorites();
    this.loadUsageStats();
  }

  /**
   * Clear all stored data
   */
  clearAll(): void {
    this.favorites.clear();
    this.usageStats.clear();

    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${this.STORAGE_PREFIX}favorites`);
      localStorage.removeItem(`${this.STORAGE_PREFIX}usage`);
    }
  }
}

/**
 * Export singleton instance
 */
export const contentLibraryService = ContentLibraryService.getInstance();

/**
 * Default export
 */
export default contentLibraryService;
