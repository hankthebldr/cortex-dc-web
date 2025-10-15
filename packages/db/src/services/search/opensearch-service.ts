/**
 * OpenSearch Service
 * Full-text search implementation for Cortex DC Platform
 *
 * Features:
 * - Full-text search across POVs, TRRs, users, and projects
 * - Fuzzy matching and autocomplete
 * - Highlighting of matching terms
 * - Aggregations and filters
 * - Auto-indexing on create/update
 *
 * @see OPENSEARCH_MEMGRAPH_INTEGRATION_GUIDE.md for setup instructions
 */

import { Client } from '@opensearch-project/opensearch';
import { redisCacheService, CacheKeys } from '../redis-cache-service';

// ============================================================================
// INTERFACES
// ============================================================================

export interface SearchOptions {
  query: string;
  types?: string[]; // ['pov', 'trr', 'user', 'project']
  limit?: number;
  offset?: number;
  userId?: string;
  filters?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  metadata?: any;
  score: number;
  highlight?: any;
}

export interface BulkIndexDocument {
  id: string;
  doc: any;
}

export interface IndexStats {
  totalDocuments: number;
  indexSize: string;
  lastIndexed: Date | null;
}

// ============================================================================
// OPENSEARCH SERVICE
// ============================================================================

export class OpenSearchService {
  private client: Client | null = null;
  private isConnected = false;
  private readonly indexes = ['povs', 'trrs', 'users', 'projects'];

  constructor() {
    // Client will be initialized on connect()
  }

  /**
   * Connect to OpenSearch cluster
   */
  async connect(): Promise<void> {
    try {
      const node = process.env.OPENSEARCH_URL || 'http://localhost:9200';
      const username = process.env.OPENSEARCH_USERNAME || '';
      const password = process.env.OPENSEARCH_PASSWORD || '';

      this.client = new Client({
        node,
        ...(username && password ? {
          auth: {
            username,
            password
          }
        } : {}),
        ssl: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      });

      // Verify connection
      const health = await this.client.cluster.health({});
      console.log('[OpenSearch] Connected successfully. Status:', health.body.status);

      this.isConnected = true;

      // Create indexes if they don't exist
      await this.createIndexes();
    } catch (error) {
      console.error('[OpenSearch] Connection failed:', error);
      this.isConnected = false;
      // Don't throw - allow app to run without search
    }
  }

  /**
   * Disconnect from OpenSearch
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('[OpenSearch] Disconnected');
    }
  }

  /**
   * Check if connected to OpenSearch
   */
  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Create indexes with optimized settings
   */
  private async createIndexes(): Promise<void> {
    if (!this.client) return;

    for (const index of this.indexes) {
      try {
        const { body: exists } = await this.client.indices.exists({ index });

        if (!exists) {
          await this.client.indices.create({
            index,
            body: {
              settings: {
                number_of_shards: 1,
                number_of_replicas: process.env.NODE_ENV === 'production' ? 1 : 0,
                max_result_window: 10000,
                analysis: {
                  analyzer: {
                    autocomplete: {
                      type: 'custom',
                      tokenizer: 'standard',
                      filter: ['lowercase', 'autocomplete_filter']
                    },
                    autocomplete_search: {
                      type: 'custom',
                      tokenizer: 'standard',
                      filter: ['lowercase']
                    }
                  },
                  filter: {
                    autocomplete_filter: {
                      type: 'edge_ngram',
                      min_gram: 2,
                      max_gram: 20
                    }
                  }
                }
              },
              mappings: {
                properties: {
                  // Common fields
                  title: {
                    type: 'text',
                    analyzer: 'autocomplete',
                    search_analyzer: 'autocomplete_search',
                    fields: {
                      keyword: { type: 'keyword' },
                      raw: { type: 'text', analyzer: 'standard' }
                    }
                  },
                  description: {
                    type: 'text',
                    analyzer: 'standard'
                  },
                  status: {
                    type: 'keyword'
                  },
                  owner: {
                    type: 'keyword'
                  },
                  createdBy: {
                    type: 'keyword'
                  },
                  createdAt: {
                    type: 'date'
                  },
                  updatedAt: {
                    type: 'date'
                  },
                  // User-specific fields
                  email: {
                    type: 'text',
                    fields: {
                      keyword: { type: 'keyword' }
                    }
                  },
                  displayName: {
                    type: 'text',
                    analyzer: 'autocomplete',
                    search_analyzer: 'autocomplete_search'
                  },
                  role: {
                    type: 'keyword'
                  },
                  // POV/TRR specific fields
                  customer: {
                    type: 'text',
                    fields: {
                      keyword: { type: 'keyword' }
                    }
                  },
                  industry: {
                    type: 'keyword'
                  },
                  priority: {
                    type: 'keyword'
                  },
                  // Flexible metadata field
                  metadata: {
                    type: 'object',
                    enabled: true
                  }
                }
              }
            }
          });
          console.log(`[OpenSearch] Created index: ${index}`);
        }
      } catch (error) {
        console.error(`[OpenSearch] Error creating index ${index}:`, error);
      }
    }
  }

  /**
   * Index a single document
   */
  async indexDocument(type: string, id: string, document: any): Promise<void> {
    if (!this.isReady()) return;

    try {
      await this.client!.index({
        index: type,
        id,
        body: document,
        refresh: true
      });

      // Invalidate related caches
      await redisCacheService.invalidate(`search:*`);

      console.log(`[OpenSearch] Indexed document: ${type}/${id}`);
    } catch (error) {
      console.error(`[OpenSearch] Error indexing document:`, error);
    }
  }

  /**
   * Bulk index multiple documents (optimized for large datasets)
   */
  async bulkIndex(type: string, documents: BulkIndexDocument[]): Promise<void> {
    if (!this.isReady() || documents.length === 0) return;

    try {
      const body = documents.flatMap(({ id, doc }) => [
        { index: { _index: type, _id: id } },
        doc
      ]);

      const response = await this.client!.bulk({
        body,
        refresh: true
      });

      if (response.body.errors) {
        const errors = response.body.items
          .filter((item: any) => item.index?.error)
          .map((item: any) => item.index.error);
        console.error(`[OpenSearch] Bulk indexing errors:`, errors);
      } else {
        console.log(`[OpenSearch] Bulk indexed ${documents.length} documents in ${type}`);
      }

      // Invalidate search caches
      await redisCacheService.invalidate(`search:*`);
    } catch (error) {
      console.error(`[OpenSearch] Error bulk indexing:`, error);
    }
  }

  /**
   * Search across indexes with advanced features
   */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    if (!this.isReady()) {
      console.warn('[OpenSearch] Service not ready, returning empty results');
      return [];
    }

    try {
      const {
        query,
        types = [],
        limit = 10,
        offset = 0,
        filters = {}
      } = options;

      // Check cache first
      const cacheKey = `search:${query}:${types.join(',')}:${limit}:${offset}`;
      const cached = await redisCacheService.get<SearchResult[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // Build search query
      const must: any[] = [];
      const should: any[] = [
        // Multi-match across key fields with boosting
        {
          multi_match: {
            query,
            fields: [
              'title^3',           // Boost title matches
              'displayName^3',     // Boost name matches
              'email^2',           // Email matches
              'description^2',     // Description matches
              'customer^2',        // Customer name matches
              'metadata.*'         // Metadata fields
            ],
            type: 'best_fields',
            fuzziness: 'AUTO',
            prefix_length: 2
          }
        },
        // Phrase prefix for autocomplete
        {
          match_phrase_prefix: {
            title: {
              query,
              boost: 2
            }
          }
        },
        // Exact match boost
        {
          term: {
            'title.keyword': {
              value: query,
              boost: 5
            }
          }
        }
      ];

      // Add filters
      Object.entries(filters).forEach(([field, value]) => {
        must.push({
          term: { [field]: value }
        });
      });

      const searchBody: any = {
        query: {
          bool: {
            must,
            should,
            minimum_should_match: must.length === 0 ? 1 : 0
          }
        },
        from: offset,
        size: limit,
        highlight: {
          fields: {
            title: {},
            description: {},
            displayName: {},
            customer: {}
          },
          pre_tags: ['<mark>'],
          post_tags: ['</mark>']
        },
        // Sort by relevance, then by date
        sort: [
          '_score',
          { createdAt: { order: 'desc' } }
        ]
      };

      // Search across specified types or all indexes
      const indexes = types.length > 0 ? types.join(',') : this.indexes.join(',');

      const { body } = await this.client!.search({
        index: indexes,
        body: searchBody
      });

      const results: SearchResult[] = body.hits.hits.map((hit: any) => ({
        id: hit._id,
        type: hit._index,
        title: hit._source.title || hit._source.displayName || hit._source.name || 'Untitled',
        description: hit._source.description,
        metadata: {
          status: hit._source.status,
          createdAt: hit._source.createdAt,
          owner: hit._source.owner || hit._source.createdBy,
          customer: hit._source.customer,
          industry: hit._source.industry,
          priority: hit._source.priority,
          role: hit._source.role,
          email: hit._source.email
        },
        score: hit._score,
        highlight: hit.highlight
      }));

      // Cache results for 2 minutes
      await redisCacheService.set(cacheKey, results, { ttl: 120 });

      return results;
    } catch (error) {
      console.error('[OpenSearch] Search error:', error);
      return [];
    }
  }

  /**
   * Update an existing document
   */
  async updateDocument(type: string, id: string, doc: any): Promise<void> {
    if (!this.isReady()) return;

    try {
      await this.client!.update({
        index: type,
        id,
        body: {
          doc
        },
        refresh: true
      });

      // Invalidate caches
      await redisCacheService.invalidate(`search:*`);

      console.log(`[OpenSearch] Updated document: ${type}/${id}`);
    } catch (error) {
      console.error(`[OpenSearch] Error updating document:`, error);
    }
  }

  /**
   * Delete a document from the index
   */
  async deleteDocument(type: string, id: string): Promise<void> {
    if (!this.isReady()) return;

    try {
      await this.client!.delete({
        index: type,
        id,
        refresh: true
      });

      // Invalidate caches
      await redisCacheService.invalidate(`search:*`);

      console.log(`[OpenSearch] Deleted document: ${type}/${id}`);
    } catch (error) {
      if (error.meta?.statusCode === 404) {
        console.warn(`[OpenSearch] Document not found: ${type}/${id}`);
      } else {
        console.error(`[OpenSearch] Error deleting document:`, error);
      }
    }
  }

  /**
   * Get suggestions for autocomplete
   */
  async getSuggestions(query: string, type?: string, limit = 5): Promise<string[]> {
    if (!this.isReady() || query.length < 2) return [];

    try {
      const indexes = type ? type : this.indexes.join(',');

      const { body } = await this.client!.search({
        index: indexes,
        body: {
          suggest: {
            text: query,
            completion: {
              field: 'title.keyword',
              size: limit,
              skip_duplicates: true
            }
          }
        }
      });

      return body.suggest?.completion?.[0]?.options?.map((opt: any) => opt.text) || [];
    } catch (error) {
      console.error('[OpenSearch] Error getting suggestions:', error);
      return [];
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(type: string): Promise<IndexStats | null> {
    if (!this.isReady()) return null;

    try {
      const { body } = await this.client!.count({ index: type });
      const totalDocuments = body.count;

      const { body: stats } = await this.client!.indices.stats({ index: type });
      const indexSize = stats.indices[type]?.total?.store?.size_in_bytes || 0;

      return {
        totalDocuments,
        indexSize: this.formatBytes(indexSize),
        lastIndexed: new Date()
      };
    } catch (error) {
      console.error(`[OpenSearch] Error getting stats for ${type}:`, error);
      return null;
    }
  }

  /**
   * Reindex all documents from database (useful for initial setup)
   */
  async reindexAll(): Promise<void> {
    if (!this.isReady()) {
      throw new Error('OpenSearch not connected');
    }

    console.log('[OpenSearch] Starting full reindex...');

    // This should be implemented based on your database structure
    // Example for POVs:
    // const db = getDatabase();
    // const povs = await db.findMany('povs', {});
    // await this.bulkIndex('povs', povs.map(p => ({ id: p.id, doc: p })));

    console.log('[OpenSearch] Reindex completed');
  }

  /**
   * Delete an entire index
   */
  async deleteIndex(type: string): Promise<void> {
    if (!this.isReady()) return;

    try {
      await this.client!.indices.delete({ index: type });
      console.log(`[OpenSearch] Deleted index: ${type}`);
    } catch (error) {
      console.error(`[OpenSearch] Error deleting index ${type}:`, error);
    }
  }

  /**
   * Format bytes to human-readable size
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const openSearchService = new OpenSearchService();
export default openSearchService;
