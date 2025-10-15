/**
 * Next.js Configuration with Multi-Target Support
 *
 * Supports three deployment targets via TARGET_ENV:
 * - firebase: Firebase Hosting with Cloud Functions
 * - k8s: Self-hosted Kubernetes deployment
 * - local: Local development environment
 *
 * @type {import('next').NextConfig}
 */

const TARGET_ENV = process.env.TARGET_ENV || 'local';
const isFirebase = TARGET_ENV === 'firebase';
const isK8s = TARGET_ENV === 'k8s';
const isLocal = TARGET_ENV === 'local';

// Asset path configuration based on target
const getAssetConfig = () => {
  if (isFirebase) {
    // Firebase Hosting handles paths automatically
    return {
      basePath: '',
      assetPrefix: undefined,
    };
  }

  if (isK8s) {
    // K8s deployment with custom domain
    const appBaseUrl = process.env.APP_BASE_URL || '';
    return {
      basePath: '',
      assetPrefix: appBaseUrl,
    };
  }

  // Local development
  return {
    basePath: '',
    assetPrefix: undefined,
  };
};

const assetConfig = getAssetConfig();

const nextConfig = {
  // Asset path configuration
  ...assetConfig,

  // Server-side rendering for containerized deployment
  // Full Next.js functionality with API routes and SSR
  output: isFirebase ? 'export' : undefined,

  // Image optimization enabled for production
  images: {
    unoptimized: isFirebase, // Firebase Hosting doesn't support image optimization
    domains: ['localhost', 'storage.googleapis.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Enable experimental webpack features
  experimental: {
    webpackBuildWorker: true,
    serverComponentsExternalPackages: [
      '@opensearch-project/opensearch',
      'neo4j-driver',
      'redis',
      'pg',
      'pg-hstore',
    ],
  },

  // Webpack configuration to handle server-only packages
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle server-only packages on client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false
  },

  // Environment variables available to the browser
  env: {
    TARGET_ENV: TARGET_ENV,
    DEPLOYMENT_MODE: process.env.DEPLOYMENT_MODE || 'self-hosted',
    API_BASE_URL: process.env.API_BASE_URL || '',
    APP_BASE_URL: process.env.APP_BASE_URL || '',
  },

  // Generate standalone build for containerized deployment
  ...(isK8s || isLocal ? {
    output: 'standalone',
  } : {}),
};

// Log configuration for debugging
if (process.env.NODE_ENV !== 'production') {
  console.log('Next.js Configuration:');
  console.log(`  TARGET_ENV:   ${TARGET_ENV}`);
  console.log(`  basePath:     ${nextConfig.basePath || '(none)'}`);
  console.log(`  assetPrefix:  ${nextConfig.assetPrefix || '(none)'}`);
  console.log(`  output:       ${nextConfig.output || 'default'}`);
}

export default nextConfig;
