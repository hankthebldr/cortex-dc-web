import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Error message to display below input
   */
  error?: string;
  /**
   * Helper text to display below input (not shown if error exists)
   */
  helperText?: string;
  /**
   * Label for the input
   */
  label?: string;
  /**
   * Element to display on left side of input
   */
  leftAddon?: React.ReactNode;
  /**
   * Element to display on right side of input
   */
  rightAddon?: React.ReactNode;
  /**
   * Make input full width
   */
  fullWidth?: boolean;
}

/**
 * Input Component
 *
 * Accessible text input with label, error handling, and addon support.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="you@example.com"
 *   error={errors.email?.message}
 *   helperText="We'll never share your email"
 * />
 *
 * <Input
 *   label="Search"
 *   leftAddon={<SearchIcon />}
 *   placeholder="Search POVs..."
 * />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error,
      helperText,
      label,
      leftAddon,
      rightAddon,
      fullWidth,
      id,
      ...props
    },
    ref
  ) => {
    // Generate ID for label association if not provided
    const inputId = id || React.useId();

    return (
      <div className={cn('w-full', !fullWidth && 'max-w-sm')}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            {label}
            {props.required && <span className="ml-1 text-red-500" aria-label="required">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-gray-500 dark:text-gray-400">
              {leftAddon}
            </div>
          )}

          <input
            type={type}
            id={inputId}
            className={cn(
              'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors',
              'placeholder:text-gray-400',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              leftAddon && 'pl-10',
              rightAddon && 'pr-10',
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {rightAddon && (
            <div className="pointer-events-none absolute right-3 flex items-center text-gray-500 dark:text-gray-400">
              {rightAddon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="mt-1 text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
