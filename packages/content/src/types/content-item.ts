/**
 * Content Item Types - Migrated from henryreed.ai
 *
 * Type definitions for content library items including:
 * - Content metadata
 * - MITRE ATT&CK mappings
 * - Platform information
 * - Usage statistics
 */

/**
 * Content item difficulty levels
 */
export type ContentDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Content item categories
 */
export type ContentCategory =
  | 'Scenarios'
  | 'Playbooks'
  | 'Detection Rules'
  | 'Response Plans'
  | 'Training'
  | 'Documentation'
  | 'Templates'
  | 'Tools';

/**
 * Content item metadata
 */
export interface ContentMetadata {
  /** Supported platforms */
  platforms?: string[];
  /** MITRE ATT&CK technique IDs */
  mitreAttck?: string[];
  /** Required dependencies */
  dependencies?: string[];
  /** Estimated completion time in minutes */
  estimatedTime?: number;
  /** Prerequisites */
  prerequisites?: string[];
  /** Related content IDs */
  relatedContent?: string[];
}

/**
 * Content library item
 */
export interface ContentItem {
  /** Unique identifier */
  id: string;
  /** Item title */
  title: string;
  /** Item description */
  description: string;
  /** Primary category */
  category: ContentCategory;
  /** Optional subcategory */
  subcategory?: string;
  /** Difficulty level */
  difficulty: ContentDifficulty;
  /** Content tags for search/filtering */
  tags: string[];
  /** Content author */
  author: string;
  /** Version number */
  version: string;
  /** Last updated timestamp */
  lastUpdated: string;
  /** User rating (1-5) */
  rating: number;
  /** Usage count */
  usageCount: number;
  /** Additional metadata */
  metadata: ContentMetadata;
  /** Optional content body */
  content?: string;
  /** Optional download URL */
  downloadUrl?: string;
}

/**
 * Content export data structure
 */
export interface ContentExportData {
  /** Export format version */
  version: string;
  /** Export timestamp */
  exportDate: string;
  /** Content items */
  items: ContentItem[];
  /** Export metadata */
  metadata: {
    totalItems: number;
    categories: string[];
    avgRating: number;
  };
}

/**
 * Content usage statistics
 */
export interface ContentUsageStats {
  /** Number of views */
  views: number;
  /** Number of uses/downloads */
  uses: number;
  /** Last access timestamp */
  lastAccessed: Date;
}

/**
 * Content filter options
 */
export interface ContentFilters {
  /** Filter by categories */
  categories?: string[];
  /** Filter by difficulty levels */
  difficulties?: ContentDifficulty[];
  /** Minimum rating filter */
  minRating?: number;
  /** Filter by tags */
  tags?: string[];
  /** Filter by date range */
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Content analytics data
 */
export interface ContentAnalytics {
  /** Total number of items */
  totalItems: number;
  /** Count by category */
  categoryCounts: Record<string, number>;
  /** Count by difficulty */
  difficultyCounts: Record<string, number>;
  /** Average rating */
  avgRating: number;
  /** Total usage count */
  totalUsage: number;
  /** Most popular tags */
  topTags: Record<string, number>;
  /** Rating distribution */
  ratingDistribution: Record<number, number>;
}
