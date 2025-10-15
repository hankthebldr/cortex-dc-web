/**
 * Cortex DC API Client
 * Unified client for backend API communication
 */

export interface APIError {
  message: string;
  statusCode: number;
  requestId?: string;
  details?: any;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface ListResponse<T = any> {
  items: T[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
  };
}

/**
 * Main API Client class
 */
class CortexAPIClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Use environment variable or default to localhost
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('cortex_token');
      this.refreshToken = localStorage.getItem('cortex_refresh_token');
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string, refreshToken?: string) {
    this.token = token;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('cortex_token', token);
      if (refreshToken) {
        localStorage.setItem('cortex_refresh_token', refreshToken);
      }
    }
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    this.token = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('cortex_token');
      localStorage.removeItem('cortex_refresh_token');
    }
  }

  /**
   * Make HTTP request to API
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && this.refreshToken && endpoint !== '/api/auth/refresh') {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry original request with new token
          return this.request<T>(endpoint, options);
        }
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle errors
      if (!response.ok) {
        throw {
          message: data.error?.message || data.message || 'API request failed',
          statusCode: response.status,
          requestId: response.headers.get('X-Request-ID'),
          details: data.error?.details || data.details,
        } as APIError;
      }

      // Return data directly if it has a success field, otherwise wrap it
      return data.data !== undefined ? data.data : data;
    } catch (error: any) {
      // Network errors or thrown errors
      if (error.statusCode) {
        throw error;
      }

      throw {
        message: error.message || 'Network error',
        statusCode: 0,
      } as APIError;
    }
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      this.setAuthToken(data.data.token, data.data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  // ==================== Authentication ====================

  /**
   * Register a new user
   */
  async register(email: string, password: string, displayName?: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.clearAuthToken();
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: any) {
    return this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // ==================== Data Management ====================

  /**
   * List documents in a collection
   */
  async listData<T = any>(
    collection: string,
    params?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      filters?: Record<string, any>;
    }
  ): Promise<ListResponse<T>> {
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.offset) queryParams.set('offset', String(params.offset));
    if (params?.orderBy) queryParams.set('orderBy', params.orderBy);
    if (params?.filters) queryParams.set('filters', JSON.stringify(params.filters));

    return this.request(`/api/data/${collection}?${queryParams}`);
  }

  /**
   * Get a single document by ID
   */
  async getData<T = any>(collection: string, id: string): Promise<T> {
    return this.request(`/api/data/${collection}/${id}`);
  }

  /**
   * Create a new document
   */
  async createData<T = any>(collection: string, data: any): Promise<T> {
    return this.request(`/api/data/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a document (full replacement)
   */
  async updateData<T = any>(collection: string, id: string, data: any): Promise<T> {
    return this.request(`/api/data/${collection}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Patch a document (partial update)
   */
  async patchData<T = any>(collection: string, id: string, updates: any): Promise<T> {
    return this.request(`/api/data/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a document
   */
  async deleteData(collection: string, id: string): Promise<void> {
    return this.request(`/api/data/${collection}/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Search documents
   */
  async searchData<T = any>(
    collection: string,
    query: string,
    options?: {
      filters?: Record<string, any>;
      limit?: number;
      offset?: number;
    }
  ): Promise<ListResponse<T>> {
    return this.request(`/api/data/${collection}/search`, {
      method: 'POST',
      body: JSON.stringify({ query, ...options }),
    });
  }

  // ==================== AI Features ====================

  /**
   * Chat with AI
   */
  async aiChat(message: string, context?: string, conversationId?: string) {
    return this.request('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context, conversationId }),
    });
  }

  /**
   * Analyze content
   */
  async aiAnalyze(content: string, analysisType: string) {
    return this.request('/api/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ content, analysisType }),
    });
  }

  /**
   * Generate content
   */
  async aiGenerate(prompt: string, options?: any) {
    return this.request('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, options }),
    });
  }

  /**
   * Summarize text
   */
  async aiSummarize(text: string, maxLength?: number) {
    return this.request('/api/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ text, maxLength }),
    });
  }

  /**
   * Get conversation history
   */
  async getConversations(params?: PaginationParams) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.offset) queryParams.set('offset', String(params.offset));

    return this.request(`/api/ai/conversations?${queryParams}`);
  }

  // ==================== Storage ====================

  /**
   * Upload a file
   */
  async uploadFile(file: File, path: string, metadata?: Record<string, any>) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return this.request('/api/storage/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
  }

  /**
   * Get signed URL for a file
   */
  async getFileURL(path: string, expiresIn?: number): Promise<{ url: string }> {
    const queryParams = new URLSearchParams();
    if (expiresIn) queryParams.set('expiresIn', String(expiresIn));

    return this.request(`/api/storage/url/${path}?${queryParams}`);
  }

  /**
   * Delete a file
   */
  async deleteFile(path: string): Promise<void> {
    return this.request(`/api/storage/${path}`, {
      method: 'DELETE',
    });
  }

  /**
   * List files
   */
  async listFiles(prefix?: string, maxResults?: number) {
    const queryParams = new URLSearchParams();
    if (prefix) queryParams.set('prefix', prefix);
    if (maxResults) queryParams.set('maxResults', String(maxResults));

    return this.request(`/api/storage/list?${queryParams}`);
  }

  // ==================== Export ====================

  /**
   * Export data to CSV
   */
  async exportToCSV(collection: string, filters?: Record<string, any>, fields?: string[]) {
    const response = await fetch(`${this.baseURL}/api/export/csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify({ collection, filters, fields }),
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  /**
   * Export data to JSON
   */
  async exportToJSON(collection: string, filters?: Record<string, any>) {
    return this.request('/api/export/json', {
      method: 'POST',
      body: JSON.stringify({ collection, filters }),
    });
  }

  /**
   * Export data to BigQuery
   */
  async exportToBigQuery(collection: string, table: string, options?: any) {
    return this.request('/api/export/bigquery', {
      method: 'POST',
      body: JSON.stringify({ collection, table, options }),
    });
  }

  // ==================== Health Check ====================

  /**
   * Check API health
   */
  async healthCheck() {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiClient = new CortexAPIClient();

// Export class for testing
export { CortexAPIClient };
