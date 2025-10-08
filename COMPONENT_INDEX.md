# Cortex DC Portal - Component Index

## Overview

This document catalogs all the UI components, sections, and design elements found in the example.html file. This serves as a reference for migrating components to the new React-based cortex-dc-web application.

## Design System

### Color Palette
- **Primary Orange**: `#f97316` (orange-500), `#ea580c` (orange-600)
- **Background**: `#030712` (gray-950), `#111827` (gray-900) 
- **Text**: `#e2e8f0` (gray-200), `#9ca3af` (gray-400)
- **Success**: `#34d399` (emerald-400), `#10b981` (emerald-500)
- **Warning**: `#fcd34d` (amber-300), `#f59e0b` (amber-500)
- **Info**: `#93c5fd` (blue-300), `#3b82f6` (blue-500)

### Typography
- **Font Family**: 'Inter', sans-serif
- **Sizes**: Text-2xl (headings), text-sm (body), text-xs (captions)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Layout System
- **Container**: Max-width 7xl, responsive padding (p-4 sm:p-6 md:p-8)
- **Grid**: CSS Grid with responsive columns (1 md:2 lg:3 lg:4)
- **Spacing**: Consistent gap-6 for major sections, space-x-2/4 for elements

## Core Layout Components

### 1. Main Container
- **Class**: `.main-container`
- **Features**: Glassmorphism effect, rounded corners, gradient background
- **Properties**: Border, backdrop blur, box shadow
- **Usage**: Root container for entire application

### 2. Header Component
- **Location**: Top of application
- **Elements**:
  - Cortex logo with brand identification
  - Breadcrumb navigation (`Cortex DC Portal / Dashboard`)
  - Global search input (hidden on mobile)
  - Global context dropdown
  - Notification bell icon
  - User avatar (40px rounded)

### 3. Main Navigation
- **Type**: Horizontal tab navigation
- **Tabs**: 7 main sections
  - Dashboard (active by default)
  - POV Management
  - TRR (Technical Requirements)  
  - Analytics
  - AI Assistant
  - Workflow
  - Demo Builder (hidden on mobile)
- **Features**: Hover effects, active state indicators

## Page Sections

### 1. Dashboard Section

#### Components:
- **Page Header**: Title, subtitle, primary CTA button
- **Metrics Cards (4)**: 
  - Active POVs (12, +15% growth)
  - Pending TRRs (23, 5 high priority)
  - Overall Success Rate (89%, goal 85%)
  - Platform Health (99.9%, all systems operational)
- **Active POVs Panel**: 
  - Progress bars for 4 projects
  - Project names with completion percentages
- **POV Status Donut Chart**:
  - SVG-based visualization
  - In Progress (7), At Risk (3), Completed (2)
  - Legend with color indicators

### 2. POV Management Section

#### Components:
- **Creation Options Grid (3)**:
  - Use Template (file-check icon)
  - Create Custom POV (file-plus icon) 
  - AI-Assisted Creation (sparkles icon, featured)
- **POV Pipeline Kanban**:
  - Planning column (1 item)
  - In Progress column (2 items)
  - Completed column (1 item)
- **Scenario Execution Terminal**:
  - Terminal header with traffic light dots
  - Command line interface simulation
  - XSIAM integration demonstration

### 3. TRR Management Section

#### Components:
- **Action Buttons**: Upload CSV, New TRR
- **Metrics Grid (4)**:
  - Total TRRs (142)
  - Pending Validation (23)
  - Completed (119)
  - Validation Success Rate (95%)
- **Data Table**:
  - Columns: TRR ID, Customer, Status, DC Owner, Last Updated, Actions
  - Status badges with color coding
  - Action buttons (Validate, View, Review)

### 4. Analytics Section

#### Components:
- **Export Data Button**: Primary CTA
- **Chart Containers**: 
  - POV Win Rate Over Time (area chart)
  - Custom SVG visualizations with gradients
  - Grid lines and responsive viewBox

## Reusable Components

### 1. Tremor Cards (`.tremor-card`)
- **Purpose**: Primary content containers
- **Features**: 
  - Glassmorphism background
  - Hover animations (lift effect)
  - Border highlight on hover
  - Backdrop blur filter

### 2. Buttons

#### Primary Button (`.primary-button`)
- **Background**: Orange-500 (`#f97316`)
- **Hover**: Orange-600 (`#ea580c`)
- **Content**: Icon + text
- **Sizing**: Padding 0.5rem 1rem

#### Secondary Button (`.secondary-button`)  
- **Background**: Gray-600 with transparency
- **Border**: Subtle white border
- **Hover**: Lighter gray background

### 3. Navigation Links (`.nav-link`)
- **States**: Default, active, hover
- **Active Indicator**: Orange underline
- **Transition**: 0.2s ease-in-out

### 4. Badges (`.tremor-badge`)
- **Variants**: 
  - Green (success states)
  - Yellow (warning states)  
  - Blue (info states)
- **Shape**: Fully rounded pills
- **Size**: Text-xs with padding

### 5. Terminal Component
- **Structure**: 
  - Header with colored dots
  - Dark code background (`#0D1117`)
  - Monospace font (Menlo, Monaco)
  - Colored output (success, prompt, command)

### 6. Data Table (`.data-table`)
- **Styling**: 
  - Left-aligned headers
  - Row borders (subtle white)
  - Responsive with horizontal scroll
  - Action buttons in last column

## Interactive Elements

### 1. Icons (Lucide Icons)
- **Library**: Lucide React (loaded via CDN)
- **Usage**: 16px (h-4 w-4) and 20px (h-5 w-5) standard sizes
- **Icons Used**: 
  - Navigation: layout-dashboard, target, clipboard-list, bar-chart-3, bot
  - Actions: plus-circle, upload-cloud, download, search, bell
  - UI Elements: chevron-down, globe, sparkles, file-check, file-plus

### 2. Progress Bars
- **Structure**: Container div with colored fill div
- **Animation**: CSS width transitions
- **Colors**: Orange (primary), yellow (warning), green (success)

### 3. Status Indicators
- **Types**: Badges, colored text, progress indicators
- **Color System**: Consistent semantic colors (green=success, yellow=warning, blue=info)

## Advanced Components

### 1. SVG Charts
- **Donut Chart**: 
  - ViewBox 36x36 coordinate system
  - Stroke-dasharray for segments
  - Central text display
- **Area Chart**: 
  - Linear gradients for fill effects
  - Responsive viewBox (300x150)
  - Grid lines for reference

### 2. Glassmorphism Effects
- **Implementation**: 
  - Backdrop-filter blur
  - Transparent backgrounds with rgba values
  - Subtle borders with white opacity
  - Box shadows for depth

### 3. Responsive Grid System
- **Breakpoints**: 
  - Mobile: 1 column
  - md (768px+): 2 columns  
  - lg (1024px+): 3-4 columns
- **Components**: Grid auto-adapts content

## Animation & Transitions

### 1. Hover Effects
- **Cards**: Transform translateY(-2px) with shadow enhancement
- **Buttons**: Background color changes
- **Navigation**: Color and border-bottom transitions

### 2. Loading States
- **Implementation**: Placeholder for loading indicators
- **Purpose**: Command execution feedback

### 3. State Transitions
- **Duration**: 0.2s ease-in-out (standard)
- **Properties**: Colors, transforms, shadows

## Design Patterns

### 1. Content Hierarchy
- **Page Header**: Title + subtitle + primary action
- **Section Headers**: Consistent typography scale
- **Card Content**: Metrics + supporting text

### 2. Action Patterns
- **Primary Actions**: Orange buttons, prominent placement
- **Secondary Actions**: Gray buttons, supporting role
- **Inline Actions**: Text links in tables

### 3. Information Architecture
- **Tab Navigation**: Primary feature organization
- **Card Groupings**: Related metrics and content
- **Table Layouts**: Structured data presentation

## Integration Points

### 1. XSIAM Terminal
- **Purpose**: Cortex XSIAM command simulation
- **Features**: Realistic terminal interface
- **Commands**: Scenario execution, authentication display

### 2. Data Visualization
- **Charts**: Custom SVG implementations
- **Real-time**: Placeholder for live data integration
- **Export**: Data download capabilities

### 3. AI Integration Points
- **AI-Assisted Creation**: Featured in POV management
- **Contextual**: Integrated into workflow sections
- **Visual Indicators**: Sparkles icon for AI features

## Technical Implementation Notes

### 1. CSS Architecture
- **Framework**: Tailwind CSS via CDN
- **Custom CSS**: Supplementary styles in `<style>` block
- **Responsive**: Mobile-first approach

### 2. JavaScript Requirements
- **Icon Library**: Lucide icons via CDN
- **Font Loading**: Google Fonts (Inter)
- **Interactivity**: Vanilla JS for navigation (implied)

### 3. Accessibility Considerations
- **Color Contrast**: Dark theme with appropriate contrast ratios
- **Focus States**: Implied for interactive elements
- **Semantic HTML**: Proper heading hierarchy

This component index serves as the foundation for implementing the React-based component library in the cortex-dc-web application, ensuring design consistency and feature completeness.