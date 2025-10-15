/**
 * Optimized Record Processing Strategy for Legacy Data Migration
 * Designed for high-throughput processing on GKE with Node.js
 * Handles millions of records with parallel processing and intelligent batching
 *
 * Integrated with Cortex DC PostgreSQL and Redis caching
 */

import { EventEmitter } from 'events';
import { Worker } from 'worker_threads';
import { getDatabase } from '../../adapters/database.factory';
import { redisCacheService } from '../redis-cache-service';

// ============================================
// PROCESSING STRATEGY CONFIGURATION
// ============================================

export interface ProcessingConfig {
  // Batch sizing (dynamically adjusted based on performance)
  initialBatchSize: number; // Start with 1000 records
  minBatchSize: number; // Don't go below 100
  maxBatchSize: number; // Cap at 10000

  // Parallelization
  maxParallelBatches: number; // Based on pod CPU cores (e.g., 4-8)
  maxWorkersPerBatch: number; // Worker threads per batch

  // Performance tuning
  memoryThresholdMB: number; // Pause processing if exceeded
  dbConnectionPoolSize: number; // Database connection limits
  prefetchSize: number; // Records to prefetch from staging

  // Retry & error handling
  maxRetries: number;
  retryBackoffMs: number[];
  errorThresholdPercent: number; // Pause job if errors exceed this

  // Resource management
  pauseBetweenBatchesMs: number; // Prevent resource exhaustion
  healthCheckIntervalMs: number;
  progressReportIntervalMs: number;
}

export const DEFAULT_CONFIG: ProcessingConfig = {
  initialBatchSize: 1000,
  minBatchSize: 100,
  maxBatchSize: 10000,
  maxParallelBatches: 8,
  maxWorkersPerBatch: 4,
  memoryThresholdMB: 1024,
  dbConnectionPoolSize: 20,
  prefetchSize: 5000,
  maxRetries: 3,
  retryBackoffMs: [1000, 5000, 15000],
  errorThresholdPercent: 10,
  pauseBetweenBatchesMs: 100,
  healthCheckIntervalMs: 5000,
  progressReportIntervalMs: 2000
};

// ============================================
// TYPES
// ============================================

export interface StagingRecord {
  id: string;
  importJobId: string;
  rowNumber: number;
  rawData: Record<string, any>;
  transformedData: Record<string, any>;
  validationStatus: string;
  validationErrors: ValidationError[];
  processingStatus: string;
  createdAt: Date;
}

export interface ValidationError {
  field: string;
  ruleId: string;
  severity: 'error' | 'warning';
  message: string;
  currentValue: any;
  suggestedValue?: any;
}

export interface ImportConfiguration {
  targetTable: string;
  uniqueFields: string[];
  mappings: FieldMapping[];
  transformations: DataTransformation[];
  skipHeaders: boolean;
  conflictResolution: string;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  targetType: string;
  required: boolean;
}

export interface DataTransformation {
  id: string;
  type: string;
  order: number;
  parameters: any;
}

export interface ValidationResult {
  valid: any[];
  invalid: any[];
  warnings: any[];
}

export interface TransformedRecord {
  id: string;
  originalData: any;
  transformedData: any;
  timestamp: Date;
}

export interface WriteResult {
  inserted: number;
  updated: number;
  failed: number;
  errors: any[];
}

export interface ProcessingMetrics {
  totalProcessed: number;
  successfulRecords: number;
  failedRecords: number;
  batchesProcessed: number;
  batchErrors: number;
  averageProcessingTimeMs: number;
  errorRate: number;
  throughputRecordsPerSecond: number;
  startTime: Date;
}

export interface JobResult {
  jobId: string;
  status: string;
  metrics: ProcessingMetrics;
  duration: number;
}

// ============================================
// MULTI-STAGE PROCESSING PIPELINE
// ============================================

/**
 * Stage 1: Fast Validation (in-memory)
 * - Syntax validation
 * - Type checking
 * - Basic format validation
 */
class FastValidationStage {
  async process(records: StagingRecord[]): Promise<ValidationResult> {
    const results: ValidationResult = {
      valid: [],
      invalid: [],
      warnings: []
    };

    // Parallel validation using worker threads
    const chunkSize = Math.ceil(records.length / 4);
    const chunks = this.chunkArray(records, chunkSize);

    // For now, validate synchronously - worker threads can be added later
    for (const chunk of chunks) {
      const validChunk = chunk.filter(record => this.validateRecord(record));
      results.valid.push(...validChunk);
    }

    return results;
  }

  private validateRecord(record: StagingRecord): boolean {
    // Basic validation logic
    return record.rawData && Object.keys(record.rawData).length > 0;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

/**
 * Stage 2: Transformation (CPU-intensive)
 * - Data cleaning
 * - Format conversion
 * - Complex calculations
 */
class TransformationStage {
  private transformationCache = new Map<string, any>();

  async process(records: StagingRecord[], config: ImportConfiguration): Promise<TransformedRecord[]> {
    // Sort transformations by order
    const orderedTransforms = config.transformations.sort((a, b) => a.order - b.order);

    // Apply transformations in pipeline fashion
    const results = await Promise.all(
      records.map(record => this.transformRecord(record, orderedTransforms))
    );

    return results;
  }

  private async transformRecord(
    record: StagingRecord,
    transforms: DataTransformation[]
  ): Promise<TransformedRecord> {
    let data = { ...record.rawData };

    for (const transform of transforms) {
      // Check cache for computed transformations
      const cacheKey = this.getCacheKey(transform, data);
      if (this.transformationCache.has(cacheKey)) {
        data = this.transformationCache.get(cacheKey);
        continue;
      }

      // Apply transformation
      data = await this.applyTransformation(data, transform);

      // Cache if deterministic
      if (this.isDeterministic(transform)) {
        this.transformationCache.set(cacheKey, data);
      }
    }

    return {
      id: record.id,
      originalData: record.rawData,
      transformedData: data,
      timestamp: new Date()
    };
  }

  private getCacheKey(transform: DataTransformation, data: any): string {
    return `${transform.id}:${JSON.stringify(data)}`;
  }

  private isDeterministic(transform: DataTransformation): boolean {
    // Date/time based transforms are not deterministic
    return !['timestamp', 'now', 'random'].includes(transform.type);
  }

  private async applyTransformation(data: any, transform: DataTransformation): Promise<any> {
    // Implementation of various transformations
    switch (transform.type) {
      case 'trim':
        return Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
        );
      case 'lowercase':
        return Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v.toLowerCase() : v])
        );
      case 'uppercase':
        return Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v.toUpperCase() : v])
        );
      default:
        return data;
    }
  }
}

/**
 * Stage 3: Database Validation (external checks)
 * - Uniqueness constraints
 * - Foreign key validation
 * - Business rule validation
 */
class DatabaseValidationStage {
  private validationCache = new Map<string, boolean>();
  private batchLookupCache = new Map<string, Set<any>>();

  async process(records: TransformedRecord[]): Promise<ValidationResult> {
    const db = getDatabase();

    // Batch lookups for efficiency
    await this.prefetchValidationData(records, db);

    const validationPromises = records.map(record =>
      this.validateRecord(record, db)
    );

    const results = await Promise.all(validationPromises);

    return this.aggregateResults(results);
  }

  private async prefetchValidationData(records: TransformedRecord[], db: any): Promise<void> {
    // Extract all foreign keys that need validation
    const foreignKeyChecks = this.extractForeignKeys(records);

    // Batch fetch all related records
    // Convert Map.entries() to array for ES5 compatibility
    for (const [entity, ids] of Array.from(foreignKeyChecks.entries())) {
      try {
        const existingRecords = await db.findMany(entity, {
          filters: [{ field: 'id', operator: 'in', value: Array.from(ids) }]
        });
        this.batchLookupCache.set(entity, new Set(existingRecords.map((r: any) => r.id)));
      } catch (error) {
        console.error(`Failed to prefetch ${entity}:`, error);
      }
    }
  }

  private extractForeignKeys(records: TransformedRecord[]): Map<string, Set<any>> {
    const foreignKeys = new Map<string, Set<any>>();

    records.forEach(record => {
      // Extract foreign key references from record
      Object.entries(record.transformedData).forEach(([key, value]) => {
        if (key.endsWith('_id') || key.endsWith('Id')) {
          const entity = key.replace(/_?id$/i, '');
          if (!foreignKeys.has(entity)) {
            foreignKeys.set(entity, new Set());
          }
          foreignKeys.get(entity)!.add(value);
        }
      });
    });

    return foreignKeys;
  }

  private async validateRecord(record: TransformedRecord, db: any): Promise<any> {
    const errors: ValidationError[] = [];

    // Use cached lookups instead of individual queries
    for (const [key, value] of Object.entries(record.transformedData)) {
      if (key.endsWith('_id') || key.endsWith('Id')) {
        const entity = key.replace(/_?id$/i, '');
        const cache = this.batchLookupCache.get(entity);

        if (cache && !cache.has(value)) {
          errors.push({
            field: key,
            ruleId: 'foreign_key',
            severity: 'error',
            message: `Referenced ${entity} does not exist`,
            currentValue: value
          });
        }
      }
    }

    return { record, errors };
  }

  private aggregateResults(results: any[]): ValidationResult {
    return {
      valid: results.filter(r => r.errors.length === 0).map(r => r.record),
      invalid: results.filter(r => r.errors.some((e: ValidationError) => e.severity === 'error')),
      warnings: results.filter(r => r.errors.length > 0 && r.errors.every((e: ValidationError) => e.severity === 'warning'))
    };
  }
}

/**
 * Stage 4: Bulk Insert/Update (optimized database operations)
 * - Batch inserts
 * - Upsert operations
 * - Transaction management
 */
class DatabaseWriteStage {
  async process(
    records: TransformedRecord[],
    config: ImportConfiguration
  ): Promise<WriteResult> {
    const db = getDatabase();
    const batchSize = 500; // Optimal for PostgreSQL
    const batches = this.chunkArray(records, batchSize);

    const results: WriteResult = {
      inserted: 0,
      updated: 0,
      failed: 0,
      errors: []
    };

    for (const batch of batches) {
      try {
        // Use database adapter for bulk operations
        const created = await db.createMany(config.targetTable, batch.map(r => r.transformedData));
        results.inserted += created.length;
      } catch (error: any) {
        results.failed += batch.length;
        results.errors.push({
          batch: batch.map(r => r.id),
          error: error.message
        });
      }
    }

    return results;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// ============================================
// ORCHESTRATOR (Main Processing Engine)
// ============================================

export class RecordProcessingOrchestrator extends EventEmitter {
  private config: ProcessingConfig;
  private metrics: ProcessingMetrics;
  private isPaused = false;
  private isHealthy = true;
  private healthCheckInterval: any;
  private progressInterval: any;

  constructor(config: Partial<ProcessingConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = this.initializeMetrics();
  }

  async processImportJob(jobId: string): Promise<JobResult> {
    this.emit('job:started', { jobId });

    try {
      const db = getDatabase();

      // Initialize stages
      const stages = {
        validation: new FastValidationStage(),
        transformation: new TransformationStage(),
        dbValidation: new DatabaseValidationStage(),
        write: new DatabaseWriteStage()
      };

      // Start health monitoring
      this.startHealthMonitoring();
      this.startProgressReporting(jobId);

      // Dynamic batch sizing
      let currentBatchSize = this.config.initialBatchSize;
      let offset = 0;
      let hasMoreRecords = true;

      while (hasMoreRecords && this.isHealthy && !this.isPaused) {
        // Fetch records from staging with prefetch optimization
        const records = await this.fetchStagingRecords(
          jobId,
          offset,
          currentBatchSize
        );

        if (records.length === 0) {
          hasMoreRecords = false;
          break;
        }

        // Process through pipeline
        const startTime = Date.now();
        await this.processBatch(records, stages, jobId);
        const processingTime = Date.now() - startTime;

        // Update metrics and adjust batch size
        this.updateMetrics(records.length, processingTime);
        currentBatchSize = this.adjustBatchSize(currentBatchSize, processingTime);

        offset += records.length;

        // Pause between batches to prevent resource exhaustion
        if (this.config.pauseBetweenBatchesMs > 0) {
          await this.sleep(this.config.pauseBetweenBatchesMs);
        }

        // Check error threshold
        if (this.shouldPauseOnErrors()) {
          this.isPaused = true;
          this.emit('job:paused', {
            jobId,
            reason: 'Error threshold exceeded',
            errorRate: this.metrics.errorRate
          });
          break;
        }
      }

      return this.finalizeJob(jobId);

    } catch (error: any) {
      this.emit('job:failed', { jobId, error: error.message });
      throw error;
    } finally {
      this.stopMonitoring();
    }
  }

  private async processBatch(
    records: StagingRecord[],
    stages: any,
    jobId: string
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Stage 1: Fast validation (parallel)
      const validationResult = await stages.validation.process(records);
      this.emit('batch:validated', {
        valid: validationResult.valid.length,
        invalid: validationResult.invalid.length
      });

      if (validationResult.valid.length === 0) {
        await this.handleInvalidRecords(validationResult.invalid, jobId);
        return;
      }

      // Stage 2: Transformation (parallel)
      const transformedRecords = await stages.transformation.process(
        validationResult.valid,
        await this.getJobConfig(jobId)
      );
      this.emit('batch:transformed', { count: transformedRecords.length });

      // Stage 3: Database validation (batch optimized)
      const dbValidationResult = await stages.dbValidation.process(transformedRecords);

      if (dbValidationResult.valid.length === 0) {
        await this.handleInvalidRecords(dbValidationResult.invalid, jobId);
        return;
      }

      // Stage 4: Bulk write (transactional)
      const writeResult = await stages.write.process(
        dbValidationResult.valid,
        await this.getJobConfig(jobId)
      );

      this.emit('batch:written', writeResult);

      // Update staging records status
      await this.updateStagingRecordsStatus(records, writeResult);

      // Record processing metrics
      this.metrics.totalProcessed += records.length;
      this.metrics.successfulRecords += writeResult.inserted + writeResult.updated;
      this.metrics.failedRecords += writeResult.failed;

    } catch (error: any) {
      this.emit('batch:error', { error: error.message });
      this.metrics.batchErrors++;
      throw error;
    }

    const processingTime = Date.now() - startTime;
    this.metrics.averageProcessingTimeMs =
      (this.metrics.averageProcessingTimeMs * this.metrics.batchesProcessed + processingTime) /
      (this.metrics.batchesProcessed + 1);
    this.metrics.batchesProcessed++;
  }

  private adjustBatchSize(currentSize: number, processingTimeMs: number): number {
    const targetProcessingTime = 5000; // 5 seconds per batch

    if (processingTimeMs < targetProcessingTime * 0.5) {
      // Too fast, increase batch size
      return Math.min(currentSize * 1.5, this.config.maxBatchSize);
    } else if (processingTimeMs > targetProcessingTime * 1.5) {
      // Too slow, decrease batch size
      return Math.max(currentSize * 0.7, this.config.minBatchSize);
    }

    return currentSize;
  }

  private shouldPauseOnErrors(): boolean {
    return this.metrics.errorRate > this.config.errorThresholdPercent;
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;

      if (heapUsedMB > this.config.memoryThresholdMB) {
        this.isHealthy = false;
        this.emit('health:warning', {
          reason: 'Memory threshold exceeded',
          heapUsedMB
        });
      }
    }, this.config.healthCheckIntervalMs);
  }

  private startProgressReporting(jobId: string): void {
    this.progressInterval = setInterval(() => {
      this.emit('progress:update', {
        jobId,
        metrics: this.metrics,
        timestamp: new Date()
      });
    }, this.config.progressReportIntervalMs);
  }

  private stopMonitoring(): void {
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    if (this.progressInterval) clearInterval(this.progressInterval);
  }

  private async fetchStagingRecords(
    jobId: string,
    offset: number,
    limit: number
  ): Promise<StagingRecord[]> {
    const db = getDatabase();

    try {
      const records = await db.findMany('stagingRecords', {
        filters: [
          { field: 'importJobId', operator: '==', value: jobId },
          { field: 'processingStatus', operator: '==', value: 'pending' }
        ],
        orderBy: 'rowNumber',
        orderDirection: 'asc',
        limit,
        offset
      });

      return records as StagingRecord[];
    } catch (error) {
      console.error('Failed to fetch staging records:', error);
      return [];
    }
  }

  private initializeMetrics(): ProcessingMetrics {
    return {
      totalProcessed: 0,
      successfulRecords: 0,
      failedRecords: 0,
      batchesProcessed: 0,
      batchErrors: 0,
      averageProcessingTimeMs: 0,
      errorRate: 0,
      throughputRecordsPerSecond: 0,
      startTime: new Date()
    };
  }

  private updateMetrics(recordCount: number, processingTimeMs: number): void {
    const throughput = (recordCount / processingTimeMs) * 1000;
    this.metrics.throughputRecordsPerSecond =
      (this.metrics.throughputRecordsPerSecond * this.metrics.batchesProcessed + throughput) /
      (this.metrics.batchesProcessed + 1);

    this.metrics.errorRate =
      (this.metrics.failedRecords / Math.max(this.metrics.totalProcessed, 1)) * 100;
  }

  private async finalizeJob(jobId: string): Promise<JobResult> {
    this.emit('job:completed', {
      jobId,
      metrics: this.metrics
    });

    return {
      jobId,
      status: 'completed',
      metrics: this.metrics,
      duration: Date.now() - this.metrics.startTime.getTime()
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getJobConfig(jobId: string): Promise<ImportConfiguration> {
    const db = getDatabase();

    try {
      const job = await db.findOne('dataImportJobs', jobId) as any;
      return job.configuration;
    } catch (error) {
      console.error('Failed to get job config:', error);
      throw error;
    }
  }

  private async handleInvalidRecords(
    invalid: any[],
    jobId: string
  ): Promise<void> {
    const db = getDatabase();
    const ids = invalid.map(r => r.record?.id || r.id);

    // Update invalid records status
    await db.updateMany('stagingRecords', ids, {
      processingStatus: 'failed',
      validationStatus: 'invalid'
    });
  }

  private async updateStagingRecordsStatus(
    records: StagingRecord[],
    writeResult: WriteResult
  ): Promise<void> {
    const db = getDatabase();
    const successIds = records.map(r => r.id);

    await db.updateMany('stagingRecords', successIds, {
      processingStatus: 'processed'
    });
  }
}

export default RecordProcessingOrchestrator;
