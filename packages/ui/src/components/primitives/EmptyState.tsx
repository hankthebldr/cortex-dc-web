import * as React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  /**
   * Icon or illustration to display
   */
  icon?: React.ReactNode;
  /**
   * Main title
   */
  title: string;
  /**
   * Description text
   */
  description: string;
  /**
   * Primary action button
   */
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Variant style
   */
  variant?: 'default' | 'minimal';
}

/**
 * EmptyState Component
 *
 * Display when there is no data to show. Provides guidance on what to do next.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<DocumentPlusIcon className="h-12 w-12" />}
 *   title="No POVs yet"
 *   description="Get started by creating your first Proof of Value"
 *   action={{
 *     label: 'Create POV',
 *     onClick: () => router.push('/povs/new'),
 *     icon: <PlusIcon className="h-4 w-4" />,
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = 'default',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variant === 'default' &&
          'rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12',
        variant === 'minimal' && 'py-12',
        'dark:border-gray-700 dark:bg-gray-800/50',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div className="mb-4 text-gray-400 dark:text-gray-500" aria-hidden="true">
          {icon}
        </div>
      )}

      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>

      <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          {action && (
            <Button
              onClick={action.onClick}
              leftIcon={action.icon}
              variant="primary"
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

EmptyState.displayName = 'EmptyState';
