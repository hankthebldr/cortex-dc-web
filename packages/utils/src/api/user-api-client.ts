/**
 * User Management API Client
 * Client-side wrapper for user management API endpoints
 * Replaces Firebase Functions with REST API calls
 */

import { apiService } from './api-service';

export interface UserProfile {
  id?: string;
  uid?: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'user' | 'admin' | 'analyst' | 'manager';
  organizationId: string | null;
  department: string | null;
  permissions: string[];
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  metadata: {
    createdAt: any;
    lastActive: any;
    loginCount: number;
    emailVerified: boolean;
    providerData: any[];
  };
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}

export interface CreateUserRequest {
  email: string;
  displayName: string;
  role?: string;
  department?: string;
  organizationId?: string;
  theme?: 'light' | 'dark';
  notifications?: boolean;
  language?: string;
}

export interface UpdateUserRequest {
  uid?: string;
  displayName?: string;
  department?: string;
  role?: string;
  status?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
  };
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: any;
  timestamp: any;
}

/**
 * User Management API Client Class
 */
export class UserApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  }

  /**
   * Get authorization header
   */
  private async getAuthHeader(): Promise<Record<string, string>> {
    try {
      const { getAuth } = await import('@cortex/db');
      const auth = getAuth();
      const token = await auth.getIdToken();

      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }

    return {};
  }

  /**
   * Make API request with authentication
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeader();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Create a new user profile
   */
  async createUser(userData: CreateUserRequest): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const result = await this.request<{ success: boolean; profile: UserProfile }>('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return result;
    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: error.message || 'Failed to create user',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: UpdateUserRequest): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const result = await this.request<{ success: boolean; profile: UserProfile }>(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return result;
    } catch (error: any) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: error.message || 'Failed to update user',
      };
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const result = await this.request<{ data: UserProfile }>(`/api/users/${uid}`);
      return result.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const result = await this.request<{ data: UserProfile }>('/api/users/me');
      return result.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  /**
   * Get all users with optional filters
   */
  async getUsers(filters?: {
    role?: string;
    status?: string;
    organizationId?: string;
    limit?: number;
  }): Promise<UserProfile[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.role) queryParams.append('role', filters.role);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.organizationId) queryParams.append('organizationId', filters.organizationId);
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      const endpoint = `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const result = await this.request<{ data: UserProfile[] }>(endpoint);
      return result.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await this.request(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(
    userIds: string[],
    updates: Partial<Pick<UserProfile, 'role' | 'status' | 'organizationId'>>
  ): Promise<{ success: number; failed: number }> {
    try {
      const result = await this.request<{ success: boolean; updated: number }>('/api/users/bulk/update', {
        method: 'PUT',
        body: JSON.stringify({ userIds, updates }),
      });

      return {
        success: result.updated,
        failed: userIds.length - result.updated,
      };
    } catch (error) {
      console.error('Error bulk updating users:', error);
      return {
        success: 0,
        failed: userIds.length,
      };
    }
  }

  /**
   * Get organization members
   */
  async getOrganizationMembers(organizationId: string): Promise<UserProfile[]> {
    return this.getUsers({ organizationId });
  }

  /**
   * Export users data
   */
  async exportUsers(filters?: {
    role?: string;
    status?: string;
    organizationId?: string;
  }): Promise<UserProfile[]> {
    return this.getUsers(filters);
  }
}

// Create singleton instance
export const userApiClient = new UserApiClient();
export default userApiClient;
