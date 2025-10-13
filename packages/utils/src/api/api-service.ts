/**
 * Comprehensive API Service Layer
 * Migrated from henryreed.ai/hosting/lib/api-service.ts
 * Provides standardized API endpoints for POV, TRR, Scenarios, and Analytics
 */

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
  version: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface POVData {
  id: string;
  name: string;
  customer: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  scenarios: string[];
  tags: string[];
  metadata: Record<string, any>;
}

export interface TRRData {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'validated' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  createdAt: string;
  updatedAt: string;
  blockchain_hash?: string;
  metadata: Record<string, any>;
}

export interface ScenarioData {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'deployed' | 'archived';
  mitre_techniques: string[];
  cloud_providers: string[];
  resources: Record<string, any>;
  metadata: Record<string, any>;
}

export interface AnalyticsData {
  region: string;
  theatre: string;
  user: string;
  engagements: number;
  povs_completed: number;
  trr_win_rate: number;
  avg_cycle_days: number;
  kpis: Record<string, number>;
  timestamp: string;
}

export interface CommandExecutionResult {
  command: string;
  output: string;
  exit_code: number;
  execution_time: number;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, boolean>;
  uptime: number;
  version: string;
}

/**
 * API Service Class
 * Handles all API operations with standardized response format
 */
class ApiService {
  private baseVersion = '1.0';
  private mockData = {
    povs: [] as POVData[],
    trrs: [] as TRRData[],
    scenarios: [] as ScenarioData[],
  };

  constructor() {
    this.initializeMockData();
  }

  /**
   * Initialize mock data for development/testing
   */
  private initializeMockData() {
    // Mock POVs
    this.mockData.povs = [
      {
        id: 'POV-001',
        name: 'Enterprise Banking Security Assessment',
        customer: 'Global Bank Corp',
        status: 'in_progress',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z',
        scenarios: ['ransomware-defense', 'cloud-posture'],
        tags: ['banking', 'enterprise', 'multi-cloud'],
        metadata: { priority: 'high', estimated_duration: '90d' },
      },
      {
        id: 'POV-002',
        name: 'Healthcare SIEM Integration',
        customer: 'MedTech Solutions',
        status: 'completed',
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-25T16:45:00Z',
        scenarios: ['compliance-audit', 'threat-hunting'],
        tags: ['healthcare', 'compliance', 'HIPAA'],
        metadata: { priority: 'medium', estimated_duration: '60d' },
      },
    ];

    // Mock TRRs
    this.mockData.trrs = [
      {
        id: 'TRR-2024-001',
        title: 'Multi-Cloud Security Assessment',
        status: 'validated',
        priority: 'high',
        assignee: 'john.smith@company.com',
        createdAt: '2024-01-12T11:00:00Z',
        updatedAt: '2024-01-18T14:20:00Z',
        blockchain_hash: '0x7d4a...f2e9',
        metadata: { customer: 'Global Bank Corp', estimated_effort: '40h' },
      },
      {
        id: 'TRR-2024-002',
        title: 'Zero Trust Architecture Review',
        status: 'in_progress',
        priority: 'medium',
        assignee: 'sarah.johnson@company.com',
        createdAt: '2024-01-15T13:00:00Z',
        updatedAt: '2024-01-20T10:15:00Z',
        metadata: { customer: 'MedTech Solutions', estimated_effort: '32h' },
      },
    ];

    // Mock Scenarios
    this.mockData.scenarios = [
      {
        id: 'SC-001',
        name: 'Ransomware Defense Chain',
        type: 'threat-simulation',
        status: 'deployed',
        mitre_techniques: ['T1486', 'T1055', 'T1021.001'],
        cloud_providers: ['AWS', 'Azure'],
        resources: { k8s_deployments: 3, cloud_functions: 7, data_stores: 2 },
        metadata: { complexity: 'advanced', duration_hours: 4 },
      },
      {
        id: 'SC-002',
        name: 'Cloud Posture Assessment',
        type: 'compliance-check',
        status: 'available',
        mitre_techniques: ['T1078', 'T1087'],
        cloud_providers: ['GCP', 'AWS'],
        resources: { compliance_checks: 45, policy_validations: 23 },
        metadata: { complexity: 'intermediate', duration_hours: 2 },
      },
    ];
  }

  /**
   * Create standardized API response
   */
  private createResponse<T>(
    data: T,
    success: boolean = true,
    error?: string
  ): ApiResponse<T> {
    return {
      success,
      data: success ? data : undefined,
      error: error || undefined,
      timestamp: Date.now(),
      version: this.baseVersion,
    };
  }

  /**
   * Create paginated response
   */
  private createPaginatedResponse<T>(
    data: T[],
    page: number = 1,
    limit: number = 20,
    total?: number
  ): PaginatedResponse<T> {
    const actualTotal = total || data.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = data.slice(start, end);

    return {
      success: true,
      data: paginatedData,
      timestamp: Date.now(),
      version: this.baseVersion,
      pagination: {
        page,
        limit,
        total: actualTotal,
        hasMore: end < actualTotal,
      },
    };
  }

  /**
   * Simulate network delay for realistic mock responses
   */
  private async delay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // POV API Methods
  async getPOVs(options?: {
    page?: number;
    limit?: number;
    status?: string;
    customer?: string;
    tags?: string[];
  }): Promise<PaginatedResponse<POVData>> {
    await this.delay();

    let filtered = [...this.mockData.povs];

    if (options?.status) {
      filtered = filtered.filter((pov) => pov.status === options.status);
    }

    if (options?.customer) {
      filtered = filtered.filter((pov) =>
        pov.customer.toLowerCase().includes(options.customer!.toLowerCase())
      );
    }

    if (options?.tags?.length) {
      filtered = filtered.filter((pov) =>
        options.tags!.some((tag) => pov.tags.includes(tag))
      );
    }

    return this.createPaginatedResponse(filtered, options?.page, options?.limit);
  }

  async getPOV(id: string): Promise<ApiResponse<POVData>> {
    await this.delay(200);
    const pov = this.mockData.povs.find((p) => p.id === id);
    return pov
      ? this.createResponse(pov)
      : this.createResponse(null as any, false, `POV ${id} not found`);
  }

  async createPOV(
    povData: Omit<POVData, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<POVData>> {
    await this.delay(500);

    const newPOV: POVData = {
      ...povData,
      id: `POV-${String(this.mockData.povs.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.mockData.povs.push(newPOV);
    return this.createResponse(newPOV);
  }

  async updatePOV(
    id: string,
    updates: Partial<POVData>
  ): Promise<ApiResponse<POVData>> {
    await this.delay(400);

    const index = this.mockData.povs.findIndex((p) => p.id === id);
    if (index === -1) {
      return this.createResponse(null as any, false, `POV ${id} not found`);
    }

    this.mockData.povs[index] = {
      ...this.mockData.povs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return this.createResponse(this.mockData.povs[index]);
  }

  // TRR API Methods
  async getTRRs(options?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    assignee?: string;
  }): Promise<PaginatedResponse<TRRData>> {
    await this.delay();

    let filtered = [...this.mockData.trrs];

    if (options?.status) {
      filtered = filtered.filter((trr) => trr.status === options.status);
    }

    if (options?.priority) {
      filtered = filtered.filter((trr) => trr.priority === options.priority);
    }

    if (options?.assignee) {
      filtered = filtered.filter((trr) => trr.assignee === options.assignee);
    }

    return this.createPaginatedResponse(filtered, options?.page, options?.limit);
  }

  async getTRR(id: string): Promise<ApiResponse<TRRData>> {
    await this.delay(200);
    const trr = this.mockData.trrs.find((t) => t.id === id);
    return trr
      ? this.createResponse(trr)
      : this.createResponse(null as any, false, `TRR ${id} not found`);
  }

  async createTRR(
    trrData: Omit<TRRData, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<TRRData>> {
    await this.delay(500);

    const newTRR: TRRData = {
      ...trrData,
      id: `TRR-2024-${String(this.mockData.trrs.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.mockData.trrs.push(newTRR);
    return this.createResponse(newTRR);
  }

  // Scenario API Methods
  async getScenarios(options?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    cloud_provider?: string;
  }): Promise<PaginatedResponse<ScenarioData>> {
    await this.delay();

    let filtered = [...this.mockData.scenarios];

    if (options?.type) {
      filtered = filtered.filter((sc) => sc.type === options.type);
    }

    if (options?.status) {
      filtered = filtered.filter((sc) => sc.status === options.status);
    }

    if (options?.cloud_provider) {
      filtered = filtered.filter((sc) =>
        sc.cloud_providers.includes(options.cloud_provider!)
      );
    }

    return this.createPaginatedResponse(filtered, options?.page, options?.limit);
  }

  async deployScenario(
    id: string,
    config?: Record<string, any>
  ): Promise<ApiResponse<{ deployment_id: string; status: string; config?: Record<string, any> }>> {
    await this.delay(800);

    const scenario = this.mockData.scenarios.find((s) => s.id === id);
    if (!scenario) {
      return this.createResponse(null as any, false, `Scenario ${id} not found`);
    }

    scenario.status = 'deployed';
    scenario.metadata.last_deployed = new Date().toISOString();

    return this.createResponse({
      deployment_id: `DEP-${Date.now()}`,
      status: 'deployed',
      config,
    });
  }

  // Analytics API Methods (placeholder - will integrate with real analytics)
  async getAnalytics(options?: {
    region?: string;
    theatre?: string;
    user?: string;
    sinceDays?: number;
  }): Promise<ApiResponse<AnalyticsData[]>> {
    await this.delay(400);

    // TODO: Integrate with real analytics service from data-service
    const mockAnalytics: AnalyticsData[] = [
      {
        region: options?.region || 'GLOBAL',
        theatre: options?.theatre || 'COMMERCIAL',
        user: options?.user || 'current-user',
        engagements: 42,
        povs_completed: 35,
        trr_win_rate: 0.83,
        avg_cycle_days: 45,
        kpis: {
          customer_satisfaction: 0.89,
          time_to_value: 32,
          technical_depth: 0.92,
        },
        timestamp: new Date().toISOString(),
      },
    ];

    return this.createResponse(mockAnalytics);
  }

  // Command execution for GUI-to-Terminal bridge
  async executeCommand(
    command: string,
    context?: Record<string, any>
  ): Promise<ApiResponse<CommandExecutionResult>> {
    await this.delay(Math.random() * 1000 + 500);

    const result: CommandExecutionResult = {
      command,
      output: `Command "${command}" executed successfully.\nContext: ${JSON.stringify(context || {}, null, 2)}`,
      exit_code: 0,
      execution_time: Math.floor(Math.random() * 1000 + 100),
    };

    return this.createResponse(result);
  }

  // Health check endpoint
  async healthCheck(): Promise<ApiResponse<HealthCheckResult>> {
    return this.createResponse({
      status: 'healthy',
      services: {
        database: true,
        external_apis: true,
        command_processor: true,
        analytics_engine: true,
      },
      uptime: Date.now() - 1234567890000,
      version: this.baseVersion,
    });
  }
}

// Singleton instance
export const apiService = new ApiService();

// Convenience API object with namespaced methods
export const api = {
  povs: {
    list: (options?: Parameters<typeof apiService.getPOVs>[0]) =>
      apiService.getPOVs(options),
    get: (id: string) => apiService.getPOV(id),
    create: (data: Parameters<typeof apiService.createPOV>[0]) =>
      apiService.createPOV(data),
    update: (id: string, updates: Parameters<typeof apiService.updatePOV>[1]) =>
      apiService.updatePOV(id, updates),
  },

  trrs: {
    list: (options?: Parameters<typeof apiService.getTRRs>[0]) =>
      apiService.getTRRs(options),
    get: (id: string) => apiService.getTRR(id),
    create: (data: Parameters<typeof apiService.createTRR>[0]) =>
      apiService.createTRR(data),
  },

  scenarios: {
    list: (options?: Parameters<typeof apiService.getScenarios>[0]) =>
      apiService.getScenarios(options),
    deploy: (id: string, config?: Record<string, any>) =>
      apiService.deployScenario(id, config),
  },

  analytics: {
    get: (options?: Parameters<typeof apiService.getAnalytics>[0]) =>
      apiService.getAnalytics(options),
  },

  commands: {
    execute: (command: string, context?: Record<string, any>) =>
      apiService.executeCommand(command, context),
  },

  health: () => apiService.healthCheck(),
};

export default apiService;
