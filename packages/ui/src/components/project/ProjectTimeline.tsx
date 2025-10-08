'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  FileText,
  Target,
  Users,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimelineEvent } from '@cortex/db/types/projects';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

interface ProjectTimelineProps {
  events: TimelineEvent[];
  className?: string;
  showAvatars?: boolean;
  maxEvents?: number;
}

const eventTypeConfig = {
  project_created: {
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Project'
  },
  project_updated: {
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Project'
  },
  project_completed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Project'
  },
  pov_created: {
    icon: Target,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'POV'
  },
  pov_phase_completed: {
    icon: CheckCircle2,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'POV'
  },
  pov_completed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'POV'
  },
  trr_created: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'TRR'
  },
  trr_submitted: {
    icon: FileText,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'TRR'
  },
  trr_approved: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'TRR'
  },
  task_created: {
    icon: Circle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    label: 'Task'
  },
  task_completed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Task'
  },
  milestone_reached: {
    icon: Target,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    label: 'Milestone'
  },
  note_added: {
    icon: FileText,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    label: 'Note'
  },
  team_member_added: {
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Team'
  },
  status_changed: {
    icon: Circle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Status'
  }
};

const formatRelativeTime = (date: Date): string => {
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }
  
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }
  
  const days = differenceInDays(new Date(), date);
  if (days <= 7) {
    return `${days} days ago`;
  }
  
  return format(date, 'MMM d, yyyy');
};

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  events,
  className,
  showAvatars = true,
  maxEvents = 50
}) => {
  const sortedEvents = useMemo(() => {
    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxEvents);
  }, [events, maxEvents]);

  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: TimelineEvent[] } = {};
    
    sortedEvents.forEach(event => {
      const dateKey = format(event.timestamp, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });
    
    return groups;
  }, [sortedEvents]);

  if (sortedEvents.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Project Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No timeline events yet</p>
            <p className="text-sm">Events will appear here as the project progresses</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Project Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
            <div key={dateKey} className="relative">
              {/* Date Header */}
              <div className="sticky top-0 z-10 bg-white pb-2">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </div>
              
              {/* Events for this day */}
              <div className="relative pl-6 ml-2">
                {/* Vertical line */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
                
                <div className="space-y-4">
                  {dayEvents.map((event, eventIndex) => {
                    const config = eventTypeConfig[event.type];
                    const Icon = config.icon;
                    const isLastEvent = eventIndex === dayEvents.length - 1;
                    
                    return (
                      <div key={event.id} className="relative">
                        {/* Timeline dot */}
                        <div className={cn(
                          'absolute -left-6 w-3 h-3 rounded-full border-2 border-white shadow-sm',
                          config.bgColor,
                          config.borderColor
                        )}>
                          <div className={cn('w-full h-full rounded-full', config.bgColor)} />
                        </div>
                        
                        {/* Event content */}
                        <div className="bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors p-4">
                          <div className="flex items-start gap-3">
                            {/* Event icon */}
                            <div className={cn(
                              'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                              config.bgColor,
                              config.borderColor,
                              'border'
                            )}>
                              <Icon className={cn('w-4 h-4', config.color)} />
                            </div>
                            
                            {/* Event details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className={cn(
                                  'text-xs',
                                  config.color.replace('text-', 'text-'),
                                  config.bgColor,
                                  config.borderColor
                                )}>
                                  {config.label}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatRelativeTime(event.timestamp)}
                                </span>
                              </div>
                              
                              <h4 className="font-medium text-gray-900 mb-1">
                                {event.title}
                              </h4>
                              
                              {event.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {event.description}
                                </p>
                              )}
                              
                              {/* Actor avatar and name */}
                              {showAvatars && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Avatar className="w-5 h-5">
                                    <AvatarImage 
                                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${event.actor}`} 
                                    />
                                    <AvatarFallback className="text-xs">
                                      {event.actor.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-gray-500">
                                    {event.actor}
                                  </span>
                                </div>
                              )}
                              
                              {/* Metadata */}
                              {event.metadata && Object.keys(event.metadata).length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <div className="text-xs text-gray-500 space-y-1">
                                    {Object.entries(event.metadata).map(([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span className="font-medium capitalize">
                                          {key.replace(/_/g, ' ')}:
                                        </span>
                                        <span>{String(value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Spacing line to next event */}
                        {!isLastEvent && (
                          <div className="absolute -left-6 top-12 w-px h-4 bg-gray-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Show more indicator */}
        {events.length > maxEvents && (
          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {maxEvents} of {events.length} events
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};