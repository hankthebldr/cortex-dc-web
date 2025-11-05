/**
 * Design System Types - Cortex DC
 *
 * TypeScript types and interfaces for the design system
 */

import { type VariantProps } from 'class-variance-authority';

/* ==================== Component Size Variants ==================== */

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ComponentSize = 'sm' | 'md' | 'lg';

/* ==================== Color Variants ==================== */

export type ColorVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'gray'
  | 'neutral';

export type SemanticColor = 'success' | 'warning' | 'danger' | 'info';

/* ==================== Component Variants ==================== */

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';
export type BadgeVariant = 'solid' | 'subtle' | 'outline';
export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

/* ==================== Layout & Spacing ==================== */

export type Spacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
export type Radius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

/* ==================== Typography ==================== */

export type FontWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';

/* ==================== Component Props ==================== */

/**
 * Base props for all interactive components
 */
export interface BaseComponentProps {
  /** Additional CSS class names */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Component size variant */
  size?: ComponentSize;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** ARIA described by for accessibility */
  'aria-describedby'?: string;
}

/**
 * Props for components with loading states
 */
export interface LoadingProps {
  /** Whether the component is in loading state */
  loading?: boolean;
  /** Loading text to display */
  loadingText?: string;
}

/**
 * Props for components with color variants
 */
export interface ColorProps {
  /** Color variant */
  variant?: ColorVariant;
}

/**
 * Props for icon components
 */
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/* ==================== Form Component Types ==================== */

/**
 * Form field state
 */
export type FieldState = 'default' | 'success' | 'warning' | 'error';

/**
 * Form field props
 */
export interface FormFieldProps {
  /** Field label */
  label?: string;
  /** Help text displayed below the field */
  helpText?: string;
  /** Error message */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Field state */
  state?: FieldState;
}

/**
 * Input validation rules
 */
export interface ValidationRule {
  /** Validation function */
  validate: (value: any) => boolean | Promise<boolean>;
  /** Error message if validation fails */
  message: string;
}

/* ==================== Table Component Types ==================== */

/**
 * Table column definition
 */
export interface TableColumn<T = any> {
  /** Unique column identifier */
  id: string;
  /** Column header text */
  header: string;
  /** Accessor function or key to get cell value */
  accessor: keyof T | ((row: T) => any);
  /** Custom cell renderer */
  cell?: (value: any, row: T) => React.ReactNode;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is filterable */
  filterable?: boolean;
  /** Column width */
  width?: number | string;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
}

/**
 * Table sort state
 */
export interface SortState {
  /** Column ID to sort by */
  columnId: string;
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Table filter state
 */
export interface FilterState {
  /** Column ID to filter */
  columnId: string;
  /** Filter value */
  value: any;
  /** Filter operator */
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt';
}

/**
 * Table pagination state
 */
export interface PaginationState {
  /** Current page (0-indexed) */
  page: number;
  /** Number of rows per page */
  pageSize: number;
  /** Total number of rows */
  total: number;
}

/* ==================== Dashboard Widget Types ==================== */

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  /** Unique widget identifier */
  id: string;
  /** Widget type */
  type: 'metric' | 'chart' | 'table' | 'activity' | 'quick-actions';
  /** Widget title */
  title: string;
  /** Widget grid position */
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Widget configuration */
  config?: Record<string, any>;
}

/**
 * Metric widget data
 */
export interface MetricData {
  /** Metric label */
  label: string;
  /** Current value */
  value: number | string;
  /** Previous value for comparison */
  previousValue?: number | string;
  /** Change percentage */
  change?: number;
  /** Change direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Format type */
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  /** Icon to display */
  icon?: React.ReactNode;
}

/**
 * Chart data point (legacy - for simple x/y charts)
 */
export interface ChartDataPoint {
  /** X-axis value (usually timestamp or category) */
  x: string | number | Date;
  /** Y-axis value */
  y: number;
  /** Optional label */
  label?: string;
  /** Optional additional data */
  [key: string]: any;
}

/**
 * Flexible chart data type for Recharts
 */
export type ChartData = Record<string, any>;

/**
 * Chart series configuration
 */
export interface ChartSeries {
  /** Data key in the chart data */
  key: string;
  /** Display name */
  name: string;
  /** Color */
  color: ColorVariant;
}

/**
 * Chart configuration for modern charts
 */
export interface ChartConfig {
  /** X-axis data key */
  xAxisKey: string;
  /** Series to display */
  series: ChartSeries[];
  /** X-axis label */
  xLabel?: string;
  /** Y-axis label */
  yLabel?: string;
}

/**
 * Legacy chart configuration
 */
export interface LegacyChartConfig {
  /** Chart type */
  type: 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'scatter';
  /** Chart data */
  data: ChartDataPoint[];
  /** X-axis label */
  xLabel?: string;
  /** Y-axis label */
  yLabel?: string;
  /** Whether to show legend */
  showLegend?: boolean;
  /** Whether to show grid */
  showGrid?: boolean;
  /** Color scheme */
  colors?: string[];
}

/* ==================== Notification Types ==================== */

/**
 * Toast notification type
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

/**
 * Toast notification options
 */
export interface ToastOptions {
  /** Notification type */
  type?: ToastType;
  /** Duration in milliseconds (0 = no auto-dismiss) */
  duration?: number;
  /** Toast position */
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  /** Whether toast can be dismissed */
  dismissible?: boolean;
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Notification item
 */
export interface Notification {
  /** Unique notification ID */
  id: string;
  /** Notification type */
  type: ToastType;
  /** Notification title */
  title: string;
  /** Notification message */
  message?: string;
  /** Timestamp */
  timestamp: Date;
  /** Whether notification is read */
  read: boolean;
  /** Optional action link */
  actionUrl?: string;
  /** Optional action label */
  actionLabel?: string;
  /** Optional icon */
  icon?: React.ReactNode;
}

/* ==================== Command Palette Types ==================== */

/**
 * Command palette action
 */
export interface Command {
  /** Unique command ID */
  id: string;
  /** Command label */
  label: string;
  /** Command description */
  description?: string;
  /** Command icon */
  icon?: React.ReactNode;
  /** Keyboard shortcut */
  shortcut?: string[];
  /** Command category */
  category?: string;
  /** Command action */
  action: () => void | Promise<void>;
  /** Command keywords for search */
  keywords?: string[];
}

/**
 * Command group
 */
export interface CommandGroup {
  /** Group label */
  label: string;
  /** Commands in this group */
  commands: Command[];
}

/* ==================== Activity Feed Types ==================== */

/**
 * Activity item
 */
export interface Activity {
  /** Unique activity ID */
  id: string;
  /** Activity type */
  type: 'create' | 'update' | 'delete' | 'comment' | 'mention' | 'status_change';
  /** Actor (user who performed the action) */
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  /** Activity action */
  action: string;
  /** Target object */
  target: {
    type: 'pov' | 'trr' | 'project' | 'finding';
    id: string;
    name: string;
  };
  /** Activity timestamp */
  timestamp: Date;
  /** Optional metadata */
  metadata?: Record<string, any>;
}

/* ==================== Drag and Drop Types ==================== */

/**
 * Draggable item
 */
export interface DraggableItem {
  /** Item ID */
  id: string;
  /** Item type */
  type: string;
  /** Item data */
  data: any;
}

/**
 * Drop zone
 */
export interface DropZone {
  /** Zone ID */
  id: string;
  /** Accepted item types */
  accepts: string[];
  /** Drop handler */
  onDrop: (item: DraggableItem) => void;
}

/* ==================== Export Utility Types ==================== */

/**
 * Generic API response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Loading state
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Generic async state
 */
export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}
