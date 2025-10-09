// Styles
import './globals.css';

// Utilities
export * from './lib/utils';

// Base Components
export { Button, buttonVariants } from './components/Button';
export type { ButtonProps } from './components/Button';

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from './components/Card';

export { Input } from './components/base/Input';
export type { InputProps } from './components/base/Input';

export { Textarea } from './components/base/Textarea';
export type { TextareaProps } from './components/base/Textarea';

export { Badge, badgeVariants } from './components/base/Badge';
export type { BadgeProps } from './components/base/Badge';

export { Spinner, spinnerVariants } from './components/base/Spinner';
export type { SpinnerProps } from './components/base/Spinner';

// Layout Components
export { AppShell } from './components/layout/AppShell';
export { Navigation } from './components/layout/Navigation';
export type { NavigationItem } from './components/layout/Navigation';

// Advanced Components
export { Terminal } from './components/Terminal';

// Domain-specific components
export { POVCard } from './components/pov/POVCard';
export { TRRStatus } from './components/trr/TRRStatus';

// Hooks
export { useTerminal } from './hooks/useTerminal';

// Types
export type { POV, TRR, Organization, User } from './types/domain-types';
export type { TerminalState, UseTerminalReturn } from './hooks/useTerminal';
