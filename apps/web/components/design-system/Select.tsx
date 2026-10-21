/**
 * Select Component - Cortex DC Design System
 *
 * Dropdown select component with search and multi-select support
 */

'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/design-system/utils';

const selectVariants = cva(
  'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      state: {
        default:
          'border-gray-300 bg-white focus-visible:border-primary-500 focus-visible:ring-primary-500',
        error:
          'border-danger-300 bg-danger-50 focus-visible:border-danger-500 focus-visible:ring-danger-500',
        success:
          'border-success-300 bg-success-50 focus-visible:border-success-500 focus-visible:ring-success-500',
      },
      size: {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      state: 'default',
      size: 'md',
    },
  }
);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  /**
   * Select label
   */
  label?: string;
  /**
   * Helper text below select
   */
  helperText?: string;
  /**
   * Error message
   */
  error?: string;
  /**
   * Success message
   */
  success?: string;
  /**
   * Options for the select
   */
  options?: SelectOption[];
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Wrapper className
   */
  wrapperClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      wrapperClassName,
      state: stateProp,
      size,
      label,
      helperText,
      error,
      success,
      options = [],
      placeholder,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    // Determine state based on props
    const state = error
      ? 'error'
      : success
      ? 'success'
      : stateProp || 'default';

    return (
      <div className={cn('w-full space-y-2', wrapperClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-danger-500" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              selectVariants({ state, size }),
              'appearance-none pr-10',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${selectId}-error`
                : success
                ? `${selectId}-success`
                : helperText
                ? `${selectId}-helper`
                : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {(error || success || helperText) && (
          <p
            id={
              error
                ? `${selectId}-error`
                : success
                ? `${selectId}-success`
                : `${selectId}-helper`
            }
            className={cn(
              'text-sm',
              error && 'text-danger-600',
              success && 'text-success-600',
              !error && !success && 'text-gray-500'
            )}
          >
            {error || success || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select, selectVariants };
