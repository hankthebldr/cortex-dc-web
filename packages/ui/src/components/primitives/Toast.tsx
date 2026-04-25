'use client';

/**
 * Toast Notification Component
 *
 * Features:
 * - Multiple variants (success, error, warning, info)
 * - Auto-dismiss with configurable duration
 * - Manual dismiss
 * - Stacking support
 * - Animations
 * - Accessible
 */

import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface ToastProps {
  id?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Toast({
  id,
  variant = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  action,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const config = {
    success: {
      bg: 'bg-success-50',
      border: 'border-success-500',
      text: 'text-success-800',
      icon: CheckCircle2,
      iconColor: 'text-success-500',
    },
    error: {
      bg: 'bg-error-50',
      border: 'border-error-500',
      text: 'text-error-800',
      icon: AlertCircle,
      iconColor: 'text-error-500',
    },
    warning: {
      bg: 'bg-warning-50',
      border: 'border-warning-500',
      text: 'text-warning-800',
      icon: AlertTriangle,
      iconColor: 'text-warning-500',
    },
    info: {
      bg: 'bg-info-50',
      border: 'border-info-500',
      text: 'text-info-800',
      icon: Info,
      iconColor: 'text-info-500',
    },
  };

  const { bg, border, text, icon: Icon, iconColor } = config[variant];

  return (
    <div
      className={`
        ${bg} ${border} border-l-4 rounded-lg shadow-lg p-4 max-w-md
        transform transition-all duration-300
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        animate-slide-in-right
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />

        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`text-sm font-semibold ${text} mb-1`}>{title}</h4>
          )}
          <p className={`text-sm ${text}`}>{message}</p>

          {action && (
            <button
              onClick={action.onClick}
              className={`mt-2 text-sm font-medium ${text} underline hover:no-underline`}
            >
              {action.label}
            </button>
          )}
        </div>

        <button
          onClick={handleClose}
          className={`${text} hover:opacity-75 transition-opacity flex-shrink-0`}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * ToastContainer - Container for managing multiple toasts
 */
export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  onRemove: (id: string) => void;
}

export function ToastContainer({
  toasts,
  position = 'top-right',
  onRemove,
}: ToastContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-3 max-w-md`}>
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id || index}
          {...toast}
          onClose={() => toast.id && onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

/**
 * Hook for managing toasts
 */
export function useToast() {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    toast: {
      success: (message: string, title?: string) =>
        addToast({ variant: 'success', message, title }),
      error: (message: string, title?: string) =>
        addToast({ variant: 'error', message, title }),
      warning: (message: string, title?: string) =>
        addToast({ variant: 'warning', message, title }),
      info: (message: string, title?: string) =>
        addToast({ variant: 'info', message, title }),
    },
  };
}

export default Toast;
