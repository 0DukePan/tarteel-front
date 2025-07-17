/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable webpack build worker to potentially help with build performance
    webpackBuildWorker: true,
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
  outputFileTracing: true,
}

export default nextConfig
