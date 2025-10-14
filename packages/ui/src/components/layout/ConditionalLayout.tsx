'use client';

/**
 * Conditional Layout Component
 * Simple wrapper that conditionally renders navigation based on route
 * Migrated from henryreed.ai/hosting/components/ConditionalLayout.tsx
 */

import React from 'react';

export interface ConditionalLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
  showHeader?: boolean;
  showBreadcrumbs?: boolean;
  showNotifications?: boolean;
  headerComponent?: React.ReactNode;
  breadcrumbsComponent?: React.ReactNode;
  notificationsComponent?: React.ReactNode;
  excludePaths?: string[];
  className?: string;
}

export const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({
  children,
  currentPath = '/',
  showHeader = true,
  showBreadcrumbs = true,
  showNotifications = true,
  headerComponent,
  breadcrumbsComponent,
  notificationsComponent,
  excludePaths = ['/auth', '/login'],
  className = ''
}) => {
  // Check if current path should exclude layout components
  const shouldExclude = excludePaths.some(path => currentPath.startsWith(path));

  if (shouldExclude) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {/* Header */}
      {showHeader && headerComponent && (
        <div className="sticky top-0 z-50">
          {headerComponent}
        </div>
      )}

      {/* Breadcrumbs */}
      {showBreadcrumbs && breadcrumbsComponent && (
        <div className="border-b border-gray-800 bg-gray-950">
          <div className="container mx-auto px-6 py-2">
            {breadcrumbsComponent}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Notifications */}
      {showNotifications && notificationsComponent && (
        <div className="fixed bottom-4 right-4 z-50">
          {notificationsComponent}
        </div>
      )}
    </div>
  );
};

export default ConditionalLayout;
