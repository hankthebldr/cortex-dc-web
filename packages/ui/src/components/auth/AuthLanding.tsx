'use client';

/**
 * Auth Landing Component
 * Migrated from henryreed.ai/hosting/components/AuthLanding.tsx
 *
 * Features:
 * - Branded authentication landing page
 * - Username/password authentication
 * - Loading states and error handling
 * - Auto-redirect on successful auth
 * - System status indicators
 * - Responsive design
 */

import React, { useState, useEffect } from 'react';

export interface AuthLandingProps {
  /** Callback for authentication */
  onSignIn?: (username: string, password: string) => Promise<void>;
  /** Callback when authentication succeeds */
  onAuthSuccess?: () => void;
  /** Initial loading state */
  loading?: boolean;
  /** Custom logo component */
  logoComponent?: React.ReactNode;
  /** Application version */
  version?: string;
  /** Branding text */
  brandingText?: string;
  /** System status indicators */
  systemStatus?: {
    online?: boolean;
    aiReady?: boolean;
  };
  /** Additional CSS classes */
  className?: string;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({
  onSignIn,
  onAuthSuccess,
  loading: externalLoading = false,
  logoComponent,
  version = 'v2.1',
  brandingText = 'Developed by Henry Reed',
  systemStatus = { online: true, aiReady: true },
  className = ''
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLoading = loading || externalLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      if (onSignIn) {
        await onSignIn(username, password);
      }

      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as any);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-950 flex items-center justify-center ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,204,102,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          {logoComponent ? (
            <div className="flex justify-center mb-4">
              {logoComponent}
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="text-orange-500 text-4xl font-bold">CORTEX</div>
            </div>
          )}

          <div className="mb-4">
            <pre className="text-green-400 text-sm font-mono leading-tight">
{`
 ██╗  ██╗███████╗██╗ █████╗ ███╗   ███╗
 ╚██╗██╔╝██╔════╝██║██╔══██╗████╗ ████║
  ╚███╔╝ ███████╗██║███████║██╔████╔██║
  ██╔██╗ ╚════██║██║██╔══██║██║╚██╔╝██║
 ██╔╝ ██╗███████║██║██║  ██║██║ ╚═╝ ██║
 ╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
`}
            </pre>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Cortex Terminal Access</h1>
          <p className="text-gray-400 text-sm mb-2">
            Secure access to the XSIAM & Cortex POV-CLI
          </p>
          <div className="text-xs text-orange-500 font-medium">
            Powered by Palo Alto Networks Security Platform
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors font-mono"
                placeholder="Enter username"
                required
                autoComplete="username"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors font-mono"
                placeholder="Enter password"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500 rounded-lg">
                <div className="flex items-center">
                  <div className="mr-2">⚠️</div>
                  <div className="text-sm text-red-300">{error}</div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">🔐</span>
                  <span>Access Terminal</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                Authorized access only
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <div className={`w-2 h-2 ${systemStatus.online ? 'bg-green-500 animate-pulse' : 'bg-gray-500'} rounded-full mr-1`}></div>
                  <span>System {systemStatus.online ? 'Online' : 'Offline'}</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-2 h-2 ${systemStatus.aiReady ? 'bg-blue-400' : 'bg-gray-500'} rounded-full mr-1`}></div>
                  <span>AI {systemStatus.aiReady ? 'Ready' : 'Unavailable'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p className="text-white font-medium">XSIAM/Cortex Proof-of-Value Terminal</p>
          <p className="mt-1">{version} • {brandingText}</p>
          <div className="flex items-center justify-center mt-2 space-x-2">
            <span>Secured by Palo Alto Networks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLanding;
