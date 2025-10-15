// Data services
export * from './data-service';

// Access control and permissions
export { accessControlService, AccessControlService } from './access-control-service';
export type { AccessContext, DataScope, AccessQuery, AccessAuditLog } from './access-control-service';

// Group management
export { groupManagementService, GroupManagementService } from './group-management-service';
export type { Group, GroupMembership, CreateGroupRequest } from './group-management-service';

// Federated data service (with built-in access control)
export { federatedDataService, FederatedDataService } from './federated-data-service';
export type { QueryOptions, QueryResult, DataAccessStats } from './federated-data-service';

// User management services (migrated from henryreed.ai)
// Export only the service and types from user-management-service
export {
  userManagementService,
  UserManagementService
} from './user-management-service';
export type {
  UserProfile,
  CreateUserRequest,
  UpdateUserRequest,
  UserActivity,
  UserSettings
} from './user-management-service';

// User management API client (for self-hosted mode)
export { userManagementApiClient } from './user-management-api-client';

// Note: user-activity-service exports are handled explicitly to avoid type conflicts
export { userActivityService } from './user-activity-service';
export * from './rbac-middleware';

// DC workflow services (migrated from henryreed.ai)
// Note: dc-context-store exports are handled explicitly to avoid type conflicts
export { dcContextStore } from './dc-context-store';

// Database validation service
export { databaseValidationService, DatabaseValidationService } from './database-validation-service';
export type { ValidationResult, ValidationReport } from './database-validation-service';

// Analytics service
export { analyticsService, AnalyticsService } from './analytics-service';
export type { UserAnalytics, AdminAnalytics } from './analytics-service';

// Relationship management service
export { relationshipManagementService, RelationshipManagementService } from './relationship-management-service';
export type { RelationshipValidation, RelationshipGraph } from './relationship-management-service';

// Dynamic record service
export { dynamicRecordService, DynamicRecordService } from './dynamic-record-service';
export type { RecordCreationOptions, LifecycleTransition } from './dynamic-record-service';

// Terraform generation service
export { terraformGenerationService, TerraformGenerationService } from './terraform-generation-service';
export type { TerraformConfig, TerraformResource, ScenarioTerraformOutput } from './terraform-generation-service';

// Event tracking service (for PostgreSQL-optimized analytics)
export { eventTrackingService, EventTrackingService } from './event-tracking-service';
export type {
  ActivityLogEvent,
  LoginEventData,
  UserSessionData,
  LoginAnalytics,
  UserActivityAnalytics
} from './event-tracking-service';

// Redis cache service (for high-performance caching)
export { redisCacheService, getRedisCacheService, RedisCacheService, CacheKeys, CacheInvalidationPatterns } from './redis-cache-service';
export type { CacheOptions, CacheStats } from './redis-cache-service';

// Data migration and import services
export { RecordProcessingOrchestrator, DEFAULT_CONFIG } from './migration/record-processing-orchestrator';
export type {
  ProcessingConfig,
  StagingRecord,
  ImportConfiguration,
  ValidationResult as MigrationValidationResult,
  TransformedRecord,
  WriteResult,
  ProcessingMetrics,
  JobResult
} from './migration/record-processing-orchestrator';

// OpenSearch service (full-text search with fuzzy matching and autocomplete)
export { openSearchService, OpenSearchService } from './search/opensearch-service';
export type {
  SearchOptions,
  SearchResult,
  BulkIndexDocument,
  IndexStats
} from './search/opensearch-service';

// Memgraph service (graph database for user interactions and recommendations)
export { memgraphService, MemgraphService } from './search/memgraph-service';
export type {
  Interaction,
  Recommendation,
  TrendingEntity,
  UserSimilarity,
  InteractionStats
} from './search/memgraph-service';
