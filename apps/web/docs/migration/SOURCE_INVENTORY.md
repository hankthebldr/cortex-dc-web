# Source Repository Inventory - henryreed.ai

## Complete File Structure Analysis

### Root Level Configuration
```
henryreed.ai/
├── firebase.json                    # Main Firebase configuration
├── .firebaserc                     # Firebase project configuration
├── deploy.sh                       # Deployment script
├── deploy-test.sh                  # Test deployment script
├── package.json                    # Root dependencies (if exists)
├── docker-compose.yml              # Docker configuration
└── Dockerfile                      # Container configuration
```

### Next.js Application Structure
```
hosting/                             # Main Next.js application
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home page
│   ├── globals.css                 # Global styles
│   ├── dc-portal-styles.css        # Portal-specific styles
│   ├── gui/page.tsx                # GUI interface route
│   ├── terminal/page.tsx           # Terminal interface route
│   ├── content/page.tsx            # Content hub route
│   ├── creator/page.tsx            # Creator tools route
│   ├── docs/page.tsx              # Documentation route
│   └── alignment-guide/page.tsx    # Command alignment guide
├── components/                     # React components (50+)
├── lib/                           # Utility libraries and services
├── docs/                          # Documentation files
├── cloud-functions/               # Additional function code
├── package.json                   # Frontend dependencies
├── next.config.ts                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS config
├── tsconfig.json                  # TypeScript configuration
├── .env.example                   # Environment variables template
├── firebase.json                  # Hosting-specific Firebase config
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Firestore indexes
└── storage.rules                  # Cloud Storage security rules
```

### React Components Inventory (50+ components)
```
components/
├── AppHeader.tsx                   # Main navigation header
├── AppShell.tsx                   # Application shell
├── AuthLanding.tsx                # Authentication landing page
├── BigQueryExplorer.tsx           # BigQuery data explorer
├── BigQueryExportPanel.tsx        # Export configuration panel
├── BreadcrumbNavigation.tsx       # Breadcrumb navigation
├── CommandAlignmentGuide.tsx      # Command alignment guide
├── ConditionalLayout.tsx          # Conditional layout wrapper
├── ConsolidatedContentLibrary.tsx # Content library management
├── ContentAnalytics.tsx           # Content analytics dashboard
├── ContentCreatorManager.tsx      # Content creation management
├── ContentLibrary.tsx             # Content library component
├── CortexButton.tsx               # Cortex-branded buttons
├── CortexCloudFrame.tsx           # Cloud frame component
├── CortexCommandButton.tsx        # Command button component
├── CortexDCTerminal.tsx           # DC terminal interface
├── CortexGUIInterface.tsx         # Main GUI interface
├── DomainConsultantWorkspace.tsx  # DC workspace component
├── EnhancedAIAssistant.tsx        # AI assistant interface
├── EnhancedContentCreator.tsx     # Enhanced content creator
├── EnhancedGUIInterface.tsx       # Enhanced GUI interface
├── EnhancedManualCreationGUI.tsx  # Manual creation GUI
├── EnhancedScenarioCreator.tsx    # Scenario creation interface
├── EnhancedTerminal.tsx           # Enhanced terminal component
├── ImprovedTerminal.tsx           # Improved terminal implementation
├── InteractiveCharts.tsx          # Interactive chart components
├── LoginForm.tsx                  # Login form component
├── ManagementDashboard.tsx        # Management dashboard
├── ManualCreationGUI.tsx          # Manual creation interface
├── NotificationSystem.tsx         # Notification management
├── OnboardingGuide.tsx            # User onboarding guide
├── POVManagement.tsx              # POV management interface
├── POVProjectManagement.tsx       # POV project management
├── ProductionTRRManagement.tsx    # Production TRR management
├── ScenarioEngine.tsx             # Scenario engine interface
├── TRRManagement.tsx              # TRR management system
├── TRRProgressChart.tsx           # TRR progress visualization
├── Terminal.tsx                   # Base terminal component
├── TerminalOutput.tsx             # Terminal output handling
├── TerminalOutputs.tsx            # Multiple terminal outputs
├── UnifiedContentCreator.tsx      # Unified content creation
├── UnifiedTerminal.tsx            # Unified terminal interface
├── UserTimelineView.tsx           # User timeline visualization
├── XSIAMHealthMonitor.tsx         # XSIAM health monitoring
└── XSIAMIntegrationPanel.tsx      # XSIAM integration panel
```

### Library and Services Structure
```
lib/
├── commands/                      # Terminal command system
│   ├── commands.tsx               # Core commands
│   ├── commands-ext.tsx           # Extended commands
│   ├── command-registry.ts        # Command registration
│   ├── arg-parser.ts              # Argument parsing
│   ├── bigquery-commands.tsx      # BigQuery commands
│   ├── cdr-commands.tsx           # CDR commands
│   ├── cloud-config-commands.tsx  # Cloud configuration
│   ├── cloud-functions-api.ts     # Cloud Functions API
│   ├── cortex-dc-commands.tsx     # Cortex DC commands
│   ├── download-commands.tsx      # Download commands
│   ├── enhanced-pov-commands.tsx  # Enhanced POV commands
│   ├── enhanced-trr-commands.tsx  # Enhanced TRR commands
│   ├── gemini-commands.tsx        # Gemini AI commands
│   ├── guide-commands.tsx         # Guide commands
│   ├── linux-commands.tsx         # Linux-style commands
│   ├── pov-commands.tsx           # POV commands
│   ├── project-commands.tsx       # Project commands
│   ├── resources-commands.tsx     # Resource commands
│   ├── scenario-commands.tsx      # Scenario commands
│   ├── template-config-commands.tsx # Template commands
│   ├── trr-blockchain-signoff.tsx # TRR blockchain signoff
│   └── xsiam-commands.tsx         # XSIAM commands
├── services/                      # Service layer
│   ├── api-service.ts             # Main API service
│   ├── ai-insights-client.ts      # AI insights client
│   ├── bigquery-service.ts        # BigQuery service
│   ├── content-library-service.ts # Content library service
│   ├── dc-ai-client.ts            # DC AI client
│   ├── dc-api-client.ts           # DC API client
│   ├── dc-context-store.ts        # DC context store
│   ├── scenario-engine.ts         # Scenario engine
│   ├── scenario-engine-client.ts  # Scenario engine client
│   ├── user-activity-service.ts   # User activity service
│   ├── user-management.ts         # User management
│   └── xsiam-api-service.ts       # XSIAM API service
├── types/                         # TypeScript type definitions
│   ├── scenario-types.ts          # Scenario types
│   ├── sdw-models.ts             # SDW models
│   ├── trr.ts                    # TRR types
│   └── trr-extended.ts           # Extended TRR types
├── hooks/                         # React hooks
│   ├── useActivityTracking.ts     # Activity tracking hook
│   └── useAuthGuard.ts           # Authentication guard hook
└── contexts/                      # React contexts
    ├── AppStateContext.tsx        # Application state
    └── AuthContext.tsx           # Authentication context
```

### Firebase Functions Structure (Multiple Codebases)
```
functions/                         # Main functions codebase
├── src/
│   ├── index.ts                  # Function exports
│   ├── gemini.ts                 # Gemini AI integration
│   ├── handlers/
│   │   ├── ai-trr-suggest.ts     # AI TRR suggestions
│   │   ├── scenario-executor.ts  # Scenario execution
│   │   └── scenario-orchestration.ts # Scenario orchestration
│   ├── middleware/
│   │   └── auth.ts               # Authentication middleware
│   ├── routes/
│   │   ├── ai.ts                 # AI routes
│   │   ├── bigquery.ts           # BigQuery routes
│   │   └── trr.ts                # TRR routes
│   ├── utils/
│   │   └── logger.ts             # Logging utilities
│   └── dataconnect-generated/    # Generated DataConnect code
├── lib/                          # Compiled JavaScript
├── package.json                  # Function dependencies
└── tsconfig.json                 # TypeScript configuration

henryreedai/                      # AI-specific functions
├── src/
│   ├── index.ts                  # AI function exports
│   ├── ai-functions.ts           # Core AI functions
│   └── genkit-sample.ts          # Genkit integration sample
├── package.json
└── tsconfig.json

hosting/cloud-functions/          # Additional hosting functions
└── bigquery-export/
    ├── index.js                  # BigQuery export function
    ├── package.json
    └── package-lock.json
```

### DataConnect Configuration
```
dataconnect/
├── dataconnect.yaml             # DataConnect configuration
├── schema/
│   └── schema.gql               # GraphQL schema
└── example/
    ├── connector.yaml           # Example connector
    ├── mutations.gql            # Example mutations
    └── queries.gql              # Example queries
```

### Documentation Structure
```
docs/                            # Root documentation
├── README.md                    # Documentation index
├── architecture.md              # System architecture
├── cloud-integration.md         # Cloud integration guide
├── development.md               # Development guide
├── commands/README.md           # Commands documentation
└── branding/                    # Branding guidelines
    ├── BRAND_GUIDELINES.md      # Brand guidelines
    ├── COLOR_REFERENCE.md       # Color reference
    └── COMPONENT_API.md         # Component API

hosting/docs/                    # Hosting-specific documentation
├── domain-consultant-guide.md   # DC guide
├── gui-user-flows.md           # GUI user flows
├── xsiam-integration.md        # XSIAM integration
├── bigquery-export.md          # BigQuery export
├── POV_CONSULTANT_GUIDE.md     # POV consultant guide
└── POV_OPTIMIZATION_ANALYSIS.md # POV optimization

Root-level Documentation:
├── BACKEND_SERVICES_SUMMARY.md  # Backend services overview
├── CLOUD_NATIVE_SECOPS_EXPANSION_PLAN.md # Security expansion
├── COMMAND_INVENTORY.md         # Command inventory
├── COMPREHENSIVE_SCENARIO_ENGINE.md # Scenario engine docs
├── Cortex_DC_Portal_Design.md   # Portal design document
├── DATA_FLOW_LIFECYCLE_DOCUMENTATION.md # Data flow docs
├── EXTENSION_FRAMEWORK_DOCUMENTATION.md # Extension framework
├── EXTERNAL_INTEGRATION_ARCHITECTURE.md # Integration architecture
├── FIREBASE_CONFIGURATION_SUMMARY.md # Firebase configuration
├── README.md                    # Main README
├── README_NEW.md                # New README version
├── TRR_MANAGEMENT_OPTIMIZATION_SUMMARY.md # TRR optimization
├── TYPESCRIPT_STRUCTURE_ANALYSIS.md # TypeScript analysis
├── UNIFIED_SCHEMA_DOCUMENTATION.md # Schema documentation
└── WARP.md                      # WARP development guide
```

### Key Configuration Files Analysis

#### Firebase Configuration Comparison
**Source**: Complex multi-environment configuration with API rewrites
**Target**: Simplified hosting-only configuration

**Key Differences:**
- Source has API function rewrites (`/api/**` → `api` function)
- Source has comprehensive security headers (CSP, X-Frame-Options, etc.)
- Source includes DataConnect configuration
- Source has detailed caching strategies by file type

#### Next.js Configuration Analysis
**Source**: Next.js 15 with experimental webpack features
- Static export with `output: 'export'`
- Experimental webpack features with environment flag
- Custom optimization for command chunking
- Turbopack configuration for SVG handling

**Target Needs**: Upgrade from Next.js 14 to 15 with same configuration

#### Package Dependencies Critical Analysis
**Source Dependencies:**
- `firebase`: 12.3.0 (latest)
- `next`: latest (15.x)
- `react`: 18.2.0
- `jspdf`: 2.5.1 (PDF generation)
- `gray-matter`: 4.0.3 (Markdown processing)
- `clsx`: 2.1.1 (Utility classes)

**Build Tools:**
- `cross-env`: Environment variable management
- `depcheck`: Dependency analysis
- `ts-prune`: TypeScript unused code detection
- Custom deployment scripts

### Environment Variables Identified
```bash
# From source .env.example analysis needed
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# AI Services
OPENAI_API_KEY=
VERTEX_AI_PROJECT=
VERTEX_AI_LOCATION=

# External APIs
XSIAM_API_BASE=
XSIAM_API_TOKEN=
BIGQUERY_PROJECT_ID=
GITHUB_TOKEN=
CAL_COM_API_KEY=

# Build Configuration
NEXT_ENABLE_WEBPACK_EXPERIMENTS=1
NODE_ENV=production
```

## Migration Priority Matrix

### High Priority (Core Infrastructure)
1. **Firebase Configuration** - Multi-environment setup critical
2. **Next.js Configuration** - Version upgrade and webpack experiments
3. **Package Dependencies** - Core libraries and build tools
4. **TypeScript Configuration** - Strict mode and shared configs
5. **Build Scripts** - Deployment and development workflows

### Medium Priority (Feature Components)
1. **React Components** - 50+ components with complex dependencies
2. **Command System** - 20+ command files with aliases
3. **Service Layer** - API clients and data management
4. **Authentication** - Firebase Auth and role-based access
5. **Documentation** - Path updates and link validation

### Lower Priority (Enhancement Features)
1. **AI Integration** - OpenAI and Vertex AI services
2. **External APIs** - XSIAM, BigQuery, GitHub integration
3. **Advanced Features** - Terminal UI, scenario engine
4. **Testing** - E2E and unit test migration
5. **Optimization** - Performance and bundle size

This inventory provides the foundation for systematic migration planning and execution.