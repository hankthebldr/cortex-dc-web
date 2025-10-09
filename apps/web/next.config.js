/** @type {import('next').NextConfig} */
const nextConfig = {
  
  // Configure for development
  reactStrictMode: true,
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false
  }
};

module.exports = nextConfig;