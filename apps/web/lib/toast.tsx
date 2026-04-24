/**
 * Toast Notification System
 *
 * Wrapper around react-hot-toast with custom styling
 */

'use client';

import toast, { Toaster as HotToaster } from 'react-hot-toast';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import type { ToastOptions } from './design-system/types';

/**
 * Show a success toast
 */
export function showSuccessToast(message: string, options?: ToastOptions) {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-slide-up' : 'animate-slide-down'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <CheckCircle2 className="h-5 w-5 text-success-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{message}</p>
              {options?.action && (
                <button
                  onClick={options.action.onClick}
                  className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  {options.action.label}
                </button>
              )}
            </div>
          </div>
        </div>
        {options?.dismissible !== false && (
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    ),
    { duration: options?.duration || 4000, position: options?.position || 'top-right' }
  );
}

/**
 * Show an error toast
 */
export function showErrorToast(message: string, options?: ToastOptions) {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-slide-up' : 'animate-slide-down'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <AlertCircle className="h-5 w-5 text-danger-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{message}</p>
              {options?.action && (
                <button
                  onClick={options.action.onClick}
                  className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  {options.action.label}
                </button>
              )}
            </div>
          </div>
        </div>
        {options?.dismissible !== false && (
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    ),
    { duration: options?.duration || 6000, position: options?.position || 'top-right' }
  );
}

/**
 * Show a warning toast
 */
export function showWarningToast(message: string, options?: ToastOptions) {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-slide-up' : 'animate-slide-down'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <AlertTriangle className="h-5 w-5 text-warning-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{message}</p>
              {options?.action && (
                <button
                  onClick={options.action.onClick}
                  className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  {options.action.label}
                </button>
              )}
            </div>
          </div>
        </div>
        {options?.dismissible !== false && (
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    ),
    { duration: options?.duration || 5000, position: options?.position || 'top-right' }
  );
}

/**
 * Show an info toast
 */
export function showInfoToast(message: string, options?: ToastOptions) {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-slide-up' : 'animate-slide-down'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <Info className="h-5 w-5 text-info-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{message}</p>
              {options?.action && (
                <button
                  onClick={options.action.onClick}
                  className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  {options.action.label}
                </button>
              )}
            </div>
          </div>
        </div>
        {options?.dismissible !== false && (
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    ),
    { duration: options?.duration || 4000, position: options?.position || 'top-right' }
  );
}

/**
 * Toast container component
 * Add this to your root layout
 */
export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: '',
        style: {},
      }}
    />
  );
}

// Export the base toast for custom usage
export { toast };
