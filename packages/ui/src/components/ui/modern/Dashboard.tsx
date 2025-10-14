'use client';

/**
 * Modern Dashboard Components
 * Metrics display, activity feed, and quick actions
 * Migrated from henryreed.ai/hosting/components/ui/modern/Dashboard.tsx
 */

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../../../lib/utils';

// Note: ModernCard, ModernButton, ModernBadge imports removed - using local implementations

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: 'accent' | 'success' | 'warning' | 'error' | 'info';
  description?: string;
}

export interface DashboardProps {
  metrics: DashboardMetric[];
  className?: string;
}

export const ModernDashboard: React.FC<DashboardProps> = ({
  metrics,
  className
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
};

interface MetricCardProps {
  metric: DashboardMetric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  // Memoize numericValue calculation to avoid inconsistent effect triggers
  const numericValue = useMemo(() => {
    if (typeof metric.value === 'number') {
      return isNaN(metric.value) ? 0 : metric.value;
    }
    const parsed = parseFloat(metric.value.toString().replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }, [metric.value]);

  useEffect(() => {
    if (typeof metric.value === 'number') {
      let start = 0;
      const end = numericValue;
      const duration = 1000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setAnimatedValue(end);
          clearInterval(timer);
        } else {
          setAnimatedValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [numericValue, metric.value]);

  // Standard Tailwind color mappings
  const colorClasses = {
    accent: 'border-cyan-400/30 bg-gradient-to-br from-cyan-400/5 to-cyan-400/10',
    success: 'border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/10',
    warning: 'border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-yellow-500/10',
    error: 'border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-500/10',
    info: 'border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-500/10'
  };

  const iconColors = {
    accent: 'text-cyan-400',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    info: 'text-blue-500'
  };

  const changeColors = {
    increase: 'text-green-500',
    decrease: 'text-red-500',
    neutral: 'text-gray-400'
  };

  // Enhanced number formatting with internationalization
  const formatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
  const displayValue = typeof metric.value === 'number' ? formatter.format(animatedValue) : metric.value;

  return (
    <div
      className={cn(
        'p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none backdrop-blur-sm bg-gray-900/50',
        colorClasses[metric.color],
        isHovered && 'shadow-lg'
      )}
      tabIndex={0}
      role="button"
      aria-label={`${metric.title}: ${displayValue}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className={cn('text-lg', iconColors[metric.color])}>
              {metric.icon}
            </span>
            <h3 className="text-sm font-medium text-gray-300">
              {metric.title}
            </h3>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">
              {displayValue}
            </div>

            {metric.change !== undefined && (
              <div className="flex items-center space-x-1">
                <svg
                  className={cn(
                    'h-3 w-3',
                    changeColors[metric.changeType || 'neutral'],
                    metric.changeType === 'increase' && 'rotate-0',
                    metric.changeType === 'decrease' && 'rotate-180'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l10-10M17 7l-3-3m3 3v3" />
                </svg>
                <span className={cn('text-xs font-medium', changeColors[metric.changeType || 'neutral'])}>
                  {Math.abs(metric.change)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {isHovered && metric.description && (
          <div className="text-xs text-gray-400 opacity-0 animate-fade-in">
            <p className="max-w-24 text-right">{metric.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Activity Feed Component
export interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  className?: string;
  onViewAll?: () => void;
}

export const ModernActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxItems = 5,
  className,
  onViewAll
}) => {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className={cn('p-4 border border-gray-800 rounded-xl backdrop-blur-sm bg-gray-900/50', className)}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg className="h-5 w-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Activity
        </h3>

        <div className="space-y-3">
          {displayActivities.map((activity, index) => (
            <ActivityItemComponent
              key={activity.id}
              activity={activity}
              index={index}
            />
          ))}
        </div>

        {activities.length > maxItems && (
          <div className="pt-3 border-t border-gray-800">
            <button
              onClick={onViewAll}
              className="w-full px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-transparent hover:bg-gray-800 rounded-lg transition-colors"
            >
              View All Activity
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface ActivityItemComponentProps {
  activity: ActivityItem;
  index: number;
}

const ActivityItemComponent: React.FC<ActivityItemComponentProps> = ({ activity, index }) => {
  const typeIcons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️'
  };

  const typeColors = {
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    info: 'text-blue-500'
  };

  return (
    <div
      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <span className={cn('text-sm', typeColors[activity.type])}>
        {typeIcons[activity.type]}
      </span>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">
            {activity.title}
          </h4>
          <time className="text-xs text-gray-400">
            {activity.timestamp.toLocaleTimeString()}
          </time>
        </div>

        <p className="text-xs text-gray-300">
          {activity.description}
        </p>

        {activity.user && (
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {activity.user.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {activity.user}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Actions Grid
export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'accent' | 'success' | 'warning' | 'error' | 'info';
  action: () => void;
  badge?: string | number;
}

export interface QuickActionsProps {
  actions: QuickActionItem[];
  className?: string;
}

export const ModernQuickActions: React.FC<QuickActionsProps> = ({
  actions,
  className
}) => {
  return (
    <div className={cn('p-4 border border-gray-800 rounded-xl backdrop-blur-sm bg-gray-900/50', className)}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg className="h-5 w-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <QuickActionButton
              key={action.id}
              action={action}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface QuickActionButtonProps {
  action: QuickActionItem;
  index: number;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ action, index }) => {
  const colorClasses = {
    accent: 'border-cyan-400/30 hover:bg-cyan-400/10 hover:border-cyan-400/50',
    success: 'border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50',
    warning: 'border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500/50',
    error: 'border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50',
    info: 'border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50'
  };

  const iconColors = {
    accent: 'text-cyan-400',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    info: 'text-blue-500'
  };

  const badgeColors = {
    accent: 'bg-cyan-400/20 text-cyan-400',
    success: 'bg-green-500/20 text-green-500',
    warning: 'bg-yellow-500/20 text-yellow-500',
    error: 'bg-red-500/20 text-red-500',
    info: 'bg-blue-500/20 text-blue-500'
  };

  return (
    <button
      onClick={action.action}
      className={cn(
        'relative p-4 border rounded-xl transition-all duration-200 text-left group focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none',
        colorClasses[action.color]
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={cn('text-lg', iconColors[action.color])}>
            {action.icon}
          </span>
          {action.badge && (
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', badgeColors[action.color])}>
              {action.badge}
            </span>
          )}
        </div>

        <div>
          <h4 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
            {action.title}
          </h4>
          <p className="text-xs text-gray-400">
            {action.description}
          </p>
        </div>
      </div>
    </button>
  );
};
