/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable webpack build worker to potentially help with build performance
    webpackBuildWorker: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add output configuration if you're deploying to Vercel
  output: 'standalone',
  // Optimize build traces
  outputFileTracing: false,
  // Add webpack configuration to handle potential circular dependencies
  webpack: (config, { isServer }) => {
    // Ignore specific modules that might cause issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Add rule to handle potential problematic imports
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
}

export default nextConfig
