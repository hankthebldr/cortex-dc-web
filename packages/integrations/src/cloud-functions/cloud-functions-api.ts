/**
 * Cloud Functions API Integration
 * Provides API client for Firebase Cloud Functions including scenario deployment,
 * blueprint generation, and validation
 *
 * Migrated from henryreed.ai/hosting/lib/cloud-functions-api.ts
 */

// Type imports - these would come from scenario-types when migrated
export interface ScenarioConfig {
  id: string;
  name: string;
  type: string;
  provider: string;
  region: string;
}

export interface ScenarioDeployment {
  id: string;
  scenarioId: string;
  status: 'deploying' | 'running' | 'validating' | 'complete' | 'failed';
  startTime: Date;
  endTime?: Date;
  provider: string;
  region: string;
  resources?: {
    cloudFunctionUrl?: string;
    storageUrl?: string;
    logs?: string[];
  };
  results?: {
    validationPassed?: boolean;
    detectionAlerts?: any[];
    telemetryData?: any[];
    performanceMetrics?: any;
  };
}

export interface ScenarioCommand {
  scenarioType: string;
  provider: string;
  region?: string;
  dryRun?: boolean;
  parameters?: Record<string, any>;
}

export interface BlueprintRecordSelection {
  engagementId: string;
  executiveTone?: string;
  emphasis?: {
    wins?: string[];
    risks?: string[];
    roadmap?: string[];
  };
}

export class CloudFunctionsAPI {
  private baseUrl: string;
  private readonly projectId: string;

  constructor(projectId: string = 'cortex-dc-project') {
    this.projectId = projectId;
    // Allow override via env for emulator or custom domain; default to /api (Firebase Hosting rewrite)
    const fromEnv = (typeof window !== 'undefined'
      ? ((window as any).NEXT_PUBLIC_FUNCTIONS_BASE_URL || process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL)
      : process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL) as string | undefined;
    const sanitized = fromEnv && fromEnv.trim().length > 0 ? fromEnv.trim().replace(/\/$/, '') : '';
    this.baseUrl = sanitized || '/api';
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const { auth } = await import('@cortex/db');
      const user = auth?.currentUser;
      if (user && typeof (user as any).getIdToken === 'function') {
        const token = await (user as any).getIdToken();
        return { Authorization: `Bearer ${token}` };
      }
    } catch (error) {
      console.warn('Failed to get auth headers:', error);
    }
    return {};
  }

  async generateBadassBlueprint(payload: {
    engagementId: string;
    executiveTone?: string;
    emphasis?: { wins?: string[]; risks?: string[]; roadmap?: string[] };
  }): Promise<{
    success: boolean;
    blueprintId?: string;
    status?: string;
    payloadPath?: string;
    message?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/extensions/badass-blueprint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await this.getAuthHeaders()),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${text || 'badass blueprint request failed'}`);
      }

      return (await response.json()) as {
        success: boolean;
        blueprintId?: string;
        status?: string;
        payloadPath?: string;
        message?: string;
      };
    } catch (error) {
      return {
        success: false,
        message: `Blueprint generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async deployScenario(command: ScenarioCommand): Promise<{
    success: boolean;
    deploymentId?: string;
    message: string;
    estimatedCompletion?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/scenario-deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await this.getAuthHeaders()),
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getDeploymentStatus(deploymentId: string): Promise<{
    success: boolean;
    deployment?: ScenarioDeployment;
    message: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/scenario-status/${deploymentId}`, { headers: await this.getAuthHeaders() });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        deployment: data.deployment,
        message: 'Status retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async listDeployments(): Promise<{
    success: boolean;
    deployments?: ScenarioDeployment[];
    message: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/scenario-list`, { headers: await this.getAuthHeaders() });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        deployments: data.deployments,
        message: 'Deployments retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `List failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async validateScenario(deploymentId: string): Promise<{
    success: boolean;
    results?: any;
    message: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/scenario-validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await this.getAuthHeaders()),
        },
        body: JSON.stringify({ deploymentId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        results: data.results,
        message: 'Validation completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async destroyScenario(deploymentId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/scenario-destroy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await this.getAuthHeaders()),
        },
        body: JSON.stringify({ deploymentId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Destroy failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async exportScenarioData(deploymentId: string, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<{
    success: boolean;
    downloadUrl?: string;
    message: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/scenario-export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await this.getAuthHeaders()),
        },
        body: JSON.stringify({ deploymentId, format }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        downloadUrl: data.downloadUrl,
        message: 'Export generated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Simulate Cloud Functions responses for demo purposes
  async simulateDeployment(command: ScenarioCommand): Promise<{
    success: boolean;
    deploymentId?: string;
    message: string;
    estimatedCompletion?: string;
  }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    if (command.dryRun) {
      return {
        success: true,
        message: `[DRY RUN] Would deploy ${command.scenarioType} scenario with provider ${command.provider}`,
        estimatedCompletion: '15-30 minutes'
      };
    }

    const deploymentId = `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      deploymentId,
      message: `Scenario deployment initiated successfully`,
      estimatedCompletion: '15-30 minutes'
    };
  }

  async simulateStatus(deploymentId: string): Promise<{
    success: boolean;
    deployment?: ScenarioDeployment;
    message: string;
  }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const statuses = ['deploying', 'running', 'validating', 'complete'] as const;
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const deployment: ScenarioDeployment = {
      id: deploymentId,
      scenarioId: 'cp-misconfigured-s3',
      status: randomStatus,
      startTime: new Date(Date.now() - Math.random() * 3600000), // Within last hour
      provider: 'gcp',
      region: 'us-central1',
      resources: {
        cloudFunctionUrl: `https://us-central1-cortex-dc-project.cloudfunctions.net/${deploymentId}`,
        storageUrl: `gs://cortex-dc-project-scenarios/${deploymentId}`,
        logs: [
          'Infrastructure provisioning started',
          'Cloud Storage bucket created',
          'IAM roles configured',
          'Scenario deployment complete'
        ]
      }
    };

    if (randomStatus === 'complete') {
      deployment.endTime = new Date();
      deployment.results = {
        validationPassed: Math.random() > 0.3,
        detectionAlerts: [
          { type: 'Storage Misconfiguration', severity: 'HIGH', detected: true },
          { type: 'Excessive Permissions', severity: 'MEDIUM', detected: Math.random() > 0.5 }
        ],
        telemetryData: [
          { timestamp: new Date(), event: 'bucket_access', source: 'test-user' },
          { timestamp: new Date(), event: 'permission_escalation', source: 'test-service' }
        ],
        performanceMetrics: {
          deploymentTime: '12m 34s',
          resourcesProvisioned: 5,
          validationDuration: '2m 15s'
        }
      };
    }

    return {
      success: true,
      deployment,
      message: 'Status retrieved successfully'
    };
  }
}

export const cloudFunctionsAPI = new CloudFunctionsAPI();
export default cloudFunctionsAPI;
