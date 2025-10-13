// @cortex/commands - Command execution and management system

// Command Registry (migrated from henryreed.ai)
export { CommandRegistry, commandRegistry, CATEGORY_INFO } from './command-registry';

// Unified Command Service (migrated from henryreed.ai)
export { UnifiedCommandService, UNIFIED_COMMANDS } from './unified-command-service';

export type {
  UnifiedCommand,
  CommandParameter,
  ExecutionContext,
  CommandResult,
  RBACEvent,
} from './unified-command-service';

// Command Types (migrated from henryreed.ai)
export type {
  CommandCategory,
  OptionSpec,
  ExampleSpec,
  SubcommandSpec,
  HelpMeta,
  EnhancedCommandConfig,
  LegacyCommandConfig,
  TerminalActions,
  HelpContext,
  SearchResult,
  CategoryInfo,
  TutorialStep,
  Tutorial,
  CommandExecutionResult,
  CommandStatistics,
  RegistryValidation,
} from './command-types';

// Existing types (backward compatibility)
export * from './types';

// Services
export * from './services';
