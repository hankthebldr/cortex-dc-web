/**
 * Export Service
 * Data export to BigQuery, CSV, and JSON formats
 */

import { config } from '../config/env.config';
import { BadRequestError, InternalServerError } from '../middleware/error.middleware';
import { BigQuery } from '@google-cloud/bigquery';
import { DataService } from './data.service';

/**
 * BigQuery export options interface
 */
interface BigQueryExportOptions {
  collection: string;
  table: string;
  options?: {
    writeDisposition?: 'WRITE_TRUNCATE' | 'WRITE_APPEND' | 'WRITE_EMPTY';
    schema?: any[];
  };
  userId: string;
}

/**
 * CSV export options interface
 */
interface CSVExportOptions {
  collection: string;
  filters?: Record<string, any>;
  fields?: string[];
  userId: string;
}

/**
 * JSON export options interface
 */
interface JSONExportOptions {
  collection: string;
  filters?: Record<string, any>;
  userId: string;
}

/**
 * Export job interface
 */
interface ExportJob {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Export Service class
 */
export class ExportService {
  private bigquery?: BigQuery;
  private dataService: DataService;

  constructor() {
    if (config.ENABLE_BIGQUERY_EXPORT) {
      this.initializeBigQuery();
    }

    this.dataService = new DataService();
  }

  /**
   * Initialize BigQuery client
   */
  private initializeBigQuery(): void {
    this.bigquery = new BigQuery({
      projectId: config.BIGQUERY_PROJECT_ID || config.GCP_PROJECT_ID,
      location: config.BIGQUERY_LOCATION,
    });
  }

  /**
   * Export data to BigQuery
   */
  async exportToBigQuery(options: BigQueryExportOptions): Promise<any> {
    if (!config.ENABLE_BIGQUERY_EXPORT) {
      throw new BadRequestError('BigQuery export is disabled');
    }

    const { collection, table, options: exportOptions, userId } = options;

    if (!collection || !table) {
      throw new BadRequestError('Collection and table are required');
    }

    try {
      // Fetch data from collection
      const result = await this.dataService.list(collection, { limit: 10000 });

      if (result.items.length === 0) {
        throw new BadRequestError('No data to export');
      }

      // Get or create dataset
      const datasetId = config.BIGQUERY_DATASET || 'cortex_exports';
      const dataset = this.bigquery!.dataset(datasetId);

      const [datasetExists] = await dataset.exists();
      if (!datasetExists) {
        await dataset.create();
      }

      // Get or create table
      const tableRef = dataset.table(table);
      const [tableExists] = await tableRef.exists();

      if (!tableExists && exportOptions?.schema) {
        await tableRef.create({
          schema: exportOptions.schema,
        });
      }

      // Insert data
      await tableRef.insert(result.items);

      return {
        success: true,
        rowsExported: result.items.length,
        destination: `${datasetId}.${table}`,
      };
    } catch (error: any) {
      console.error('BigQuery export error:', error);
      throw new InternalServerError(`Failed to export to BigQuery: ${error.message}`);
    }
  }

  /**
   * Export data to CSV format
   */
  async exportToCSV(options: CSVExportOptions): Promise<string> {
    const { collection, filters, fields, userId } = options;

    if (!collection) {
      throw new BadRequestError('Collection is required');
    }

    try {
      // Fetch data from collection
      const result = await this.dataService.list(collection, {
        limit: 10000,
        filters,
      });

      if (result.items.length === 0) {
        return '';
      }

      // Determine fields to export
      const exportFields = fields || Object.keys(result.items[0]);

      // Build CSV header
      const header = exportFields.join(',');

      // Build CSV rows
      const rows = result.items.map(item => {
        return exportFields
          .map(field => {
            const value = item[field];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',');
      });

      // Combine header and rows
      return [header, ...rows].join('\n');
    } catch (error: any) {
      console.error('CSV export error:', error);
      throw new InternalServerError(`Failed to export to CSV: ${error.message}`);
    }
  }

  /**
   * Export data to JSON format
   */
  async exportToJSON(options: JSONExportOptions): Promise<any> {
    const { collection, filters, userId } = options;

    if (!collection) {
      throw new BadRequestError('Collection is required');
    }

    try {
      // Fetch data from collection
      const result = await this.dataService.list(collection, {
        limit: 10000,
        filters,
      });

      return {
        collection,
        exportedAt: new Date().toISOString(),
        count: result.items.length,
        data: result.items,
      };
    } catch (error: any) {
      console.error('JSON export error:', error);
      throw new InternalServerError(`Failed to export to JSON: ${error.message}`);
    }
  }

  /**
   * List export jobs
   */
  async listJobs(
    userId: string,
    options: { status?: string; limit?: number; offset?: number }
  ): Promise<ExportJob[]> {
    const { status, limit = 20, offset = 0 } = options;

    // TODO: Implement job tracking in database
    // This is a placeholder implementation

    return [];
  }

  /**
   * Get export job status
   */
  async getJob(userId: string, jobId: string): Promise<ExportJob> {
    // TODO: Implement job tracking in database
    // This is a placeholder implementation

    throw new BadRequestError('Job tracking not implemented yet');
  }

  /**
   * Schedule recurring export
   */
  async scheduleExport(options: {
    schedule: string;
    exportConfig: any;
    userId: string;
  }): Promise<any> {
    const { schedule, exportConfig, userId } = options;

    if (!schedule || !exportConfig) {
      throw new BadRequestError('Schedule and export config are required');
    }

    // TODO: Implement scheduled exports using Cloud Scheduler or similar
    // This is a placeholder implementation

    return {
      success: true,
      message: 'Scheduled export not implemented yet',
    };
  }

  /**
   * Convert data to BigQuery schema
   */
  private inferBigQuerySchema(data: any[]): any[] {
    if (data.length === 0) return [];

    const sample = data[0];
    const schema: any[] = [];

    Object.keys(sample).forEach(key => {
      const value = sample[key];
      let type = 'STRING';

      if (typeof value === 'number') {
        type = Number.isInteger(value) ? 'INTEGER' : 'FLOAT';
      } else if (typeof value === 'boolean') {
        type = 'BOOLEAN';
      } else if (value instanceof Date) {
        type = 'TIMESTAMP';
      } else if (typeof value === 'object' && value !== null) {
        type = 'JSON';
      }

      schema.push({
        name: key,
        type,
        mode: 'NULLABLE',
      });
    });

    return schema;
  }
}
