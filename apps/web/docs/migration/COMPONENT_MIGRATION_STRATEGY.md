# Component Migration Strategy - Phase 2

## Migration Order (Dependency-First Approach)

### Tier 1: Core Infrastructure Components (High Priority)
1. **AppShell.tsx** - Main application shell and layout
2. **AppHeader.tsx** - Navigation header
3. **AuthLanding.tsx** - Authentication interface
4. **ConditionalLayout.tsx** - Layout wrapper
5. **NotificationSystem.tsx** - Global notifications

### Tier 2: UI Foundation Components (Medium Priority)
6. **CortexButton.tsx** - Button components
7. **CortexCommandButton.tsx** - Command interface buttons
8. **BreadcrumbNavigation.tsx** - Navigation breadcrumbs
9. **LoginForm.tsx** - Authentication forms
10. **SettingsPanel.tsx** - Configuration panels

### Tier 3: Terminal Components (Medium Priority)
11. **Terminal.tsx** - Base terminal interface
12. **CortexDCTerminal.tsx** - Enhanced DC terminal
13. **EnhancedTerminal.tsx** - Advanced terminal features
14. **ImprovedTerminal.tsx** - Latest terminal implementation
15. **UnifiedTerminal.tsx** - Unified terminal interface
16. **TerminalWindow.tsx** - Terminal window wrapper
17. **TerminalOutput.tsx** - Terminal output handling
18. **TerminalOutputs.tsx** - Multiple terminal outputs
19. **TerminalIntegrationSettings.tsx** - Terminal configuration

### Tier 4: Feature Components (High Priority)
20. **CortexGUIInterface.tsx** - Main GUI interface
21. **EnhancedGUIInterface.tsx** - Enhanced GUI features
22. **ManagementDashboard.tsx** - Main dashboard
23. **DomainConsultantWorkspace.tsx** - DC workspace
24. **OnboardingGuide.tsx** - User onboarding

### Tier 5: Content Management (Medium Priority)
25. **ContentLibrary.tsx** - Content management
26. **ConsolidatedContentLibrary.tsx** - Enhanced content library
27. **UnifiedContentCreator.tsx** - Content creation interface
28. **EnhancedContentCreator.tsx** - Advanced content creator
29. **ContentCreatorManager.tsx** - Content creation management
30. **ContentAnalytics.tsx** - Content analytics dashboard

### Tier 6: POV and TRR Management (High Priority)
31. **POVManagement.tsx** - POV lifecycle management
32. **POVProjectManagement.tsx** - POV project handling
33. **TRRManagement.tsx** - TRR management system
34. **ProductionTRRManagement.tsx** - Production TRR handling
35. **TRRProgressChart.tsx** - TRR progress visualization

### Tier 7: AI and Analysis Components (Medium Priority)
36. **EnhancedAIAssistant.tsx** - AI assistant interface
37. **BigQueryExplorer.tsx** - BigQuery data explorer
38. **BigQueryExportPanel.tsx** - Export configuration panel
39. **InteractiveCharts.tsx** - Chart components
40. **UserTimelineView.tsx** - User timeline visualization

### Tier 8: Integration Components (Medium Priority)
41. **XSIAMIntegrationPanel.tsx** - XSIAM integration
42. **XSIAMHealthMonitor.tsx** - XSIAM health monitoring
43. **CortexCloudFrame.tsx** - Cloud frame component
44. **CommandAlignmentGuide.tsx** - Command alignment guide

### Tier 9: Scenario and Workflow (Lower Priority)
45. **EnhancedScenarioCreator.tsx** - Scenario creation
46. **SDWWorkflow.tsx** - SDW workflow management
47. **EnhancedManualCreationGUI.tsx** - Manual creation GUI
48. **ManualCreationGUI.tsx** - Basic manual creation

## Component Dependencies Analysis

### Critical Dependencies
- **Firebase**: Authentication, Firestore, Storage
- **Next.js**: App Router, Image optimization
- **React**: Hooks, Context, Suspense
- **Tailwind CSS**: Styling framework
- **TypeScript**: Type definitions

### Service Dependencies
- **API Services**: /lib/services/*
- **Command System**: /lib/commands/*
- **Types**: /lib/types/*
- **Contexts**: /lib/contexts/*
- **Hooks**: /lib/hooks/*

### External Dependencies
- **jsPDF**: PDF generation
- **gray-matter**: Markdown processing
- **clsx**: Class name utilities
- **tailwind-merge**: Tailwind utilities

## Migration Process Per Component

### 1. Analysis Phase
- [ ] Read source component code
- [ ] Identify dependencies and imports
- [ ] Map required services and types
- [ ] Document component functionality

### 2. Adaptation Phase
- [ ] Update import paths for monorepo structure
- [ ] Adapt to new directory structure
- [ ] Update service and API calls
- [ ] Ensure TypeScript compatibility

### 3. Integration Phase
- [ ] Create component in target structure
- [ ] Test component compilation
- [ ] Verify functionality
- [ ] Update parent component imports

### 4. Validation Phase
- [ ] Component renders without errors
- [ ] All features work as expected
- [ ] Dependencies resolved
- [ ] TypeScript validation passes

## File Structure Mapping

### Source → Target Mapping
```
henryreed.ai/hosting/components/
└── ComponentName.tsx

cortex-dc-web/apps/web/components/
├── core/           # AppShell, AppHeader, AuthLanding
├── features/       # Management, POV, TRR components
├── ui/            # Buttons, Forms, Navigation
└── terminal/      # Terminal-related components
```

## Success Criteria
- [ ] All 50+ components migrated successfully
- [ ] No compilation errors
- [ ] All imports resolved
- [ ] Component functionality preserved
- [ ] Monorepo structure maintained
- [ ] TypeScript strict mode compliance