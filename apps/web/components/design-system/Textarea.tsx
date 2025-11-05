/**
 * Textarea Component - Cortex DC Design System
 *
 * Multi-line text input component
 */

'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/design-system/utils';

const textareaVariants = cva(
  'flex w-full rounded-lg border px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
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
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  /**
   * Textarea label
   */
  label?: string;
  /**
   * Helper text below textarea
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
   * Show character count
   */
  showCount?: boolean;
  /**
   * Wrapper className
   */
  wrapperClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      wrapperClassName,
      state: stateProp,
      label,
      helperText,
      error,
      success,
      showCount,
      maxLength,
      value,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    // Determine state based on props
    const state = error
      ? 'error'
      : success
      ? 'success'
      : stateProp || 'default';

    const currentLength =
      typeof value === 'string' ? value.length : props.defaultValue?.toString().length || 0;

    return (
      <div className={cn('w-full space-y-2', wrapperClassName)}>
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={textareaId}
              className="block text-sm font-medium text-gray-700"
            >
              {label}
              {props.required && (
                <span className="ml-1 text-danger-500" aria-label="required">
                  *
                </span>
              )}
            </label>
            {showCount && maxLength && (
              <span className="text-xs text-gray-500">
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(textareaVariants({ state }), className)}
          maxLength={maxLength}
          value={value}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : success
              ? `${textareaId}-success`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          {...props}
        />
        {(error || success || helperText) && (
          <p
            id={
              error
                ? `${textareaId}-error`
                : success
                ? `${textareaId}-success`
                : `${textareaId}-helper`
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

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
