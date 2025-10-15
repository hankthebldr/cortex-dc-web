/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server-side rendering for containerized deployment
  // Removed static export for full Next.js functionality with API routes

  // Image optimization enabled for production
  images: {
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
    DEPLOYMENT_MODE: process.env.DEPLOYMENT_MODE || 'self-hosted',
  },
};

export default nextConfig;
