/**
 * Command Registry - Migrated from henryreed.ai
 *
 * Central registry for all terminal commands with support for:
 * - Command registration and lookup
 * - Alias resolution
 * - Category-based organization
 * - Full-text search and discovery
 * - Related command suggestions
 * - Registry validation
 *
 * NOTE: This is the core registry structure. Individual command implementations
 * will be migrated in Phase 3 (Component Migration).
 */

import type {
  EnhancedCommandConfig,
  LegacyCommandConfig,
  CommandCategory,
  SearchResult,
  CategoryInfo,
  CommandStatistics,
  RegistryValidation,
} from './command-types';

/**
 * Category metadata for organization and discovery
 */
export const CATEGORY_INFO: Record<CommandCategory, CategoryInfo> = {
  core: {
    name: 'core',
    displayName: 'Core Commands',
    description: 'Essential terminal commands for navigation and basic operations',
    icon: '🔧',
  },
  context: {
    name: 'context',
    displayName: 'Context & Information',
    description: 'Learn about XSIAM and Cortex capabilities and features',
    icon: '👤',
  },
  ai: {
    name: 'ai',
    displayName: 'AI & Intelligence',
    description: 'Interact with AI assistants and generate insights',
    icon: '🤖',
  },
  search: {
    name: 'search',
    displayName: 'Search & Discovery',
    description: 'Find information and explore knowledge base',
    icon: '🔍',
  },
  downloads: {
    name: 'downloads',
    displayName: 'Downloads & Resources',
    description: 'Download tools, templates, and infrastructure code',
    icon: '📥',
  },
  scenarios: {
    name: 'scenarios',
    displayName: 'Security Scenarios',
    description: 'Deploy and manage security assessment environments',
    icon: '🎯',
  },
  utilities: {
    name: 'utilities',
    displayName: 'Utilities',
    description: 'System status, configuration, and helper tools',
    icon: '⚙️',
  },
  theming: {
    name: 'theming',
    displayName: 'Appearance',
    description: 'Customize terminal appearance and themes',
    icon: '🎨',
  },
};

/**
 * Convert legacy CommandConfig to EnhancedCommandConfig with categorization
 */
function enhanceCommand(
  cmd: LegacyCommandConfig,
  defaultCategory: CommandCategory
): EnhancedCommandConfig {
  return {
    ...cmd,
    help: {
      category: defaultCategory,
      topics: [cmd.name, ...(cmd.aliases || [])],
      examples: [],
    },
  };
}

/**
 * Command Registry Class
 *
 * Manages all terminal commands with advanced search, discovery, and validation.
 */
export class CommandRegistry {
  private commands: EnhancedCommandConfig[] = [];
  private commandIndex: Map<string, EnhancedCommandConfig> = new Map();
  private aliasIndex: Map<string, string> = new Map();

  /**
   * Register a single command
   *
   * @param command - Command configuration to register
   */
  register(command: EnhancedCommandConfig): void {
    // Check for duplicates
    if (this.commandIndex.has(command.name.toLowerCase())) {
      console.warn(`Command ${command.name} is already registered`);
      return;
    }

    // Add to collections
    this.commands.push(command);
    this.commandIndex.set(command.name.toLowerCase(), command);
    this.aliasIndex.set(command.name.toLowerCase(), command.name);

    // Register aliases
    if (command.aliases) {
      command.aliases.forEach((alias) => {
        if (this.aliasIndex.has(alias.toLowerCase())) {
          console.warn(`Alias ${alias} is already registered for another command`);
        } else {
          this.aliasIndex.set(alias.toLowerCase(), command.name);
        }
      });
    }
  }

  /**
   * Register multiple commands at once
   *
   * @param commands - Array of command configurations
   */
  registerBatch(commands: EnhancedCommandConfig[]): void {
    commands.forEach((cmd) => this.register(cmd));
  }

  /**
   * Register legacy commands with auto-categorization
   *
   * @param commands - Array of legacy command configurations
   * @param defaultCategory - Default category for commands
   */
  registerLegacyCommands(
    commands: LegacyCommandConfig[],
    defaultCategory: CommandCategory = 'utilities'
  ): void {
    commands.forEach((cmd) => {
      const enhanced = enhanceCommand(cmd, defaultCategory);
      this.register(enhanced);
    });
  }

  /**
   * Get all registered commands
   *
   * @returns Array of all commands
   */
  getAllCommands(): EnhancedCommandConfig[] {
    return [...this.commands];
  }

  /**
   * Find a command by name or alias
   *
   * @param name - Command name or alias
   * @returns Command configuration or undefined
   */
  getCommandByNameOrAlias(name: string): EnhancedCommandConfig | undefined {
    const normalizedName = name.toLowerCase();

    // Try direct lookup first
    if (this.commandIndex.has(normalizedName)) {
      return this.commandIndex.get(normalizedName);
    }

    // Try alias lookup
    const primaryName = this.aliasIndex.get(normalizedName);
    if (primaryName) {
      return this.commandIndex.get(primaryName.toLowerCase());
    }

    return undefined;
  }

  /**
   * Get commands by category
   *
   * @param category - Command category
   * @returns Array of commands in category
   */
  getCommandsByCategory(category: CommandCategory): EnhancedCommandConfig[] {
    return this.commands.filter((cmd) => cmd.help?.category === category);
  }

  /**
   * Get all available categories with command counts
   *
   * @returns Array of category info with counts
   */
  getCategories(): Array<CategoryInfo & { count: number }> {
    const categoryCounts = new Map<CommandCategory, number>();

    this.commands.forEach((cmd) => {
      const category = cmd.help?.category || 'utilities';
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    });

    return Object.values(CATEGORY_INFO).map((info) => ({
      ...info,
      count: categoryCounts.get(info.name) || 0,
    }));
  }

  /**
   * Search commands by topics, descriptions, examples, etc.
   *
   * @param query - Search query
   * @returns Array of search results sorted by relevance
   */
  searchCommandsByTopic(query: string): SearchResult[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];

    const results: SearchResult[] = [];
    const queryWords = normalizedQuery.split(/\s+/);

    this.commands.forEach((cmd) => {
      let relevance = 0;
      const matches: Array<{
        type: SearchResult['matchType'];
        text: string;
        score: number;
      }> = [];

      // Name match (highest priority)
      if (cmd.name.toLowerCase().includes(normalizedQuery)) {
        relevance += 10;
        matches.push({ type: 'name', text: cmd.name, score: 10 });
      }

      // Alias match
      if (cmd.aliases) {
        for (const alias of cmd.aliases) {
          if (alias.toLowerCase().includes(normalizedQuery)) {
            relevance += 8;
            matches.push({ type: 'alias', text: alias, score: 8 });
            break;
          }
        }
      }

      // Description match
      if (cmd.description.toLowerCase().includes(normalizedQuery)) {
        relevance += 5;
        matches.push({ type: 'description', text: cmd.description, score: 5 });
      }

      // Long description match
      if (cmd.help?.longDescription?.toLowerCase().includes(normalizedQuery)) {
        relevance += 4;
        matches.push({ type: 'description', text: cmd.help.longDescription, score: 4 });
      }

      // Topics match
      if (cmd.help?.topics) {
        for (const topic of cmd.help.topics) {
          if (topic.toLowerCase().includes(normalizedQuery)) {
            relevance += 6;
            matches.push({ type: 'topic', text: topic, score: 6 });
          }
        }
      }

      // Example match
      if (cmd.help?.examples) {
        for (const example of cmd.help.examples) {
          if (
            example.cmd.toLowerCase().includes(normalizedQuery) ||
            example.description?.toLowerCase().includes(normalizedQuery)
          ) {
            relevance += 3;
            matches.push({ type: 'example', text: example.cmd, score: 3 });
          }
        }
      }

      // Fuzzy matching for individual words
      queryWords.forEach((word) => {
        if (word.length > 2) {
          // Skip very short words
          [cmd.name, cmd.description, ...(cmd.help?.topics || [])].forEach((text) => {
            if (text.toLowerCase().includes(word)) {
              relevance += 1;
            }
          });
        }
      });

      if (relevance > 0) {
        const bestMatch = matches.reduce(
          (best, current) => (current.score > best.score ? current : best),
          matches[0]
        );

        results.push({
          command: cmd,
          relevance,
          matchType: bestMatch?.type || 'description',
          matchText: bestMatch?.text,
        });
      }
    });

    // Sort by relevance, then by name
    return results
      .sort((a, b) => {
        if (b.relevance !== a.relevance) {
          return b.relevance - a.relevance;
        }
        return a.command.name.localeCompare(b.command.name);
      })
      .slice(0, 20); // Limit results
  }

  /**
   * Get all unique topics for discovery
   *
   * @returns Sorted array of all topics
   */
  getAllTopics(): string[] {
    const topicsSet = new Set<string>();

    this.commands.forEach((cmd) => {
      if (cmd.help?.topics) {
        cmd.help.topics.forEach((topic) => topicsSet.add(topic));
      }
    });

    return Array.from(topicsSet).sort();
  }

  /**
   * Get commands that reference this command in seeAlso
   *
   * @param commandName - Command name to find references to
   * @returns Array of related commands
   */
  getRelatedCommands(commandName: string): EnhancedCommandConfig[] {
    return this.commands.filter((cmd) => cmd.help?.seeAlso?.includes(commandName));
  }

  /**
   * Validate registry integrity
   *
   * Checks for duplicate names, aliases, and missing categories
   *
   * @returns Validation result
   */
  validateRegistry(): RegistryValidation {
    const nameSet = new Set<string>();
    const aliasSet = new Set<string>();
    const duplicateNames: string[] = [];
    const duplicateAliases: string[] = [];
    const missingCategories: string[] = [];

    this.commands.forEach((cmd) => {
      // Check for duplicate names
      if (nameSet.has(cmd.name)) {
        duplicateNames.push(cmd.name);
      } else {
        nameSet.add(cmd.name);
      }

      // Check for duplicate aliases
      if (cmd.aliases) {
        cmd.aliases.forEach((alias) => {
          if (aliasSet.has(alias) || nameSet.has(alias)) {
            duplicateAliases.push(alias);
          } else {
            aliasSet.add(alias);
          }
        });
      }

      // Check for missing categories
      if (!cmd.help?.category || !CATEGORY_INFO[cmd.help.category]) {
        missingCategories.push(cmd.name);
      }
    });

    return {
      isValid:
        duplicateNames.length === 0 &&
        duplicateAliases.length === 0 &&
        missingCategories.length === 0,
      duplicateNames,
      duplicateAliases,
      missingCategories,
    };
  }

  /**
   * Get command statistics
   *
   * @returns Registry statistics
   */
  getStatistics(): CommandStatistics {
    const stats: CommandStatistics = {
      totalCommands: this.commands.length,
      totalAliases: 0,
      commandsWithHelp: 0,
      commandsWithExamples: 0,
      commandsWithOptions: 0,
      categoryCounts: new Map<CommandCategory, number>(),
    };

    this.commands.forEach((cmd) => {
      if (cmd.aliases) stats.totalAliases += cmd.aliases.length;
      if (cmd.help) stats.commandsWithHelp++;
      if (cmd.help?.examples?.length) stats.commandsWithExamples++;
      if (cmd.help?.options?.length) stats.commandsWithOptions++;

      const category = cmd.help?.category || 'utilities';
      stats.categoryCounts.set(category, (stats.categoryCounts.get(category) || 0) + 1);
    });

    return stats;
  }

  /**
   * Clear all registered commands
   */
  clear(): void {
    this.commands = [];
    this.commandIndex.clear();
    this.aliasIndex.clear();
  }

  /**
   * Remove a specific command
   *
   * @param commandName - Name of command to remove
   * @returns True if command was removed
   */
  unregister(commandName: string): boolean {
    const cmd = this.getCommandByNameOrAlias(commandName);
    if (!cmd) return false;

    // Remove from arrays and maps
    this.commands = this.commands.filter((c) => c.name !== cmd.name);
    this.commandIndex.delete(cmd.name.toLowerCase());
    this.aliasIndex.delete(cmd.name.toLowerCase());

    // Remove aliases
    if (cmd.aliases) {
      cmd.aliases.forEach((alias) => {
        this.aliasIndex.delete(alias.toLowerCase());
      });
    }

    return true;
  }
}

/**
 * Singleton instance for global access
 */
export const commandRegistry = new CommandRegistry();

/**
 * Default export
 */
export default commandRegistry;
