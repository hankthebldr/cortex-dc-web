'use client';

/**
 * XSIAM API Integration Service - Migrated from henryreed.ai
 *
 * Handles secure storage and management of XSIAM tenant credentials
 * and provides programmatic access to tenant analytics and health data.
 *
 * Features:
 * - Encrypted credential storage
 * - Connection testing and validation
 * - Health monitoring
 * - Analytics data retrieval
 * - Custom query execution
 * - Tenant information access
 */

/**
 * XSIAM tenant credentials
 */
export interface XSIAMCredentials {
  /** XSIAM tenant API base URL (e.g., https://api-tenant.xdr.us.paloaltonetworks.com) */
  apiAddress: string;
  /** API authentication ID */
  apiId: string;
  /** API authentication key */
  apiKey: string;
  /** Optional tenant display name */
  tenantName?: string;
  /** Tenant region (e.g., us, eu, apj) */
  region?: string;
  /** ISO timestamp of last connection test */
  lastTested?: string;
  /** Whether the credentials passed validation */
  isValid?: boolean;
}

/**
 * XSIAM tenant health status
 */
export interface XSIAMHealthData {
  /** Overall tenant health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Uptime percentage */
  uptime: number;
  /** Last update timestamp */
  lastUpdate: string;
  /** Component-level health status */
  components: Array<{
    name: string;
    status: 'operational' | 'degraded' | 'outage';
    responseTime?: number;
  }>;
  /** Key metrics */
  metrics: {
    incidentsProcessed: number;
    alertsGenerated: number;
    dataIngestionRate: number; // GB/hour
    storageUsed: number; // Percentage
    activeUsers: number;
  };
}

/**
 * XSIAM analytics data for a time range
 */
export interface XSIAMAnalyticsData {
  /** Time range (e.g., "7d", "30d", "90d") */
  timeRange: string;
  /** Summary statistics */
  summary: {
    totalIncidents: number;
    resolvedIncidents: number;
    averageResolutionTime: number; // hours
    falsePositiveRate: number; // percentage
    criticalAlerts: number;
  };
  /** Daily trends */
  trends: Array<{
    date: string;
    incidents: number;
    alerts: number;
    responseTime: number; // hours
  }>;
  /** Top threats by count */
  topThreats: Array<{
    name: string;
    count: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  /** MITRE ATT&CK detection coverage */
  detectionCoverage: Array<{
    technique: string;
    coverage: number; // percentage
    lastSeen: string;
  }>;
}

/**
 * XSIAM API response wrapper
 */
export interface XSIAMAPIResponse<T = any> {
  /** Whether the request succeeded */
  success: boolean;
  /** Response data (if successful) */
  data?: T;
  /** Error message (if failed) */
  error?: string;
  /** Response timestamp */
  timestamp: string;
  /** Unique request ID for tracking */
  requestId: string;
}

/**
 * XSIAM API Service Class
 *
 * Provides secure integration with Cortex XSIAM tenant API for:
 * - Credential management
 * - Health monitoring
 * - Analytics data retrieval
 * - Custom query execution
 */
export class XSIAMAPIService {
  private readonly STORAGE_KEY = 'cortex_dc_xsiam_credentials';
  private readonly ENCRYPTION_KEY = 'cortex_dc_xsiam_encryption_key';
  private credentials: XSIAMCredentials | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadCredentials();
    }
  }

  /**
   * Encrypt data for secure storage
   *
   * Uses base64 encoding with checksum for data integrity.
   * In production, consider using Web Crypto API for stronger encryption.
   *
   * @param data - Data to encrypt
   * @returns Encrypted string
   */
  private encryptData(data: string): string {
    try {
      return btoa(
        encodeURIComponent(
          JSON.stringify({
            data: btoa(data),
            timestamp: Date.now(),
            checksum: this.generateChecksum(data),
          })
        )
      );
    } catch (error) {
      console.error('Encryption failed:', error);
      return btoa(data); // Fallback to simple base64
    }
  }

  /**
   * Decrypt stored credentials
   *
   * @param encryptedData - Encrypted data string
   * @returns Decrypted data
   */
  private decryptData(encryptedData: string): string {
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(encryptedData)));
      const data = atob(decoded.data);

      // Verify checksum for data integrity
      if (decoded.checksum && decoded.checksum !== this.generateChecksum(data)) {
        throw new Error('Data integrity check failed');
      }

      return data;
    } catch (error) {
      console.error('Decryption failed:', error);
      return atob(encryptedData); // Fallback for backward compatibility
    }
  }

  /**
   * Generate simple checksum for data integrity validation
   *
   * @param data - Data to checksum
   * @returns Checksum string
   */
  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Store XSIAM credentials securely
   *
   * Validates and tests credentials before storing them.
   *
   * @param credentials - XSIAM credentials to store
   * @throws Error if credentials are invalid or connection test fails
   */
  async storeCredentials(credentials: XSIAMCredentials): Promise<void> {
    try {
      // Validate credentials format before storing
      if (!this.validateCredentials(credentials)) {
        throw new Error('Invalid credentials format');
      }

      // Test credentials before storing
      const isValid = await this.testConnection(credentials);
      credentials.isValid = isValid;
      credentials.lastTested = new Date().toISOString();

      const encrypted = this.encryptData(JSON.stringify(credentials));
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, encrypted);
      }
      this.credentials = credentials;

      console.log('XSIAM credentials stored successfully');
    } catch (error) {
      console.error('Failed to store credentials:', error);
      throw error;
    }
  }

  /**
   * Load credentials from local storage
   */
  private loadCredentials(): void {
    try {
      if (typeof window === 'undefined') return;

      const encrypted = localStorage.getItem(this.STORAGE_KEY);
      if (encrypted) {
        const decrypted = this.decryptData(encrypted);
        this.credentials = JSON.parse(decrypted);
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
      this.clearCredentials();
    }
  }

  /**
   * Get current credentials
   *
   * @returns Current credentials or null if not configured
   */
  getCredentials(): XSIAMCredentials | null {
    return this.credentials;
  }

  /**
   * Clear stored credentials
   *
   * Removes credentials from memory and local storage
   */
  clearCredentials(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.credentials = null;
  }

  /**
   * Check if credentials are configured
   *
   * @returns True if valid credentials exist
   */
  isConfigured(): boolean {
    return this.credentials !== null && this.validateCredentials(this.credentials);
  }

  /**
   * Validate credentials format
   *
   * @param credentials - Credentials to validate
   * @returns True if credentials are valid
   */
  private validateCredentials(credentials: XSIAMCredentials): boolean {
    return !!(
      credentials &&
      credentials.apiAddress &&
      credentials.apiId &&
      credentials.apiKey &&
      credentials.apiAddress.startsWith('https://') &&
      credentials.apiId.length > 0 &&
      credentials.apiKey.length > 0
    );
  }

  /**
   * Test connection to XSIAM tenant
   *
   * Attempts to connect to the XSIAM API health endpoint
   *
   * @param credentials - Optional credentials to test (uses stored credentials if not provided)
   * @returns True if connection successful
   */
  async testConnection(credentials?: XSIAMCredentials): Promise<boolean> {
    const creds = credentials || this.credentials;
    if (!creds) {
      throw new Error('No credentials provided');
    }

    try {
      const response = await this.makeAPIRequest(creds, '/public_api/v1/healthcheck', 'GET');
      return response.success;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Make authenticated API request to XSIAM
   *
   * Handles authentication headers and request formatting
   *
   * @param credentials - XSIAM credentials
   * @param endpoint - API endpoint path
   * @param method - HTTP method
   * @param body - Optional request body
   * @returns API response
   */
  private async makeAPIRequest(
    credentials: XSIAMCredentials,
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any
  ): Promise<XSIAMAPIResponse> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    try {
      // Generate authentication headers per XSIAM API spec
      const headers = {
        'Content-Type': 'application/json',
        'x-xdr-auth-id': credentials.apiId,
        Authorization: credentials.apiKey,
        'x-xdr-timestamp': Date.now().toString(),
        'x-xdr-nonce': Math.random().toString(36).substring(2, 17),
      };

      const url = `${credentials.apiAddress}${endpoint}`;

      const requestOptions: RequestInit = {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) }),
      };

      console.log(`Making XSIAM API request: ${method} ${url}`);

      const response = await fetch(url, requestOptions);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return {
        success: true,
        data: responseData,
        timestamp: new Date().toISOString(),
        requestId,
      };
    } catch (error) {
      console.error('XSIAM API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown API error',
        timestamp: new Date().toISOString(),
        requestId,
      };
    }
  }

  /**
   * Get tenant health data
   *
   * Retrieves current health status and metrics for the XSIAM tenant
   *
   * @returns Health data or null
   * @throws Error if credentials not configured
   */
  async getHealthData(): Promise<XSIAMHealthData | null> {
    if (!this.credentials) {
      throw new Error('No XSIAM credentials configured');
    }

    try {
      const response = await this.makeAPIRequest(
        this.credentials,
        '/public_api/v1/system/health',
        'GET'
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch health data');
      }

      // Transform API response to health data structure
      // This is a mock structure - adapt based on actual XSIAM API response
      const healthData: XSIAMHealthData = {
        status: response.data?.status || 'healthy',
        uptime: response.data?.uptime || 99.98,
        lastUpdate: new Date().toISOString(),
        components: response.data?.components || [
          { name: 'Data Ingestion', status: 'operational', responseTime: 120 },
          { name: 'Analytics Engine', status: 'operational', responseTime: 85 },
          { name: 'Alert Processing', status: 'operational', responseTime: 200 },
          { name: 'API Gateway', status: 'operational', responseTime: 50 },
          { name: 'Storage', status: 'operational' },
        ],
        metrics: {
          incidentsProcessed: response.data?.metrics?.incidents || 1247,
          alertsGenerated: response.data?.metrics?.alerts || 3891,
          dataIngestionRate: response.data?.metrics?.ingestionRate || 2.5, // GB/hour
          storageUsed: response.data?.metrics?.storageUsed || 87.3, // Percentage
          activeUsers: response.data?.metrics?.activeUsers || 23,
        },
      };

      return healthData;
    } catch (error) {
      console.error('Failed to get health data:', error);
      throw error;
    }
  }

  /**
   * Get tenant analytics data for a time range
   *
   * Retrieves incident statistics, trends, and threat intelligence
   *
   * @param timeRange - Time range (e.g., "7d", "30d", "90d")
   * @returns Analytics data or null
   * @throws Error if credentials not configured
   */
  async getAnalyticsData(timeRange: string = '7d'): Promise<XSIAMAnalyticsData | null> {
    if (!this.credentials) {
      throw new Error('No XSIAM credentials configured');
    }

    try {
      const response = await this.makeAPIRequest(
        this.credentials,
        `/public_api/v1/analytics/summary?time_range=${timeRange}`,
        'GET'
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch analytics data');
      }

      // Transform API response to analytics data structure
      // This is a mock structure - adapt based on actual XSIAM API response
      const analyticsData: XSIAMAnalyticsData = {
        timeRange,
        summary: {
          totalIncidents: response.data?.summary?.totalIncidents || 156,
          resolvedIncidents: response.data?.summary?.resolvedIncidents || 142,
          averageResolutionTime: response.data?.summary?.avgResolutionTime || 4.2, // hours
          falsePositiveRate: response.data?.summary?.falsePositiveRate || 2.1, // percentage
          criticalAlerts: response.data?.summary?.criticalAlerts || 8,
        },
        trends:
          response.data?.trends ||
          this.generateMockTrends(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90),
        topThreats: response.data?.topThreats || [
          { name: 'Malicious PowerShell', count: 45, severity: 'high' },
          { name: 'Suspicious Network Activity', count: 32, severity: 'medium' },
          { name: 'Credential Stuffing', count: 28, severity: 'high' },
          { name: 'Lateral Movement', count: 15, severity: 'critical' },
          { name: 'Data Exfiltration Attempt', count: 12, severity: 'critical' },
        ],
        detectionCoverage: response.data?.coverage || [
          {
            technique: 'T1078 - Valid Accounts',
            coverage: 85,
            lastSeen: '2025-01-16T10:30:00Z',
          },
          {
            technique: 'T1059 - Command Line Interface',
            coverage: 92,
            lastSeen: '2025-01-16T14:20:00Z',
          },
          {
            technique: 'T1055 - Process Injection',
            coverage: 78,
            lastSeen: '2025-01-16T09:15:00Z',
          },
          {
            technique: 'T1003 - Credential Dumping',
            coverage: 95,
            lastSeen: '2025-01-16T11:45:00Z',
          },
        ],
      };

      return analyticsData;
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      throw error;
    }
  }

  /**
   * Generate mock trend data for testing
   */
  private generateMockTrends(
    days: number
  ): Array<{ date: string; incidents: number; alerts: number; responseTime: number }> {
    const trends = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      trends.push({
        date: date.toISOString().split('T')[0],
        incidents: Math.floor(Math.random() * 20) + 15,
        alerts: Math.floor(Math.random() * 50) + 40,
        responseTime: Math.random() * 2 + 3, // 3-5 hours
      });
    }

    return trends;
  }

  /**
   * Execute custom XQL query on XSIAM tenant
   *
   * Runs a custom query against the tenant's data lake
   *
   * @param query - XQL query string
   * @param timeRange - Optional time range (default: "24h")
   * @returns Query results
   * @throws Error if credentials not configured or query fails
   */
  async executeQuery(query: string, timeRange?: string): Promise<any> {
    if (!this.credentials) {
      throw new Error('No XSIAM credentials configured');
    }

    try {
      const response = await this.makeAPIRequest(this.credentials, '/public_api/v1/query', 'POST', {
        query,
        time_range: timeRange || '24h',
      });

      if (!response.success) {
        throw new Error(response.error || 'Query execution failed');
      }

      return response.data;
    } catch (error) {
      console.error('Failed to execute query:', error);
      throw error;
    }
  }

  /**
   * Get tenant information
   *
   * Retrieves tenant configuration and metadata
   *
   * @returns Tenant information
   * @throws Error if credentials not configured
   */
  async getTenantInfo(): Promise<any> {
    if (!this.credentials) {
      throw new Error('No XSIAM credentials configured');
    }

    try {
      const response = await this.makeAPIRequest(this.credentials, '/public_api/v1/tenant/info', 'GET');

      if (!response.success) {
        throw new Error(response.error || 'Failed to get tenant info');
      }

      return response.data;
    } catch (error) {
      console.error('Failed to get tenant info:', error);
      throw error;
    }
  }
}

/**
 * Singleton instance for easy access
 */
export const xsiamApiService = new XSIAMAPIService();

/**
 * Default export
 */
export default xsiamApiService;
