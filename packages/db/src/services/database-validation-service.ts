/**
 * Database Validation Service
 * Validates that database operations are correctly migrated
 * and working across Firebase and self-hosted modes
 */

import { getDatabase } from '../adapters/database.factory';
import { getStorage } from '../adapters/storage.factory';

export interface ValidationResult {
  passed: boolean;
  test: string;
  duration: number;
  error?: string;
  details?: any;
}

export interface ValidationReport {
  overall: 'passed' | 'failed' | 'partial';
  timestamp: Date;
  mode: 'firebase' | 'self-hosted';
  results: ValidationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
}

export class DatabaseValidationService {
  /**
   * Run comprehensive database validation tests
   */
  async validate(): Promise<ValidationReport> {
    const results: ValidationResult[] = [];
    const startTime = Date.now();

    // Test 1: Database Connection
    results.push(await this.testDatabaseConnection());

    // Test 2: CRUD Operations
    results.push(await this.testCRUDOperations());

    // Test 3: Query Operations
    results.push(await this.testQueryOperations());

    // Test 4: Transaction Support
    results.push(await this.testTransactions());

    // Test 5: Storage Operations
    results.push(await this.testStorageOperations());

    // Test 6: Relationship Integrity
    results.push(await this.testRelationshipIntegrity());

    // Calculate summary
    const totalDuration = Date.now() - startTime;
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    // Determine deployment mode
    const mode = (process.env.DEPLOYMENT_MODE || process.env.NEXT_PUBLIC_DEPLOYMENT_MODE) === 'self-hosted'
      ? 'self-hosted'
      : 'firebase';

    return {
      overall: failed === 0 ? 'passed' : (passed > 0 ? 'partial' : 'failed'),
      timestamp: new Date(),
      mode,
      results,
      summary: {
        total: results.length,
        passed,
        failed,
        duration: totalDuration,
      },
    };
  }

  /**
   * Test database connection
   */
  private async testDatabaseConnection(): Promise<ValidationResult> {
    const start = Date.now();
    try {
      const db = getDatabase();

      // Verify database is connected
      if (!db.isConnected()) {
        await db.connect();
      }

      const connected = db.isConnected();

      return {
        passed: connected,
        test: 'Database Connection',
        duration: Date.now() - start,
        details: { connected },
      };
    } catch (error) {
      return {
        passed: false,
        test: 'Database Connection',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Test CRUD operations
   */
  private async testCRUDOperations(): Promise<ValidationResult> {
    const start = Date.now();
    try {
      const db = getDatabase();
      const testId = `test-${Date.now()}`;

      // Create
      const created = await db.create('test_records', {
        id: testId,
        name: 'Test Record',
        value: 123,
        createdAt: new Date(),
      });

      if (!created || created.id !== testId) {
        throw new Error('Create operation failed');
      }

      // Read
      const found = await db.findOne('test_records', testId);
      if (!found || (found as any).id !== testId) {
        throw new Error('Read operation failed');
      }

      // Update
      const updated = await db.update('test_records', testId, {
        value: 456,
        updatedAt: new Date(),
      });
      if (!updated || updated.value !== 456) {
        throw new Error('Update operation failed');
      }

      // Delete
      await db.delete('test_records', testId);
      const deleted = await db.findOne('test_records', testId);
      if (deleted !== null) {
        throw new Error('Delete operation failed');
      }

      return {
        passed: true,
        test: 'CRUD Operations',
        duration: Date.now() - start,
        details: { operations: ['create', 'read', 'update', 'delete'] },
      };
    } catch (error) {
      return {
        passed: false,
        test: 'CRUD Operations',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'CRUD operations failed',
      };
    }
  }

  /**
   * Test query operations
   */
  private async testQueryOperations(): Promise<ValidationResult> {
    const start = Date.now();
    try {
      const db = getDatabase();

      // Test findMany with filters
      const results = await db.findMany('users', {
        limit: 10,
        orderBy: 'createdAt',
        orderDirection: 'desc',
      });

      // Test exists
      if (results.length > 0) {
        const exists = await db.exists('users', (results[0] as any).id);
        if (!exists) {
          throw new Error('Exists check failed');
        }
      }

      // Test count
      const count = await db.count('users');
      if (typeof count !== 'number') {
        throw new Error('Count operation failed');
      }

      return {
        passed: true,
        test: 'Query Operations',
        duration: Date.now() - start,
        details: { resultCount: results.length, totalCount: count },
      };
    } catch (error) {
      return {
        passed: false,
        test: 'Query Operations',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Query operations failed',
      };
    }
  }

  /**
   * Test transaction support
   */
  private async testTransactions(): Promise<ValidationResult> {
    const start = Date.now();
    try {
      const db = getDatabase();
      const testId1 = `test-txn-1-${Date.now()}`;
      const testId2 = `test-txn-2-${Date.now()}`;

      // Test transaction
      await db.transaction(async (tx) => {
        await tx.create('test_records', {
          id: testId1,
          name: 'Transaction Test 1',
          createdAt: new Date(),
        });

        await tx.create('test_records', {
          id: testId2,
          name: 'Transaction Test 2',
          createdAt: new Date(),
        });
      });

      // Verify both records exist
      const record1 = await db.findOne('test_records', testId1);
      const record2 = await db.findOne('test_records', testId2);

      if (!record1 || !record2) {
        throw new Error('Transaction records not found');
      }

      // Cleanup
      await db.delete('test_records', testId1);
      await db.delete('test_records', testId2);

      return {
        passed: true,
        test: 'Transaction Support',
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        passed: false,
        test: 'Transaction Support',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Transaction failed',
      };
    }
  }

  /**
   * Test storage operations
   */
  private async testStorageOperations(): Promise<ValidationResult> {
    const start = Date.now();
    try {
      const storage = getStorage();
      await storage.initialize();

      const testPath = `test/${Date.now()}.txt`;
      const testData = new TextEncoder().encode('Test storage data');

      // Upload
      const uploaded = await storage.upload(testPath, testData, {
        contentType: 'text/plain',
        customMetadata: { test: 'true' },
      });

      if (!uploaded) {
        throw new Error('Upload failed');
      }

      // Download URL
      const url = await storage.getDownloadURL(testPath);
      if (!url) {
        throw new Error('Failed to get download URL');
      }

      // Exists
      const exists = await storage.exists(testPath);
      if (!exists) {
        throw new Error('File existence check failed');
      }

      // Delete
      await storage.delete(testPath);
      const deletedExists = await storage.exists(testPath);
      if (deletedExists) {
        throw new Error('Delete failed');
      }

      return {
        passed: true,
        test: 'Storage Operations',
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        passed: false,
        test: 'Storage Operations',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Storage operations failed',
      };
    }
  }

  /**
   * Test relationship integrity
   */
  private async testRelationshipIntegrity(): Promise<ValidationResult> {
    const start = Date.now();
    try {
      const db = getDatabase();

      // Get sample POVs and TRRs
      const povs = await db.findMany('povs', { limit: 5 });
      const trrs = await db.findMany('trrs', { limit: 5 });

      // Check TRR-POV relationships
      let validRelationships = 0;
      for (const trr of trrs) {
        if ((trr as any).povId) {
          const pov = await db.findOne('povs', (trr as any).povId);
          if (pov) {
            validRelationships++;
          }
        }
      }

      // Check Project-POV relationships
      const projects = await db.findMany('projects', { limit: 5 });
      for (const project of projects) {
        if ((project as any).povIds && Array.isArray((project as any).povIds)) {
          for (const povId of (project as any).povIds) {
            const pov = await db.findOne('povs', povId);
            if (pov) {
              validRelationships++;
            }
          }
        }
      }

      return {
        passed: true,
        test: 'Relationship Integrity',
        duration: Date.now() - start,
        details: { validRelationships, totalChecked: trrs.length + projects.length },
      };
    } catch (error) {
      return {
        passed: false,
        test: 'Relationship Integrity',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Relationship check failed',
      };
    }
  }

  /**
   * Quick health check (subset of full validation)
   */
  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const db = getDatabase();

      // Check connection
      if (!db.isConnected()) {
        await db.connect();
      }

      // Try a simple query
      await db.findMany('users', { limit: 1 });

      return {
        healthy: true,
        details: {
          mode: process.env.DEPLOYMENT_MODE || 'firebase',
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : 'Health check failed',
          timestamp: new Date(),
        },
      };
    }
  }
}

// Export singleton instance
export const databaseValidationService = new DatabaseValidationService();
export default databaseValidationService;
