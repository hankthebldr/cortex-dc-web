'use client';

/**
 * Settings Panel Component
 * Migrated from henryreed.ai/hosting/components/SettingsPanel.tsx
 *
 * Features:
 * - User profile management
 * - View mode switching (admin/user)
 * - Authentication settings
 * - System information display
 * - Tab-based interface
 * - Role-based access control
 */

import React, { useState, useEffect } from 'react';
import { CortexButton } from '../CortexButton';

export interface SettingsUser {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'manager' | 'senior_dc' | 'dc' | 'analyst';
  viewMode?: 'admin' | 'user';
  lastLogin?: string;
  assignedProjects?: string[];
  assignedCustomers?: string[];
}

export interface SettingsPanelProps {
  /** Whether the settings panel is open */
  isOpen: boolean;
  /** Callback when the panel should be closed */
  onClose: () => void;
  /** Current user object */
  user: SettingsUser | null;
  /** Callback when view mode changes */
  onViewModeChange?: (mode: 'admin' | 'user') => void;
  /** Callback when user logs out */
  onLogout?: () => void;
  /** Auth provider name (default: 'local') */
  authProvider?: string;
  /** App version (default: '2.2.0') */
  appVersion?: string;
  /** Build environment (default: 'development') */
  buildEnv?: 'development' | 'production' | 'staging';
  /** System statistics */
  systemStats?: {
    activeUsers?: number;
    povProjects?: number;
    trrRequests?: number;
  };
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  user,
  onViewModeChange,
  onLogout,
  authProvider = 'local',
  appVersion = '2.2.0',
  buildEnv = 'development',
  systemStats = {}
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'view-mode' | 'auth' | 'system'>('profile');
  const [viewMode, setViewMode] = useState<'admin' | 'user'>(user?.viewMode || 'user');

  useEffect(() => {
    if (user?.viewMode) {
      setViewMode(user.viewMode);
    }
  }, [user?.viewMode]);

  if (!isOpen) return null;

  const handleViewModeToggle = (mode: 'admin' | 'user') => {
    setViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    ...(['admin', 'manager'].includes(user?.role || '') ? [{ id: 'view-mode' as const, name: 'View Mode', icon: '⚙️' }] : []),
    { id: 'auth', name: 'Authentication', icon: '🔐' },
    ...(['admin', 'manager'].includes(user?.role || '') ? [{ id: 'system' as const, name: 'System', icon: '🖥️' }] : [])
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h2 className="text-xl font-bold text-gray-100">Settings</h2>
              <p className="text-sm text-gray-400">
                Manage your preferences and system configuration
              </p>
            </div>
          </div>
          <CortexButton
            variant="ghost"
            size="sm"
            icon="✕"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-100"
          >
            Close
          </CortexButton>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-48 bg-gray-800 border-r border-gray-700 p-4">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'profile' | 'view-mode' | 'auth' | 'system')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-500 text-black font-medium'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">User Profile</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Username</label>
                        <div className="mt-1 text-gray-100">{user?.username || 'Not set'}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Role</label>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            user?.role === 'admin'
                              ? 'bg-red-500/20 text-red-400'
                              : user?.role === 'manager'
                                ? 'bg-orange-500/20 text-orange-400'
                                : user?.role === 'senior_dc'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : user?.role === 'dc'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user?.role?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {user?.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-400">Email</label>
                        <div className="mt-1 text-gray-100">{user.email}</div>
                      </div>
                    )}

                    {user?.lastLogin && (
                      <div>
                        <label className="text-sm font-medium text-gray-400">Last Login</label>
                        <div className="mt-1 text-gray-100">{user.lastLogin}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'view-mode' && ['admin', 'manager'].includes(user?.role || '') && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">View Mode</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Switch between admin and user experiences. This affects available features and interface complexity.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">👨‍💼</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-100">Admin Experience</div>
                          <div className="text-sm text-gray-400">
                            Full system access, advanced features, user management
                          </div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="viewMode"
                        checked={viewMode === 'admin'}
                        onChange={() => handleViewModeToggle('admin')}
                        className="w-4 h-4 text-green-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">👨‍💻</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-100">User Experience</div>
                          <div className="text-sm text-gray-400">
                            Simplified interface, guided workflows, essential features
                          </div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="viewMode"
                        checked={viewMode === 'user'}
                        onChange={() => handleViewModeToggle('user')}
                        className="w-4 h-4 text-green-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <span className="text-cyan-400 mt-0.5">ℹ️</span>
                      <div className="text-sm text-cyan-400">
                        <strong>Current Mode:</strong> {viewMode === 'admin' ? 'Admin' : 'User'} Experience
                        <br />
                        Changes take effect immediately without requiring a page refresh.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'auth' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">Authentication</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Auth Provider</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                          {authProvider === 'local' ? 'Local Development' : authProvider}
                        </span>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-500">Connected</span>
                      </div>
                    </div>

                    {authProvider === 'local' && (
                      <div>
                        <CortexButton
                          variant="outline"
                          size="sm"
                          icon="🔑"
                          onClick={() => {
                            // TODO: Implement password change
                            alert('Password change functionality not yet implemented');
                          }}
                        >
                          Change Password
                        </CortexButton>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-700">
                      <CortexButton
                        variant="danger"
                        icon="🚪"
                        onClick={onLogout}
                      >
                        Sign Out
                      </CortexButton>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && user?.role === 'admin' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-4">System Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Application Version</label>
                        <div className="mt-1 text-gray-100 font-mono">{appVersion}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Environment</label>
                        <div className="mt-1">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            buildEnv === 'production'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {buildEnv.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-400">System Status</label>
                      <div className="mt-2 flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-500">Terminal Online</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-500">Commands Ready</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-500">Auth Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <div className="text-sm text-gray-400">
                        <div className="flex justify-between">
                          <span>Active Users:</span>
                          <span className="text-gray-100">{systemStats.activeUsers ?? 1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>POV Projects:</span>
                          <span className="text-gray-100">{systemStats.povProjects ?? 3}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>TRR Requests:</span>
                          <span className="text-gray-100">{systemStats.trrRequests ?? 7}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Floating Settings Gear Component
 * Quick access button for opening settings panel
 */
export const SettingsGear: React.FC<{
  onClick: () => void;
  className?: string;
}> = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed top-4 right-4 z-40 w-12 h-12 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-green-500 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl group ${className}`}
      title="Open Settings"
    >
      <span className="text-xl group-hover:rotate-45 transition-transform duration-200">⚙️</span>
    </button>
  );
};

export default SettingsPanel;
