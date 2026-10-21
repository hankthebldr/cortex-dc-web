/**
 * Progress Component - Progress bar and circular progress
 */

'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/design-system/utils';

const progressVariants = cva('relative overflow-hidden rounded-full bg-gray-200', {
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  /**
   * Progress value (0-100)
   */
  value: number;
  /**
   * Maximum value
   */
  max?: number;
  /**
   * Progress bar color
   */
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /**
   * Show label
   */
  showLabel?: boolean;
  /**
   * Label position
   */
  labelPosition?: 'top' | 'bottom' | 'inside';
}

export function Progress({
  value,
  max = 100,
  color = 'primary',
  size,
  showLabel = false,
  labelPosition = 'top',
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    info: 'bg-info-500',
  };

  const label = showLabel && (
    <div className="text-sm font-medium text-gray-700 mb-1">
      {percentage.toFixed(0)}%
    </div>
  );

  return (
    <div className={cn('w-full', className)} {...props}>
      {showLabel && labelPosition === 'top' && label}
      <div className={cn(progressVariants({ size }))}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-in-out',
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          {showLabel && labelPosition === 'inside' && percentage > 10 && (
            <div className="flex items-center justify-end h-full pr-2">
              <span className="text-xs font-medium text-white">
                {percentage.toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>
      {showLabel && labelPosition === 'bottom' && (
        <div className="mt-1">{label}</div>
      )}
    </div>
  );
}

/**
 * CircularProgress Component
 */
export interface CircularProgressProps {
  /**
   * Progress value (0-100)
   */
  value: number;
  /**
   * Maximum value
   */
  max?: number;
  /**
   * Size in pixels
   */
  size?: number;
  /**
   * Stroke width
   */
  strokeWidth?: number;
  /**
   * Progress color
   */
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /**
   * Show label
   */
  showLabel?: boolean;
  /**
   * Additional className
   */
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  showLabel = true,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: 'text-primary-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    danger: 'text-danger-500',
    info: 'text-info-500',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-300', colorClasses[color])}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}
