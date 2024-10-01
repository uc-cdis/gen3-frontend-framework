'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('./src/lib/plugins/index.js');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

// Next configuration with support for rewrting API to existing common services
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
    instrumentationHook: true,
    experimental: {
      turbo: {
        moduleIdStrategy: 'deterministic',
      },
    },
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
  transpilePackages: ['@gen3/frontend'],
  basePath: process.env.BASE_PATH || '',
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
    ];
  },
};

module.exports = withMDX(nextConfig);
