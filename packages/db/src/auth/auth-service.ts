'use client';

// Authentication service with simple username/password authentication
// Migrated from henryreed.ai/hosting/lib/auth-service.ts
// Supports local authentication and session management

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  viewMode: 'admin' | 'user';
  permissions: string[];
  lastLogin: string;
  authProvider: 'local' | 'okta' | 'firebase';
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

class AuthService {
  private readonly STORAGE_KEYS = {
    AUTHENTICATED: 'cortex_dc_authenticated',
    USER: 'cortex_dc_user',
    SESSION_ID: 'cortex_dc_session_id',
  } as const;

  // Valid credentials and corresponding user profiles
  // TODO: Move to environment variables or secure backend
  private readonly VALID_USERS = {
    user1: {
      password: 'paloalto1',
      profile: {
        id: 'user1-001',
        username: 'user1',
        email: 'user1@paloaltonetworks.com',
        role: 'user' as const,
        viewMode: 'user' as const,
        permissions: ['scenario:execute', 'pov:create', 'trr:create'],
        authProvider: 'local' as const,
      },
    },
    cortex: {
      password: 'xsiam',
      profile: {
        id: 'cortex-001',
        username: 'cortex',
        email: 'cortex@paloaltonetworks.com',
        role: 'admin' as const,
        viewMode: 'admin' as const,
        permissions: [
          'scenario:execute',
          'pov:create',
          'system:admin',
          'trr:manage',
          'user:manage',
        ],
        authProvider: 'local' as const,
      },
    },
  };

  /**
   * Authenticate user with local credentials
   * Supports: user1/paloalto1 and cortex/xsiam
   * @param credentials - Username and password
   * @returns Authentication result with user data or error
   */
  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      // Simulate authentication delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 800));

      const userConfig =
        this.VALID_USERS[credentials.username as keyof typeof this.VALID_USERS];

      if (userConfig && credentials.password === userConfig.password) {
        const user: AuthUser = {
          ...userConfig.profile,
          lastLogin: new Date().toISOString(),
        };

        // Store authentication state
        this.setSession(user);

        return {
          success: true,
          user,
        };
      } else {
        return {
          success: false,
          error: 'Invalid credentials. Use user1/paloalto1 or cortex/xsiam.',
        };
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed. Please try again.',
      };
    }
  }

  /**
   * Check if user is currently authenticated
   * @returns True if user has valid session
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(this.STORAGE_KEYS.AUTHENTICATED) === 'true';
  }

  /**
   * Get current authenticated user
   * @returns User object or null if not authenticated
   */
  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;

    try {
      const userStr = sessionStorage.getItem(this.STORAGE_KEYS.USER);
      if (!userStr) return null;

      return JSON.parse(userStr) as AuthUser;
    } catch (error) {
      console.warn('Failed to parse user from session:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Get current session ID
   * @returns Session ID or null
   */
  getSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(this.STORAGE_KEYS.SESSION_ID);
  }

  /**
   * Store authentication session
   * @param user - Authenticated user data
   */
  private setSession(user: AuthUser): void {
    if (typeof window === 'undefined') return;

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    sessionStorage.setItem(this.STORAGE_KEYS.AUTHENTICATED, 'true');
    sessionStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
    sessionStorage.setItem(this.STORAGE_KEYS.SESSION_ID, sessionId);
  }

  /**
   * Clear authentication session
   */
  clearSession(): void {
    if (typeof window === 'undefined') return;

    sessionStorage.removeItem(this.STORAGE_KEYS.AUTHENTICATED);
    sessionStorage.removeItem(this.STORAGE_KEYS.USER);
    sessionStorage.removeItem(this.STORAGE_KEYS.SESSION_ID);
  }

  /**
   * Logout user and clear session
   */
  async logout(): Promise<void> {
    try {
      // TODO: Call backend logout endpoint when available
      this.clearSession();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local session even if logout fails
      this.clearSession();
    }
  }

  /**
   * Check if user has specific permission
   * @param permission - Permission string to check
   * @returns True if user has permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Admin users have all permissions
    if (user.viewMode === 'admin') return true;

    return user.permissions.includes(permission);
  }

  /**
   * Check if user has admin role
   * @returns True if user is admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin' || user?.viewMode === 'admin';
  }

  /**
   * Get user permissions
   * @returns Array of permission strings
   */
  getUserPermissions(): string[] {
    const user = this.getCurrentUser();
    return user?.permissions || [];
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
