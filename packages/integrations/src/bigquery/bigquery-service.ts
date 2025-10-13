'use client';

/**
 * BigQuery Data Export Service - Migrated from henryreed.ai
 *
 * Handles data collection, formatting, and export to GCP BigQuery via Cloud Functions.
 *
 * Features:
 * - Event tracking (commands, GUI interactions, POV/TRR actions, scenarios)
 * - Data sanitization (PII removal)
 * - Queued batch exports
 * - Analytics data collection
 * - Cloud Function integration
 * - Firebase Auth integration
 */

import type { ApiService } from '@cortex/utils';

/**
 * BigQuery export configuration
 */
export interface BigQueryExportConfig {
  /** BigQuery dataset name */
  dataset: string;
  /** BigQuery table name */
  table: string;
  /** GCP project ID */
  projectId: string;
  /** Cloud Function endpoint URL for BigQuery exports */
  cloudFunctionUrl: string;
  /** Whether to include PII in exports (default: false) */
  includePII: boolean;
  /** Time range for data collection */
  timeRange?: {
    start: string;
    end: string;
  };
}

/**
 * BigQuery row structure
 */
export interface BigQueryRow {
  /** Event timestamp */
  timestamp: string;
  /** User session ID */
  session_id: string;
  /** User identifier */
  user_id: string;
  /** Type of event being tracked */
  event_type:
    | 'command_execution'
    | 'pov_action'
    | 'trr_update'
    | 'scenario_deployment'
    | 'gui_interaction';
  /** Event-specific data */
  event_data: Record<string, any>;
  /** Metadata about the event context */
  metadata: {
    interface_type: 'gui' | 'terminal';
    client_info: Record<string, any>;
    performance_metrics?: Record<string, any>;
  };
}

/**
 * Result of a BigQuery export operation
 */
export interface ExportResult {
  /** Whether the export succeeded */
  success: boolean;
  /** Number of records exported */
  recordsExported: number;
  /** BigQuery job ID (if successful) */
  bigqueryJobId?: string;
  /** Error message (if failed) */
  error?: string;
  /** Export timestamp */
  timestamp: string;
}

/**
 * BigQuery Service Class
 *
 * Provides comprehensive analytics tracking and export functionality for
 * Cortex DC Portal usage data to Google BigQuery.
 */
export class BigQueryService {
  private config: BigQueryExportConfig;
  private exportQueue: BigQueryRow[] = [];
  private sessionId: string;
  private apiService: ApiService | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.config = {
      dataset: 'cortex_dc_analytics',
      table: 'user_interactions',
      projectId: process.env.NEXT_PUBLIC_GCP_PROJECT_ID || 'cortex-dc-portal',
      cloudFunctionUrl:
        process.env.NEXT_PUBLIC_BIGQUERY_FUNCTION_URL || '/api/export/bigquery',
      includePII: false, // Default to false for privacy
      timeRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
        end: new Date().toISOString(),
      },
    };
  }

  /**
   * Set API service instance for data collection
   */
  setApiService(apiService: ApiService): void {
    this.apiService = apiService;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get current user identifier from session storage
   */
  private getCurrentUser(): string {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('cortex_dc_user') || 'anonymous';
    }
    return 'server';
  }

  /**
   * Sanitize data by removing sensitive information
   *
   * @param data - Data to sanitize
   * @param includePII - Whether to include PII (default: false)
   * @returns Sanitized data
   */
  private sanitizeData(data: any, includePII: boolean = false): any {
    if (!includePII) {
      // Remove sensitive information
      const sanitized = { ...data };
      const sensitiveKeys = ['password', 'token', 'api_key', 'secret', 'email', 'phone'];

      const recursiveSanitize = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;

        const cleaned = Array.isArray(obj) ? [] : {};
        for (const [key, value] of Object.entries(obj)) {
          const lowercaseKey = key.toLowerCase();
          if (sensitiveKeys.some((sensitive) => lowercaseKey.includes(sensitive))) {
            (cleaned as any)[key] = '[REDACTED]';
          } else if (typeof value === 'object') {
            (cleaned as any)[key] = recursiveSanitize(value);
          } else {
            (cleaned as any)[key] = value;
          }
        }
        return cleaned;
      };

      return recursiveSanitize(sanitized);
    }
    return data;
  }

  /**
   * Track a command execution event
   *
   * @param command - Command name
   * @param args - Command arguments
   * @param output - Command output
   * @param executionTime - Execution time in milliseconds
   */
  trackCommandExecution(
    command: string,
    args: string[],
    output: any,
    executionTime: number
  ): void {
    const row: BigQueryRow = {
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: this.getCurrentUser(),
      event_type: 'command_execution',
      event_data: this.sanitizeData({
        command,
        args,
        output_summary:
          typeof output === 'string' ? output.substring(0, 500) : 'non-string-output',
        execution_time_ms: executionTime,
        success: true,
      }),
      metadata: {
        interface_type: 'terminal',
        client_info: {
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
          timestamp: Date.now(),
          url: typeof window !== 'undefined' ? window.location.href : 'server',
        },
        performance_metrics: {
          execution_time_ms: executionTime,
          memory_usage:
            typeof window !== 'undefined' && (window as any).performance?.memory
              ? (window as any).performance.memory.usedJSHeapSize
              : null,
        },
      },
    };

    this.exportQueue.push(row);
  }

  /**
   * Track a GUI interaction event
   *
   * @param actionType - Type of action (e.g., "button_click", "form_submit")
   * @param component - Component name
   * @param data - Additional interaction data
   */
  trackGUIInteraction(actionType: string, component: string, data: any): void {
    const row: BigQueryRow = {
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: this.getCurrentUser(),
      event_type: 'gui_interaction',
      event_data: this.sanitizeData({
        action_type: actionType,
        component,
        interaction_data: data,
        page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      }),
      metadata: {
        interface_type: 'gui',
        client_info: {
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
          timestamp: Date.now(),
          url: typeof window !== 'undefined' ? window.location.href : 'server',
          viewport:
            typeof window !== 'undefined'
              ? { width: window.innerWidth, height: window.innerHeight }
              : null,
        },
      },
    };

    this.exportQueue.push(row);
  }

  /**
   * Track POV-related actions
   *
   * @param action - Action type (e.g., "created", "updated", "deleted")
   * @param povId - POV identifier
   * @param data - POV data
   */
  trackPOVAction(action: string, povId: string, data: any): void {
    const row: BigQueryRow = {
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: this.getCurrentUser(),
      event_type: 'pov_action',
      event_data: this.sanitizeData({
        action,
        pov_id: povId,
        pov_data: data,
      }),
      metadata: {
        interface_type:
          typeof window !== 'undefined' && window.location.pathname.includes('gui')
            ? 'gui'
            : 'terminal',
        client_info: {
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
          timestamp: Date.now(),
        },
      },
    };

    this.exportQueue.push(row);
  }

  /**
   * Collect comprehensive analytics data from the application
   *
   * Fetches POV, TRR, and Scenario data from the API service
   *
   * @returns Array of BigQuery rows
   */
  async collectAnalyticsData(): Promise<BigQueryRow[]> {
    const rows: BigQueryRow[] = [...this.exportQueue];

    // Early return if no API service configured
    if (!this.apiService) {
      console.warn('API service not configured, skipping analytics collection');
      return rows;
    }

    try {
      // Collect POV data
      const povResponse = await this.apiService.getPOVs({ page: 1, limit: 100 });
      if (povResponse.success && povResponse.data) {
        rows.push({
          timestamp: new Date().toISOString(),
          session_id: this.sessionId,
          user_id: this.getCurrentUser(),
          event_type: 'pov_action',
          event_data: this.sanitizeData({
            action: 'bulk_export',
            total_povs: povResponse.data.length,
            povs_summary: povResponse.data.map((pov: any) => ({
              id: pov.id,
              status: pov.status,
              customer: pov.customer,
              created_at: pov.createdAt,
              scenario_count: pov.scenarios?.length || 0,
            })),
          }),
          metadata: {
            interface_type: 'gui',
            client_info: {
              export_type: 'analytics_collection',
              timestamp: Date.now(),
            },
          },
        });
      }

      // Collect TRR data
      const trrResponse = await this.apiService.getTRRs({ page: 1, limit: 100 });
      if (trrResponse.success && trrResponse.data) {
        rows.push({
          timestamp: new Date().toISOString(),
          session_id: this.sessionId,
          user_id: this.getCurrentUser(),
          event_type: 'trr_update',
          event_data: this.sanitizeData({
            action: 'bulk_export',
            total_trrs: trrResponse.data.length,
            trrs_summary: trrResponse.data.map((trr: any) => ({
              id: trr.id,
              status: trr.status,
              priority: trr.priority,
              created_at: trr.createdAt,
              has_blockchain_hash: !!trr.blockchain_hash,
            })),
          }),
          metadata: {
            interface_type: 'gui',
            client_info: {
              export_type: 'analytics_collection',
              timestamp: Date.now(),
            },
          },
        });
      }

      // Collect Scenario data
      const scenarioResponse = await this.apiService.getScenarios({ page: 1, limit: 100 });
      if (scenarioResponse.success && scenarioResponse.data) {
        rows.push({
          timestamp: new Date().toISOString(),
          session_id: this.sessionId,
          user_id: this.getCurrentUser(),
          event_type: 'scenario_deployment',
          event_data: this.sanitizeData({
            action: 'bulk_export',
            total_scenarios: scenarioResponse.data.length,
            scenarios_summary: scenarioResponse.data.map((scenario: any) => ({
              id: scenario.id,
              type: scenario.type,
              status: scenario.status,
              mitre_techniques: scenario.mitre_techniques,
              cloud_providers: scenario.cloud_providers,
            })),
          }),
          metadata: {
            interface_type: 'gui',
            client_info: {
              export_type: 'analytics_collection',
              timestamp: Date.now(),
            },
          },
        });
      }
    } catch (error) {
      console.error('Error collecting analytics data:', error);
      // Add error event to export
      rows.push({
        timestamp: new Date().toISOString(),
        session_id: this.sessionId,
        user_id: this.getCurrentUser(),
        event_type: 'gui_interaction',
        event_data: {
          action: 'data_collection_error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        metadata: {
          interface_type: 'gui',
          client_info: {
            timestamp: Date.now(),
            error_context: 'analytics_collection',
          },
        },
      });
    }

    return rows;
  }

  /**
   * Export data to BigQuery via Cloud Function
   *
   * @param options - Export options
   * @returns Export result
   */
  async exportToBigQuery(
    options: {
      includeQueuedData?: boolean;
      collectFreshData?: boolean;
      customConfig?: Partial<BigQueryExportConfig>;
    } = {}
  ): Promise<ExportResult> {
    const { includeQueuedData = true, collectFreshData = true, customConfig = {} } = options;

    const config = { ...this.config, ...customConfig };
    const dataToExport: BigQueryRow[] = [];

    try {
      // Include queued data
      if (includeQueuedData) {
        dataToExport.push(...this.exportQueue);
      }

      // Collect fresh analytics data
      if (collectFreshData) {
        const freshData = await this.collectAnalyticsData();
        dataToExport.push(...freshData);
      }

      if (dataToExport.length === 0) {
        return {
          success: false,
          recordsExported: 0,
          error: 'No data to export',
          timestamp: new Date().toISOString(),
        };
      }

      // Prepare payload for Cloud Function
      const payload = {
        dataset: config.dataset,
        table: config.table,
        rows: dataToExport,
        metadata: {
          export_timestamp: new Date().toISOString(),
          session_id: this.sessionId,
          user_id: this.getCurrentUser(),
          total_records: dataToExport.length,
          time_range: config.timeRange,
        },
      };

      // Call Cloud Function
      const response = await fetch(config.cloudFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await this.getIdToken()}`, // For authentication
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Clear exported data from queue
        if (includeQueuedData) {
          this.exportQueue = [];
        }

        return {
          success: true,
          recordsExported: dataToExport.length,
          bigqueryJobId: result.jobId,
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('BigQuery export error:', error);
      return {
        success: false,
        recordsExported: 0,
        error: error instanceof Error ? error.message : 'Unknown export error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get Firebase ID token for authentication
   *
   * Integrates with Firebase Auth to get user ID token
   *
   * @returns ID token or fallback token
   */
  private async getIdToken(): Promise<string> {
    if (typeof window !== 'undefined') {
      // Try to get Firebase ID token if available
      try {
        const { getAuth, getIdToken } = await import('firebase/auth');
        const auth = getAuth();
        if (auth.currentUser) {
          return await getIdToken(auth.currentUser);
        }
      } catch (error) {
        console.warn('Firebase auth not available for ID token');
      }
    }

    // Fallback: return session token or placeholder
    return sessionStorage.getItem('cortex_dc_auth_token') || 'anonymous-token';
  }

  /**
   * Get current export queue status
   *
   * @returns Queue size and timestamp info
   */
  getQueueStatus(): { queueSize: number; oldestItem?: string; newestItem?: string } {
    const queue = this.exportQueue;
    return {
      queueSize: queue.length,
      oldestItem: queue.length > 0 ? queue[0].timestamp : undefined,
      newestItem: queue.length > 0 ? queue[queue.length - 1].timestamp : undefined,
    };
  }

  /**
   * Clear the export queue
   */
  clearQueue(): void {
    this.exportQueue = [];
  }

  /**
   * Update export configuration
   *
   * @param newConfig - Partial configuration to merge
   */
  updateConfig(newConfig: Partial<BigQueryExportConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   *
   * @returns Current export configuration
   */
  getConfig(): BigQueryExportConfig {
    return { ...this.config };
  }
}

/**
 * Singleton instance
 */
export const bigQueryService = new BigQueryService();

/**
 * Export tracking helpers for easy integration
 */
export const trackCommand = (
  command: string,
  args: string[],
  output: any,
  executionTime: number
) => bigQueryService.trackCommandExecution(command, args, output, executionTime);

export const trackGUIAction = (actionType: string, component: string, data: any) =>
  bigQueryService.trackGUIInteraction(actionType, component, data);

export const trackPOV = (action: string, povId: string, data: any) =>
  bigQueryService.trackPOVAction(action, povId, data);

/**
 * Default export
 */
export default bigQueryService;
