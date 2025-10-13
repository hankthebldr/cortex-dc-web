/**
 * Command System Types - Migrated from henryreed.ai
 *
 * Type definitions for the enhanced command system including:
 * - Command configuration and metadata
 * - Help and documentation structures
 * - Search and discovery
 * - Tutorial system
 */

import type { ReactNode } from 'react';

/**
 * Command categories for organization
 */
export type CommandCategory =
  | 'core'
  | 'context'
  | 'ai'
  | 'downloads'
  | 'scenarios'
  | 'search'
  | 'utilities'
  | 'theming';

/**
 * Command option specification
 */
export interface OptionSpec {
  /** Flag (e.g., --all, -a) */
  flag: string;
  /** Option value type */
  type: 'boolean' | 'string' | 'number' | 'enum';
  /** Allowed values for enum type */
  enumValues?: string[];
  /** Default value */
  default?: any;
  /** Whether option is required */
  required?: boolean;
  /** Option description */
  description: string;
  /** Whether option is deprecated */
  deprecated?: boolean;
}

/**
 * Command example specification
 */
export interface ExampleSpec {
  /** Example command */
  cmd: string;
  /** Optional description */
  description?: string;
}

/**
 * Subcommand specification
 */
export interface SubcommandSpec {
  /** Subcommand name */
  name: string;
  /** Subcommand description */
  description: string;
  /** Examples */
  examples?: ExampleSpec[];
  /** Options */
  options?: OptionSpec[];
}

/**
 * Help metadata for enhanced documentation
 */
export interface HelpMeta {
  /** Command category */
  category: CommandCategory;
  /** Extended description */
  longDescription?: string;
  /** Available options */
  options?: OptionSpec[];
  /** Usage examples */
  examples?: ExampleSpec[];
  /** Subcommands */
  subcommands?: SubcommandSpec[];
  /** Keywords for help search */
  topics?: string[];
  /** Related commands */
  seeAlso?: string[];
  /** Whether command supports interactive mode */
  isInteractive?: boolean;
}

/**
 * Enhanced command configuration
 */
export interface EnhancedCommandConfig {
  /** Command name */
  name: string;
  /** Short description */
  description: string;
  /** Usage syntax */
  usage: string;
  /** Command aliases */
  aliases?: string[];
  /** Help metadata */
  help?: HelpMeta;
  /** Command handler function */
  handler: (args: string[]) => ReactNode | Promise<ReactNode>;
}

/**
 * Legacy command configuration (for backward compatibility)
 */
export interface LegacyCommandConfig {
  /** Command name */
  name: string;
  /** Short description */
  description: string;
  /** Usage syntax */
  usage: string;
  /** Command aliases */
  aliases?: string[];
  /** Command handler function */
  handler: (args: string[]) => ReactNode | Promise<ReactNode>;
}

/**
 * Terminal action context for interactive help features
 */
export interface TerminalActions {
  /** Set terminal input */
  setInput: (input: string) => void;
  /** Execute a command */
  executeCommand: (command: string) => Promise<void>;
  /** Add command to history */
  addToHistory: (command: string) => void;
}

/**
 * Help rendering context
 */
export interface HelpContext {
  /** Terminal actions for interactive help */
  terminalActions?: TerminalActions;
  /** Currently executing command */
  currentCommand?: string;
  /** Command history */
  commandHistory?: string[];
  /** User context data */
  userContext?: any;
}

/**
 * Search result
 */
export interface SearchResult {
  /** Matching command */
  command: EnhancedCommandConfig;
  /** Relevance score */
  relevance: number;
  /** Type of match */
  matchType: 'name' | 'alias' | 'description' | 'topic' | 'example';
  /** Matching text */
  matchText?: string;
}

/**
 * Category information
 */
export interface CategoryInfo {
  /** Category identifier */
  name: CommandCategory;
  /** Display name */
  displayName: string;
  /** Category description */
  description: string;
  /** Category icon */
  icon: string;
}

/**
 * Tutorial step
 */
export interface TutorialStep {
  /** Step identifier */
  id: string;
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Command to execute */
  command?: string;
  /** Whether to auto-execute */
  autoExecute?: boolean;
  /** Validation function */
  validation?: (output: any) => boolean;
}

/**
 * Tutorial definition
 */
export interface Tutorial {
  /** Tutorial identifier */
  id: string;
  /** Tutorial title */
  title: string;
  /** Tutorial description */
  description: string;
  /** Tutorial category */
  category: CommandCategory;
  /** Tutorial steps */
  steps: TutorialStep[];
  /** Estimated duration */
  estimatedDuration: string;
}

/**
 * Command execution result
 */
export interface CommandExecutionResult {
  /** Whether execution succeeded */
  success: boolean;
  /** Result output */
  output?: ReactNode;
  /** Error message */
  error?: string;
  /** Execution time in milliseconds */
  executionTime?: number;
}

/**
 * Command registry statistics
 */
export interface CommandStatistics {
  /** Total number of commands */
  totalCommands: number;
  /** Total number of aliases */
  totalAliases: number;
  /** Commands with help metadata */
  commandsWithHelp: number;
  /** Commands with examples */
  commandsWithExamples: number;
  /** Commands with options */
  commandsWithOptions: number;
  /** Command counts by category */
  categoryCounts: Map<CommandCategory, number>;
}

/**
 * Registry validation result
 */
export interface RegistryValidation {
  /** Whether registry is valid */
  isValid: boolean;
  /** Duplicate command names */
  duplicateNames: string[];
  /** Duplicate aliases */
  duplicateAliases: string[];
  /** Commands with missing categories */
  missingCategories: string[];
}
