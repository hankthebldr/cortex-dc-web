import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectCardProps {
  project: any; // Using any for now
  onClick?: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{project?.title || 'Untitled Project'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{project?.description || 'No description available'}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            Status: {project?.status || 'Unknown'}
          </span>
          <span className="text-sm text-gray-500">
            Priority: {project?.priority || 'Medium'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
