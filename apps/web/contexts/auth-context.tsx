'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient, User as AuthUser } from '@/lib/auth-client';
import { getBrowserInfo, generateSessionId } from '@/lib/browser-utils';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Generate or restore session ID
    let currentSessionId = sessionStorage.getItem('sessionId');
    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      sessionStorage.setItem('sessionId', currentSessionId);
    }
    setSessionId(currentSessionId);

    // Subscribe to auth state changes
    const unsubscribe = authClient.onAuthStateChange(async (authState) => {
      setUser(authState.user);
      setIsLoading(authState.isLoading);
      setError(authState.error);

      // Update session activity if user is authenticated
      if (authState.user && currentSessionId) {
        try {
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update', sessionId: currentSessionId }),
          });
        } catch (err) {
          console.error('Failed to update session activity:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const user = await authClient.signInWithEmail(email, password);

      // Track successful login event (tracking is now handled server-side in /api/auth/login)
      if (user && sessionId) {
        // Create session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            userId: user.uid,
            sessionId,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            expiresAt,
          }),
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setIsLoading(true);
      // OAuth flow redirects to backend, then back to app
      await authClient.signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);

      // End session before signing out
      if (sessionId) {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'end', sessionId }),
        });
        sessionStorage.removeItem('sessionId');
      }

      await authClient.signOut();
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signInWithGoogle,
    signOut,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
