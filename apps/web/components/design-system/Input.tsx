/**
 * Input Component - Cortex DC Design System
 *
 * Form input component with validation and states
 */

'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/design-system/utils';

const inputVariants = cva(
  'flex w-full rounded-lg border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      state: {
        default:
          'border-gray-300 bg-white focus-visible:border-primary-500 focus-visible:ring-primary-500',
        error:
          'border-danger-300 bg-danger-50 focus-visible:border-danger-500 focus-visible:ring-danger-500',
        success:
          'border-success-300 bg-success-50 focus-visible:border-success-500 focus-visible:ring-success-500',
        warning:
          'border-warning-300 bg-warning-50 focus-visible:border-warning-500 focus-visible:ring-warning-500',
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

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Input label
   */
  label?: string;
  /**
   * Helper text below input
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
   * Icon to display at the start of the input
   */
  startIcon?: React.ReactNode;
  /**
   * Icon to display at the end of the input
   */
  endIcon?: React.ReactNode;
  /**
   * Wrapper className
   */
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
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
      startIcon,
      endIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Determine state based on props
    const state = error
      ? 'error'
      : success
      ? 'success'
      : stateProp || 'default';

    const statusIcon = error ? (
      <AlertCircle className="h-4 w-4 text-danger-500" />
    ) : success ? (
      <CheckCircle2 className="h-4 w-4 text-success-500" />
    ) : null;

    return (
      <div className={cn('w-full space-y-2', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
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
        <div className="relative flex items-center">
          {startIcon && (
            <span className="absolute left-3 flex items-center text-gray-400">
              {startIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ state, size }),
              startIcon && 'pl-10',
              (endIcon || statusIcon) && 'pr-10',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : success
                ? `${inputId}-success`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />
          {(endIcon || statusIcon) && (
            <span className="absolute right-3 flex items-center text-gray-400">
              {statusIcon || endIcon}
            </span>
          )}
        </div>
        {(error || success || helperText) && (
          <p
            id={
              error
                ? `${inputId}-error`
                : success
                ? `${inputId}-success`
                : `${inputId}-helper`
            }
            className={cn(
              'text-sm flex items-center gap-1',
              error && 'text-danger-600',
              success && 'text-success-600',
              !error && !success && 'text-gray-500'
            )}
          >
            {error && <AlertCircle className="h-3 w-3" />}
            {success && <CheckCircle2 className="h-3 w-3" />}
            {helperText && !error && !success && <Info className="h-3 w-3" />}
            <span>{error || success || helperText}</span>
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
