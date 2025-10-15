import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Button Variants using class-variance-authority
 * Provides type-safe variant composition
 */
const buttonVariants = cva(
  // Base styles - always applied
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
        outline: 'border-2 border-gray-300 bg-transparent hover:bg-gray-50 active:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800',
        ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-800',
        danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
        success: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 shadow-sm',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Render button as child element (for Next.js Link, etc.)
   */
  asChild?: boolean;
  /**
   * Show loading spinner and disable button
   */
  loading?: boolean;
  /**
   * Icon to display before children
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display after children
   */
  rightIcon?: React.ReactNode;
}

/**
 * Button Component
 *
 * Accessible, keyboard-friendly button with multiple variants and sizes.
 * Supports loading state and icon composition.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={() => {}}>
 *   Click Me
 * </Button>
 *
 * <Button variant="outline" loading leftIcon={<PlusIcon />}>
 *   Create POV
 * </Button>
 *
 * <Button asChild>
 *   <Link href="/dashboard">Go to Dashboard</Link>
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="button-icon-left">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="button-icon-right">{rightIcon}</span>}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
