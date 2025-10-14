/**
 * Environment Configuration
 * Centralized configuration management using environment variables
 */

import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';
import * as path from 'path';

// Load .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : process.env.NODE_ENV === 'test'
  ? '.env.test'
  : '.env.local';

dotenvConfig({ path: path.resolve(process.cwd(), envFile) });

// Environment variable schema with validation
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.string().default('8080').transform(Number),

  // GCP
  GCP_PROJECT_ID: z.string(),
  GCP_REGION: z.string().default('us-central1'),
  GCP_SERVICE_ACCOUNT_KEY: z.string().optional(),

  // Database
  DATABASE_TYPE: z.enum(['firestore', 'postgres']).default('firestore'),
  FIRESTORE_PROJECT_ID: z.string().optional(),
  FIRESTORE_DATABASE_ID: z.string().optional(),
  DATABASE_HOST: z.string().optional(),
  DATABASE_PORT: z.string().optional().transform(val => val ? Number(val) : undefined),
  DATABASE_NAME: z.string().optional(),
  DATABASE_USER: z.string().optional(),
  DATABASE_PASSWORD: z.string().optional(),
  DATABASE_SSL: z.string().optional().transform(val => val === 'true'),
  DATABASE_CONNECTION_POOL_MAX: z.string().default('10').transform(Number),
  DATABASE_CONNECTION_POOL_MIN: z.string().default('2').transform(Number),

  // Storage
  STORAGE_PROVIDER: z.enum(['gcs', 'local']).default('gcs'),
  STORAGE_BUCKET: z.string(),
  STORAGE_CDN_URL: z.string().url().optional(),
  STORAGE_MAX_FILE_SIZE: z.string().default('52428800').transform(Number),

  // Authentication
  AUTH_PROVIDER: z.enum(['firebase', 'gcp-identity']).default('firebase'),
  AUTH_DOMAIN: z.string(),
  AUTH_PROJECT_ID: z.string().optional(),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRATION: z.string().default('7d'),
  JWT_REFRESH_EXPIRATION: z.string().default('30d'),
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
  SESSION_MAX_AGE: z.string().default('86400000').transform(Number),

  // API
  API_BASE_URL: z.string().url(),
  API_TIMEOUT: z.string().default('30000').transform(Number),
  API_RATE_LIMIT: z.string().default('100').transform(Number),
  API_RATE_LIMIT_WINDOW: z.string().default('900000').transform(Number),
  CORS_ORIGINS: z.string(),
  CORS_CREDENTIALS: z.string().default('true').transform(val => val === 'true'),

  // AI Services
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-pro'),
  GEMINI_TEMPERATURE: z.string().default('0.7').transform(Number),
  GEMINI_MAX_TOKENS: z.string().default('2048').transform(Number),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4').optional(),

  // BigQuery
  BIGQUERY_PROJECT_ID: z.string().optional(),
  BIGQUERY_DATASET: z.string().optional(),
  BIGQUERY_LOCATION: z.string().default('US').optional(),
  BIGQUERY_ENABLE_CACHE: z.string().default('true').transform(val => val === 'true'),

  // XSIAM Integration
  XSIAM_API_URL: z.string().url().optional(),
  XSIAM_API_KEY: z.string().optional(),
  XSIAM_TENANT_ID: z.string().optional(),

  // Monitoring
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'text']).default('json'),
  ENABLE_REQUEST_LOGGING: z.string().default('true').transform(val => val === 'true'),
  ENABLE_PERFORMANCE_MONITORING: z.string().default('true').transform(val => val === 'true'),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.string().default('0.1').transform(Number).optional(),

  // Feature Flags
  ENABLE_ANALYTICS: z.string().default('true').transform(val => val === 'true'),
  ENABLE_AI_FEATURES: z.string().default('true').transform(val => val === 'true'),
  ENABLE_BIGQUERY_EXPORT: z.string().default('false').transform(val => val === 'true'),
  ENABLE_XSIAM_INTEGRATION: z.string().default('false').transform(val => val === 'true'),
  ENABLE_CONTENT_LIBRARY: z.string().default('true').transform(val => val === 'true'),
  ENABLE_POV_MANAGEMENT: z.string().default('true').transform(val => val === 'true'),
  ENABLE_TRR_WORKFLOWS: z.string().default('true').transform(val => val === 'true'),

  // Cache (Redis - optional)
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().optional().transform(val => val ? Number(val) : undefined),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().default('0').transform(Number).optional(),
  REDIS_TLS: z.string().default('false').transform(val => val === 'true').optional(),
  CACHE_TTL: z.string().default('3600').transform(Number),

  // Security
  RATE_LIMIT_ENABLED: z.string().default('true').transform(val => val === 'true'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
  CSRF_ENABLED: z.string().default('true').transform(val => val === 'true'),
  CSRF_SECRET: z.string().optional(),
  CSP_ENABLED: z.string().default('true').transform(val => val === 'true'),

  // Development
  DEBUG: z.string().default('false').transform(val => val === 'true'),
  ENABLE_SWAGGER_UI: z.string().default('false').transform(val => val === 'true'),
});

// Parse and validate environment variables
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  throw new Error('Environment validation failed');
}

export const config = parsed.data;

// Helper function to check if we're in production
export const isProduction = () => config.NODE_ENV === 'production';
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isTest = () => config.NODE_ENV === 'test';

// Log configuration on startup (redact sensitive values)
if (isDevelopment() || config.DEBUG) {
  console.log('📋 Configuration loaded:', {
    nodeEnv: config.NODE_ENV,
    port: config.PORT,
    gcpProjectId: config.GCP_PROJECT_ID,
    databaseType: config.DATABASE_TYPE,
    storageProvider: config.STORAGE_PROVIDER,
    authProvider: config.AUTH_PROVIDER,
    featuresEnabled: {
      analytics: config.ENABLE_ANALYTICS,
      ai: config.ENABLE_AI_FEATURES,
      bigQuery: config.ENABLE_BIGQUERY_EXPORT,
      xsiam: config.ENABLE_XSIAM_INTEGRATION,
    }
  });
}
