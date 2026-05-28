/**
 * Next.js config wrapper that adds all workspace-related plumbing.
 *
 * Usage (consumer's `next.config.js`):
 *
 *   const { withJupyterWorkspaces } = require('@gen3/jupyter-workspaces/server');
 *   module.exports = withJupyterWorkspaces(yourNextConfig);
 */

import type { NextConfig } from 'next';
import nodePath from 'path';

export interface WithJupyterWorkspacesOptions {
  /**
   * URL of the gateway proxy for local dev rewrites.
   * Default: env `GATEWAY_PROXY_URL` or `http://localhost:8890`
   */
  gatewayProxyUrl?: string;
  /**
   * Workspace page routes that need COOP/COEP headers.
   * Default: ['/workspaces/jupyter', '/workspaces/jupyter-lite', '/workspaces/jupyter-kernel']
   */
  workspaceRoutes?: string[];
}

const DEFAULT_WORKSPACE_ROUTES = [
  '/workspaces/jupyter',
  '/workspaces/jupyter-lite',
  '/workspaces/jupyter-kernel',
];

export function withJupyterWorkspaces(
  nextConfig: NextConfig,
  options?: WithJupyterWorkspacesOptions,
): NextConfig {
  const workspaceRoutes = options?.workspaceRoutes ?? DEFAULT_WORKSPACE_ROUTES;

  return {
    ...nextConfig,

    // Merge transpilePackages
    transpilePackages: [
      ...(nextConfig.transpilePackages ?? []),
      ...['@gen3/jupyter-workspaces'].filter(
        (pkg) => !(nextConfig.transpilePackages ?? []).includes(pkg),
      ),
    ],

    // Merge webpack config — add React dedup alias
    webpack(config: Record<string, any>, ctx: any) {
      config.resolve = config.resolve ?? {};
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        react: nodePath.dirname(require.resolve('react/package.json')),
        'react-dom': nodePath.dirname(
          require.resolve('react-dom/package.json'),
        ),
      };

      // Chain the consumer's existing webpack config
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, ctx);
      }
      return config;
    },

    // Merge rewrites — add gateway proxy rewrite in dev mode
    async rewrites() {
      const isDev = process.env.NODE_ENV === 'development';
      const existing =
        typeof nextConfig.rewrites === 'function'
          ? await nextConfig.rewrites()
          : [];

      if (!isDev) return existing;

      const gatewayProxyUrl =
        options?.gatewayProxyUrl ??
        process.env.GATEWAY_PROXY_URL ??
        'http://localhost:8890';

      const gatewayRewrite = {
        source: '/api/workspace/gateway/:path*',
        destination: `${gatewayProxyUrl}/api/workspace/gateway/:path*`,
      };

      // rewrites() can return an array or { beforeFiles, afterFiles, fallback }
      if (Array.isArray(existing)) {
        return [gatewayRewrite, ...existing];
      }
      return {
        ...existing,
        beforeFiles: [gatewayRewrite, ...(existing.beforeFiles ?? [])],
      };
    },

    // Merge headers — add COOP/COEP for workspace routes
    async headers() {
      const existing =
        typeof nextConfig.headers === 'function'
          ? await nextConfig.headers()
          : [];

      const coopCoepHeaders = workspaceRoutes.map((route) => ({
        source: route,
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      }));

      return [...existing, ...coopCoepHeaders];
    },
  };
}
