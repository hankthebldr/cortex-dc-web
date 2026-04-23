/**
 * MetricCard Component - Dashboard Widget
 *
 * Display key metrics with trend indicators
 */

'use client';

import React from 'react';
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, cn } from '../design-system';
import type { MetricData } from '@/lib/design-system/types';
import {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDuration,
} from '@/lib/design-system/utils';

export interface MetricCardProps {
  /**
   * Metric data
   */
  metric: MetricData;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Click handler
   */
  onClick?: () => void;
}

export function MetricCard({
  metric,
  className,
  loading,
  onClick,
}: MetricCardProps) {
  const {
    label,
    value,
    previousValue,
    change,
    trend,
    format = 'number',
    icon,
  } = metric;

  // Format the value based on format type
  const formattedValue = React.useMemo(() => {
    if (typeof value !== 'number') return value;

    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'duration':
        return formatDuration(value);
      case 'number':
      default:
        return formatNumber(value);
    }
  }, [value, format]);

  // Get trend color and icon
  const trendInfo = React.useMemo(() => {
    if (!trend || !change) return null;

    const isPositive = change > 0;
    const isNegative = change < 0;

    return {
      color:
        trend === 'up'
          ? 'text-success-600'
          : trend === 'down'
          ? 'text-danger-600'
          : 'text-gray-600',
      bg:
        trend === 'up'
          ? 'bg-success-50'
          : trend === 'down'
          ? 'bg-danger-50'
          : 'bg-gray-50',
      icon:
        trend === 'up' ? (
          <TrendingUp className="h-4 w-4" />
        ) : trend === 'down' ? (
          <TrendingDown className="h-4 w-4" />
        ) : (
          <Minus className="h-4 w-4" />
        ),
      arrow:
        isPositive ? (
          <ArrowUp className="h-3 w-3" />
        ) : isNegative ? (
          <ArrowDown className="h-3 w-3" />
        ) : null,
      changeText: formatPercentage(Math.abs(change), 1),
    };
  }, [trend, change]);

  if (loading) {
    return (
      <Card className={cn('relative overflow-hidden', className)}>
        <CardContent  className="space-y-3">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <CardContent >
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Label */}
            <p className="text-sm font-medium text-gray-600">{label}</p>

            {/* Value */}
            <p className="text-3xl font-bold text-gray-900">
              {formattedValue}
            </p>

            {/* Trend */}
            {trendInfo && (
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    trendInfo.color,
                    trendInfo.bg
                  )}
                >
                  {trendInfo.arrow}
                  {trendInfo.changeText}
                </span>
                <span className="text-xs text-gray-500">
                  vs previous period
                </span>
              </div>
            )}
          </div>

          {/* Icon */}
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
