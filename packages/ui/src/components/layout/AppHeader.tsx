'use client';

/**
 * App Header Component
 * Migrated from henryreed.ai/hosting/components/AppHeader.tsx
 *
 * Features:
 * - Responsive navigation with mobile/desktop layouts
 * - User authentication display
 * - Role-based access control for navigation items
 * - Settings panel integration
 * - Breadcrumb integration
 * - Terminal quick access
 * - Logout functionality
 */

import React, { useState, useEffect } from 'react';

export interface HeaderUser {
  username: string;
  role?: string;
  viewMode?: 'admin' | 'user';
}

export interface NavigationRoute {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  requiresTerminalAccess?: boolean;
}

export interface AppHeaderProps {
  /** Current active route path */
  currentPath?: string;
  /** Current authenticated user */
  user: HeaderUser | null;
  /** Callback when navigation item is clicked */
  onNavigate?: (path: string) => void;
  /** Callback when logout is triggered */
  onLogout?: () => void;
  /** Callback when settings is opened */
  onSettingsOpen?: () => void;
  /** Callback when terminal quick access is clicked */
  onTerminalOpen?: () => void;
  /** Callback when view mode changes */
  onViewModeChange?: (mode: 'admin' | 'user') => void;
  /** Branding logo component */
  logoComponent?: React.ReactNode;
  /** Additional navigation routes */
  customRoutes?: NavigationRoute[];
  /** Hide header completely */
  hidden?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// SVG Icons as components
const DashboardIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2v0z" />
  </svg>
);

const TerminalIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TRRIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ContentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DocsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CommandsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const defaultRoutes: NavigationRoute[] = [
  {
    id: 'gui',
    label: 'Dashboard',
    path: '/gui',
    icon: <DashboardIcon />,
    color: 'bg-orange-500 text-white',
    hoverColor: 'hover:text-orange-500 hover:bg-gray-800'
  },
  {
    id: 'terminal',
    label: 'Terminal',
    path: '/terminal',
    icon: <TerminalIcon />,
    color: 'bg-green-500 text-white',
    hoverColor: 'hover:text-green-500 hover:bg-gray-800',
    requiresTerminalAccess: true
  },
  {
    id: 'trr',
    label: 'TRR',
    path: '/trr',
    icon: <TRRIcon />,
    color: 'bg-orange-500 text-white',
    hoverColor: 'hover:text-orange-500 hover:bg-gray-800'
  },
  {
    id: 'content',
    label: 'Content',
    path: '/content',
    icon: <ContentIcon />,
    color: 'bg-green-500 text-white',
    hoverColor: 'hover:text-green-500 hover:bg-gray-800'
  },
  {
    id: 'docs',
    label: 'Docs',
    path: '/docs',
    icon: <DocsIcon />,
    color: 'bg-blue-500 text-white',
    hoverColor: 'hover:text-blue-500 hover:bg-gray-800'
  },
  {
    id: 'alignment-guide',
    label: 'Commands',
    path: '/alignment-guide',
    icon: <CommandsIcon />,
    color: 'bg-yellow-500 text-black',
    hoverColor: 'hover:text-yellow-500 hover:bg-gray-800'
  }
];

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentPath = '',
  user,
  onNavigate,
  onLogout,
  onSettingsOpen,
  onTerminalOpen,
  onViewModeChange,
  logoComponent,
  customRoutes,
  hidden = false,
  className = ''
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Check if user has terminal access
  const hasTerminalAccess = user && ['admin', 'manager', 'senior_dc', 'dc'].includes(user.role || '');

  const routes = customRoutes || defaultRoutes;
  const filteredRoutes = routes.filter(route => !route.requiresTerminalAccess || hasTerminalAccess);

  const isActive = (path: string) => currentPath.startsWith(path);

  const handleNavigate = (path: string) => {
    onNavigate?.(path);
  };

  if (hidden) return null;

  return (
    <header className={`bg-gray-900 border-b border-gray-700 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Brand Section */}
          <div className="flex items-center space-x-4">
            {logoComponent ? (
              <button
                onClick={() => handleNavigate('/gui')}
                className="hover:opacity-80 transition-opacity duration-200"
                aria-label="Go to Dashboard"
                title="Go to Dashboard"
              >
                {logoComponent}
              </button>
            ) : (
              <button
                onClick={() => handleNavigate('/gui')}
                className="text-xl font-bold text-cyan-400 hover:opacity-80 transition-opacity"
              >
                Cortex DC
              </button>
            )}
          </div>

          {/* Main Navigation */}
          <div className="flex items-center space-x-8">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {filteredRoutes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => handleNavigate(route.path)}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${
                    isActive(route.path)
                      ? route.color
                      : `text-gray-400 ${route.hoverColor}`
                  }`}
                >
                  {route.icon}
                  <span>{route.label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile Navigation - Icon Only */}
            <nav className="flex md:hidden items-center space-x-1">
              {filteredRoutes.slice(0, 4).map((route) => (
                <button
                  key={route.id}
                  onClick={() => handleNavigate(route.path)}
                  className={`px-2 py-2 rounded-lg ${
                    isActive(route.path) ? route.color : 'text-gray-400 hover:bg-gray-800'
                  }`}
                  title={route.label}
                >
                  {route.icon}
                </button>
              ))}
            </nav>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  {user?.username.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="ml-2 hidden md:block">
                  <div className="text-white font-medium text-sm">{user?.username || 'Guest'}</div>
                  {user && (
                    <div className="text-gray-400 text-xs">
                      {user.viewMode === 'admin' ? 'Administrator' : 'Consultant'}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-1">
                {hasTerminalAccess && onTerminalOpen && (
                  <button
                    onClick={onTerminalOpen}
                    className="p-2 rounded-lg text-gray-400 hover:text-green-500 hover:bg-gray-800 transition-all duration-300"
                    title="Open Terminal"
                  >
                    <TerminalIcon />
                  </button>
                )}

                {user && onSettingsOpen && (
                  <button
                    onClick={onSettingsOpen}
                    className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-gray-800 transition-all duration-300"
                    title="Settings"
                  >
                    <SettingsIcon />
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-gray-800 transition-all duration-300 text-sm flex items-center"
                    title="Logout"
                  >
                    <LogoutIcon />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
