/**
 * Terraform Generation Service
 * Generates Terraform deployment configurations from scenarios
 * Enables infrastructure-as-code deployment for demo scenarios
 */

import { getDatabase } from '../adapters/database.factory';

export interface TerraformConfig {
  version: string;
  provider: 'gcp' | 'aws' | 'azure';
  region: string;
  projectId?: string;
  resources: TerraformResource[];
}

export interface TerraformResource {
  type: string;
  name: string;
  config: Record<string, any>;
  dependencies?: string[];
}

export interface ScenarioTerraformOutput {
  filename: string;
  content: string;
  format: 'hcl' | 'json';
  variables: Record<string, any>;
  outputs: Record<string, any>;
}

export class TerraformGenerationService {
  /**
   * Generate Terraform configuration from a scenario
   */
  async generateTerraformForScenario(
    scenarioId: string,
    options: {
      provider?: 'gcp' | 'aws' | 'azure';
      format?: 'hcl' | 'json';
      includeVariables?: boolean;
      includeOutputs?: boolean;
    } = {}
  ): Promise<ScenarioTerraformOutput> {
    const db = getDatabase();

    // Get scenario
    const scenario = await db.findOne('scenarios', scenarioId);
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }

    const provider = options.provider || 'gcp';
    const format = options.format || 'hcl';

    const scenarioData = scenario as any;

    // Build Terraform configuration
    const config: TerraformConfig = {
      version: '1.5',
      provider,
      region: scenarioData.environment === 'production' ? 'us-central1' : 'us-east1',
      projectId: scenarioData.projectId,
      resources: [],
    };

    // Generate resources based on scenario type and steps
    config.resources = await this.generateResourcesFromScenario(scenarioData);

    // Convert to desired format
    if (format === 'hcl') {
      const hcl = this.generateHCL(config, options);
      return {
        filename: `${scenarioData.id}-deployment.tf`,
        content: hcl,
        format: 'hcl',
        variables: this.extractVariables(config),
        outputs: this.generateOutputs(config),
      };
    } else {
      const json = this.generateJSON(config, options);
      return {
        filename: `${scenarioData.id}-deployment.tf.json`,
        content: json,
        format: 'json',
        variables: this.extractVariables(config),
        outputs: this.generateOutputs(config),
      };
    }
  }

  /**
   * Generate Terraform resources from scenario configuration
   */
  private async generateResourcesFromScenario(scenario: any): Promise<TerraformResource[]> {
    const resources: TerraformResource[] = [];

    // Always include base infrastructure
    resources.push({
      type: 'google_project',
      name: 'project',
      config: {
        name: scenario.projectId || 'cortex-dc-demo',
        project_id: scenario.projectId || 'cortex-dc-demo',
        billing_account: '${var.billing_account}',
      },
    });

    // Network resources
    resources.push({
      type: 'google_compute_network',
      name: 'vpc_network',
      config: {
        name: `${scenario.id}-vpc`,
        project: '${google_project.project.project_id}',
        auto_create_subnetworks: false,
      },
      dependencies: ['google_project.project'],
    });

    resources.push({
      type: 'google_compute_subnetwork',
      name: 'subnet',
      config: {
        name: `${scenario.id}-subnet`,
        network: '${google_compute_network.vpc_network.id}',
        ip_cidr_range: '10.0.0.0/24',
        region: '${var.region}',
        project: '${google_project.project.project_id}',
      },
      dependencies: ['google_compute_network.vpc_network'],
    });

    // GKE Cluster if scenario requires it
    if (this.requiresGKE(scenario)) {
      resources.push({
        type: 'google_container_cluster',
        name: 'primary',
        config: {
          name: `${scenario.id}-gke`,
          location: '${var.region}',
          project: '${google_project.project.project_id}',
          network: '${google_compute_network.vpc_network.name}',
          subnetwork: '${google_compute_subnetwork.subnet.name}',
          remove_default_node_pool: true,
          initial_node_count: 1,
        },
        dependencies: ['google_compute_subnetwork.subnet'],
      });

      resources.push({
        type: 'google_container_node_pool',
        name: 'primary_nodes',
        config: {
          name: 'primary-pool',
          cluster: '${google_container_cluster.primary.name}',
          location: '${var.region}',
          project: '${google_project.project.project_id}',
          node_count: 3,
          node_config: {
            machine_type: 'n2-standard-4',
            disk_size_gb: 100,
            disk_type: 'pd-standard',
            oauth_scopes: [
              'https://www.googleapis.com/auth/cloud-platform',
            ],
          },
        },
        dependencies: ['google_container_cluster.primary'],
      });
    }

    // Firestore database
    if (this.requiresFirestore(scenario)) {
      resources.push({
        type: 'google_firestore_database',
        name: 'database',
        config: {
          name: `${scenario.id}-firestore`,
          project: '${google_project.project.project_id}',
          location_id: '${var.region}',
          type: 'FIRESTORE_NATIVE',
        },
        dependencies: ['google_project.project'],
      });
    }

    // Cloud Storage buckets
    if (this.requiresStorage(scenario)) {
      resources.push({
        type: 'google_storage_bucket',
        name: 'storage',
        config: {
          name: `${scenario.id}-storage`,
          project: '${google_project.project.project_id}',
          location: '${var.region}',
          force_destroy: true,
          uniform_bucket_level_access: true,
        },
        dependencies: ['google_project.project'],
      });
    }

    // BigQuery dataset for analytics
    if (this.requiresBigQuery(scenario)) {
      resources.push({
        type: 'google_bigquery_dataset',
        name: 'dataset',
        config: {
          dataset_id: scenario.id.replace(/-/g, '_'),
          project: '${google_project.project.project_id}',
          location: '${var.region}',
          description: `BigQuery dataset for ${scenario.title}`,
        },
        dependencies: ['google_project.project'],
      });
    }

    // Cloud Functions
    if (this.requiresCloudFunctions(scenario)) {
      resources.push({
        type: 'google_storage_bucket',
        name: 'functions_bucket',
        config: {
          name: `${scenario.id}-functions`,
          project: '${google_project.project.project_id}',
          location: '${var.region}',
        },
        dependencies: ['google_project.project'],
      });

      resources.push({
        type: 'google_cloudfunctions2_function',
        name: 'function',
        config: {
          name: `${scenario.id}-function`,
          project: '${google_project.project.project_id}',
          location: '${var.region}',
          description: `Cloud Function for ${scenario.title}`,
          build_config: {
            runtime: 'nodejs22',
            entry_point: 'handler',
            source: {
              storage_source: {
                bucket: '${google_storage_bucket.functions_bucket.name}',
                object: '${var.function_source_archive}',
              },
            },
          },
          service_config: {
            max_instance_count: 10,
            available_memory: '256M',
            timeout_seconds: 60,
          },
        },
        dependencies: ['google_storage_bucket.functions_bucket'],
      });
    }

    // Add scenario-specific resources from steps
    for (const step of scenario.steps || []) {
      const stepResources = this.generateResourcesFromStep(step, scenario);
      resources.push(...stepResources);
    }

    return resources;
  }

  /**
   * Generate resources from scenario step
   */
  private generateResourcesFromStep(step: any, scenario: any): TerraformResource[] {
    const resources: TerraformResource[] = [];

    // Parse step configuration and generate appropriate resources
    if (step.type === 'deployment') {
      // Add deployment-specific resources
    } else if (step.type === 'configuration') {
      // Add configuration-specific resources
    } else if (step.type === 'test') {
      // Add test infrastructure resources
    }

    return resources;
  }

  /**
   * Generate HCL format Terraform configuration
   */
  private generateHCL(config: TerraformConfig, options: any = {}): string {
    let hcl = '';

    // Terraform block
    hcl += `terraform {\n`;
    hcl += `  required_version = ">= ${config.version}"\n`;
    hcl += `  required_providers {\n`;

    if (config.provider === 'gcp') {
      hcl += `    google = {\n`;
      hcl += `      source  = "hashicorp/google"\n`;
      hcl += `      version = "~> 5.0"\n`;
      hcl += `    }\n`;
    }

    hcl += `  }\n`;
    hcl += `}\n\n`;

    // Provider block
    if (config.provider === 'gcp') {
      hcl += `provider "google" {\n`;
      hcl += `  project = var.project_id\n`;
      hcl += `  region  = var.region\n`;
      hcl += `}\n\n`;
    }

    // Variables
    if (options.includeVariables !== false) {
      hcl += this.generateVariablesHCL(config);
    }

    // Resources
    for (const resource of config.resources) {
      hcl += this.generateResourceHCL(resource);
    }

    // Outputs
    if (options.includeOutputs !== false) {
      hcl += this.generateOutputsHCL(config);
    }

    return hcl;
  }

  /**
   * Generate variables block in HCL
   */
  private generateVariablesHCL(config: TerraformConfig): string {
    let hcl = '# Variables\n\n';

    hcl += `variable "project_id" {\n`;
    hcl += `  description = "GCP Project ID"\n`;
    hcl += `  type        = string\n`;
    if (config.projectId) {
      hcl += `  default     = "${config.projectId}"\n`;
    }
    hcl += `}\n\n`;

    hcl += `variable "region" {\n`;
    hcl += `  description = "GCP Region"\n`;
    hcl += `  type        = string\n`;
    hcl += `  default     = "${config.region}"\n`;
    hcl += `}\n\n`;

    hcl += `variable "billing_account" {\n`;
    hcl += `  description = "GCP Billing Account ID"\n`;
    hcl += `  type        = string\n`;
    hcl += `}\n\n`;

    return hcl;
  }

  /**
   * Generate resource block in HCL
   */
  private generateResourceHCL(resource: TerraformResource): string {
    let hcl = `resource "${resource.type}" "${resource.name}" {\n`;

    for (const [key, value] of Object.entries(resource.config)) {
      hcl += this.formatHCLValue(key, value, 2);
    }

    if (resource.dependencies && resource.dependencies.length > 0) {
      hcl += `\n  depends_on = [\n`;
      for (const dep of resource.dependencies) {
        hcl += `    ${dep},\n`;
      }
      hcl += `  ]\n`;
    }

    hcl += `}\n\n`;
    return hcl;
  }

  /**
   * Format HCL value with proper indentation
   */
  private formatHCLValue(key: string, value: any, indent: number): string {
    const spaces = ' '.repeat(indent);

    if (typeof value === 'string') {
      // Check if it's a reference (starts with $)
      if (value.startsWith('${') && value.endsWith('}')) {
        return `${spaces}${key} = ${value}\n`;
      }
      return `${spaces}${key} = "${value}"\n`;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      return `${spaces}${key} = ${value}\n`;
    } else if (Array.isArray(value)) {
      let result = `${spaces}${key} = [\n`;
      for (const item of value) {
        if (typeof item === 'string') {
          result += `${spaces}  "${item}",\n`;
        } else {
          result += `${spaces}  ${JSON.stringify(item)},\n`;
        }
      }
      result += `${spaces}]\n`;
      return result;
    } else if (typeof value === 'object' && value !== null) {
      let result = `${spaces}${key} {\n`;
      for (const [k, v] of Object.entries(value)) {
        result += this.formatHCLValue(k, v, indent + 2);
      }
      result += `${spaces}}\n`;
      return result;
    }

    return '';
  }

  /**
   * Generate outputs block in HCL
   */
  private generateOutputsHCL(config: TerraformConfig): string {
    let hcl = '# Outputs\n\n';

    const outputs = this.generateOutputs(config);
    for (const [name, output] of Object.entries(outputs)) {
      hcl += `output "${name}" {\n`;
      hcl += `  description = "${output.description}"\n`;
      hcl += `  value       = ${output.value}\n`;
      hcl += `}\n\n`;
    }

    return hcl;
  }

  /**
   * Generate JSON format Terraform configuration
   */
  private generateJSON(config: TerraformConfig, options: any = {}): string {
    const json: any = {
      terraform: {
        required_version: `>= ${config.version}`,
        required_providers: {},
      },
      provider: {},
      variable: {},
      resource: {},
      output: {},
    };

    // Provider configuration
    if (config.provider === 'gcp') {
      json.terraform.required_providers.google = {
        source: 'hashicorp/google',
        version: '~> 5.0',
      };
      json.provider.google = {
        project: '${var.project_id}',
        region: '${var.region}',
      };
    }

    // Variables
    if (options.includeVariables !== false) {
      json.variable = this.extractVariables(config);
    }

    // Resources
    for (const resource of config.resources) {
      if (!json.resource[resource.type]) {
        json.resource[resource.type] = {};
      }
      json.resource[resource.type][resource.name] = resource.config;

      if (resource.dependencies && resource.dependencies.length > 0) {
        json.resource[resource.type][resource.name].depends_on = resource.dependencies;
      }
    }

    // Outputs
    if (options.includeOutputs !== false) {
      json.output = this.generateOutputs(config);
    }

    return JSON.stringify(json, null, 2);
  }

  /**
   * Extract variables from configuration
   */
  private extractVariables(config: TerraformConfig): Record<string, any> {
    return {
      project_id: {
        description: 'GCP Project ID',
        type: 'string',
        default: config.projectId || null,
      },
      region: {
        description: 'GCP Region',
        type: 'string',
        default: config.region,
      },
      billing_account: {
        description: 'GCP Billing Account ID',
        type: 'string',
      },
    };
  }

  /**
   * Generate output values
   */
  private generateOutputs(config: TerraformConfig): Record<string, any> {
    const outputs: Record<string, any> = {};

    // Add outputs based on resources
    const hasGKE = config.resources.some((r) => r.type === 'google_container_cluster');
    if (hasGKE) {
      outputs.gke_cluster_name = {
        description: 'GKE Cluster Name',
        value: '${google_container_cluster.primary.name}',
      };
      outputs.gke_cluster_endpoint = {
        description: 'GKE Cluster Endpoint',
        value: '${google_container_cluster.primary.endpoint}',
      };
    }

    const hasFirestore = config.resources.some((r) => r.type === 'google_firestore_database');
    if (hasFirestore) {
      outputs.firestore_database_name = {
        description: 'Firestore Database Name',
        value: '${google_firestore_database.database.name}',
      };
    }

    return outputs;
  }

  /**
   * Helper methods to determine required resources
   */
  private requiresGKE(scenario: any): boolean {
    return scenario.type === 'deployment' ||
           scenario.environment === 'production' ||
           (scenario.steps && scenario.steps.some((s: any) => s.type === 'deployment'));
  }

  private requiresFirestore(scenario: any): boolean {
    return true; // Most scenarios need Firestore
  }

  private requiresStorage(scenario: any): boolean {
    return scenario.testData && Object.keys(scenario.testData).length > 0;
  }

  private requiresBigQuery(scenario: any): boolean {
    return scenario.type === 'analytics' || scenario.type === 'demo';
  }

  private requiresCloudFunctions(scenario: any): boolean {
    return scenario.steps && scenario.steps.some((s: any) => s.type === 'function');
  }

  /**
   * Generate Terraform configuration as downloadable file
   */
  async generateDownloadableFile(
    scenarioId: string,
    format: 'hcl' | 'json' = 'hcl'
  ): Promise<{ filename: string; content: Buffer; mimeType: string }> {
    const output = await this.generateTerraformForScenario(scenarioId, { format });

    return {
      filename: output.filename,
      content: Buffer.from(output.content, 'utf-8'),
      mimeType: format === 'hcl' ? 'text/plain' : 'application/json',
    };
  }
}

// Export singleton instance
export const terraformGenerationService = new TerraformGenerationService();
export default terraformGenerationService;
