/**
 * Stepper Component - Multi-step progress indicator
 */

'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/design-system/utils';

export interface Step {
  /**
   * Step label
   */
  label: string;
  /**
   * Step description
   */
  description?: string;
  /**
   * Step icon
   */
  icon?: React.ReactNode;
}

export interface StepperProps {
  /**
   * Array of steps
   */
  steps: Step[];
  /**
   * Current active step index (0-based)
   */
  currentStep: number;
  /**
   * Orientation
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Click handler for step
   */
  onStepClick?: (stepIndex: number) => void;
  /**
   * Whether to allow clicking on steps
   */
  clickable?: boolean;
  /**
   * Additional className
   */
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  orientation = 'horizontal',
  onStepClick,
  clickable = false,
  className,
}: StepperProps) {
  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = clickable && index <= currentStep;

          return (
            <div key={index} className="flex gap-4">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                    isComplete &&
                      'border-success-500 bg-success-500 text-white',
                    isCurrent &&
                      !isComplete &&
                      'border-primary-500 bg-primary-500 text-white',
                    !isComplete &&
                      !isCurrent &&
                      'border-gray-300 bg-white text-gray-400',
                    isClickable && 'cursor-pointer hover:border-primary-400',
                    !isClickable && 'cursor-not-allowed'
                  )}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 h-full min-h-[2rem] mt-2',
                      index < currentStep ? 'bg-success-500' : 'bg-gray-300'
                    )}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 pb-8">
                <h4
                  className={cn(
                    'text-sm font-medium',
                    isCurrent && 'text-primary-600',
                    isComplete && 'text-gray-900',
                    !isComplete && !isCurrent && 'text-gray-500'
                  )}
                >
                  {step.label}
                </h4>
                {step.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = clickable && index <= currentStep;

          return (
            <React.Fragment key={index}>
              {/* Step */}
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                    isComplete &&
                      'border-success-500 bg-success-500 text-white',
                    isCurrent &&
                      !isComplete &&
                      'border-primary-500 bg-primary-500 text-white',
                    !isComplete &&
                      !isCurrent &&
                      'border-gray-300 bg-white text-gray-400',
                    isClickable && 'cursor-pointer hover:border-primary-400',
                    !isClickable && 'cursor-not-allowed'
                  )}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>
                <div className="mt-2 text-center">
                  <h4
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-primary-600',
                      isComplete && 'text-gray-900',
                      !isComplete && !isCurrent && 'text-gray-500'
                    )}
                  >
                    {step.label}
                  </h4>
                  {step.description && (
                    <p className="mt-1 text-xs text-gray-500">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 px-2 pb-8">
                  <div
                    className={cn(
                      'h-0.5 w-full',
                      index < currentStep ? 'bg-success-500' : 'bg-gray-300'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
