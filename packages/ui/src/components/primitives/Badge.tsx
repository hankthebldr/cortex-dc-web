import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-base px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Show dot indicator
   */
  dot?: boolean;
  /**
   * Icon to display (replaces dot if provided)
   */
  icon?: React.ReactNode;
}

/**
 * Badge Component
 *
 * Status indicator with multiple variants and sizes.
 * Supports dot indicator and custom icons.
 *
 * @example
 * ```tsx
 * <Badge variant="success" dot>Active</Badge>
 * <Badge variant="error">Failed</Badge>
 * <Badge variant="info" icon={<CheckIcon />}>Validated</Badge>
 * ```
 */
function Badge({ className, variant, size, dot, icon, children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      role="status"
      {...props}
    >
      {icon && <span className="badge-icon" aria-hidden="true">{icon}</span>}
      {!icon && dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
