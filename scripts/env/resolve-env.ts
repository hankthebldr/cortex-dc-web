#!/usr/bin/env tsx
/**
 * Environment Resolution and Validation Script
 *
 * Validates required environment variables for different TARGET_ENV profiles:
 * - firebase: Firebase hosting with Cloud Functions
 * - k8s: Self-hosted Kubernetes deployment
 * - local: Local development environment
 *
 * Usage:
 *   tsx scripts/env/resolve-env.ts
 *   TARGET_ENV=k8s tsx scripts/env/resolve-env.ts
 */

type TargetEnv = 'firebase' | 'k8s' | 'local';

interface EnvConfig {
  TARGET_ENV: TargetEnv;
  NODE_ENV: string;
  APP_BASE_URL: string;
  API_BASE_URL: string;
  PORT?: string;
  // Optional feature flags
  ENABLE_ANALYTICS?: string;
  ENABLE_TELEMETRY?: string;
}

const ALLOWED_TARGETS: TargetEnv[] = ['firebase', 'k8s', 'local'];

const DEFAULT_VALUES: Record<TargetEnv, Partial<EnvConfig>> = {
  firebase: {
    APP_BASE_URL: 'https://cortex-dc-portal.web.app',
    API_BASE_URL: 'https://us-central1-cortex-dc-portal.cloudfunctions.net',
    PORT: '3000',
  },
  k8s: {
    APP_BASE_URL: process.env.APP_BASE_URL || '',
    API_BASE_URL: process.env.API_BASE_URL || 'http://functions-service/api',
    PORT: '3000',
  },
  local: {
    APP_BASE_URL: 'http://localhost:3000',
    API_BASE_URL: 'http://localhost:5001',
    PORT: '3000',
  },
};

const REQUIRED_VARS: Record<TargetEnv, string[]> = {
  firebase: ['NODE_ENV'],
  k8s: ['NODE_ENV', 'APP_BASE_URL', 'API_BASE_URL'],
  local: ['NODE_ENV'],
};

class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * Validates and resolves environment configuration
 */
function resolveEnv(): EnvConfig {
  // Determine target environment
  const targetEnv = (process.env.TARGET_ENV || 'local') as TargetEnv;

  if (!ALLOWED_TARGETS.includes(targetEnv)) {
    throw new EnvValidationError(
      `Invalid TARGET_ENV: ${targetEnv}. Allowed values: ${ALLOWED_TARGETS.join(', ')}`
    );
  }

  // Get defaults for this target
  const defaults = DEFAULT_VALUES[targetEnv];

  // Build config with defaults and overrides
  const config: EnvConfig = {
    TARGET_ENV: targetEnv,
    NODE_ENV: process.env.NODE_ENV || 'development',
    APP_BASE_URL: process.env.APP_BASE_URL || defaults.APP_BASE_URL || '',
    API_BASE_URL: process.env.API_BASE_URL || defaults.API_BASE_URL || '',
    PORT: process.env.PORT || defaults.PORT,
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS,
    ENABLE_TELEMETRY: process.env.ENABLE_TELEMETRY,
  };

  // Validate required variables
  const requiredVars = REQUIRED_VARS[targetEnv];
  const missingVars = requiredVars.filter(varName => {
    const value = config[varName as keyof EnvConfig];
    return !value || value.trim() === '';
  });

  if (missingVars.length > 0) {
    throw new EnvValidationError(
      `Missing required environment variables for TARGET_ENV=${targetEnv}: ${missingVars.join(', ')}`
    );
  }

  // Validate URLs for k8s target
  if (targetEnv === 'k8s') {
    if (!config.APP_BASE_URL.startsWith('http')) {
      throw new EnvValidationError(
        `APP_BASE_URL must start with http:// or https:// for K8s deployment. Got: ${config.APP_BASE_URL}`
      );
    }
    if (!config.API_BASE_URL.startsWith('http')) {
      throw new EnvValidationError(
        `API_BASE_URL must start with http:// or https:// for K8s deployment. Got: ${config.API_BASE_URL}`
      );
    }
  }

  return config;
}

/**
 * Prints environment configuration
 */
function printConfig(config: EnvConfig): void {
  console.log('✓ Environment validation passed\n');
  console.log('Configuration:');
  console.log(`  TARGET_ENV:      ${config.TARGET_ENV}`);
  console.log(`  NODE_ENV:        ${config.NODE_ENV}`);
  console.log(`  APP_BASE_URL:    ${config.APP_BASE_URL}`);
  console.log(`  API_BASE_URL:    ${config.API_BASE_URL}`);
  console.log(`  PORT:            ${config.PORT || 'default'}`);

  if (config.ENABLE_ANALYTICS) {
    console.log(`  ENABLE_ANALYTICS: ${config.ENABLE_ANALYTICS}`);
  }
  if (config.ENABLE_TELEMETRY) {
    console.log(`  ENABLE_TELEMETRY: ${config.ENABLE_TELEMETRY}`);
  }

  console.log('');
}

/**
 * Exports config as shell-compatible format
 */
function exportConfig(config: EnvConfig): void {
  Object.entries(config).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      console.log(`export ${key}="${value}"`);
    }
  });
}

// Main execution
if (require.main === module) {
  try {
    const config = resolveEnv();

    const shouldExport = process.argv.includes('--export');

    if (shouldExport) {
      exportConfig(config);
    } else {
      printConfig(config);
    }

    process.exit(0);
  } catch (error) {
    if (error instanceof EnvValidationError) {
      console.error(`❌ ${error.message}\n`);
      console.error('Environment validation failed. Please set required variables.\n');
      console.error('Examples:');
      console.error('  # Local development');
      console.error('  TARGET_ENV=local npm run build:local\n');
      console.error('  # Kubernetes deployment');
      console.error('  TARGET_ENV=k8s APP_BASE_URL=https://app.example.com API_BASE_URL=https://api.example.com npm run build:k8s\n');
      console.error('  # Firebase deployment');
      console.error('  TARGET_ENV=firebase npm run build:firebase\n');
      process.exit(1);
    }
    throw error;
  }
}

export { resolveEnv, EnvConfig, TargetEnv };
