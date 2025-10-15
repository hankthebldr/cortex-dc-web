// API services (migrated from henryreed.ai)
export * from './api';
export { userApiClient } from './api/user-api-client';
export type { UserProfile, CreateUserRequest, UpdateUserRequest } from './api/user-api-client';

// Utility functions
export { cn } from './cn';
export { formatDate, formatRelativeTime } from './date';
export { generateId, slugify } from './string';
export { debounce, throttle } from './async';
export { getBrowserInfo, generateSessionId } from './browser-info';
export type { BrowserInfo } from './browser-info';

// Validation utilities
export { validateEmail, validatePassword } from './validation';

// Parser utilities (migrated from henryreed.ai)
export * from './parsers/arg-parser';

// Storage utilities (migrated from henryreed.ai)
export { default as cloudStoreService, cloudStoreService as CloudStoreService } from './storage/cloud-store-service';
export type { CloudStoredMarkdown } from './storage/cloud-store-service';

// Context storage (migrated from henryreed.ai)
export { contextStorage } from './context/context-storage';
export type { UserContext } from './context/context-storage';

// Platform settings (migrated from henryreed.ai)
export { platformSettingsService } from './platform/platform-settings-service';
export type {
  PlatformEnvironment,
  ReleaseChannel,
  FeatureFlagDefinition,
  FeatureFlagState,
  EnvironmentConfig,
  PlatformSettingsAuditEntry,
  PlatformSettingsDocument,
} from './platform/platform-settings-service';

// Constants
export * from './constants/app';
export * from './constants/validation';

// Types
export type {
  AppConfig,
  ValidationResult,
  FormatOptions
} from './types/utils';