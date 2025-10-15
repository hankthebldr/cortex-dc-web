# Cortex DC Web - Comprehensive Migration Schematic

## Executive Summary

This document provides a comprehensive schematic for rebuilding the existing henryreed.ai application as a net new repository (cortex-dc-web) with reduced technical debt, improved manageability, and enhanced scalability. The migration follows a domain-driven, monorepo architecture using modern tooling while preserving all existing capabilities.

### Key Objectives
- **Reduce Technical Debt**: Modern tooling, clean architecture boundaries, strict TypeScript
- **Improve Scalability**: Monorepo structure, provider-agnostic AI layer, cloud-native patterns
- **Enhance Manageability**: Domain-driven design, comprehensive testing, observability
- **Preserve Capabilities**: Zero feature loss, comprehensive content migration, embedded service compatibility

### Success Criteria
✅ **Functional `firebase deploy`** for dev/staging/prod environments  
✅ **Generative AI services** working across all configured providers  
✅ **Storage and embedded services** fully operational  
✅ **Zero content loss** with archived/indexed legacy content  

---

## Current Application Analysis

### Architecture Overview
The existing henryreed.ai application is a **Firebase-hosted Next.js 15 application** with the following characteristics:

**Frontend Stack:**
- Next.js 15 with App Router and static export (`output: 'export'`)
- Tailwind CSS with custom Cortex branding
- TypeScript with comprehensive UI components
- Firebase Hosting with CDN and rewrites

**Backend Services:**
- Firebase Functions (2nd gen) for serverless compute
- Firestore for operational data storage
- Firebase Storage for asset management

- Firebase Auth for authentication
- Vertex AI integration for generative AI capabilities

**Key Features:**
- **Domain Consultant (DC) Portal**: Professional engagement platform
- **Terminal Interface**: Comprehensive command system for POV management, scenarios, TRR workflows
- **AI-Powered Insights**: Context-aware recommendations and chat assistance
- **Content Management**: Dynamic content creation and management
- **Scenario Engine**: Security assessment framework with cloud deployments
- **BigQuery Integration**: Data export and analytics capabilities

### Current File Structure Analysis
```
henryreed.ai/
├── hosting/                          # Next.js application
│   ├── app/                         # App Router pages
│   │   ├── gui/                     # Main DC interface
│   │   ├── terminal/                # Terminal interface
│   │   ├── content/                 # Content management
│   │   └── docs/                    # Documentation
│   ├── components/                  # React components
│   │   ├── ui/                      # Base UI components
│   │   ├── terminal/                # Terminal components
│   │   ├── EnhancedGUIInterface.tsx # Main GUI
│   │   ├── POVManagement.tsx        # POV workflows
│   │   ├── TRRManagement.tsx        # TRR system
│   │   └── BigQueryExplorer.tsx     # Data export
│   ├── lib/                         # Core libraries
│   │   ├── commands.tsx             # Terminal commands
│   │   ├── scenario-commands.tsx    # Scenario system
│   │   ├── pov-commands.tsx         # POV management
│   │   ├── gemini-ai-service.ts     # AI integration
│   │   ├── dc-context-store.ts      # State management
│   │   └── cloud-functions-api.ts   # Backend API
│   ├── contexts/                    # React contexts
│   ├── hooks/                       # Custom hooks
│   └── docs/                        # Technical documentation
├── functions/                       # Firebase Functions
├── firebase.json                    # Firebase configuration
└── README_NEW.md                   # Current documentation
```

### Capabilities Inventory

#### Core Features
1. **Authentication & Authorization**
   - Firebase Auth with email/password and demo modes
   - Role-based access control
   - Session management

2. **Domain Consultant Workflows**
   - POV (Proof of Value) lifecycle management
   - TRR (Technical Risk Review) workflows
   - Customer engagement tracking
   - Timeline and milestone management

3. **Terminal Command System**
   - 200+ commands across multiple modules
   - Scenario generation and deployment
   - Detection testing and validation
   - Monitoring and analytics
   - Resource management

4. **AI Integration**
   - Vertex AI (Gemini) for chat and generation
   - Context-aware recommendations
   - Interactive AI assistant
   - Content generation capabilities

5. **Content Management**
   - Dynamic content creation
   - Markdown processing
   - Template system
   - Version control

6. **Data Export & Analytics**
   - BigQuery integration
   - Configurable exports
   - Job tracking and history
   - Multiple format support

#### Datasets & Storage
1. **Firestore Collections**
   - Users and profiles
   - POVs and TRRs
   - Scenarios and templates
   - Chat sessions and messages
   - Analytics and events

2. **Firebase Storage**
   - Asset storage (images, documents, exports)
   - Template files
   - Generated content
   - User uploads

3. **External Integrations**
   - Google Cloud Functions for scenario deployment
   - BigQuery for analytics
   - Various AI providers (Vertex AI primary)

### Technical Debt Assessment

#### Current Issues
1. **Monolithic Structure**: Single Next.js app handling all concerns
2. **Mixed Patterns**: Inconsistent state management and data fetching
3. **Tightly Coupled Dependencies**: Hard to test and maintain individual features
4. **Limited Scalability**: Single deployment unit constrains updates
5. **Inconsistent Error Handling**: Mixed error patterns across components
6. **Documentation Gaps**: Missing ADRs and architectural decisions

#### Optimization Opportunities
1. **Domain Separation**: Clear boundaries between DC workflows, AI, content, etc.
2. **Provider Abstraction**: Vendor-neutral AI and storage layers
3. **Testing Strategy**: Comprehensive unit, integration, and E2E testing
4. **Performance**: Code splitting, caching, and optimization
5. **Observability**: Structured logging and monitoring

---

## Target Architecture

### High-Level Design Principles
1. **Domain-Driven Design**: Clear domain boundaries and services
2. **Provider Agnostic**: Abstract cloud providers and AI services
3. **Cloud-Native**: Leverage managed services for scalability
4. **Security First**: Zero-trust architecture with least privilege
5. **Observable**: Comprehensive logging, monitoring, and tracing

### Technology Stack

#### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with design system
- **State**: Server Components + Client Components pattern
- **Testing**: Vitest + Playwright

#### Backend
- **Functions**: Firebase Functions 2nd gen
- **Database**: Firestore Native mode
- **Storage**: Firebase Storage + Cloud Storage
- **Queue**: Cloud Pub/Sub
- **Jobs**: Cloud Run jobs
- **AI**: Vertex AI (primary) + provider abstraction

#### Infrastructure
- **Hosting**: Firebase Hosting + CDN
- **Auth**: Firebase Auth + App Check
- **Monitoring**: Cloud Monitoring + Sentry
- **Secrets**: Secret Manager
- **CI/CD**: GitHub Actions

### Monorepo Structure

```
cortex-dc-web/
├── apps/
│   ├── web/                         # Next.js 14 frontend
│   │   ├── app/                     # App Router
│   │   │   ├── (auth)/              # Auth routes
│   │   │   ├── (dashboard)/         # DC dashboard
│   │   │   ├── (terminal)/          # Terminal interface
│   │   │   └── (admin)/             # Admin interface
│   │   ├── components/              # App-specific components
│   │   └── lib/                     # App utilities
│   └── admin/ (optional)            # Admin dashboard
├── packages/
│   ├── ui/                          # Shared UI components (design system)
│   │   ├── components/              # React components
│   │   ├── styles/                  # Tailwind config & styles
│   │   └── assets/                  # Icons, fonts, images
│   ├── db/                          # Database layer
│   │   ├── firestore/               # Firestore utilities
│   │   ├── schemas/                 # Zod schemas
│   │   └── queries/                 # Query builders
│   ├── ai/                          # AI platform abstraction
│   │   ├── providers/               # Provider implementations
│   │   ├── chat/                    # Chat interfaces
│   │   ├── embeddings/              # Vector operations
│   │   └── rag/                     # RAG orchestration
│   ├── utils/                       # Shared utilities
│   └── config/                      # Shared configurations
├── functions/                       # Firebase Functions
│   ├── src/
│   │   ├── auth/                    # Auth triggers
│   │   ├── webhooks/                # Webhook handlers
│   │   ├── api/                     # HTTP functions
│   │   └── scheduled/               # Cron jobs
├── services/                        # Cloud Run services
│   └── ingestion/                   # Content ingestion pipeline
├── infra/                          # Infrastructure as Code
├── docs/                           # Documentation
│   ├── architecture/                # System design docs
│   ├── adrs/                       # Architecture Decision Records
│   ├── runbooks/                   # Operational procedures
│   └── migration/                  # Migration artifacts
└── tools/                          # Development tools
```

### Domain Architecture

#### 1. Authentication & Authorization Domain
**Packages**: `@cortex/auth`
- User management and profiles
- Role-based access control (RBAC)
- Organization and team management
- Session and token management

#### 2. Content Management Domain
**Packages**: `@cortex/content`
- Document and article management
- Template and snippet systems
- Content versioning and history
- Search and indexing

#### 3. AI & Chat Domain
**Packages**: `@cortex/ai`
- Multi-provider AI abstraction
- Chat session management
- RAG (Retrieval-Augmented Generation)
- Tool integration and function calling

#### 4. DC Workflows Domain
**Packages**: `@cortex/dc-workflows`
- POV lifecycle management
- TRR process workflows
- Customer engagement tracking
- Scenario management

#### 5. Terminal & Commands Domain
**Packages**: `@cortex/terminal`
- Command parsing and execution
- Terminal interface components
- Command history and suggestions
- Plugin system for extensions

#### 6. Analytics & Insights Domain
**Packages**: `@cortex/analytics`
- Event tracking and processing
- Dashboard and visualization
- Export and reporting
- Performance metrics

---

## Migration Strategy

### Phase 1: Foundation & Setup (Weeks 1-2)

#### Repository Setup
```bash
# Create new repository
mkdir cortex-dc-web && cd cortex-dc-web
git init
pnpm create next-app@latest apps/web --typescript --tailwind --app
```

#### Tooling Configuration
- **Package Manager**: pnpm with workspaces
- **Build System**: Turborepo for monorepo builds
- **Linting**: ESLint + Prettier with shared configs
- **Git Hooks**: Husky + lint-staged for pre-commit checks
- **Commit Convention**: Conventional Commits with Changesets

#### Environment Setup
```yaml
Environments:
  dev: cortex-dc-web-dev
  staging: cortex-dc-web-staging  
  prod: cortex-dc-web-prod

Configuration:
  - Firebase projects per environment
  - GCP projects or folders
  - Secret Manager for credentials
  - Feature flags for A/B testing
```

#### CI/CD Pipeline
```yaml
GitHub Actions Workflows:
  ci.yml:
    - Lint, type-check, test
    - Build all packages
    - Security scans
  
  e2e.yml:
    - Firebase emulator setup
    - Playwright tests
    - Visual regression tests
  
  deploy.yml:
    - Preview channels on PR
    - Staging deploy on main
    - Production with manual approval
```

### Phase 2: Core Infrastructure (Weeks 3-4)

#### Firebase Project Setup
```bash
# Create projects
firebase projects:create cortex-dc-web-dev
firebase projects:create cortex-dc-web-staging
firebase projects:create cortex-dc-web-prod

# Enable services
firebase experiments:enable webframeworks
gcloud services enable aiplatform.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable pubsub.googleapis.com
```

#### Database Design
```typescript
// Firestore Collections Schema
interface Collections {
  // User Management
  users: UserProfile
  organizations: Organization
  orgMembers: OrganizationMember
  
  // DC Workflows  
  povs: ProofOfValue
  trrs: TechnicalRiskReview
  scenarios: SecurityScenario
  
  // Content & Chat
  documents: Document
  chunks: DocumentChunk
  sessions: ChatSession
  messages: ChatMessage
  
  // System
  jobs: ProcessingJob
  events: AnalyticsEvent
  settings: SystemSettings
}
```

#### Security Configuration
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Organization-scoped access
    match /povs/{povId} {
      allow read, write: if request.auth != null 
        && request.auth.uid in resource.data.members;
    }
  }
}
```

### Phase 3: Data Layer & Services (Weeks 5-6)

#### Database Abstraction Layer
```typescript
// packages/db/src/firestore/client.ts
export class FirestoreClient {
  constructor(private firestore: Firestore) {}
  
  async createPOV(data: CreatePOVInput): Promise<POV> {
    const docRef = await this.firestore.collection('povs').add({
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return this.getPOV(docRef.id);
  }
}
```

#### AI Platform Abstraction
```typescript
// packages/ai/src/providers/base.ts
export abstract class AIProvider {
  abstract chat(messages: ChatMessage[]): Promise<ChatResponse>
  abstract embed(text: string): Promise<number[]>
  abstract generateTools(prompt: string): Promise<ToolCall[]>
}

// packages/ai/src/providers/vertex.ts
export class VertexAIProvider extends AIProvider {
  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    const model = this.getModel('gemini-1.5-pro');
    return await model.generateContent(messages);
  }
}
```

#### Content Ingestion Pipeline
```typescript
// services/ingestion/src/pipeline.ts
export class ContentPipeline {
  async ingest(source: ContentSource): Promise<void> {
    // 1. Extract content
    const content = await this.extractContent(source);
    
    // 2. Chunk for processing
    const chunks = await this.chunkContent(content);
    
    // 3. Generate embeddings
    const embeddings = await this.generateEmbeddings(chunks);
    
    // 4. Store in vector database
    await this.storeEmbeddings(embeddings);
    
    // 5. Index for search
    await this.indexContent(content);
  }
}
```

### Phase 4: Frontend Migration (Weeks 7-10)

#### Component Migration Strategy
```typescript
// Migration mapping for major components
const COMPONENT_MIGRATION = {
  // Legacy -> New Location
  'components/EnhancedGUIInterface.tsx': 'apps/web/app/(dashboard)/page.tsx',
  'components/POVManagement.tsx': 'packages/ui/components/pov/POVManagement.tsx',
  'components/TRRManagement.tsx': 'packages/ui/components/trr/TRRManagement.tsx',
  'components/BigQueryExplorer.tsx': 'packages/ui/components/analytics/ExportPanel.tsx',
  'components/Terminal.tsx': 'packages/ui/components/terminal/Terminal.tsx'
};
```

#### Route Migration
```typescript
// apps/web/app layout structure
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── page.tsx                     # Main DC interface
│   ├── povs/
│   │   ├── page.tsx                 # POV list
│   │   ├── [id]/page.tsx           # POV detail
│   │   └── new/page.tsx            # Create POV
│   ├── trrs/
│   │   └── ...                     # TRR workflows
│   └── scenarios/
│       └── ...                     # Scenario management
├── (terminal)/
│   └── page.tsx                    # Terminal interface
├── (content)/
│   ├── docs/page.tsx
│   └── creator/page.tsx
└── api/
    ├── auth/                       # Auth endpoints
    ├── chat/                       # AI chat API
    └── webhooks/                   # Webhook handlers
```

#### State Management Migration
```typescript
// Modern server/client state pattern
// Server Components for data fetching
export default async function POVPage({ params }: { params: { id: string } }) {
  const pov = await getPOV(params.id);
  return <POVDetail pov={pov} />;
}

// Client Components for interactivity
'use client';
export function POVDetail({ pov }: { pov: POV }) {
  const [isEditing, setIsEditing] = useState(false);
  // Interactive logic here
}
```

### Phase 5: Content & Data Migration (Weeks 11-12)

#### Content Migration Process
```typescript
// Migration script structure
interface MigrationScript {
  name: string;
  version: string;
  idempotent: boolean;
  execute(): Promise<void>;
  rollback(): Promise<void>;
  validate(): Promise<boolean>;
}

// Example: POV migration
class POVMigrationScript implements MigrationScript {
  async execute(): Promise<void> {
    const oldPOVs = await this.oldDB.collection('povs').get();
    
    for (const doc of oldPOVs.docs) {
      const oldData = doc.data();
      const newData = this.transformPOVData(oldData);
      
      // Preserve old data in archive
      await this.archiveOldPOV(doc.id, oldData);
      
      // Create new document
      await this.newDB.collection('povs').doc(doc.id).set(newData);
    }
  }
}
```

#### Archive Strategy
```markdown
# Content Archival Policy

## Deprecated Components
- Location: `docs/archive/components/`
- Index: `ARCHIVE.md` with search functionality
- Format: Original code + migration notes

## Legacy Data
- Storage: Firestore subcollections with `.archived` suffix
- Access: Read-only via admin interface
- Retention: 2 years before hard deletion

## Documentation
- All legacy docs moved to `docs/legacy/`
- Cross-references updated to point to new locations
- Search index includes legacy content
```

### Phase 6: Testing & Quality Assurance (Weeks 13-14)

#### Testing Strategy
```typescript
// Unit Tests
describe('POV Service', () => {
  it('should create POV with valid data', async () => {
    const service = new POVService(mockFirestore);
    const result = await service.createPOV(validPOVData);
    expect(result.id).toBeDefined();
  });
});

// Integration Tests with Firebase Emulator
describe('POV API Integration', () => {
  beforeAll(async () => {
    await initializeTestApp();
  });
  
  it('should handle POV lifecycle', async () => {
    // Test full workflow
  });
});

// E2E Tests with Playwright
test('POV creation workflow', async ({ page }) => {
  await page.goto('/povs/new');
  await page.fill('[data-testid="pov-name"]', 'Test POV');
  await page.click('[data-testid="create-button"]');
  await expect(page.locator('.pov-success')).toBeVisible();
});
```

#### Quality Gates
```yaml
CI Pipeline Gates:
  Code Quality:
    - ESLint: zero errors
    - TypeScript: strict mode, zero errors
    - Test Coverage: >80%
  
  Security:
    - npm audit: zero high/critical
    - Firestore rules: security-rules-unit-testing
    - SAST scanning: CodeQL
  
  Performance:
    - Bundle size: <500kb gzipped
    - Lighthouse: >90 performance score
    - Core Web Vitals: all green
  
  Deployment:
    - Emulator tests: all pass
    - Preview deploy: successful
    - Smoke tests: all endpoints responding
```

### Phase 7: Deployment & Go-Live (Weeks 15-16)

#### Deployment Strategy
```yaml
Deployment Phases:
  1. Preview Channel Testing:
     - Deploy to Firebase preview channel
     - Internal team testing
     - Performance validation
  
  2. Staging Deployment:
     - Full staging environment
     - End-to-end testing
     - Data migration rehearsal
  
  3. Production Cutover:
     - Maintenance window announcement
     - Final data synchronization
     - DNS/routing updates
     - Live validation
```

#### Go-Live Checklist
```markdown
# Go-Live Validation Checklist

## Technical Verification
- [ ] firebase deploy succeeds for all environments
- [ ] All pages load correctly
- [ ] Authentication flows work
- [ ] AI chat functionality operational
- [ ] File upload/download working
- [ ] Search functionality active
- [ ] Analytics/tracking operational

## Data Integrity
- [ ] User accounts migrated
- [ ] POVs and TRRs accessible
- [ ] File attachments preserved
- [ ] Chat history maintained
- [ ] Analytics data available

## Performance & Security
- [ ] Page load times <3s
- [ ] API response times <500ms
- [ ] Security headers present
- [ ] SSL certificates valid
- [ ] Monitoring alerts configured
```

---

## Risk Mitigation & Contingencies

### Technical Risks

#### Risk: Data Migration Failure
**Mitigation**: 
- Full backup before migration
- Incremental migration with checkpoints
- Rollback scripts for each migration step
- Parallel run validation

#### Risk: Performance Degradation
**Mitigation**:
- Performance testing on staging
- Gradual traffic routing
- CDN optimization
- Database indexing optimization

#### Risk: Third-party Integration Failures
**Mitigation**:
- Provider abstraction layers
- Fallback mechanisms
- Feature flags for optional integrations
- Health check endpoints

### Business Risks

#### Risk: User Experience Disruption
**Mitigation**:
- Comprehensive user testing
- Training materials and documentation
- Gradual feature rollout
- Support team readiness

#### Risk: Extended Downtime
**Mitigation**:
- Blue-green deployment strategy
- Automated rollback procedures
- Communication plan
- War room for critical issues

---

## Success Metrics & KPIs

### Technical Metrics
```yaml
Performance:
  - Page Load Time: <2s (90th percentile)
  - API Response Time: <300ms (95th percentile)
  - Error Rate: <0.1%
  - Uptime: >99.9%

Quality:
  - Test Coverage: >85%
  - Code Quality: A rating
  - Security Vulnerabilities: 0 high/critical
  - Technical Debt Ratio: <5%
```

### Business Metrics
```yaml
Adoption:
  - User Migration Rate: >95%
  - Feature Parity: 100%
  - User Satisfaction: >4.5/5
  - Support Tickets: <10% increase

Operational:
  - Deployment Frequency: Daily
  - Lead Time: <1 day
  - Recovery Time: <1 hour
  - Change Failure Rate: <5%
```

### Firebase Deploy Success Criteria
```bash
# The ultimate success validation
firebase deploy --project cortex-dc-web-prod

# Followed by comprehensive smoke tests
npm run smoke-test:prod

# Key validations:
✅ Generative AI: Chat responses working
✅ Storage: File uploads/downloads operational  
✅ Embedded Services: Analytics tracking active
✅ Authentication: Login/logout flows working
✅ Core Features: POV/TRR workflows functional
```

---

## Post-Migration Optimization

### Technical Debt Reduction Goals
- **Code Quality**: Achieve >90% TypeScript strict compliance
- **Test Coverage**: Maintain >85% across all packages
- **Performance**: Sub-2s page loads, <300ms API responses
- **Security**: Zero high/critical vulnerabilities

### Continuous Improvement Plan
```yaml
Monthly Reviews:
  - Performance metrics analysis
  - Security vulnerability scans
  - User feedback incorporation
  - Technical debt assessment

Quarterly Upgrades:
  - Dependencies update cycles
  - Framework version upgrades
  - Infrastructure optimization
  - Feature enhancement planning
```

### Knowledge Transfer & Documentation
- **Architecture Decision Records (ADRs)**: Document all major decisions
- **Runbooks**: Operational procedures for common tasks
- **Developer Onboarding**: Comprehensive setup and contribution guides
- **User Documentation**: Updated workflows and feature guides

---

## Conclusion

This migration schematic provides a comprehensive roadmap for rebuilding henryreed.ai as cortex-dc-web with significantly reduced technical debt, improved scalability, and enhanced maintainability. The approach prioritizes:

1. **Zero Feature Loss**: All existing capabilities preserved and enhanced
2. **Modern Architecture**: Domain-driven design with cloud-native patterns  
3. **Developer Experience**: Comprehensive tooling, testing, and documentation
4. **Operational Excellence**: Robust CI/CD, monitoring, and incident response
5. **Future-Proofing**: Provider-agnostic abstractions and scalable foundations

The success criteria focus on the critical requirement: **functional `firebase deploy`** with all generative AI, storage, and embedded services operational. The migration preserves institutional knowledge while establishing a foundation for future innovation and growth.

**Estimated Timeline**: 16 weeks for full migration and optimization  
**Team Requirements**: 2-3 senior developers, 1 DevOps engineer, 1 QA specialist  
**Success Probability**: High, given comprehensive planning and risk mitigation  

This schematic serves as both a strategic roadmap and tactical execution guide for delivering a modern, maintainable, and scalable domain consultant platform.

<citations>
<document>
<document_type>RULE</document_type>
<document_id>4MCSfwC7HMM7WpQI6WHIF7</document_id>
</document>
<document>
<document_type>RULE</document_type>
<document_id>a2VHqvja9Iev5intH875CA</document_id>
</document>
<document>
<document_type>RULE</document_type>
<document_id>sg4ExRc85szKEFtNJ64ntV</document_id>
</document>
</citations>