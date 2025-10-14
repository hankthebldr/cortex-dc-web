'use client';

/**
 * Login Form Component
 * Migrated from henryreed.ai/hosting/components/LoginForm.tsx
 *
 * Features:
 * - Email/password authentication
 * - OAuth (Google) sign-in support
 * - Toggle between sign-in and sign-up modes
 * - Loading states and error handling
 * - Modal overlay presentation
 */

import React, { useState } from 'react';

export interface LoginFormProps {
  /** Callback when form is closed */
  onClose: () => void;
  /** Callback for email/password sign in */
  onSignIn?: (email: string, password: string) => Promise<void>;
  /** Callback for email/password sign up */
  onSignUp?: (email: string, password: string) => Promise<void>;
  /** Callback for Google OAuth sign in */
  onGoogleSignIn?: () => Promise<void>;
  /** Initial mode (login vs signup) */
  initialMode?: 'login' | 'signup';
  /** Custom branding text */
  brandingText?: string;
  /** Additional CSS classes */
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onClose,
  onSignIn,
  onSignUp,
  onGoogleSignIn,
  initialMode = 'login',
  brandingText = 'Developed by Henry Reed',
  className = ''
}) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (isLogin && onSignIn) {
        await onSignIn(email, password);
      } else if (!isLogin && onSignUp) {
        await onSignUp(email, password);
      }
      onClose();
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!onGoogleSignIn) return;

    setError('');
    setLoading(true);

    try {
      await onGoogleSignIn();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-green-400">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-xl transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              placeholder="your@email.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2 rounded font-medium transition-colors"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        {onGoogleSignIn && (
          <>
            <div className="my-4 text-center text-gray-500">or</div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white py-2 rounded font-medium transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </>
        )}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-500 hover:text-green-400 text-sm transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"
            }
          </button>
        </div>

        {brandingText && (
          <div className="mt-6 text-center text-xs text-gray-500">{brandingText}</div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
