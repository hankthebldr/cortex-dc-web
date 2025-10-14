'use client';

/**
 * Loading Component
 * Multiple loading variants with size options
 * Migrated from henryreed.ai/hosting/components/ui/Loading.tsx
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
  fullscreen?: boolean;
  className?: string;
}

export function Loading({
  size = 'md',
  variant = 'spinner',
  text,
  fullscreen = false,
  className
}: LoadingProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const renderSpinner = () => (
    <div className="relative">
      <div className={cn(
        'animate-spin rounded-full border-4 border-gray-700 border-t-cyan-400',
        sizes[size]
      )} />
      <div className={cn(
        'absolute inset-0 animate-ping rounded-full bg-cyan-400 opacity-20',
        sizes[size]
      )} style={{ animationDuration: '2s' }} />
    </div>
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'animate-bounce rounded-full bg-cyan-400',
            size === 'sm' && 'h-1 w-1',
            size === 'md' && 'h-2 w-2',
            size === 'lg' && 'h-3 w-3',
            size === 'xl' && 'h-4 w-4'
          )}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className="relative flex items-center justify-center">
      <div className={cn(
        'animate-pulse bg-gradient-to-r from-cyan-400 via-green-500 to-cyan-400 rounded-full shadow-lg shadow-cyan-400/50',
        sizes[size]
      )} style={{ backgroundSize: '200% 100%' }} />
      <div className={cn(
        'absolute animate-ping rounded-full bg-green-500 opacity-30',
        sizes[size]
      )} style={{ animationDuration: '1.5s' }} />
    </div>
  );

  const renderSkeleton = () => (
    <div className="space-y-3">
      <div className="animate-pulse bg-gray-700 h-4 rounded-md w-3/4" />
      <div className="animate-pulse bg-gray-700 h-4 rounded-md w-1/2" />
      <div className="animate-pulse bg-gray-700 h-4 rounded-md w-5/6" />
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      fullscreen && 'min-h-screen',
      className
    )}>
      {renderVariant()}
      {text && (
        <div className={cn(
          'text-gray-400 font-medium',
          textSizes[size]
        )}>
          {text}
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-md z-50 flex items-center justify-center animate-fadeIn">
        <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-2xl p-12 shadow-2xl shadow-cyan-400/20 animate-scaleIn">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

// Skeleton component for content loading
export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      'animate-pulse bg-gray-700 rounded-md',
      className
    )} />
  );
}
