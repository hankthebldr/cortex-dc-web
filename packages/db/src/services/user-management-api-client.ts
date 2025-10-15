/**
 * User Management API Client
 * Replaces Firebase Functions with REST API calls
 * Works with both Firebase and self-hosted deployments
 */

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

export interface UserProfile {
  uid: string;
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  profile?: T;
  error?: string;
}

/**
 * Get API base URL based on environment
 */
function getApiBaseUrl(): string {
  // Check for explicit API URL
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Check for API server URL
  if (process.env.API_URL) {
    return process.env.API_URL;
  }

  // Default to localhost in development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080';
  }

  // Production default
  return '/api';
}

/**
 * Get authentication token
 */
async function getAuthToken(): Promise<string | null> {
  try {
    // Try to get token from auth adapter
    const { getAuth } = await import('../adapters/auth.factory');
    const auth = getAuth();
    const token = await auth.getIdToken();
    return token;
  } catch (error) {
    console.warn('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(errorData.error || `API request failed: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * User Management API Client Class
 */
export class UserManagementApiClient {
  /**
   * Create a new user profile
   */
  async createUser(
    userData: CreateUserRequest
  ): Promise<ApiResponse<UserProfile>> {
    try {
      const result = await apiRequest<ApiResponse<UserProfile>>('/api/users', {
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
  async updateUser(
    userId: string,
    updates: UpdateUserRequest
  ): Promise<ApiResponse<UserProfile>> {
    try {
      const result = await apiRequest<ApiResponse<UserProfile>>(
        `/api/users/${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );

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
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const result = await apiRequest<{ data: UserProfile }>(
        `/api/users/${userId}`
      );
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
      const result = await apiRequest<{ data: UserProfile }>('/api/users/me');
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
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.organizationId)
        params.append('organizationId', filters.organizationId);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const endpoint = `/api/users${queryString ? `?${queryString}` : ''}`;

      const result = await apiRequest<{ data: UserProfile[] }>(endpoint);
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
      await apiRequest(`/api/users/${userId}`, {
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
      const result = await apiRequest<{ success: boolean; updated: number }>(
        '/api/users/bulk/update',
        {
          method: 'PUT',
          body: JSON.stringify({ userIds, updates }),
        }
      );

      return {
        success: result.updated || 0,
        failed: userIds.length - (result.updated || 0),
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
export const userManagementApiClient = new UserManagementApiClient();
export default userManagementApiClient;
