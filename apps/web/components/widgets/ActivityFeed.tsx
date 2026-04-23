/**
 * ActivityFeed Component - Dashboard Widget
 *
 * Display recent activity and events
 */

'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  AtSign,
  TrendingUp,
  Trash2,
  Edit,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, cn } from '../design-system';
import type { Activity } from '@/lib/design-system/types';

export interface ActivityFeedProps {
  /**
   * Activity items
   */
  activities: Activity[];
  /**
   * Maximum number of items to display
   */
  limit?: number;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Show all activities (no limit)
   */
  showAll?: boolean;
}

const activityIcons: Record<Activity['type'], React.ReactNode> = {
  create: <FileText className="h-4 w-4" />,
  update: <Edit className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  comment: <MessageSquare className="h-4 w-4" />,
  mention: <AtSign className="h-4 w-4" />,
  status_change: <TrendingUp className="h-4 w-4" />,
};

const activityColors: Record<Activity['type'], string> = {
  create: 'bg-success-100 text-success-600',
  update: 'bg-info-100 text-info-600',
  delete: 'bg-danger-100 text-danger-600',
  comment: 'bg-primary-100 text-primary-600',
  mention: 'bg-warning-100 text-warning-600',
  status_change: 'bg-gray-100 text-gray-600',
};

export function ActivityFeed({
  activities,
  limit = 10,
  loading,
  className,
  showAll = false,
}: ActivityFeedProps) {
  const displayedActivities = showAll
    ? activities
    : activities.slice(0, limit);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayedActivities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flow-root">
          <ul className="-mb-8">
            {displayedActivities.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== displayedActivities.length - 1 && (
                    <span
                      className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex gap-x-3">
                    {/* Activity Icon */}
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white',
                        activityColors[activity.type]
                      )}
                    >
                      {activityIcons[activity.type]}
                    </div>

                    {/* Activity Details */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">
                          {activity.actor.name}
                        </span>
                        <span className="text-gray-600 mx-1">
                          {activity.action}
                        </span>
                        <span className="font-medium text-gray-900">
                          {activity.target.name}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          size="sm"
                          variant="subtle"
                          color={
                            activity.target.type === 'pov'
                              ? 'primary'
                              : activity.target.type === 'trr'
                              ? 'warning'
                              : 'gray'
                          }
                        >
                          {activity.target.type.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(activity.timestamp, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {!showAll && activities.length > limit && (
          <div className="mt-4 text-center">
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View all activity ({activities.length})
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
