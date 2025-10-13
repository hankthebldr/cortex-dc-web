// @cortex/content - Content management and knowledge base system

// Content Library Service (migrated from henryreed.ai)
export { ContentLibraryService, contentLibraryService } from './services/content-library-service';

// Knowledge Base System (migrated from henryreed.ai)
export { KnowledgeBase, knowledgeBase, KBUtils } from './services/knowledge-base';

export type {
  KnowledgeBaseEntry,
  SearchFilters,
  SearchResult,
} from './services/knowledge-base';

// Content Types (migrated from henryreed.ai)
export type {
  ContentItem,
  ContentDifficulty,
  ContentCategory,
  ContentMetadata,
  ContentExportData,
  ContentUsageStats,
  ContentFilters,
  ContentAnalytics,
} from './types/content-item';

// Existing exports
export * from './components';
export * from './services';
export * from './types';
