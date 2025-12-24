// @ts-check

'use strict';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const dns = require('dns');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const basePath = process.env.NEXT_PUBLIC_BASEPATH;

dns.setDefaultResultOrder('ipv4first');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    version: process.env.npm_package_version,
  },
  reactStrictMode: true,
  output: 'standalone',
  allowedDevOrigins: ['local.io', '*.local.io'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: true,
  pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
  basePath: basePath,
  webpack: (config, { dev }) => {
    config.infrastructureLogging = {
      level: 'error',
    };

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@gen3/core': path.resolve(__dirname, '../core/src/index.ts'),
      '@gen3/frontend': path.resolve(__dirname, '../frontend/src/index.ts'),
    };

    if (dev) {
      config.watchOptions = {
        ...(config.watchOptions || {}),
        ignored: [
          '**/.next/**',
          '**/dist/**',
          '**/.swc/**',
          '**/node_modules/**',
        ],
      };
    }

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)?', // Matches all pages
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
      {
        source: '/jupyter/(.*)?',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  transpilePackages: ['@gen3/core', '@gen3/frontend'],
};

module.exports = nextConfig;
