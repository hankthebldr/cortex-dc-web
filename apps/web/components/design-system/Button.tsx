/**
 * Button Component - Cortex DC Design System
 *
 * A versatile button component with multiple variants, sizes, and states
 */

'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/design-system/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        solid:
          'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow-md',
        outline:
          'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
        ghost:
          'text-primary-600 hover:bg-primary-50 active:bg-primary-100',
        link:
          'text-primary-600 underline-offset-4 hover:underline active:text-primary-700',
        danger:
          'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 shadow-sm hover:shadow-md',
        success:
          'bg-success-500 text-white hover:bg-success-600 active:bg-success-700 shadow-sm hover:shadow-md',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Button content
   */
  children: React.ReactNode;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Icon to display before the content
   */
  startIcon?: React.ReactNode;
  /**
   * Icon to display after the content
   */
  endIcon?: React.ReactNode;
  /**
   * Button as a link (renders as <a>)
   */
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      children,
      loading,
      startIcon,
      endIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {!loading && startIcon && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {startIcon}
          </span>
        )}
        <span>{children}</span>
        {!loading && endIcon && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {endIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
