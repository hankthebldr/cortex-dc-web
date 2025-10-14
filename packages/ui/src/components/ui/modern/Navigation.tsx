'use client';

/**
 * Modern Navigation Components
 * Sidebar, breadcrumbs, and command palette
 * Migrated from henryreed.ai/hosting/components/ui/modern/Navigation.tsx
 */

import React, { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  description?: string;
  badge?: string | number;
  isActive?: boolean;
  children?: NavigationItem[];
}

export interface ModernNavigationProps {
  items: NavigationItem[];
  className?: string;
  onItemClick?: (item: NavigationItem) => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  currentPath?: string;
}

export const ModernSidebar: React.FC<ModernNavigationProps> = ({
  items,
  className,
  onItemClick,
  collapsed = false,
  onToggleCollapsed,
  currentPath = '/'
}) => {
  const handleItemClick = (item: NavigationItem) => {
    onItemClick?.(item);
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-gray-950/60 backdrop-blur-xl border-r border-gray-800/50 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-green-500 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">DC</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-semibold text-white">Cortex Portal</h1>
              <p className="text-xs text-gray-400">Domain Consultant</p>
            </div>
          )}
          {onToggleCollapsed && (
            <button
              onClick={onToggleCollapsed}
              className="ml-auto p-1 rounded-md hover:bg-gray-800 transition-colors"
            >
              <svg
                className={cn(
                  'h-4 w-4 text-gray-400 transition-transform',
                  collapsed ? 'rotate-180' : ''
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.map((item) => (
          <NavigationItemComponent
            key={item.id}
            item={item}
            collapsed={collapsed}
            isActive={currentPath === item.href}
            onClick={() => handleItemClick(item)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800/50">
        {!collapsed && (
          <div className="text-xs text-gray-500 text-center">
            <p>© 2025 Henry Reed AI</p>
            <p className="mt-1">Cortex Platform v2.6</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface NavigationItemComponentProps {
  item: NavigationItem;
  collapsed: boolean;
  isActive: boolean;
  onClick: () => void;
}

const NavigationItemComponent: React.FC<NavigationItemComponentProps> = ({
  item,
  collapsed,
  isActive,
  onClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button
        className={cn(
          'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group',
          isActive
            ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 shadow-sm'
            : 'text-gray-300 hover:text-white hover:bg-gray-800',
          collapsed ? 'justify-center' : ''
        )}
        onClick={onClick}
        title={collapsed ? item.label : undefined}
      >
        <span className={cn(
          'flex-shrink-0',
          isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'
        )}>
          {item.icon}
        </span>

        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="bg-cyan-400/20 text-cyan-400 px-2 py-0.5 rounded-full text-xs font-medium">
                {item.badge}
              </span>
            )}
            {item.children && (
              <svg
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded ? 'rotate-90' : ''
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </>
        )}
      </button>

      {/* Sub-items */}
      {item.children && !collapsed && isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {item.children.map((child) => (
            <NavigationItemComponent
              key={child.id}
              item={child}
              collapsed={false}
              isActive={false}
              onClick={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Breadcrumb Component
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface ModernBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  onNavigate?: (href: string) => void;
}

export const ModernBreadcrumbs: React.FC<ModernBreadcrumbsProps> = ({
  items,
  className,
  onNavigate
}) => {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center space-x-2">
            {item.icon && (
              <span className="text-gray-400">{item.icon}</span>
            )}
            {item.href ? (
              <button
                onClick={() => onNavigate?.(item.href!)}
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-white font-medium">{item.label}</span>
            )}
          </div>
          {index < items.length - 1 && (
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Command Palette/Quick Actions
export interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export interface ModernCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: QuickAction[];
}

export const ModernCommandPalette: React.FC<ModernCommandPaletteProps> = ({
  isOpen,
  onClose,
  actions
}) => {
  const [search, setSearch] = useState('');
  const [filteredActions, setFilteredActions] = useState(actions);

  useEffect(() => {
    const filtered = actions.filter(action =>
      action.label.toLowerCase().includes(search.toLowerCase()) ||
      action.description?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredActions(filtered);
  }, [search, actions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20">
      <div className="w-full max-w-lg mx-4 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl animate-scale-in">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs text-gray-500 bg-gray-900 rounded border border-gray-800">
              ESC
            </kbd>
          </div>
        </div>

        {/* Actions List */}
        <div className="max-h-64 overflow-y-auto">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>No commands found</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    action.action();
                    onClose();
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
                >
                  <span className="text-cyan-400">{action.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-white">{action.label}</div>
                    {action.description && (
                      <div className="text-xs text-gray-400">{action.description}</div>
                    )}
                  </div>
                  {action.shortcut && (
                    <kbd className="px-2 py-1 text-xs text-gray-500 bg-gray-900 rounded border border-gray-800">
                      {action.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
