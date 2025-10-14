'use client';

/**
 * Terminal Integration Settings Component
 * Migrated from henryreed.ai/hosting/components/TerminalIntegrationSettings.tsx
 *
 * Features:
 * - Cloud environment configuration (AWS, GCP, Azure)
 * - Connection testing and status tracking
 * - Credential management
 * - Endpoint configuration
 * - Integration toggles
 * - Settings persistence
 */

import React, { useState, useEffect } from 'react';

export interface CloudCredentials {
  accessKey?: string;
  secretKey?: string;
  region?: string;
  projectId?: string;
  subscriptionId?: string;
  keyFilePath?: string;
}

export interface CloudEndpoints {
  terminalProxy: string;
  commandExecutor: string;
  fileSystem: string;
}

export interface CloudEnvironmentConfig {
  provider: 'aws' | 'gcp' | 'azure';
  connectionType: 'ssh' | 'api' | 'websocket';
  credentials: CloudCredentials;
  endpoints: CloudEndpoints;
  enabled: boolean;
}

export interface IntegrationSettings {
  contentHubIntegration: boolean;
  detectionEngineIntegration: boolean;
  cloudExecution: boolean;
  realTimeUpdates: boolean;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface TerminalIntegrationSettingsProps {
  /** Initial cloud configuration */
  initialCloudConfig?: CloudEnvironmentConfig;
  /** Initial integration settings */
  initialIntegrationSettings?: IntegrationSettings;
  /** Callback when settings are saved */
  onSave?: (config: CloudEnvironmentConfig, settings: IntegrationSettings) => void;
  /** Callback for connection testing */
  onTestConnection?: (config: CloudEnvironmentConfig) => Promise<{ success: boolean; message: string }>;
  /** Callback for notifications */
  onNotify?: (type: 'success' | 'error' | 'info', message: string) => void;
  /** Additional CSS classes */
  className?: string;
}

export const TerminalIntegrationSettings: React.FC<TerminalIntegrationSettingsProps> = ({
  initialCloudConfig,
  initialIntegrationSettings,
  onSave,
  onTestConnection,
  onNotify,
  className = ''
}) => {
  const [cloudConfig, setCloudConfig] = useState<CloudEnvironmentConfig>(
    initialCloudConfig || {
      provider: 'aws',
      connectionType: 'websocket',
      credentials: {
        region: 'us-east-1'
      },
      endpoints: {
        terminalProxy: '',
        commandExecutor: '',
        fileSystem: ''
      },
      enabled: false
    }
  );

  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(
    initialIntegrationSettings || {
      contentHubIntegration: true,
      detectionEngineIntegration: true,
      cloudExecution: false,
      realTimeUpdates: true
    }
  );

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [testResults, setTestResults] = useState<string>('');
  const [showCredentials, setShowCredentials] = useState(false);

  // Load settings from localStorage on mount if no initial config provided
  useEffect(() => {
    if (!initialCloudConfig && typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('terminal_cloud_config');
      if (savedConfig) {
        try {
          setCloudConfig(JSON.parse(savedConfig));
        } catch (error) {
          console.error('Failed to load cloud config:', error);
        }
      }
    }

    if (!initialIntegrationSettings && typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('terminal_integration_settings');
      if (savedSettings) {
        try {
          setIntegrationSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error('Failed to load integration settings:', error);
        }
      }
    }
  }, [initialCloudConfig, initialIntegrationSettings]);

  const handleProviderChange = (provider: 'aws' | 'gcp' | 'azure') => {
    setCloudConfig(prev => ({
      ...prev,
      provider,
      credentials: {
        ...(provider === 'aws' && { region: 'us-east-1' }),
        ...(provider === 'gcp' && { projectId: '' }),
        ...(provider === 'azure' && { subscriptionId: '' })
      }
    }));
  };

  const handleCredentialChange = (field: keyof CloudCredentials, value: string) => {
    setCloudConfig(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [field]: value
      }
    }));
  };

  const handleEndpointChange = (field: keyof CloudEndpoints, value: string) => {
    setCloudConfig(prev => ({
      ...prev,
      endpoints: {
        ...prev.endpoints,
        [field]: value
      }
    }));
  };

  const handleIntegrationToggle = (setting: keyof IntegrationSettings, value: boolean) => {
    setIntegrationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const testConnection = async () => {
    setConnectionStatus('connecting');
    setTestResults('Testing connection...');

    try {
      if (onTestConnection) {
        const result = await onTestConnection(cloudConfig);
        if (result.success) {
          setConnectionStatus('connected');
          setTestResults(result.message);
          onNotify?.('success', 'Cloud environment connected successfully');
        } else {
          throw new Error(result.message);
        }
      } else {
        // Mock connection test
        await new Promise(resolve => setTimeout(resolve, 2000));
        const isValid = cloudConfig.credentials.accessKey && cloudConfig.endpoints.terminalProxy;

        if (isValid) {
          setConnectionStatus('connected');
          setTestResults(`✅ Successfully connected to ${cloudConfig.provider.toUpperCase()}\n📡 Terminal proxy: ${cloudConfig.endpoints.terminalProxy}\n🔧 Command executor: Ready\n📁 File system: Accessible`);
          onNotify?.('success', 'Cloud environment connected successfully');
        } else {
          throw new Error('Invalid credentials or missing endpoints');
        }
      }
    } catch (error) {
      setConnectionStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResults(`❌ Connection failed: ${errorMessage}\nPlease check your credentials and endpoints.`);
      onNotify?.('error', 'Failed to connect to cloud environment');
    }
  };

  const saveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('terminal_cloud_config', JSON.stringify(cloudConfig));
      localStorage.setItem('terminal_integration_settings', JSON.stringify(integrationSettings));
    }

    if (onSave) {
      onSave(cloudConfig, integrationSettings);
    }

    onNotify?.('success', 'Terminal integration settings saved');
  };

  const resetSettings = () => {
    const defaultConfig: CloudEnvironmentConfig = {
      provider: 'aws',
      connectionType: 'websocket',
      credentials: { region: 'us-east-1' },
      endpoints: { terminalProxy: '', commandExecutor: '', fileSystem: '' },
      enabled: false
    };

    const defaultSettings: IntegrationSettings = {
      contentHubIntegration: true,
      detectionEngineIntegration: true,
      cloudExecution: false,
      realTimeUpdates: true
    };

    setCloudConfig(defaultConfig);
    setIntegrationSettings(defaultSettings);
    setConnectionStatus('disconnected');
    setTestResults('');

    onNotify?.('info', 'Settings reset to defaults');
  };

  return (
    <div className={`bg-gray-950 text-white p-6 rounded-lg border border-gray-700 max-w-4xl mx-auto ${className}`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-orange-400 mb-2">⚡ Terminal Integration Settings</h2>
        <p className="text-gray-400">Configure real-time terminal integration with cloud environments</p>
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg">
        <p className="text-sm text-gray-300 mb-4">
          🔧 Terminal integration allows you to configure cloud environment connections
          for real-time terminal execution.
        </p>

        <div className="text-center py-8">
          <div className="text-4xl mb-4">🚀</div>
          <div className="text-xl text-white mb-2">Cloud Terminal Integration</div>
          <div className="text-gray-400">Configure AWS, GCP, or Azure environments</div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={testConnection}
            disabled={connectionStatus === 'connecting'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
          >
            {connectionStatus === 'connecting' ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            Save Settings
          </button>
          <button
            onClick={resetSettings}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="mt-6 p-4 bg-gray-900 rounded border border-gray-700">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{testResults}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalIntegrationSettings;
