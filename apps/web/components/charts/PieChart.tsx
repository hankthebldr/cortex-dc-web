/**
 * PieChart Component - Pie and donut chart visualization
 *
 * Uses Recharts for data visualization
 */

'use client';

import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { cn } from '@/lib/design-system/utils';

export interface PieDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  /**
   * Chart data
   */
  data: PieDataItem[];
  /**
   * Height in pixels
   */
  height?: number;
  /**
   * Show legend
   */
  showLegend?: boolean;
  /**
   * Show tooltip
   */
  showTooltip?: boolean;
  /**
   * Show percentage labels
   */
  showLabels?: boolean;
  /**
   * Inner radius (0 for pie, >0 for donut)
   */
  innerRadius?: number;
  /**
   * Outer radius
   */
  outerRadius?: number;
  /**
   * Enable animations
   */
  animated?: boolean;
  /**
   * Custom colors
   */
  colors?: string[];
  /**
   * Additional className
   */
  className?: string;
}

// Custom tooltip component
function CustomTooltip({ active, payload }: TooltipProps<any, any>) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0];
  const total = payload[0]?.payload?.percent
    ? 100
    : data.payload.value;
  const percent = payload[0]?.payload?.percent ||
    ((data.value / total) * 100).toFixed(1);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.payload.fill }}
        />
        <span className="text-sm font-medium text-gray-900">
          {data.name}
        </span>
      </div>
      <div className="mt-2 space-y-1">
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-gray-600">Value:</span>
          <span className="font-medium text-gray-900">{data.value}</span>
        </div>
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-gray-600">Percentage:</span>
          <span className="font-medium text-gray-900">{percent}%</span>
        </div>
      </div>
    </div>
  );
}

// Default color palette
const DEFAULT_COLORS = [
  'rgb(249, 115, 22)', // orange-500 (primary)
  'rgb(59, 130, 246)', // blue-500 (info)
  'rgb(34, 197, 94)', // green-500 (success)
  'rgb(251, 191, 36)', // yellow-400 (warning)
  'rgb(239, 68, 68)', // red-500 (danger)
  'rgb(168, 85, 247)', // purple-500
  'rgb(236, 72, 153)', // pink-500
  'rgb(20, 184, 166)', // teal-500
];

// Label rendering function
const renderLabel = (entry: any) => {
  return `${entry.percent.toFixed(0)}%`;
};

export function PieChart({
  data,
  height = 300,
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  innerRadius = 0,
  outerRadius = 80,
  animated = true,
  colors = DEFAULT_COLORS,
  className,
}: PieChartProps) {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercent = data.map(item => ({
    ...item,
    percent: (item.value / total) * 100,
  }));

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={dataWithPercent}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            label={showLabels ? renderLabel : false}
            labelLine={showLabels}
            isAnimationActive={animated}
          >
            {dataWithPercent.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
              verticalAlign="bottom"
              height={36}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * DonutChart - Convenience component for donut charts
 */
export function DonutChart(props: Omit<PieChartProps, 'innerRadius'>) {
  return <PieChart {...props} innerRadius={60} />;
}
