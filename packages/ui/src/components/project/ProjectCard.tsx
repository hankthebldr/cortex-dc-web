'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CalendarDays, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Building2,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Project, ProjectStatus, Priority } from '@cortex/db/types/projects';
import { format, isAfter, differenceInDays } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  progress?: number;
  health?: 'good' | 'warning' | 'at_risk';
  povCount?: number;
  trrCount?: number;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

const statusConfig = {
  [ProjectStatus.DRAFT]: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Clock
  },
  [ProjectStatus.ACTIVE]: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle2
  },
  [ProjectStatus.ON_HOLD]: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertTriangle
  },
  [ProjectStatus.COMPLETED]: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2
  },
  [ProjectStatus.CANCELLED]: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle
  }
};

const priorityConfig = {
  [Priority.LOW]: {
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    dot: 'bg-gray-400'
  },
  [Priority.MEDIUM]: {
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500'
  },
  [Priority.HIGH]: {
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500'
  },
  [Priority.CRITICAL]: {
    color: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500'
  }
};

const healthConfig = {
  good: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  warning: {
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  at_risk: {
    color: 'text-red-600',
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200'
  }
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  progress = 0,
  health = 'good',
  povCount = 0,
  trrCount = 0,
  onView,
  onEdit,
  onDelete,
  className
}) => {
  const StatusIcon = statusConfig[project.status].icon;
  const isOverdue = project.endDate && isAfter(new Date(), project.endDate) && project.status !== ProjectStatus.COMPLETED;
  const daysUntilDue = project.endDate ? differenceInDays(project.endDate, new Date()) : null;
  
  return (
    <Card className={cn(
      'group hover:shadow-lg transition-all duration-200 border-l-4',
      priorityConfig[project.priority].color.replace('bg-', 'border-l-').replace('-50', '-400'),
      health && healthConfig[health].borderColor,
      isOverdue && 'bg-red-50 border-red-200',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={cn(
                'w-4 h-4',
                project.status === ProjectStatus.COMPLETED ? 'text-green-600' : 
                project.status === ProjectStatus.CANCELLED ? 'text-red-600' :
                'text-blue-600'
              )} />
              <CardTitle className="text-lg font-semibold truncate">
                {project.title}
              </CardTitle>
              {isOverdue && (
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
            </div>
            <CardDescription className="text-sm text-gray-600 line-clamp-2">
              {project.description}
            </CardDescription>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onView && (
                <DropdownMenuItem onClick={onView}>
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  Edit Project
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuSeparator />
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  Delete Project
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Customer Information */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building2 className="w-4 h-4" />
          <span className="font-medium">{project.customer.name}</span>
          {project.customer.industry && (
            <>
              <span>•</span>
              <span>{project.customer.industry}</span>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              className={cn(
                'h-2',
                health === 'good' && 'bg-green-100',
                health === 'warning' && 'bg-yellow-100',
                health === 'at_risk' && 'bg-red-100'
              )}
            />
          </div>
        )}
        
        {/* Status and Priority Badges */}
        <div className="flex items-center gap-2 mb-4">
          <Badge 
            variant="outline" 
            className={statusConfig[project.status].color}
          >
            {project.status.replace('_', ' ').toUpperCase()}
          </Badge>
          
          <Badge 
            variant="outline" 
            className={cn('flex items-center gap-1', priorityConfig[project.priority].color)}
          >
            <div className={cn('w-2 h-2 rounded-full', priorityConfig[project.priority].dot)} />
            {project.priority.toUpperCase()}
          </Badge>
          
          {health !== 'good' && (
            <Badge 
              variant="outline"
              className={cn('flex items-center gap-1', healthConfig[health].color, healthConfig[health].bgColor)}
            >
              <AlertTriangle className="w-3 h-3" />
              {health === 'at_risk' ? 'AT RISK' : 'WARNING'}
            </Badge>
          )}
        </div>
        
        {/* Project Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">POVs:</span>
            <span className="font-medium">{povCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-gray-600">TRRs:</span>
            <span className="font-medium">{trrCount}</span>
          </div>
        </div>
        
        {/* Timeline Information */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <CalendarDays className="w-4 h-4" />
            <span>Started: {format(project.startDate, 'MMM d, yyyy')}</span>
          </div>
          
          {project.endDate && (
            <div className={cn(
              'flex items-center gap-2',
              isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'
            )}>
              <CalendarDays className="w-4 h-4" />
              <span>
                Due: {format(project.endDate, 'MMM d, yyyy')}
                {daysUntilDue !== null && (
                  <span className="ml-1">
                    ({daysUntilDue > 0 ? `${daysUntilDue} days left` : 
                      daysUntilDue === 0 ? 'Due today' : 
                      `${Math.abs(daysUntilDue)} days overdue`})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
        
        {/* Team Members */}
        {project.team.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Team</span>
            </div>
            <div className="flex -space-x-2">
              {project.team.slice(0, 3).map((memberId, index) => (
                <Avatar key={memberId} className="w-6 h-6 border-2 border-white">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${memberId}`} />
                  <AvatarFallback className="text-xs">
                    {String(index + 1)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.team.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                  +{project.team.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Estimated Value */}
        {project.estimatedValue && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">Est. Value:</span>
            <span className="text-sm font-medium text-green-600">
              ${project.estimatedValue.toLocaleString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};