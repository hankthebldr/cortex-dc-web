/**
 * Badge Component - Cortex DC Design System
 *
 * Small label component for status indicators and tags
 */

'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/design-system/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        solid: '',
        subtle: '',
        outline: 'border-2 bg-transparent',
      },
      color: {
        primary: '',
        success: '',
        warning: '',
        danger: '',
        info: '',
        gray: '',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
      },
    },
    compoundVariants: [
      // Primary variants
      {
        variant: 'solid',
        color: 'primary',
        className: 'bg-primary-500 text-white',
      },
      {
        variant: 'subtle',
        color: 'primary',
        className: 'bg-primary-100 text-primary-700',
      },
      {
        variant: 'outline',
        color: 'primary',
        className: 'border-primary-500 text-primary-700',
      },
      // Success variants
      {
        variant: 'solid',
        color: 'success',
        className: 'bg-success-500 text-white',
      },
      {
        variant: 'subtle',
        color: 'success',
        className: 'bg-success-100 text-success-700',
      },
      {
        variant: 'outline',
        color: 'success',
        className: 'border-success-500 text-success-700',
      },
      // Warning variants
      {
        variant: 'solid',
        color: 'warning',
        className: 'bg-warning-500 text-white',
      },
      {
        variant: 'subtle',
        color: 'warning',
        className: 'bg-warning-100 text-warning-700',
      },
      {
        variant: 'outline',
        color: 'warning',
        className: 'border-warning-500 text-warning-700',
      },
      // Danger variants
      {
        variant: 'solid',
        color: 'danger',
        className: 'bg-danger-500 text-white',
      },
      {
        variant: 'subtle',
        color: 'danger',
        className: 'bg-danger-100 text-danger-700',
      },
      {
        variant: 'outline',
        color: 'danger',
        className: 'border-danger-500 text-danger-700',
      },
      // Info variants
      {
        variant: 'solid',
        color: 'info',
        className: 'bg-info-500 text-white',
      },
      {
        variant: 'subtle',
        color: 'info',
        className: 'bg-info-100 text-info-700',
      },
      {
        variant: 'outline',
        color: 'info',
        className: 'border-info-500 text-info-700',
      },
      // Gray variants
      {
        variant: 'solid',
        color: 'gray',
        className: 'bg-gray-500 text-white',
      },
      {
        variant: 'subtle',
        color: 'gray',
        className: 'bg-gray-100 text-gray-700',
      },
      {
        variant: 'outline',
        color: 'gray',
        className: 'border-gray-500 text-gray-700',
      },
    ],
    defaultVariants: {
      variant: 'subtle',
      color: 'gray',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Icon to display before the content
   */
  startIcon?: React.ReactNode;
  /**
   * Enable remove/close button
   */
  removable?: boolean;
  /**
   * Callback when remove button is clicked
   */
  onRemove?: () => void;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      color,
      size,
      children,
      startIcon,
      removable,
      onRemove,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, color, size, className }))}
        {...props}
      >
        {startIcon && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {startIcon}
          </span>
        )}
        <span>{children}</span>
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex shrink-0 rounded-full hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-1"
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
