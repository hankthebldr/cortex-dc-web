/**
 * DashboardGrid Component - Drag-and-drop customizable dashboard
 *
 * Built with @dnd-kit
 */

'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Settings } from 'lucide-react';
import { Card } from '../design-system';
import { cn } from '@/lib/design-system/utils';
import type { DashboardWidget } from '@/lib/design-system/types';

export interface DashboardGridProps {
  /**
   * Initial widgets
   */
  widgets: DashboardWidget[];
  /**
   * Callback when widgets are reordered
   */
  onWidgetsChange?: (widgets: DashboardWidget[]) => void;
  /**
   * Callback when widget is removed
   */
  onWidgetRemove?: (widgetId: string) => void;
  /**
   * Callback when widget is configured
   */
  onWidgetConfigure?: (widgetId: string) => void;
  /**
   * Grid columns
   */
  columns?: number;
  /**
   * Gap between widgets
   */
  gap?: number;
  /**
   * Editable mode
   */
  editable?: boolean;
  /**
   * Additional className
   */
  className?: string;
}

interface SortableWidgetProps {
  widget: DashboardWidget;
  editable: boolean;
  onRemove?: () => void;
  onConfigure?: () => void;
  children: React.ReactNode;
}

function SortableWidget({
  widget,
  editable,
  onRemove,
  onConfigure,
  children,
}: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    gridColumn: `span ${widget.position.width}`,
    gridRow: `span ${widget.position.height}`,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Card
        className={cn(
          'h-full',
          isDragging && 'ring-2 ring-primary-500 shadow-lg'
        )}
      >
        {/* Widget header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {editable && (
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <h3 className="font-medium text-gray-900">{widget.title}</h3>
          </div>
          {editable && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onConfigure && (
                <button
                  onClick={onConfigure}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
              {onRemove && (
                <button
                  onClick={onRemove}
                  className="p-1 hover:bg-danger-50 rounded text-gray-500 hover:text-danger-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Widget content */}
        <div className="p-4">{children}</div>
      </Card>
    </div>
  );
}

export function DashboardGrid({
  widgets: initialWidgets,
  onWidgetsChange,
  onWidgetRemove,
  onWidgetConfigure,
  columns = 12,
  gap = 4,
  editable = false,
  className,
}: DashboardGridProps) {
  const [widgets, setWidgets] = useState(initialWidgets);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);

      const newWidgets = arrayMove(widgets, oldIndex, newIndex);
      setWidgets(newWidgets);
      onWidgetsChange?.(newWidgets);
    }
  };

  const handleRemove = (widgetId: string) => {
    const newWidgets = widgets.filter((w) => w.id !== widgetId);
    setWidgets(newWidgets);
    onWidgetRemove?.(widgetId);
    onWidgetsChange?.(newWidgets);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={widgets} strategy={rectSortingStrategy}>
        <div
          className={cn(
            'grid auto-rows-[100px]',
            className
          )}
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${gap * 4}px`,
          }}
        >
          {widgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              editable={editable}
              onRemove={() => handleRemove(widget.id)}
              onConfigure={() => onWidgetConfigure?.(widget.id)}
            >
              {/* Widget content based on type */}
              {widget.type === 'metric' && (
                <div className="flex flex-col justify-center h-full">
                  <div className="text-3xl font-bold text-gray-900">
                    {widget.config?.value || '—'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {widget.config?.label || 'Metric'}
                  </div>
                </div>
              )}
              {widget.type === 'chart' && (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Chart placeholder
                </div>
              )}
              {widget.type === 'table' && (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Table placeholder
                </div>
              )}
              {widget.type === 'activity' && (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Activity feed
                </div>
              )}
              {widget.type === 'quick-actions' && (
                <div className="flex flex-col gap-2">
                  <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                    Quick Action 1
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Quick Action 2
                  </button>
                </div>
              )}
            </SortableWidget>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
