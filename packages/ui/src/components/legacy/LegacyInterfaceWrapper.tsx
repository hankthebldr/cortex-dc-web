'use client';

/**
 * Legacy Interface Wrapper Component
 * Compatibility wrapper for legacy interface modes
 * Migrated from henryreed.ai/hosting/components/LegacyInterfaceWrapper.tsx
 */

import React from 'react';

export interface LegacyInterfaceWrapperProps {
  mode: string;
  onBack: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const LegacyInterfaceWrapper: React.FC<LegacyInterfaceWrapperProps> = ({
  mode,
  onBack,
  children,
  className = ''
}) => {
  return (
    <div className={`h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${className}`}>
      {/* Legacy Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">
                Legacy Interface - {mode.toUpperCase()}
              </h1>
              <p className="text-gray-400 mt-1">
                Classic interface for backwards compatibility
              </p>
            </div>

            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white transition-colors flex items-center space-x-2"
              aria-label="Return to enhanced interface"
            >
              <span>←</span>
              <span>Enhanced Interface</span>
            </button>
          </div>
        </div>
      </header>

      {/* Legacy Content */}
      <main className="flex-1 overflow-auto p-6">
        {children || (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔧</div>
            <div className="text-lg text-gray-300">Legacy Mode</div>
            <div className="text-sm text-gray-400 mt-2">Mode: {mode}</div>
            <p className="text-gray-500 mt-4 max-w-md mx-auto">
              This is a compatibility wrapper for legacy interface modes.
              Consider migrating to the enhanced interface for better features.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LegacyInterfaceWrapper;
