'use client';

/**
 * Breadcrumb Navigation Component
 * Migrated from henryreed.ai/hosting/components/BreadcrumbNavigation.tsx
 *
 * Features:
 * - Hierarchical navigation display
 * - Click-to-navigate breadcrumb items
 * - Responsive design with mobile support
 * - Active item highlighting
 * - Automatic hiding when minimal breadcrumbs
 */

import React from 'react';

export interface BreadcrumbItem {
  label: string;
  path: string;
  active?: boolean;
}

export interface BreadcrumbNavigationProps {
  /** Array of breadcrumb items to display */
  breadcrumbs: BreadcrumbItem[];
  /** Callback when a breadcrumb is clicked */
  onBreadcrumbClick?: (path: string, index: number) => void;
  /** Custom class name for styling */
  className?: string;
  /** Render custom link component */
  renderLink?: (crumb: BreadcrumbItem, isLast: boolean) => React.ReactNode;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  breadcrumbs,
  onBreadcrumbClick,
  className = '',
  renderLink
}) => {
  const handleBreadcrumbClick = (path: string, index: number) => {
    onBreadcrumbClick?.(path, index);
  };

  // Don't render if there's only one or no breadcrumbs
  if (breadcrumbs.length <= 1) return null;

  return (
    <div className={`bg-gray-800 border-b border-gray-700 px-3 md:px-4 py-2 ${className}`}>
      <nav className="flex overflow-x-auto" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1 md:space-x-2 text-sm whitespace-nowrap">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <li key={`${crumb.path}-${index}`} className="flex items-center">
                {index > 0 && (
                  <span className="text-gray-500 mx-1 md:mx-2">
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}

                {renderLink ? (
                  renderLink(crumb, isLast)
                ) : isLast ? (
                  <span className="text-green-500 font-medium text-xs md:text-sm">
                    {crumb.label}
                  </span>
                ) : (
                  <button
                    onClick={() => handleBreadcrumbClick(crumb.path, index)}
                    className="text-gray-400 hover:text-green-500 transition-colors font-medium text-xs md:text-sm focus:outline-none focus:text-green-500"
                  >
                    {crumb.label}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default BreadcrumbNavigation;
