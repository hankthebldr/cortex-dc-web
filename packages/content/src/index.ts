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

// Advanced Knowledge Base Service (migrated from henryreed.ai)
export {
  saveKnowledgeDocument,
  updateKnowledgeDocument,
  getKnowledgeDocument,
  deleteKnowledgeDocument,
  getAllKnowledgeDocuments,
  searchKnowledgeDocuments,
  buildKnowledgeGraph,
  findRelatedDocuments,
  getKnowledgeBaseStats,
  exportKnowledgeBase,
  importKnowledgeBase
} from './services/knowledge-base-service';

// Markdown Parser (migrated from henryreed.ai)
export {
  parseMarkdown,
  generateSuggestedTags,
  extractRelationships
} from './services/markdown-parser';

export type {
  MarkdownMetadata,
  ParsedMarkdown
} from './services/markdown-parser';

// Knowledge Base Types (migrated from henryreed.ai)
export type {
  KnowledgeDocument,
  DocumentMetadata,
  DocumentRelationship,
  RelationshipType,
  CustomFieldValue,
  CustomFieldType,
  CustomFieldDefinition,
  GraphNode,
  GraphEdge,
  KnowledgeGraph,
  NodeType,
  ImportResult
} from './types/knowledge-base';

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
// export * from './components'; // TODO: Enable after components are migrated
export * from './services';
export * from './types';
