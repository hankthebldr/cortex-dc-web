import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Firebase Hosting
  output: 'export',
  trailingSlash: true,
  
  // Disable image optimization for static export
  images: {
    unoptimized: true
  },
  
  // Configure basePath for local development
  basePath: process.env.NODE_ENV === 'development' ? '' : '',
  
  // Enable experimental webpack features for Firebase
  experimental: {
    webpackBuildWorker: true
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false
  }
};

export default nextConfig;
