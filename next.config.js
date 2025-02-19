const withPWA = require('next-pwa')
const { PWA_CONFIG } = require('./src/lib/pwa/config.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    optimizePackageImports: ['@/components/ui'],
  }
}

module.exports = withPWA(PWA_CONFIG)(nextConfig) 