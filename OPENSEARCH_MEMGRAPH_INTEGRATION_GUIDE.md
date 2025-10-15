# OpenSearch & Memgraph Integration Guide
## Search & Interaction Tracking for Cortex DC

**Status**: Implementation Guide
**Date**: 2025-10-14

---

## Overview

This guide provides complete instructions for integrating:
1. **OpenSearch** - Full-text search across POVs, TRRs, users, and projects
2. **Memgraph** - Graph database for user interaction tracking and AI-powered recommendations

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  GlobalSearch Component (✅ Already Created)                │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────────┐
│                    API Layer                                 │
│  /api/search         - Search endpoint                      │
│  /api/interactions   - Interaction tracking                 │
│  /api/recommendations - AI-powered suggestions              │
└──────┬─────────────────────────────┬────────────────────────┘
       │                             │
┌──────┴─────────────┐      ┌────────┴────────────────────────┐
│    OpenSearch      │      │       Memgraph                   │
│  - Full-text       │      │  - User interactions             │
│  - Fuzzy matching  │      │  - Relationship graph            │
│  - Aggregations    │      │  - AI recommendations            │
└────────────────────┘      └──────────────────────────────────┘
```

---

## Part 1: OpenSearch Integration

### 1.1 Install Dependencies

```bash
pnpm add @opensearch-project/opensearch --filter "@cortex/db"
```

### 1.2 Add to Docker Compose

Add to `docker-compose.production.yml`:

```yaml
# OpenSearch
opensearch:
  image: opensearchproject/opensearch:2.11.0
  container_name: cortex-opensearch
  environment:
    - discovery.type=single-node
    - plugins.security.disabled=true
    - "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m"
    - bootstrap.memory_lock=true
  ulimits:
    memlock:
      soft: -1
      hard: -1
    nofile:
      soft: 65536
      hard: 65536
  ports:
    - "9200:9200"
    - "9600:9600"
  volumes:
    - opensearch_data:/usr/share/opensearch/data
  networks:
    - cortex-network
  healthcheck:
    test: ["CMD-SHELL", "curl -f http://localhost:9200 || exit 1"]
    interval: 30s
    timeout: 10s
    retries: 5
  restart: unless-stopped

# OpenSearch Dashboards (Optional - for management)
opensearch-dashboards:
  image: opensearchproject/opensearch-dashboards:2.11.0
  container_name: cortex-opensearch-dashboards
  ports:
    - "5601:5601"
  environment:
    - 'OPENSEARCH_HOSTS=["http://opensearch:9200"]'
  depends_on:
    - opensearch
  networks:
    - cortex-network
  restart: unless-stopped

volumes:
  opensearch_data:
    driver: local
```

### 1.3 Create OpenSearch Service

Create `packages/db/src/services/search/opensearch-service.ts`:

```typescript
/**
 * OpenSearch Service
 * Full-text search implementation for Cortex DC
 */

import { Client } from '@opensearch-project/opensearch';

export interface SearchOptions {
  query: string;
  types?: string[];
  limit?: number;
  offset?: number;
  userId?: string;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  metadata?: any;
  score: number;
}

export class OpenSearchService {
  private client: Client;
  private isConnected = false;

  constructor() {
    const node = process.env.OPENSEARCH_URL || 'http://localhost:9200';

    this.client = new Client({
      node,
      ssl: {
        rejectUnauthorized: false // For development - use proper certs in production
      }
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.cluster.health({});
      this.isConnected = true;
      console.log('[OpenSearch] Connected successfully');

      // Create indexes if they don't exist
      await this.createIndexes();
    } catch (error) {
      console.error('[OpenSearch] Connection failed:', error);
      this.isConnected = false;
    }
  }

  private async createIndexes(): Promise<void> {
    const indexes = ['povs', 'trrs', 'users', 'projects'];

    for (const index of indexes) {
      try {
        const { body: exists } = await this.client.indices.exists({ index });

        if (!exists) {
          await this.client.indices.create({
            index,
            body: {
              settings: {
                number_of_shards: 1,
                number_of_replicas: 0,
                analysis: {
                  analyzer: {
                    autocomplete: {
                      type: 'custom',
                      tokenizer: 'standard',
                      filter: ['lowercase', 'autocomplete_filter']
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
                  title: {
                    type: 'text',
                    analyzer: 'autocomplete',
                    search_analyzer: 'standard'
                  },
                  description: { type: 'text' },
                  status: { type: 'keyword' },
                  owner: { type: 'keyword' },
                  createdAt: { type: 'date' },
                  updatedAt: { type: 'date' },
                  metadata: { type: 'object', enabled: true }
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

  async indexDocument(type: string, id: string, document: any): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.index({
        index: type,
        id,
        body: document,
        refresh: true
      });
    } catch (error) {
      console.error(`[OpenSearch] Error indexing document:`, error);
    }
  }

  async bulkIndex(type: string, documents: Array<{ id: string; doc: any }>): Promise<void> {
    if (!this.isConnected || documents.length === 0) return;

    try {
      const body = documents.flatMap(({ id, doc }) => [
        { index: { _index: type, _id: id } },
        doc
      ]);

      await this.client.bulk({
        body,
        refresh: true
      });
    } catch (error) {
      console.error(`[OpenSearch] Error bulk indexing:`, error);
    }
  }

  async search(options: SearchOptions): Promise<SearchResult[]> {
    if (!this.isConnected) return [];

    try {
      const { query, types = [], limit = 10, offset = 0 } = options;

      const searchBody: any = {
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query,
                  fields: ['title^3', 'description^2', 'metadata.*'],
                  type: 'best_fields',
                  fuzziness: 'AUTO'
                }
              },
              {
                match_phrase_prefix: {
                  title: {
                    query,
                    boost: 2
                  }
                }
              }
            ],
            minimum_should_match: 1
          }
        },
        from: offset,
        size: limit,
        highlight: {
          fields: {
            title: {},
            description: {}
          }
        }
      };

      // Search across specified types or all indexes
      const indexes = types.length > 0 ? types.join(',') : 'povs,trrs,users,projects';

      const { body } = await this.client.search({
        index: indexes,
        body: searchBody
      });

      return body.hits.hits.map((hit: any) => ({
        id: hit._id,
        type: hit._index,
        title: hit._source.title || hit._source.displayName || hit._source.name,
        description: hit._source.description,
        metadata: {
          status: hit._source.status,
          createdAt: hit._source.createdAt,
          owner: hit._source.owner
        },
        score: hit._score,
        highlight: hit.highlight
      }));
    } catch (error) {
      console.error('[OpenSearch] Search error:', error);
      return [];
    }
  }

  async deleteDocument(type: string, id: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.delete({
        index: type,
        id,
        refresh: true
      });
    } catch (error) {
      console.error(`[OpenSearch] Error deleting document:`, error);
    }
  }

  async updateDocument(type: string, id: string, doc: any): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.update({
        index: type,
        id,
        body: {
          doc
        },
        refresh: true
      });
    } catch (error) {
      console.error(`[OpenSearch] Error updating document:`, error);
    }
  }
}

// Export singleton
export const openSearchService = new OpenSearchService();
export default openSearchService;
```

### 1.4 Auto-Indexing Hook

Create hooks to automatically index data when it's created/updated. Add to your database adapter:

```typescript
// In packages/db/src/adapters/postgres.adapter.ts or firestore.adapter.ts

import { openSearchService } from '../services/search/opensearch-service';

async create<T>(collection: string, data: Partial<T>): Promise<T> {
  const result = await this.prisma[collection].create({ data });

  // Auto-index for searchable entities
  if (['pov', 'trr', 'user', 'project'].includes(collection)) {
    await openSearchService.indexDocument(collection + 's', result.id, result);
  }

  return result;
}
```

### 1.5 Create Search API Endpoint

Create `apps/web/app/api/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { openSearchService } from '@cortex/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, types, limit = 10, offset = 0 } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const results = await openSearchService.search({
      query,
      types,
      limit,
      offset
    });

    return NextResponse.json({ results, total: results.length });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
```

---

## Part 2: Memgraph Integration

### 2.1 Install Dependencies

```bash
pnpm add neo4j-driver --filter "@cortex/db"
```

### 2.2 Add to Docker Compose

Add to `docker-compose.production.yml`:

```yaml
# Memgraph
memgraph:
  image: memgraph/memgraph-platform:latest
  container_name: cortex-memgraph
  ports:
    - "7687:7687"  # Bolt protocol
    - "7444:7444"  # Monitoring
    - "3000:3000"  # Memgraph Lab
  volumes:
    - memgraph_data:/var/lib/memgraph
    - memgraph_log:/var/log/memgraph
    - memgraph_etc:/etc/memgraph
  environment:
    - MEMGRAPH_LOG_LEVEL=WARNING
  networks:
    - cortex-network
  healthcheck:
    test: ["CMD-SHELL", "echo 'RETURN 1;' | mgconsole || exit 1"]
    interval: 30s
    timeout: 10s
    retries: 5
  restart: unless-stopped

volumes:
  memgraph_data:
    driver: local
  memgraph_log:
    driver: local
  memgraph_etc:
    driver: local
```

### 2.3 Create Memgraph Service

Create `packages/db/src/services/search/memgraph-service.ts`:

```typescript
/**
 * Memgraph Service
 * Graph database for user interaction tracking and recommendations
 */

import neo4j, { Driver, Session } from 'neo4j-driver';

export interface Interaction {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp?: Date;
  metadata?: any;
}

export interface Recommendation {
  entityId: string;
  entityType: string;
  score: number;
  reason: string;
}

export class MemgraphService {
  private driver: Driver | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      const uri = process.env.MEMGRAPH_URI || 'bolt://localhost:7687';
      const user = process.env.MEMGRAPH_USER || '';
      const password = process.env.MEMGRAPH_PASSWORD || '';

      this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

      // Verify connectivity
      await this.driver.verifyConnectivity();
      this.isConnected = true;
      console.log('[Memgraph] Connected successfully');

      // Create constraints and indexes
      await this.createConstraints();
    } catch (error) {
      console.error('[Memgraph] Connection failed:', error);
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.isConnected = false;
    }
  }

  private async createConstraints(): Promise<void> {
    const session = this.getSession();

    try {
      // Create unique constraints
      await session.run('CREATE CONSTRAINT ON (u:User) ASSERT u.id IS UNIQUE;');
      await session.run('CREATE CONSTRAINT ON (p:POV) ASSERT p.id IS UNIQUE;');
      await session.run('CREATE CONSTRAINT ON (t:TRR) ASSERT t.id IS UNIQUE;');
      await session.run('CREATE CONSTRAINT ON (pr:Project) ASSERT pr.id IS UNIQUE;');

      // Create indexes for better performance
      await session.run('CREATE INDEX ON :User(id);');
      await session.run('CREATE INDEX ON :POV(id);');
      await session.run('CREATE INDEX ON :TRR(id);');
      await session.run('CREATE INDEX ON :Project(id);');
    } catch (error) {
      // Constraints might already exist
      console.log('[Memgraph] Constraints/indexes may already exist');
    } finally {
      await session.close();
    }
  }

  private getSession(): Session {
    if (!this.driver) {
      throw new Error('Memgraph driver not initialized');
    }
    return this.driver.session();
  }

  /**
   * Track a user interaction
   */
  async trackInteraction(interaction: Interaction): Promise<void> {
    if (!this.isConnected) return;

    const session = this.getSession();

    try {
      const { userId, action, entityType, entityId, metadata = {} } = interaction;

      // Create or merge user node
      await session.run(
        `
        MERGE (u:User {id: $userId})
        `,
        { userId }
      );

      // Create or merge entity node
      await session.run(
        `
        MERGE (e:${entityType} {id: $entityId})
        `,
        { entityId }
      );

      // Create interaction relationship
      await session.run(
        `
        MATCH (u:User {id: $userId})
        MATCH (e:${entityType} {id: $entityId})
        CREATE (u)-[r:${action.toUpperCase()} {
          timestamp: datetime(),
          metadata: $metadata
        }]->(e)
        `,
        { userId, entityId, metadata: JSON.stringify(metadata) }
      );
    } catch (error) {
      console.error('[Memgraph] Error tracking interaction:', error);
    } finally {
      await session.close();
    }
  }

  /**
   * Get recommendations for a user based on interaction patterns
   */
  async getRecommendations(userId: string, limit = 10): Promise<Recommendation[]> {
    if (!this.isConnected) return [];

    const session = this.getSession();

    try {
      // Find similar users and their interactions
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[r1]->(e)
        MATCH (similar:User)-[r2]->(e)
        WHERE u <> similar
        WITH similar, COUNT(DISTINCT e) AS commonInterests
        ORDER BY commonInterests DESC
        LIMIT 10

        MATCH (similar)-[r]->(recommended)
        WHERE NOT (u)-[]->(recommended)
        WITH recommended,
             type(r) AS interactionType,
             COUNT(r) AS interactionCount,
             commonInterests
        RETURN
          recommended.id AS entityId,
          labels(recommended)[0] AS entityType,
          interactionCount * commonInterests AS score,
          'Similar users also interacted with this' AS reason
        ORDER BY score DESC
        LIMIT $limit
        `,
        { userId, limit }
      );

      return result.records.map(record => ({
        entityId: record.get('entityId'),
        entityType: record.get('entityType'),
        score: record.get('score').toNumber(),
        reason: record.get('reason')
      }));
    } catch (error) {
      console.error('[Memgraph] Error getting recommendations:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Get user interaction history
   */
  async getUserInteractions(userId: string, limit = 50): Promise<any[]> {
    if (!this.isConnected) return [];

    const session = this.getSession();

    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[r]->(e)
        RETURN
          type(r) AS action,
          labels(e)[0] AS entityType,
          e.id AS entityId,
          r.timestamp AS timestamp,
          r.metadata AS metadata
        ORDER BY r.timestamp DESC
        LIMIT $limit
        `,
        { userId, limit }
      );

      return result.records.map(record => ({
        action: record.get('action'),
        entityType: record.get('entityType'),
        entityId: record.get('entityId'),
        timestamp: record.get('timestamp'),
        metadata: JSON.parse(record.get('metadata') || '{}')
      }));
    } catch (error) {
      console.error('[Memgraph] Error getting user interactions:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Get trending entities based on recent interactions
   */
  async getTrending(entityType?: string, limit = 10): Promise<any[]> {
    if (!this.isConnected) return [];

    const session = this.getSession();

    try {
      const typeFilter = entityType ? `:${entityType}` : '';

      const result = await session.run(
        `
        MATCH (u:User)-[r]->(e${typeFilter})
        WHERE r.timestamp > datetime() - duration({days: 7})
        WITH e, COUNT(r) AS interactionCount
        RETURN
          e.id AS entityId,
          labels(e)[0] AS entityType,
          interactionCount
        ORDER BY interactionCount DESC
        LIMIT $limit
        `,
        { limit }
      );

      return result.records.map(record => ({
        entityId: record.get('entityId'),
        entityType: record.get('entityType'),
        interactionCount: record.get('interactionCount').toNumber()
      }));
    } catch (error) {
      console.error('[Memgraph] Error getting trending:', error);
      return [];
    } finally {
      await session.close();
    }
  }
}

// Export singleton
export const memgraphService = new MemgraphService();
export default memgraphService;
```

### 2.4 Create Interactions API Endpoint

Create `apps/web/app/api/interactions/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { memgraphService } from '@cortex/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, entityType, entityId, metadata } = body;

    if (!userId || !action || !entityType || !entityId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await memgraphService.trackInteraction({
      userId,
      action,
      entityType,
      entityId,
      metadata
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Interaction tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
}
```

### 2.5 Create Recommendations API Endpoint

Create `apps/web/app/api/recommendations/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { memgraphService } from '@cortex/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const recommendations = await memgraphService.getRecommendations(userId, limit);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
```

---

## Part 3: AI Integration

### 3.1 AI-Powered Search Suggestions

Enhance search with AI:

```typescript
// In packages/db/src/services/search/ai-search-service.ts

import { generateText } from 'ai';
import { openSearchService } from './opensearch-service';

export async function enhanceSearch(query: string, context: any) {
  // Use AI to understand intent and expand query
  const { text } = await generateText({
    model: yourAIModel,
    prompt: `
    Analyze this search query and suggest related terms:
    Query: "${query}"
    Context: ${JSON.stringify(context)}

    Provide synonyms and related terms that would improve search results.
    `
  });

  // Combine original and AI-enhanced query
  return await openSearchService.search({
    query: `${query} ${text}`,
    ...context
  });
}
```

### 3.2 AI-Powered Recommendations

```typescript
// In packages/db/src/services/search/ai-recommendations.ts

export async function getAIRecommendations(userId: string) {
  // Get user's interaction history
  const interactions = await memgraphService.getUserInteractions(userId);

  // Get graph-based recommendations
  const graphRecs = await memgraphService.getRecommendations(userId);

  // Use AI to analyze and rank recommendations
  const { text } = await generateText({
    model: yourAIModel,
    prompt: `
    Analyze user interactions and provide personalized recommendations:

    Interactions: ${JSON.stringify(interactions)}
    Graph Recommendations: ${JSON.stringify(graphRecs)}

    Rank and explain why these are good recommendations for this user.
    `
  });

  return {
    recommendations: graphRecs,
    aiInsights: text
  };
}
```

---

## Part 4: Setup & Testing

### 4.1 Environment Variables

Add to `.env`:

```bash
# OpenSearch
OPENSEARCH_URL=http://localhost:9200

# Memgraph
MEMGRAPH_URI=bolt://localhost:7687
MEMGRAPH_USER=
MEMGRAPH_PASSWORD=
```

### 4.2 Start Services

```bash
# Start Docker services
docker-compose -f docker-compose.production.yml up -d opensearch memgraph

# Verify OpenSearch
curl http://localhost:9200

# Access OpenSearch Dashboards
open http://localhost:5601

# Access Memgraph Lab
open http://localhost:3000
```

### 4.3 Initialize Services

Add to your application startup:

```typescript
// In packages/db/src/index.ts or app initialization

import { openSearchService, memgraphService } from '@cortex/db';

async function initializeServices() {
  await openSearchService.connect();
  await memgraphService.connect();
}

initializeServices();
```

### 4.4 Test Search

```bash
# Index some test data
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "types": ["pov", "trr"], "limit": 10}'
```

### 4.5 Test Interactions

```bash
# Track an interaction
curl -X POST http://localhost:3000/api/interactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "action": "search_click",
    "entityType": "pov",
    "entityId": "pov456",
    "metadata": {"query": "test"}
  }'

# Get recommendations
curl http://localhost:3000/api/recommendations?userId=user123&limit=10
```

---

## Part 5: Export Services

Update `packages/db/src/services/index.ts`:

```typescript
// Search and interaction services
export { openSearchService, OpenSearchService } from './search/opensearch-service';
export { memgraphService, MemgraphService } from './search/memgraph-service';
export type { SearchOptions, SearchResult } from './search/opensearch-service';
export type { Interaction, Recommendation } from './search/memgraph-service';
```

---

## Monitoring & Performance

### OpenSearch Monitoring

```bash
# Check cluster health
curl http://localhost:9200/_cluster/health

# View indexes
curl http://localhost:9200/_cat/indices?v

# Search statistics
curl http://localhost:9200/_cat/indices/povs,trrs,users,projects?v
```

### Memgraph Monitoring

Access Memgraph Lab at `http://localhost:3000` and run queries:

```cypher
// Total interactions
MATCH ()-[r]->() RETURN COUNT(r);

// Most active users
MATCH (u:User)-[r]->()
RETURN u.id, COUNT(r) AS interactions
ORDER BY interactions DESC
LIMIT 10;

// Popular entities
MATCH ()-[r]->(e)
WHERE r.timestamp > datetime() - duration({days: 7})
RETURN labels(e)[0] AS type, e.id, COUNT(r) AS popularity
ORDER BY popularity DESC
LIMIT 10;
```

---

## Performance Tips

1. **OpenSearch**:
   - Use bulk indexing for large datasets
   - Configure appropriate shard sizes
   - Enable caching for frequent queries
   - Use filters before queries when possible

2. **Memgraph**:
   - Create indexes on frequently queried properties
   - Use parameterized queries to leverage query caching
   - Limit graph traversal depth
   - Use OPTIONAL MATCH for non-critical relationships

3. **Caching**:
   - Cache search results in Redis for 2-5 minutes
   - Cache recommendations for 10-15 minutes
   - Invalidate on data changes

---

## Next Steps

1. Implement the services following this guide
2. Create bulk indexing script for existing data
3. Add search analytics to track popular queries
4. Implement query suggestions using AI
5. Create recommendation widgets in the UI
6. Set up monitoring and alerting

---

**Implementation Status**: Ready to implement
**Estimated Time**: 4-6 hours for full integration
**Dependencies**: Docker, OpenSearch 2.11+, Memgraph Platform

For questions or issues, refer to:
- OpenSearch docs: https://opensearch.org/docs/latest/
- Memgraph docs: https://memgraph.com/docs/
