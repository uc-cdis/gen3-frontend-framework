'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dns = require('dns');
const path = require('path');

const basePath = process.env.NEXT_PUBLIC_BASEPATH;

dns.setDefaultResultOrder('ipv4first');

// Next configuration with support for rewriting API to existing common services
const nextConfig = {
  reactStrictMode: true,
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

    if (dev) {
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
};

module.exports = nextConfig;
