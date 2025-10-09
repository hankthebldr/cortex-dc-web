# Project Management Architecture

## Overview

The Cortex DC Web application is built around a comprehensive project management backbone that accelerates Domain Consultant (DC) deal cycles and consolidates internal tools. This document outlines the architecture and implementation of the core project management functionality.

## Core Premise

The application serves Domain Consultants during technical engagements by providing:

1. **Project Management Solution**: Centralized project tracking and lifecycle management
2. **User-Specific Documentation**: Personal note-taking and documentation capture
3. **Shared Knowledge Base**: Collaborative knowledge repository
4. **Scenario Hub**: Security testing and validation scenarios
5. **Integrations Hub**: Connections to internal and external tools

## User Role Architecture

### Hierarchical Access Control

```mermaid
graph TD
    A[User Authentication] --> B{Role Assignment}
    
    B -->|User| C[Domain Consultant]
    B -->|Manager| D[Team Lead] 
    B -->|Admin| E[Platform Administrator]
    
    C --> F[Personal Workspace]
    D --> G[Team Management]
    E --> H[Platform Administration]
    
    F --> I[POV Management]
    F --> J[TRR Participation]
    F --> K[Content Access]
    F --> L[Scenario Execution]
    
    G --> M[Team Oversight]
    G --> N[Approval Workflows]
    G --> O[Resource Management]
    
    H --> P[User Management]
    H --> Q[Platform Analytics]
    H --> R[System Configuration]
```

### Role Capabilities Matrix

| Capability | User | Manager | Admin |
|------------|------|---------|-------|
| Create Projects | ✅ | ✅ | ✅ |
| View All Projects | ❌ | ✅ (Team) | ✅ (All) |
| Delete Projects | ❌ | ✅ | ✅ |
| Approve TRRs | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ |
| Platform Analytics | ❌ | Limited | ✅ |
| Terminal Admin | ❌ | ❌ | ✅ |

## Core Data Architecture

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ PROJECT : owns
    USER ||--o{ POV : owns
    USER ||--o{ TRR : owns
    USER }|--|| TEAM : belongs_to
    
    PROJECT ||--o{ POV : contains
    PROJECT ||--o{ TRR : contains
    PROJECT ||--o{ TASK : contains
    PROJECT ||--o{ NOTE : has
    PROJECT ||--o{ TIMELINE_EVENT : generates
    
    POV ||--o{ POV_OBJECTIVE : contains
    POV ||--o{ POV_PHASE : contains
    POV ||--o{ TASK : contains
    
    TRR ||--o{ TRR_FINDING : contains
    TRR ||--o{ TASK : contains
    
    PROJECT {
        string id PK
        string title
        string description
        json customer
        enum status
        enum priority
        string owner FK
        array team
        date startDate
        date endDate
        number estimatedValue
        array povIds
        array trrIds
        array scenarioIds
        date createdAt
        date updatedAt
    }
    
    POV {
        string id PK
        string projectId FK
        string title
        string description
        enum status
        enum priority
        array objectives
        array phases
        json testPlan
        json successMetrics
        string owner FK
        array team
        date createdAt
        date updatedAt
    }
    
    TRR {
        string id PK
        string projectId FK
        string povId FK
        string title
        string description
        enum status
        enum priority
        json riskAssessment
        array findings
        json validation
        json signoff
        string owner FK
        array reviewers
        date createdAt
        date updatedAt
    }
```

## Component Architecture

### Frontend Layer Structure

```mermaid
graph TD
    A[Next.js App Router] --> B[Role-Based Routing]
    B --> C[Dashboard Layout]
    B --> D[Project Management Layout]
    B --> E[POV/TRR Workflows]
    
    C --> F[PersonalDashboard]
    C --> G[TeamDashboard]
    C --> H[AdminDashboard]
    
    D --> I[ProjectCard Components]
    D --> J[ProjectTimeline Components]
    D --> K[Project Creation Wizard]
    
    E --> L[POVCreationWizard]
    E --> M[TRRWorkflow]
    E --> N[Progress Tracking]
    
    F --> O[@cortex-dc/ui Components]
    G --> O
    H --> O
    
    O --> P[Tremor Charts]
    O --> Q[Radix UI Primitives]
    O --> R[Custom Components]
```

### Backend Service Architecture

```mermaid
graph TD
    A[Firebase Authentication] --> B[Role Validation Middleware]
    B --> C[Cloud Functions API]
    
    C --> D[Project Service]
    C --> E[POV Service]
    C --> F[TRR Service]
    C --> G[Timeline Service]
    C --> H[Notification Service]
    
    D --> I[Firestore Projects Collection]
    E --> J[Firestore POVs Collection]
    F --> K[Firestore TRRs Collection]
    G --> L[Firestore Timeline Events]
    
    C --> M[Genkit AI Integration]
    M --> N[Vertex AI]
    M --> O[AI-Assisted POV Creation]
    M --> P[TRR Risk Analysis]
    
    C --> Q[Data Connect Integration]
    Q --> R[PostgreSQL Analytics]
    Q --> S[Reporting Queries]
    
    C --> T[Firebase Storage]
    T --> U[Document Attachments]
    T --> V[Evidence Files]
    T --> W[Export Artifacts]
```

## Workflow Implementation

### POV Lifecycle Management

```mermaid
stateDiagram-v2
    [*] --> Planning
    Planning --> InProgress: Start Execution
    Planning --> Cancelled: Cancel POV
    
    InProgress --> Testing: Begin Testing Phase
    InProgress --> AtRisk: Issues Identified
    InProgress --> Cancelled: Cancel POV
    
    Testing --> Validating: Test Complete
    Testing --> AtRisk: Test Failures
    
    AtRisk --> InProgress: Issues Resolved
    AtRisk --> Cancelled: Unresolvable Issues
    
    Validating --> Completed: Validation Success
    Validating --> AtRisk: Validation Failure
    
    Completed --> [*]
    Cancelled --> [*]
```

### TRR Approval Workflow

```mermaid
sequenceDiagram
    participant DC as Domain Consultant
    participant M as Manager
    participant S as System
    
    DC->>S: Create TRR
    S->>S: Set status to DRAFT
    
    DC->>S: Add findings and evidence
    DC->>S: Submit for review
    S->>S: Set status to IN_REVIEW
    
    S->>M: Notify manager
    M->>S: Review TRR
    
    alt Approved
        M->>S: Approve TRR
        S->>S: Set status to APPROVED
        S->>DC: Notify approval
    else Needs Changes
        M->>S: Request changes
        S->>S: Set status to PENDING_VALIDATION
        S->>DC: Notify changes needed
        DC->>S: Make updates
        DC->>S: Resubmit
    else Rejected
        M->>S: Reject TRR
        S->>S: Set status to REJECTED
        S->>DC: Notify rejection
    end
```

## UI/UX Design Patterns

### Design System Implementation

Based on the existing brand guidelines and user requirements, the application uses:

1. **Color Palette**:
   - Primary Orange: `#f97316` (orange-500)
   - Success Green: `#22c55e` (green-500)  
   - Warning Amber: `#f59e0b` (amber-500)
   - Danger Red: `#ef4444` (red-500)
   - Info Blue: `#3b82f6` (blue-500)

2. **Component Library**:
   - **Tremor**: Dashboard and data visualization components
   - **Radix UI**: Accessible primitives for complex interactions
   - **Tailwind CSS**: Utility-first styling system
   - **Lucide Icons**: Consistent icon system

3. **Interaction Patterns**:
   - **Card-based layouts** for project and POV displays
   - **Step-by-step wizards** for complex creation workflows
   - **Interactive timelines** for progress visualization
   - **Role-based navigation** with appropriate permissions
   - **Progressive disclosure** for complex information hierarchy

### Responsive Design Strategy

```mermaid
graph TD
    A[Mobile First Design] --> B[Responsive Breakpoints]
    B --> C[sm: 640px]
    B --> D[md: 768px] 
    B --> E[lg: 1024px]
    B --> F[xl: 1280px]
    
    C --> G[Single Column Layout]
    D --> H[Two Column Layout]
    E --> I[Three Column Layout]
    F --> J[Four Column Layout]
    
    G --> K[Stacked Cards]
    H --> L[Side-by-side Cards]
    I --> M[Dashboard Grid]
    J --> N[Full Dashboard Layout]
```

## Integration Architecture

### Internal Tool Consolidation

The application serves as a hub for various internal tools and processes:

1. **Scenario Hub Integration**:
   - Connection to security testing scenarios
   - Automated scenario execution tracking
   - Results integration with POV workflows

2. **Knowledge Base Integration**:
   - Shared documentation repository
   - AI-powered content suggestions
   - Version control and collaboration features

3. **TAC Escalation System**:
   - Integrated support escalation workflows
   - Case tracking and resolution monitoring
   - Automated handoff processes

4. **Analytics and Reporting**:
   - Project performance metrics
   - User activity tracking
   - Success rate analysis
   - Export capabilities for external reporting

### External API Integrations

```mermaid
graph TD
    A[Cortex DC Web] --> B[Internal APIs]
    A --> C[External Services]
    
    B --> D[PANW Identity Services]
    B --> E[Internal Knowledge Base]
    B --> F[TAC Systems]
    B --> G[Resource Management]
    
    C --> H[Customer CRM Systems]
    C --> I[Third-party Security Tools]
    C --> J[Communication Platforms]
    C --> K[Document Management]
```

## Performance and Scalability

### Optimization Strategies

1. **Frontend Optimization**:
   - Code splitting by route and role
   - Component lazy loading
   - Image optimization
   - Progressive Web App capabilities

2. **Backend Optimization**:
   - Firestore query optimization
   - Cloud Function cold start reduction
   - Caching strategies for frequently accessed data
   - Batch operations for bulk updates

3. **Database Design**:
   - Denormalization for read-heavy operations
   - Composite indexes for complex queries
   - Data partitioning by organization/team
   - Archival strategies for historical data

### Monitoring and Analytics

```mermaid
graph TD
    A[Application Metrics] --> B[Performance Monitoring]
    A --> C[User Analytics]
    A --> D[Business Metrics]
    
    B --> E[Page Load Times]
    B --> F[API Response Times]
    B --> G[Error Rates]
    
    C --> H[User Engagement]
    C --> I[Feature Usage]
    C --> J[Navigation Patterns]
    
    D --> K[POV Success Rates]
    D --> L[Deal Cycle Times]
    D --> M[Resource Utilization]
```

## Security and Compliance

### Security Architecture

1. **Authentication and Authorization**:
   - Firebase Authentication with enterprise SSO
   - Role-based access control (RBAC)
   - Permission-based feature access
   - Session management and timeout

2. **Data Protection**:
   - Encryption at rest and in transit
   - PII data handling compliance
   - Audit logging for sensitive operations
   - Data retention and deletion policies

3. **API Security**:
   - Input validation and sanitization
   - Rate limiting and throttling
   - CORS configuration
   - Security headers implementation

### Compliance Considerations

- **GDPR**: Data privacy and user consent management
- **SOC 2**: Security controls and monitoring
- **Industry Standards**: Following cybersecurity best practices
- **Internal Policies**: Compliance with PANW security requirements

## Future Roadmap

### Phase 1 Enhancements (Near-term)
- Advanced AI integration for POV recommendations
- Mobile application for field consultants
- Enhanced reporting and analytics
- Integration with additional internal tools

### Phase 2 Expansions (Medium-term)
- Multi-tenant architecture for partner access
- Advanced workflow automation
- Predictive analytics for deal success
- Integration with customer environments

### Phase 3 Innovations (Long-term)
- Machine learning for risk prediction
- Automated POV generation
- Advanced collaboration features
- Real-time customer dashboards

## Implementation Guidelines

### Development Best Practices

1. **Code Organization**:
   - Domain-driven design principles
   - Clear separation of concerns
   - Reusable component architecture
   - Comprehensive testing coverage

2. **Data Management**:
   - Strong typing with TypeScript and Zod
   - Optimistic updates for better UX
   - Offline-first design patterns
   - Data synchronization strategies

3. **User Experience**:
   - Accessibility-first design
   - Progressive enhancement
   - Error handling and recovery
   - Loading states and feedback

This architecture provides a solid foundation for the Domain Consultant platform while remaining flexible for future enhancements and integrations.

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
<document_id>p1mEdM6y1tpQLEjyuecRzx</document_id>
</document>
</citations>