'use client';

/**
 * Portal Shell Component
 * Full-featured application shell with sidebar navigation, header, and responsive design
 * Migrated from henryreed.ai/hosting/components/AppShell.tsx
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Navigation item interface
export interface NavItem {
  id: string;
  name: string;
  icon: string;
  path: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}

export interface PortalShellProps {
  children: React.ReactNode;
  user?: {
    displayName?: string;
    email?: string;
  };
  currentPath?: string;
  navigationItems?: NavItem[];
  onNavigate?: (item: NavItem) => void;
  onLogout?: () => void;
  isLoading?: boolean;
  title?: string;
  version?: string;
  defaultCollapsed?: boolean;
  className?: string;
}

// Default navigation items
const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '📊',
    path: '/gui',
    description: 'POV Management & Analytics'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '💻',
    path: '/terminal',
    description: 'Command Interface'
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: '🎯',
    path: '/gui?tab=projects',
    description: 'POV & TRR Management'
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    icon: '🤖',
    path: '/gui?tab=ai',
    description: 'Gemini AI Analysis'
  },
  {
    id: 'scenarios',
    name: 'Scenarios',
    icon: '🎭',
    path: '/gui?tab=scenarios',
    description: 'Security Test Scenarios'
  },
  {
    id: 'content',
    name: 'Content',
    icon: '📝',
    path: '/content',
    description: 'Knowledge Base'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: '📈',
    path: '/gui?tab=data',
    description: 'Performance Metrics'
  }
];

// Loading skeleton component
const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-700 rounded ${className}`} />
);

// Header component with user info and actions
const PortalHeader: React.FC<{
  user?: { displayName?: string; email?: string };
  onLogout?: () => void;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}> = ({ user, onLogout, isCollapsed, onToggleSidebar }) => {
  return (
    <header className="h-16 bg-gray-900/95 border-b border-gray-800 flex items-center justify-between px-6 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center text-black font-bold text-sm">
            C
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gray-100">
              Cortex DC Portal
            </h1>
            <p className="text-xs text-gray-400">
              Domain Consultant Platform
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Status indicator */}
        <div className="hidden md:flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-gray-400">System Online</span>
        </div>

        {/* User menu */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium text-gray-100">
              {user?.displayName || user?.email || 'User'}
            </div>
            <div className="text-xs text-gray-400">
              Domain Consultant
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-gray-800 transition-all duration-200 text-gray-400 hover:text-red-500"
              title="Sign Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

// Sidebar navigation component
const PortalSidebar: React.FC<{
  items: NavItem[];
  activeItem: string;
  onNavigate?: (item: NavItem) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  version?: string;
}> = ({ items, activeItem, onNavigate, isCollapsed, onToggle, version = 'v2.5.0' }) => {
  return (
    <aside className={`
      fixed lg:relative inset-y-0 left-0 z-40
      ${isCollapsed ? 'w-20' : 'w-72'}
      bg-gray-950 border-r border-gray-800
      transition-all duration-300 ease-in-out
      flex flex-col
    `}>
      {/* Sidebar header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-cyan-400 rounded-md" />
            <span className="font-bold text-gray-100 text-sm">
              Palo Alto Networks
            </span>
          </div>
        )}

        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 hidden lg:flex"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate?.(item)}
            disabled={item.disabled}
            className={`
              group w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
              transition-all duration-200 relative overflow-hidden
              ${
                activeItem === item.id
                  ? 'bg-cyan-400 text-black shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
              }
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={isCollapsed ? `${item.name} - ${item.description}` : item.description}
          >
            {/* Active indicator */}
            {activeItem === item.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-400 opacity-10 rounded-lg" />
            )}

            {/* Icon */}
            <div className={`
              flex-shrink-0 text-lg
              ${isCollapsed ? 'mr-0' : 'mr-3'}
            `}>
              {item.icon}
            </div>

            {/* Label and description */}
            {!isCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500 rounded-full text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 truncate mt-0.5">
                  {item.description}
                </div>
              </div>
            )}

            {/* Hover effect */}
            <div className="absolute inset-0 bg-cyan-400 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-200" />
          </button>
        ))}
      </nav>

      {/* Footer info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-400 text-center">
            <div className="font-mono">{version}</div>
            <div className="mt-1">Cortex DC Platform</div>
          </div>
        </div>
      )}
    </aside>
  );
};

// Main content area with loading states
const ContentArea: React.FC<{
  children: React.ReactNode;
  isLoading?: boolean;
  title?: string;
}> = ({ children, isLoading = false, title }) => {
  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {title && (
            <div className="flex items-center justify-between">
              <LoadingSkeleton className="h-8 w-48" />
              <LoadingSkeleton className="h-10 w-32" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-lg border border-gray-800 p-6 space-y-4">
                <LoadingSkeleton className="h-6 w-3/4" />
                <LoadingSkeleton className="h-4 w-full" />
                <LoadingSkeleton className="h-4 w-2/3" />
                <div className="flex space-x-2">
                  <LoadingSkeleton className="h-8 w-16" />
                  <LoadingSkeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto bg-gray-950">
      <div className="min-h-full">
        {children}
      </div>
    </main>
  );
};

// Main PortalShell component
export const PortalShell: React.FC<PortalShellProps> = ({
  children,
  user,
  currentPath = '/',
  navigationItems = DEFAULT_NAV_ITEMS,
  onNavigate,
  onLogout,
  isLoading = false,
  title,
  version,
  defaultCollapsed = false,
  className = ''
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');

  // Determine active nav item based on current path
  const currentNavItem = useMemo(() => {
    const item = navigationItems.find(item => {
      if (item.path === currentPath) return true;
      if (item.path.includes('?') && currentPath === item.path.split('?')[0]) {
        const params = new URLSearchParams(item.path.split('?')[1]);
        if (typeof window !== 'undefined') {
          const currentParams = new URLSearchParams(window.location.search);
          return params.get('tab') === currentParams.get('tab');
        }
      }
      return false;
    });
    return item?.id || 'dashboard';
  }, [currentPath, navigationItems]);

  useEffect(() => {
    setActiveNavItem(currentNavItem);
  }, [currentNavItem]);

  // Handle navigation
  const handleNavigate = useCallback((item: NavItem) => {
    if (item.disabled) return;
    setActiveNavItem(item.id);
    onNavigate?.(item);
  }, [onNavigate]);

  // Responsive sidebar handling
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`h-screen flex bg-gray-950 text-gray-100 overflow-hidden ${className}`}>
      {/* Sidebar */}
      <PortalSidebar
        items={navigationItems}
        activeItem={activeNavItem}
        onNavigate={handleNavigate}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        version={version}
      />

      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <PortalHeader
          user={user}
          onLogout={onLogout}
          isCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <ContentArea isLoading={isLoading} title={title}>
          {children}
        </ContentArea>
      </div>
    </div>
  );
};

export default PortalShell;
