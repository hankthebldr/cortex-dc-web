/**
 * BarChart Component - Bar chart visualization
 *
 * Uses Recharts for data visualization
 */

'use client';

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { cn } from '@/lib/design-system/utils';
import type { ChartData, ChartConfig } from '@/lib/design-system/types';

export interface BarChartProps {
  /**
   * Chart data
   */
  data: ChartData[];
  /**
   * Chart configuration
   */
  config: ChartConfig;
  /**
   * Height in pixels
   */
  height?: number;
  /**
   * Show grid
   */
  showGrid?: boolean;
  /**
   * Show legend
   */
  showLegend?: boolean;
  /**
   * Show tooltip
   */
  showTooltip?: boolean;
  /**
   * Bar orientation
   */
  layout?: 'horizontal' | 'vertical';
  /**
   * Enable stacked bars
   */
  stacked?: boolean;
  /**
   * Enable animations
   */
  animated?: boolean;
  /**
   * Additional className
   */
  className?: string;
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: TooltipProps<any, any>) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-gray-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function BarChart({
  data,
  config,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  layout = 'horizontal',
  stacked = false,
  animated = true,
  className,
}: BarChartProps) {
  const colors = {
    primary: 'rgb(249, 115, 22)', // orange-500
    success: 'rgb(34, 197, 94)', // green-500
    warning: 'rgb(251, 191, 36)', // yellow-400
    danger: 'rgb(239, 68, 68)', // red-500
    info: 'rgb(59, 130, 246)', // blue-500
    gray: 'rgb(107, 114, 128)', // gray-500
  };

  const isVertical = layout === 'vertical';

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 20, left: isVertical ? 20 : 0, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(229, 231, 235)" />
          )}
          {isVertical ? (
            <>
              <XAxis
                type="number"
                stroke="rgb(107, 114, 128)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                dataKey={config.xAxisKey}
                type="category"
                stroke="rgb(107, 114, 128)"
                fontSize={12}
                tickLine={false}
                width={100}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={config.xAxisKey}
                stroke="rgb(107, 114, 128)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="rgb(107, 114, 128)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
            </>
          )}
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="square"
            />
          )}
          {config.series.map((series, index) => (
            <Bar
              key={series.key}
              dataKey={series.key}
              name={series.name}
              fill={colors[series.color as keyof typeof colors] || colors.primary}
              radius={[4, 4, 0, 0]}
              stackId={stacked ? 'stack' : undefined}
              isAnimationActive={animated}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
