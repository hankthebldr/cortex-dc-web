// Integration type definitions

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'xsiam' | 'bigquery' | 'custom';
  enabled: boolean;
  settings: Record<string, unknown>;
}

export interface IntegrationHealth {
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: number;
  message?: string;
}
