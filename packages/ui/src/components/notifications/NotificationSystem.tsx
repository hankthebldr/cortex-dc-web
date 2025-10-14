'use client';

/**
 * Notification System Component
 * Migrated from henryreed.ai/hosting/components/NotificationSystem.tsx
 *
 * Features:
 * - Toast-style notifications with auto-dismiss
 * - Support for success, error, warning, and info types
 * - Animated entrance and exit
 * - Manual dismiss capability
 * - Stacked notification display
 * - Optional action buttons
 */

import React, { useEffect, useState } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp?: number;
  duration?: number; // Auto-dismiss duration in ms (default 5000)
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationItemProps extends Notification {
  onRemove: (id: string) => void;
}

export interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  className?: string;
}

function NotificationItem({
  id,
  type,
  message,
  timestamp,
  duration = 5000,
  action,
  onRemove
}: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);

    // Auto-remove after duration
    const timer = setTimeout(() => {
      setIsRemoving(true);
      setTimeout(() => onRemove(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, onRemove, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success': return 'border-green-500 bg-green-900/20 text-green-400';
      case 'error': return 'border-red-500 bg-red-900/20 text-red-400';
      case 'warning': return 'border-yellow-500 bg-yellow-900/20 text-yellow-400';
      case 'info': return 'border-blue-500 bg-blue-900/20 text-blue-400';
      default: return 'border-gray-500 bg-gray-900/20 text-gray-400';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 1000) return 'now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  const handleDismiss = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(id), 300);
  };

  return (
    <div
      className={`
        max-w-sm w-full bg-gray-900 shadow-lg rounded-lg pointer-events-auto border transition-all duration-300 ease-in-out transform
        ${getColorClasses()}
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-xl">{getIcon()}</span>
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium break-words whitespace-normal leading-relaxed">
              {message}
            </p>
            <div className="mt-1 flex items-center justify-between">
              {timestamp && (
                <p className="text-xs opacity-70">
                  {formatTime(timestamp)}
                </p>
              )}
              {action && (
                <button
                  onClick={() => {
                    action.onClick();
                    handleDismiss();
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 flex-shrink-0"
                  aria-label={action.label}
                >
                  {action.label}
                </button>
              )}
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="rounded-md inline-flex hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-gray-400 text-xs opacity-50 p-1"
              onClick={handleDismiss}
              aria-label="Close notification"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2'
};

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onRemove,
  position = 'top-right',
  className = ''
}) => {
  if (notifications.length === 0) return null;

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 flex flex-col space-y-4 pointer-events-none ${className}`}
      role="region"
      aria-live="polite"
      aria-atomic="true"
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          {...notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default NotificationSystem;
