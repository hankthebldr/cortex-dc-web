import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectTimelineProps {
  events: any[]; // Using any for now
}

export function ProjectTimeline({ events = [] }: ProjectTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-gray-500 text-sm">No timeline events available</p>
          ) : (
            events.map((event, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">{event.title || 'Event'}</p>
                  <p className="text-sm text-gray-500">{event.description || 'No description'}</p>
                  <p className="text-xs text-gray-400">{event.date || 'No date'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
