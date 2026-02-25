// @ts-check

'use strict';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const dns = require('dns');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const basePath = process.env.NEXT_PUBLIC_BASEPATH;

dns.setDefaultResultOrder('ipv4first');

const isDev = process.env.NODE_ENV === 'development';

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

    // Important: disable symlinks for faster resolution
    config.resolve.symlinks = false;

    config.resolve.alias = {
      ...(config.resolve.alias || {}),

      '@gen3/core$': path.resolve(__dirname, '../core/src/index.ts'),

      // Specific sub-path aliases (these bypass barrel files)
      '@gen3/frontend/app': path.resolve(
        __dirname,
        '../frontend/src/exports/app.ts',
      ),
      '@gen3/frontend/explorerRenderers': path.resolve(
        __dirname,
        '../frontend/src/exports/explorerRenderers.ts',
      ),
      '@gen3/frontend/content': path.resolve(
        __dirname,
        '../frontend/src/exports/content.ts',
      ),
    };

    if (isDev) {
      // More aggressive caching
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };

      config.watchOptions = {
        ...(config.watchOptions || {}),
        ignored: [
          '**/.next/**',
          '**/dist/**',
          '**/.swc/**',
          '**/node_modules/**',
          '**/.git/**',
          '**/coverage/**',
          '**/.storybook/**',
          '**/storybook-static/**',
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/*.spec.ts',
          '**/*.spec.tsx',
        ],
      };

      // Reduce module resolution work
      config.snapshot = {
        managedPaths: [/^(.+?[\\/]node_modules[\\/])/],
        immutablePaths: [],
      };
    }
    return config;
  },
  async rewrites() {
    if (isDev) {
      const GEN3_TARGET =
        process.env.NEXT_PUBLIC_GEN3_API_TARGET || 'https://localhost';
      return [
        { source: '/_status', destination: `${GEN3_TARGET}/_status` },
        { source: '/user/:path*', destination: `${GEN3_TARGET}/user/:path*` },
        {
          source: '/guppy/:path*',
          destination: `${GEN3_TARGET}/guppy/:path*`,
        },
        { source: '/mds/:path*', destination: `${GEN3_TARGET}/mds/:path*` },
        {
          source: '/ai-search/:path*',
          destination: `${GEN3_TARGET}/ai-search/:path*`,
        },
        {
          source: '/authz/:path*',
          destination: `${GEN3_TARGET}/authz/:path*`,
        },
        {
          source: '/lw-workspace/:path*',
          destination: `${GEN3_TARGET}/lw-workspace/:path*`,
        },
        {
          source: '/api/v0/submission/:path*',
          destination: `${GEN3_TARGET}/api/v0/submission/:path*`,
        },
        { source: '/wts/:path*', destination: `${GEN3_TARGET}/wts/:path*` },
        {
          source: '/library/lists/:path*',
          destination: `${GEN3_TARGET}/library/lists/:path*`,
        },
        { source: '/jobs/:path*', destination: `${GEN3_TARGET}/jobs/:path*` },
        {
          source: '/manifests/:path*',
          destination: `${GEN3_TARGET}/manifests/:path*`,
        },
        {
          source: '/requestor/:path*',
          destination: `${GEN3_TARGET}/requestor/:path*`,
        },
      ];
    } else {
      return [];
    }
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

// IMPORTANT: actually export your config (wrapped by plugins)
module.exports = withMDX(nextConfig);
