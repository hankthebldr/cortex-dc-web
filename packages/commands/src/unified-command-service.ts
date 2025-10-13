/**
 * Unified Command Service - Migrated from henryreed.ai
 *
 * Ensures GUI-Terminal parity by providing a unified interface for command execution
 * across both interfaces. Features include:
 * - Role-based access control (RBAC) integration
 * - Parameter validation and sanitization
 * - Cloud command execution
 * - GUI action routing
 * - Usage analytics
 * - Command search and discovery
 *
 * NOTE: Dependencies on rbac-middleware and cloud-command-executor will be
 * migrated separately. This service uses placeholder implementations for now.
 */

/**
 * Unified command definition
 */
export interface UnifiedCommand {
  /** Unique command identifier */
  id: string;
  /** Display name */
  name: string;
  /** Command description */
  description: string;
  /** Terminal command syntax */
  terminalCommand: string;
  /** GUI action identifier */
  guiAction: string;
  /** Required roles to execute */
  requiredRole: string[];
  /** Command category */
  category: 'pov' | 'trr' | 'scenario' | 'ai' | 'content' | 'system';
  /** Command parameters */
  parameters: CommandParameter[];
}

/**
 * Command parameter definition
 */
export interface CommandParameter {
  /** Parameter name */
  name: string;
  /** Parameter type */
  type: 'string' | 'number' | 'boolean' | 'select' | 'file';
  /** Whether parameter is required */
  required: boolean;
  /** Parameter description */
  description: string;
  /** Options for select type */
  options?: string[];
  /** Default value */
  defaultValue?: any;
}

/**
 * Command execution context
 */
export interface ExecutionContext {
  /** User identifier */
  userId: string;
  /** User role */
  userRole: string;
  /** Interface type */
  interface: 'gui' | 'terminal';
  /** Cloud configuration (for terminal execution) */
  cloudConfig?: any;
  /** Session identifier */
  sessionId?: string;
}

/**
 * Command execution result
 */
export interface CommandResult {
  /** Whether execution succeeded */
  success: boolean;
  /** Result message */
  message?: string;
  /** Result data */
  data?: any;
  /** Error information */
  error?: string;
  /** Execution time in milliseconds */
  executionTime?: number;
}

/**
 * RBAC event for audit logging
 */
export interface RBACEvent {
  /** User identifier */
  userId: string;
  /** User role */
  userRole: string;
  /** Action attempted */
  action: string;
  /** Resource accessed */
  resource: string;
  /** Whether action was allowed */
  allowed: boolean;
  /** Reason if denied */
  reason?: string;
  /** Event timestamp */
  timestamp: string;
}

/**
 * Unified command definitions ensuring GUI-Terminal parity
 */
export const UNIFIED_COMMANDS: UnifiedCommand[] = [
  // POV Management Commands
  {
    id: 'pov_create',
    name: 'Create POV',
    description: 'Initialize a new Proof of Value project',
    terminalCommand: 'pov create --interactive',
    guiAction: 'dashboard.newPOV',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    category: 'pov',
    parameters: [
      { name: 'customer', type: 'string', required: true, description: 'Customer name' },
      {
        name: 'template',
        type: 'select',
        required: false,
        description: 'POV template',
        options: ['standard', 'enterprise', 'custom'],
      },
    ],
  },
  {
    id: 'pov_list',
    name: 'List POVs',
    description: 'List active Proof of Value projects',
    terminalCommand: 'pov list --active',
    guiAction: 'dashboard.activePOVs',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc', 'analyst'],
    category: 'pov',
    parameters: [
      {
        name: 'status',
        type: 'select',
        required: false,
        description: 'Filter by status',
        options: ['active', 'completed', 'pending', 'all'],
      },
    ],
  },
  {
    id: 'pov_report',
    name: 'Generate POV Report',
    description: 'Create executive or technical POV report',
    terminalCommand: 'pov report --current --executive',
    guiAction: 'dashboard.generateReport',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    category: 'pov',
    parameters: [
      {
        name: 'type',
        type: 'select',
        required: true,
        description: 'Report type',
        options: ['executive', 'technical', 'summary'],
      },
      {
        name: 'format',
        type: 'select',
        required: false,
        description: 'Output format',
        options: ['pdf', 'excel', 'word'],
        defaultValue: 'pdf',
      },
    ],
  },
  {
    id: 'pov_blueprint',
    name: 'Create Badass Blueprint',
    description: 'Generate transformation blueprint PDF',
    terminalCommand: 'pov --badass-blueprint',
    guiAction: 'dashboard.badassBlueprint',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    category: 'pov',
    parameters: [
      { name: 'customer', type: 'string', required: true, description: 'Customer name for blueprint' },
    ],
  },

  // TRR Management Commands
  {
    id: 'trr_create',
    name: 'Create TRR',
    description: 'Create new Technical Requirements Review',
    terminalCommand: 'trr create --interactive',
    guiAction: 'trr.createNew',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    category: 'trr',
    parameters: [
      { name: 'title', type: 'string', required: true, description: 'TRR title' },
      {
        name: 'category',
        type: 'select',
        required: true,
        description: 'TRR category',
        options: ['security', 'integration', 'performance', 'compliance'],
      },
    ],
  },
  {
    id: 'trr_list',
    name: 'List TRRs',
    description: 'List all Technical Requirements Reviews',
    terminalCommand: 'trr list',
    guiAction: 'trr.listTRRs',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc', 'analyst'],
    category: 'trr',
    parameters: [
      {
        name: 'status',
        type: 'select',
        required: false,
        description: 'Filter by status',
        options: ['pending', 'validated', 'in-review', 'all'],
      },
    ],
  },
  {
    id: 'trr_import',
    name: 'Import TRR CSV',
    description: 'Import TRR data from CSV file',
    terminalCommand: 'trr import --file sample.csv',
    guiAction: 'trr.importCSV',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    category: 'trr',
    parameters: [{ name: 'file', type: 'file', required: true, description: 'CSV file to import' }],
  },
  {
    id: 'trr_validate',
    name: 'Validate TRRs',
    description: 'Validate pending TRRs',
    terminalCommand: 'trr validate --all --status pending',
    guiAction: 'trr.validate',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    category: 'trr',
    parameters: [
      {
        name: 'scope',
        type: 'select',
        required: false,
        description: 'Validation scope',
        options: ['all', 'pending', 'assigned'],
        defaultValue: 'pending',
      },
    ],
  },
  {
    id: 'trr_export',
    name: 'Export TRRs',
    description: 'Export TRR data as CSV/Excel',
    terminalCommand: 'trr export --format csv',
    guiAction: 'trr.export',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    category: 'trr',
    parameters: [
      {
        name: 'format',
        type: 'select',
        required: false,
        description: 'Export format',
        options: ['csv', 'excel', 'json'],
        defaultValue: 'csv',
      },
    ],
  },

  // Scenario Management Commands
  {
    id: 'scenario_list',
    name: 'List Scenarios',
    description: 'Browse available security scenarios',
    terminalCommand: 'scenario list',
    guiAction: 'dashboard.listScenarios',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    category: 'scenario',
    parameters: [
      {
        name: 'type',
        type: 'select',
        required: false,
        description: 'Scenario type',
        options: ['cloud-posture', 'threat-hunting', 'incident-response', 'all'],
      },
    ],
  },
  {
    id: 'scenario_deploy',
    name: 'Deploy Scenario',
    description: 'Deploy security scenario',
    terminalCommand: 'scenario generate --scenario-type cloud-posture',
    guiAction: 'dashboard.deployScenario',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    category: 'scenario',
    parameters: [
      {
        name: 'type',
        type: 'select',
        required: true,
        description: 'Scenario type',
        options: ['cloud-posture', 'threat-hunting', 'incident-response'],
      },
      {
        name: 'environment',
        type: 'select',
        required: false,
        description: 'Target environment',
        options: ['dev', 'staging', 'prod'],
        defaultValue: 'dev',
      },
    ],
  },
  {
    id: 'scenario_validate',
    name: 'Validate Scenario',
    description: 'Validate scenario deployment',
    terminalCommand: 'scenario validate [id]',
    guiAction: 'scenarios.validate',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    category: 'scenario',
    parameters: [
      { name: 'scenarioId', type: 'string', required: true, description: 'Scenario ID to validate' },
    ],
  },

  // AI & Analytics Commands
  {
    id: 'ai_query',
    name: 'AI Query',
    description: 'Quick AI assistance query',
    terminalCommand: 'ai "help with POV optimization"',
    guiAction: 'ai.quickQuery',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc', 'analyst'],
    category: 'ai',
    parameters: [
      { name: 'query', type: 'string', required: true, description: 'Question or request for AI' },
    ],
  },
  {
    id: 'gemini_analyze',
    name: 'AI Analysis',
    description: 'Run comprehensive AI analysis',
    terminalCommand: 'gemini analyze --context dashboard',
    guiAction: 'ai.runAnalysis',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    category: 'ai',
    parameters: [
      {
        name: 'context',
        type: 'select',
        required: false,
        description: 'Analysis context',
        options: ['dashboard', 'pov', 'trr', 'scenario'],
        defaultValue: 'dashboard',
      },
    ],
  },
  {
    id: 'gemini_predict',
    name: 'Predictive Insights',
    description: 'Generate timeline and risk predictions',
    terminalCommand: 'gemini predict --timeline --risks',
    guiAction: 'ai.predictiveInsights',
    requiredRole: ['admin', 'manager', 'senior_dc'],
    category: 'ai',
    parameters: [
      {
        name: 'scope',
        type: 'select',
        required: false,
        description: 'Prediction scope',
        options: ['timeline', 'risks', 'both'],
        defaultValue: 'both',
      },
    ],
  },

  // Content Creation Commands
  {
    id: 'content_create_pov',
    name: 'Quick POV Setup',
    description: 'Initialize POV with template',
    terminalCommand: 'pov init --template executive-overview',
    guiAction: 'creator.quickPOVSetup',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    category: 'content',
    parameters: [
      {
        name: 'template',
        type: 'select',
        required: true,
        description: 'POV template',
        options: ['executive-overview', 'technical-deep-dive', 'comparison-matrix'],
      },
    ],
  },
  {
    id: 'content_clone_template',
    name: 'Clone Template',
    description: 'Clone existing template',
    terminalCommand: 'template clone --base ransomware-detection',
    guiAction: 'creator.cloneTemplate',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    category: 'content',
    parameters: [
      {
        name: 'baseTemplate',
        type: 'string',
        required: true,
        description: 'Base template to clone',
      },
      { name: 'newName', type: 'string', required: true, description: 'New template name' },
    ],
  },
  {
    id: 'content_mitre_scenario',
    name: 'MITRE-Guided Scenario',
    description: 'Create MITRE-mapped scenario',
    terminalCommand: 'scenario generate --type cloud-posture --mitre-guided',
    guiAction: 'creator.mitreGuidedScenario',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc'],
    category: 'content',
    parameters: [
      {
        name: 'mitreId',
        type: 'string',
        required: false,
        description: 'MITRE ATT&CK technique ID',
      },
      {
        name: 'scenarioType',
        type: 'select',
        required: true,
        description: 'Scenario type',
        options: ['cloud-posture', 'threat-hunting', 'incident-response'],
      },
    ],
  },

  // System Commands
  {
    id: 'help',
    name: 'Help',
    description: 'Show available commands',
    terminalCommand: 'help',
    guiAction: 'system.viewCommands',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc', 'analyst'],
    category: 'system',
    parameters: [],
  },
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Show introduction and guide',
    terminalCommand: 'getting-started',
    guiAction: 'system.gettingStartedGuide',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc', 'analyst'],
    category: 'system',
    parameters: [],
  },
  {
    id: 'status_analytics',
    name: 'Refresh Data',
    description: 'Refresh system data and analytics',
    terminalCommand: 'status --analytics',
    guiAction: 'dashboard.refreshData',
    requiredRole: ['admin', 'manager', 'senior_dc', 'dc', 'analyst'],
    category: 'system',
    parameters: [],
  },
];

/**
 * Unified Command Service Class
 *
 * Provides a unified interface for command execution across GUI and terminal interfaces.
 */
export class UnifiedCommandService {
  private static cloudExecutor: any = null; // Placeholder for cloud executor
  private static rbacEnabled: boolean = true;

  /**
   * Get available commands based on user role
   *
   * @param userRole - User's role
   * @returns Array of commands user can execute
   */
  static getAvailableCommands(userRole: string): UnifiedCommand[] {
    return UNIFIED_COMMANDS.filter((cmd) => cmd.requiredRole.includes(userRole));
  }

  /**
   * Get commands grouped by category
   *
   * @param userRole - User's role
   * @returns Commands grouped by category
   */
  static getCommandsByCategory(userRole: string): Record<string, UnifiedCommand[]> {
    const availableCommands = this.getAvailableCommands(userRole);
    const grouped: Record<string, UnifiedCommand[]> = {};

    for (const command of availableCommands) {
      if (!grouped[command.category]) {
        grouped[command.category] = [];
      }
      grouped[command.category].push(command);
    }

    return grouped;
  }

  /**
   * Find command by ID
   *
   * @param commandId - Command identifier
   * @returns Command configuration or undefined
   */
  static findCommand(commandId: string): UnifiedCommand | undefined {
    return UNIFIED_COMMANDS.find((cmd) => cmd.id === commandId);
  }

  /**
   * Execute command via appropriate interface
   *
   * @param commandId - Command identifier
   * @param parameters - Command parameters
   * @param context - Execution context
   * @returns Execution result
   */
  static async executeCommand(
    commandId: string,
    parameters: Record<string, any>,
    context: ExecutionContext
  ): Promise<CommandResult> {
    const command = this.findCommand(commandId);

    if (!command) {
      return {
        success: false,
        error: `Command not found: ${commandId}`,
      };
    }

    // Check permissions
    if (this.rbacEnabled && !this.hasPermission(context.userRole, command)) {
      this.logRBACEvent({
        userId: context.userId,
        userRole: context.userRole,
        action: 'execute_command',
        resource: commandId,
        allowed: false,
        reason: 'Insufficient role permissions',
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        error: 'Insufficient permissions to execute this command',
      };
    }

    // Log successful permission check
    this.logRBACEvent({
      userId: context.userId,
      userRole: context.userRole,
      action: 'execute_command',
      resource: commandId,
      allowed: true,
      timestamp: new Date().toISOString(),
    });

    const startTime = Date.now();

    try {
      // Execute via appropriate interface
      let result: CommandResult;

      if (context.interface === 'terminal' && context.cloudConfig) {
        result = await this.executeTerminalCommand(command, parameters, context);
      } else {
        result = await this.executeGUIAction(command, parameters, context);
      }

      result.executionTime = Date.now() - startTime;
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute command via terminal in cloud environment
   *
   * TODO: Integrate with cloud-command-executor once migrated
   */
  private static async executeTerminalCommand(
    command: UnifiedCommand,
    parameters: Record<string, any>,
    context: ExecutionContext
  ): Promise<CommandResult> {
    // Build command with parameters
    const fullCommand = this.buildCommand(command.terminalCommand, parameters);

    // Placeholder for cloud execution
    console.log('Terminal command execution:', fullCommand, context);

    return {
      success: true,
      message: `Terminal command executed: ${fullCommand}`,
      data: { command: fullCommand, parameters },
    };
  }

  /**
   * Execute command via GUI action
   */
  private static async executeGUIAction(
    command: UnifiedCommand,
    parameters: Record<string, any>,
    context: ExecutionContext
  ): Promise<CommandResult> {
    // Validate and sanitize parameters
    const sanitizedParams = this.validateAndSanitizeParameters(command, parameters);

    // Build action payload
    const actionPayload = {
      command: command.guiAction,
      parameters: sanitizedParams,
      context: {
        userId: context.userId,
        userRole: context.userRole,
        sessionId: context.sessionId,
      },
    };

    console.log('Executing GUI action:', actionPayload);

    // Simulate different GUI actions
    switch (command.guiAction) {
      case 'dashboard.newPOV':
        return {
          success: true,
          message: 'POV creation wizard opened',
          data: sanitizedParams,
        };

      case 'trr.createNew':
        return {
          success: true,
          message: 'TRR creation form opened',
          data: sanitizedParams,
        };

      case 'ai.quickQuery':
        return {
          success: true,
          message: 'AI query submitted',
          data: { response: 'AI response would appear here' },
        };

      default:
        return {
          success: true,
          message: `GUI action executed: ${command.guiAction}`,
          data: actionPayload,
        };
    }
  }

  /**
   * Build terminal command with parameters
   */
  private static buildCommand(baseCommand: string, parameters: Record<string, any>): string {
    let command = baseCommand;

    // Replace parameter placeholders
    for (const [key, value] of Object.entries(parameters)) {
      if (value !== undefined && value !== null && value !== '') {
        // Handle different parameter types
        if (typeof value === 'boolean') {
          if (value) {
            command += ` --${key}`;
          }
        } else {
          command += ` --${key} "${value}"`;
        }
      }
    }

    return command;
  }

  /**
   * Validate and sanitize parameters
   *
   * @throws Error if required parameters missing or invalid
   */
  private static validateAndSanitizeParameters(
    command: UnifiedCommand,
    parameters: Record<string, any>
  ): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const paramDef of command.parameters) {
      const value = parameters[paramDef.name];

      // Check required parameters
      if (paramDef.required && (value === undefined || value === null || value === '')) {
        throw new Error(`Required parameter missing: ${paramDef.name}`);
      }

      // Validate parameter types
      if (value !== undefined && value !== null && value !== '') {
        switch (paramDef.type) {
          case 'string':
            sanitized[paramDef.name] = String(value).trim();
            break;
          case 'number':
            const num = Number(value);
            if (isNaN(num)) {
              throw new Error(`Invalid number for parameter: ${paramDef.name}`);
            }
            sanitized[paramDef.name] = num;
            break;
          case 'boolean':
            sanitized[paramDef.name] = Boolean(value);
            break;
          case 'select':
            if (paramDef.options && !paramDef.options.includes(value)) {
              throw new Error(`Invalid option for parameter ${paramDef.name}: ${value}`);
            }
            sanitized[paramDef.name] = value;
            break;
          case 'file':
            // File validation would be implemented here
            sanitized[paramDef.name] = value;
            break;
        }
      } else if (paramDef.defaultValue !== undefined) {
        sanitized[paramDef.name] = paramDef.defaultValue;
      }
    }

    return sanitized;
  }

  /**
   * Check if user has permission to execute command
   */
  private static hasPermission(userRole: string, command: UnifiedCommand): boolean {
    return command.requiredRole.includes(userRole);
  }

  /**
   * Log RBAC event for audit trail
   */
  private static logRBACEvent(event: RBACEvent): void {
    if (typeof window === 'undefined') return;

    try {
      const auditLog = JSON.parse(localStorage.getItem('cortex_dc_rbac_audit_log') || '[]');
      auditLog.push(event);

      // Keep last 1000 events
      if (auditLog.length > 1000) {
        auditLog.shift();
      }

      localStorage.setItem('cortex_dc_rbac_audit_log', JSON.stringify(auditLog));
    } catch (error) {
      console.error('Failed to log RBAC event:', error);
    }
  }

  /**
   * Get command execution history for user
   *
   * @param userId - User identifier
   * @returns Array of RBAC events for user
   */
  static getExecutionHistory(userId: string): RBACEvent[] {
    if (typeof window === 'undefined') return [];

    try {
      const auditLog = JSON.parse(localStorage.getItem('cortex_dc_rbac_audit_log') || '[]');
      return auditLog.filter(
        (event: RBACEvent) => event.userId === userId && event.action === 'execute_command'
      );
    } catch {
      return [];
    }
  }

  /**
   * Get command usage statistics
   *
   * @returns Command usage counts
   */
  static getUsageStatistics(): Record<string, number> {
    if (typeof window === 'undefined') return {};

    try {
      const auditLog = JSON.parse(localStorage.getItem('cortex_dc_rbac_audit_log') || '[]');
      const stats: Record<string, number> = {};

      for (const event of auditLog) {
        if (event.action === 'execute_command' && event.allowed) {
          stats[event.resource] = (stats[event.resource] || 0) + 1;
        }
      }

      return stats;
    } catch {
      return {};
    }
  }

  /**
   * Search commands by name or description
   *
   * @param query - Search query
   * @param userRole - User's role
   * @returns Matching commands
   */
  static searchCommands(query: string, userRole: string): UnifiedCommand[] {
    const availableCommands = this.getAvailableCommands(userRole);
    const searchTerm = query.toLowerCase().trim();

    if (!searchTerm) {
      return availableCommands;
    }

    return availableCommands.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(searchTerm) ||
        cmd.description.toLowerCase().includes(searchTerm) ||
        cmd.terminalCommand.toLowerCase().includes(searchTerm) ||
        cmd.category.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Enable or disable RBAC enforcement
   *
   * @param enabled - Whether to enable RBAC
   */
  static setRBACEnabled(enabled: boolean): void {
    this.rbacEnabled = enabled;
  }
}

/**
 * Default export
 */
export default UnifiedCommandService;
