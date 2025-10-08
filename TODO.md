# Cortex DC Web - Migration TODO

## Overview

This TODO list prioritizes the migration of components and features from the example.html file to the React-based cortex-dc-web application. Tasks are organized by priority and dependency.

**Note**: The example.html file appears to be incomplete (truncated at line 469). Missing sections likely include:
- AI Assistant page content
- Workflow management page
- Complete Analytics charts
- JavaScript functionality for navigation
- Closing HTML tags and scripts

## Phase 1: Foundation Components (High Priority)

### 1.1 Design System Setup
- [ ] **Configure Tailwind CSS** with custom theme
  - [ ] Add Inter font integration
  - [ ] Define color palette (orange-500 primary, gray-950 background)
  - [ ] Set up responsive breakpoints
  - [ ] Configure glassmorphism utilities

- [ ] **Create base component styles** in `packages/ui/src/styles/`
  - [ ] Tremor card styles (`.tremor-card`)
  - [ ] Button variants (primary, secondary)
  - [ ] Navigation link styles (`.nav-link`)
  - [ ] Badge variants (success, warning, info)

### 1.2 Core Layout Components
- [ ] **Main Container Component** (`packages/ui/src/components/layout/MainContainer.tsx`)
  - [ ] Glassmorphism background effect
  - [ ] Responsive padding system
  - [ ] Gradient and shadow styling

- [ ] **Header Component** (`packages/ui/src/components/layout/Header.tsx`)
  - [ ] Cortex logo integration
  - [ ] Breadcrumb navigation
  - [ ] Global search input (responsive hidden)
  - [ ] Context dropdown menu
  - [ ] Notification bell with badge
  - [ ] User avatar component

- [ ] **Navigation Component** (`packages/ui/src/components/navigation/MainNav.tsx`)
  - [ ] Tab-based navigation system
  - [ ] Active state management
  - [ ] Responsive tab hiding (Demo Builder)
  - [ ] Lucide icon integration

## Phase 2: Core UI Components (High Priority)

### 2.1 Button System
- [ ] **Base Button Component** (`packages/ui/src/components/Button.tsx`)
  - [ ] Update existing implementation with new variants
  - [ ] Primary button (orange-500 background)
  - [ ] Secondary button (gray with transparency)
  - [ ] Icon + text combination
  - [ ] Loading states
  - [ ] Hover animations

### 2.2 Card Components
- [ ] **Tremor Card Component** (`packages/ui/src/components/Card.tsx`)
  - [ ] Update existing Card with tremor styling
  - [ ] Glassmorphism background
  - [ ] Hover lift effect
  - [ ] Border highlight animation
  - [ ] Backdrop blur filter

- [ ] **Metric Card Component** (`packages/ui/src/components/cards/MetricCard.tsx`)
  - [ ] Title, metric value, subtitle layout
  - [ ] Badge integration for trends
  - [ ] Color variants for different states
  - [ ] Responsive typography

### 2.3 Data Display Components
- [ ] **Badge Component** (`packages/ui/src/components/Badge.tsx`)
  - [ ] Status variants (green, yellow, blue)
  - [ ] Pill shape with rounded corners
  - [ ] Text size and padding variants

- [ ] **Progress Bar Component** (`packages/ui/src/components/ProgressBar.tsx`)
  - [ ] Container and fill structure
  - [ ] Color variants (orange, yellow, green)
  - [ ] Percentage text display
  - [ ] Animation transitions

- [ ] **Data Table Component** (`packages/ui/src/components/DataTable.tsx`)
  - [ ] Responsive table with horizontal scroll
  - [ ] Header styling with borders
  - [ ] Row hover effects
  - [ ] Action button integration

## Phase 3: Advanced Components (Medium Priority)

### 3.1 Terminal Component
- [ ] **Terminal Component** (`packages/ui/src/components/Terminal.tsx`)
  - [ ] Update existing Terminal implementation
  - [ ] Header with colored dots
  - [ ] Dark code background (#0D1117)
  - [ ] Monospace font integration
  - [ ] Colored output (success, prompt, command)
  - [ ] Command simulation functionality

### 3.2 Chart Components
- [ ] **Donut Chart Component** (`packages/ui/src/components/charts/DonutChart.tsx`)
  - [ ] SVG-based implementation
  - [ ] Configurable segments with stroke-dasharray
  - [ ] Central text display
  - [ ] Legend component
  - [ ] Responsive sizing

- [ ] **Area Chart Component** (`packages/ui/src/components/charts/AreaChart.tsx`)
  - [ ] SVG with linear gradients
  - [ ] Grid lines for reference
  - [ ] Responsive viewBox
  - [ ] Data point plotting
  - [ ] Hover interactions

### 3.3 Interactive Components
- [ ] **Search Input Component** (`packages/ui/src/components/SearchInput.tsx`)
  - [ ] Icon prefix (search icon)
  - [ ] Glassmorphism background
  - [ ] Focus states with orange accent
  - [ ] Responsive hide/show

- [ ] **Dropdown Menu Component** (`packages/ui/src/components/DropdownMenu.tsx`)
  - [ ] Context dropdown implementation
  - [ ] Chevron indicator
  - [ ] Hover states
  - [ ] Click outside handling

## Phase 4: Page-Specific Components (Medium Priority)

### 4.1 Dashboard Components
- [ ] **Dashboard Metrics Grid** (`apps/web/src/components/dashboard/MetricsGrid.tsx`)
  - [ ] 4-column responsive grid
  - [ ] Metric cards with trend indicators
  - [ ] Real-time data integration placeholders

- [ ] **POV Progress Panel** (`apps/web/src/components/dashboard/POVProgressPanel.tsx`)
  - [ ] Project list with progress bars
  - [ ] Color-coded completion status
  - [ ] Interactive progress indicators

- [ ] **POV Status Chart** (`apps/web/src/components/dashboard/POVStatusChart.tsx`)
  - [ ] Donut chart implementation
  - [ ] Status legend
  - [ ] Center text display

### 4.2 POV Management Components
- [ ] **POV Creation Grid** (`apps/web/src/components/pov/POVCreationGrid.tsx`)
  - [ ] 3-option grid layout
  - [ ] Hover border effects
  - [ ] Icon integration (file-check, file-plus, sparkles)
  - [ ] Featured AI option styling

- [ ] **POV Pipeline Kanban** (`apps/web/src/components/pov/POVPipelineKanban.tsx`)
  - [ ] 3-column layout (Planning, In Progress, Completed)
  - [ ] Card drag-and-drop functionality
  - [ ] Status indicators
  - [ ] At-risk highlighting

### 4.3 TRR Management Components
- [ ] **TRR Action Bar** (`apps/web/src/components/trr/TRRActionBar.tsx`)
  - [ ] Upload CSV button
  - [ ] New TRR button
  - [ ] Button group styling

- [ ] **TRR Metrics Dashboard** (`apps/web/src/components/trr/TRRMetricsDashboard.tsx`)
  - [ ] 4-metric grid layout
  - [ ] Total, pending, completed, success rate
  - [ ] Color-coded values

- [ ] **TRR Table** (`apps/web/src/components/trr/TRRTable.tsx`)
  - [ ] Sortable columns
  - [ ] Status badge integration
  - [ ] Action buttons per row
  - [ ] Pagination support

## Phase 5: Page Assembly (Low Priority)

### 5.1 Page Layouts
- [ ] **Dashboard Page** (`apps/web/src/app/dashboard/page.tsx`)
  - [ ] Assemble dashboard components
  - [ ] Page header with CTA
  - [ ] Grid layout implementation
  - [ ] State management integration

- [ ] **POV Management Page** (`apps/web/src/app/pov/page.tsx`)
  - [ ] Creation options section
  - [ ] Pipeline kanban board
  - [ ] Terminal integration
  - [ ] Modal/form integration

- [ ] **TRR Management Page** (`apps/web/src/app/trr/page.tsx`)
  - [ ] Action bar
  - [ ] Metrics grid
  - [ ] Data table
  - [ ] CRUD operations

- [ ] **Analytics Page** (`apps/web/src/app/analytics/page.tsx`)
  - [ ] Chart containers
  - [ ] Export functionality
  - [ ] Filter controls
  - [ ] Data visualization

### 5.2 Navigation Integration
- [ ] **Tab Navigation System** (`apps/web/src/components/navigation/TabNavigation.tsx`)
  - [ ] Active tab state management
  - [ ] URL synchronization
  - [ ] Breadcrumb updates
  - [ ] Mobile responsive behavior

## Phase 6: Enhanced Features (Low Priority)

### 6.1 Animation System
- [ ] **Hover Animations**
  - [ ] Card lift effects (translateY(-2px))
  - [ ] Button color transitions
  - [ ] Border highlight animations
  - [ ] Shadow enhancements

- [ ] **Loading States**
  - [ ] Skeleton loading components
  - [ ] Spinner components
  - [ ] Progress indicators
  - [ ] Command execution feedback

### 6.2 Icon System
- [ ] **Lucide Icon Integration**
  - [ ] Icon component wrapper
  - [ ] Size variants (16px, 20px)
  - [ ] Color variants
  - [ ] Icon + text combinations

### 6.3 Responsive Enhancements
- [ ] **Mobile Optimization**
  - [ ] Navigation drawer for mobile
  - [ ] Table horizontal scroll
  - [ ] Grid responsive breakpoints
  - [ ] Touch-friendly interactions

## Phase 7: Missing Components from Example.html

### 7.1 Additional UI Components Found
- [ ] **AI Assistant Section** (appears to be missing from example.html)
  - [ ] Chat interface component
  - [ ] AI response formatting
  - [ ] Conversation history
  - [ ] Suggested prompts

- [ ] **Workflow Section** (appears to be missing from example.html)
  - [ ] Process flow visualization
  - [ ] Step-by-step workflow components
  - [ ] Progress tracking

### 7.2 Interactive JavaScript Functionality
- [ ] **Tab Navigation Logic** (`apps/web/src/lib/navigation.ts`)
  - [ ] Show/hide content sections
  - [ ] Active tab state management
  - [ ] Breadcrumb updates
  - [ ] URL routing integration

- [ ] **Lucide Icons Initialization**
  - [ ] Replace CDN with npm package
  - [ ] Icon component wrapper
  - [ ] Dynamic icon loading

### 7.3 Enhanced Terminal Features
- [ ] **Command Simulation System**
  - [ ] XSIAM command execution simulation
  - [ ] Real-time output streaming
  - [ ] Command history
  - [ ] Error state handling

## Phase 8: Integration & Testing

### 8.1 Data Integration
- [ ] **API Integration Points**
  - [ ] POV data fetching
  - [ ] TRR management APIs
  - [ ] Analytics data services
  - [ ] Real-time updates

### 8.2 State Management
- [ ] **Global State Setup**
  - [ ] Navigation state
  - [ ] User context
  - [ ] Theme management
  - [ ] Loading states

### 8.3 Testing
- [ ] **Component Testing**
  - [ ] Unit tests for all components
  - [ ] Visual regression tests
  - [ ] Accessibility tests
  - [ ] Performance benchmarks

## Implementation Notes

### Priority Levels:
- **High Priority**: Foundation and core components needed for basic functionality
- **Medium Priority**: Advanced components that enhance user experience
- **Low Priority**: Polish and optimization features

### Dependencies:
- Phase 1 components must be completed before Phase 2
- Chart components depend on data structure definition
- Page assembly requires all component dependencies

### Design System Alignment:
- All components must follow the Tremor design system patterns
- Consistent use of the orange-500 primary color
- Glassmorphism effects throughout
- Inter font family usage

### Performance Considerations:
- Lazy load chart components
- Optimize SVG rendering
- Implement virtual scrolling for large tables
- Bundle splitting for page-specific components

This TODO provides a systematic approach to migrating the example.html design into the React-based cortex-dc-web application while maintaining design fidelity and improving functionality.