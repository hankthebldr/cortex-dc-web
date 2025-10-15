'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as AuthUser } from '@/lib/auth';
import {
  signInWithEmail as signInWithEmailAuth,
  signInWithGoogle as signInWithGoogleAuth,
  signOut as signOutAuth,
  onAuthChange,
} from '@/lib/auth';
import { eventTrackingService } from '@cortex/db';
import { getBrowserInfo, generateSessionId } from '@cortex/utils';

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
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);

      // Update session activity if user is authenticated
      if (firebaseUser && currentSessionId) {
        try {
          await eventTrackingService.updateSessionActivity(currentSessionId);
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
      const user = await signInWithEmailAuth(email, password);
      setUser(user);

      // Track successful login event
      if (user && sessionId) {
        const browserInfo = getBrowserInfo();
        await eventTrackingService.logLogin({
          userId: user.uid,
          email: user.email || email,
          loginMethod: 'email',
          success: true,
          sessionId,
          ipAddress: undefined, // Will be set by backend if needed
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          deviceType: browserInfo.deviceType,
          browser: browserInfo.browser,
          os: browserInfo.os,
        });

        // Create session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 day session
        await eventTrackingService.createSession({
          userId: user.uid,
          sessionId,
          ipAddress: undefined,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          expiresAt,
        });
      }
    } catch (err: any) {
      // Track failed login event
      if (sessionId) {
        const browserInfo = getBrowserInfo();
        await eventTrackingService.logLogin({
          userId: 'unknown',
          email: email,
          loginMethod: 'email',
          success: false,
          failureReason: err.message || 'Authentication failed',
          sessionId,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          deviceType: browserInfo.deviceType,
          browser: browserInfo.browser,
          os: browserInfo.os,
        }).catch(console.error);
      }

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
      const user = await signInWithGoogleAuth();
      setUser(user);

      // Track successful login event
      if (user && sessionId) {
        const browserInfo = getBrowserInfo();
        await eventTrackingService.logLogin({
          userId: user.uid,
          email: user.email || 'unknown',
          loginMethod: 'google',
          success: true,
          sessionId,
          ipAddress: undefined,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          deviceType: browserInfo.deviceType,
          browser: browserInfo.browser,
          os: browserInfo.os,
        });

        // Create session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 day session
        await eventTrackingService.createSession({
          userId: user.uid,
          sessionId,
          ipAddress: undefined,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          expiresAt,
        });
      }
    } catch (err: any) {
      // Track failed login event
      if (sessionId) {
        const browserInfo = getBrowserInfo();
        await eventTrackingService.logLogin({
          userId: 'unknown',
          email: 'unknown',
          loginMethod: 'google',
          success: false,
          failureReason: err.message || 'Authentication failed',
          sessionId,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          deviceType: browserInfo.deviceType,
          browser: browserInfo.browser,
          os: browserInfo.os,
        }).catch(console.error);
      }

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
        await eventTrackingService.endSession(sessionId);
        sessionStorage.removeItem('sessionId');
      }

      await signOutAuth();
      setUser(null);
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
