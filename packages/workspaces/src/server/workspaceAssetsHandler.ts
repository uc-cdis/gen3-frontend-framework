/**
 * Next.js API route handler factory for serving JupyterLite static assets.
 *
 * Usage (consumer's `src/pages/api/workspace-assets/[tier]/[[...path]].ts`):
 *
 *   import { createWorkspaceAssetsHandler } from '@gen3/jupyter-workspaces/server';
 *   export default createWorkspaceAssetsHandler();
 *
 * Or with custom config:
 *
 *   export default createWorkspaceAssetsHandler({
 *     gatewayBaseUrl: '/api/workspace/gateway/',
 *   });
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import nodePath from 'path';
import fs from 'fs';

// ---------- types ----------

export interface WorkspaceAssetsHandlerOptions {
  /** Gateway base URL injected into remote tier config (default: env JUPYTER_GATEWAY_BASE_URL or '/api/workspace/gateway/') */
  gatewayBaseUrl?: string;
  /**
   * Root directory containing the JupyterLite assets.
   * Default: `<cwd>/node_modules/@gen3/jupyter-workspaces/assets`
   */
  assetRoot?: string;
  /** Additional JupyterLite extensions to disable for the remote tier */
  additionalDisabledExtensions?: string[];
  /** Application name injected into JupyterLite config data and used as <title> override (opt-in branding). */
  appName?: string;
  /** Favicon URL injected into JupyterLite config data (opt-in branding). */
  faviconUrl?: string;
}

// ---------- constants ----------

const ALLOWED_TIERS = new Set(['free', 'remote']);

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.ipynb': 'application/json; charset=utf-8',
};

const REMOTE_DISABLED_EXTENSIONS = [
  '@jupyterlite/services-extension:config-section-manager',
  '@jupyterlite/services-extension:default-drive',
  '@jupyterlite/services-extension:event-manager',
  '@jupyterlite/services-extension:exporters',
  '@jupyterlite/services-extension:kernel-manager',
  '@jupyterlite/services-extension:kernel-client',
  '@jupyterlite/services-extension:kernel-spec-client',
  '@jupyterlite/services-extension:kernel-spec-manager',
  '@jupyterlite/services-extension:kernel-specs',
  '@jupyterlite/services-extension:nbconvert-manager',
  '@jupyterlite/services-extension:session-manager',
  '@jupyterlite/application-extension:service-worker-manager',
  '@jupyterlab/apputils-extension:themes',
];

// ---------- helpers ----------

function defaultAssetRoot(): string {
  return nodePath.join(
    process.cwd(),
    'node_modules',
    '@gen3',
    'jupyter-workspaces',
    'assets',
  );
}

interface BrandingConfig {
  appName?: string;
  faviconUrl?: string;
}

/**
 * Resolve the origin from forwarding headers, with referer fallback.
 * Handles proxies that drop non-standard ports from the Host header.
 */
function resolveOrigin(req: NextApiRequest): { proto: string; host: string } {
  const forwardedProto =
    (Array.isArray(req.headers['x-forwarded-proto'])
      ? req.headers['x-forwarded-proto'][0]
      : req.headers['x-forwarded-proto']) || 'http';
  const forwardedHost = Array.isArray(req.headers['x-forwarded-host'])
    ? req.headers['x-forwarded-host'][0]
    : req.headers['x-forwarded-host'];
  const hostHeader = Array.isArray(req.headers.host)
    ? req.headers.host[0]
    : req.headers.host;
  const refererHeader = Array.isArray(req.headers.referer)
    ? req.headers.referer[0]
    : req.headers.referer;

  let resolvedHost = (forwardedHost || hostHeader || '').trim();
  let resolvedProto = String(forwardedProto).trim() || 'http';

  if (refererHeader) {
    try {
      const refererUrl = new URL(refererHeader);
      if (!resolvedHost || !resolvedHost.includes(':')) {
        resolvedHost = refererUrl.host;
      }
      if (!resolvedProto) {
        resolvedProto = refererUrl.protocol.replace(':', '');
      }
    } catch {
      // Ignore malformed referer and keep header-derived values.
    }
  }

  if (!resolvedHost) {
    resolvedHost = 'localhost:8890';
  }

  return { proto: resolvedProto, host: resolvedHost };
}

function injectRemoteConfig(
  html: string,
  req: NextApiRequest,
  gatewayBaseUrl: string,
  disabledExtensions: string[],
  branding?: BrandingConfig,
): string {
  const { proto, host } = resolveOrigin(req);
  const absoluteGatewayBase = `${proto}://${host}${gatewayBaseUrl}`;

  const configData: Record<string, unknown> = {
    remoteBaseUrl: absoluteGatewayBase,
    appendToken: false,
    disabledExtensions,
    fullThemesUrl: '/workspace-api/workspace-assets/remote/build/themes',
  };

  if (branding?.appName) configData.appName = branding.appName;
  if (branding?.faviconUrl) configData.faviconUrl = branding.faviconUrl;

  let result = html.replace(
    /(<script\s+id="jupyter-config-data"[^>]*>)\s*(\{[^]*?\})\s*(<\/script>)/,
    (_match, openTag: string, existingJson: string, closeTag: string) => {
      let existing: Record<string, unknown> = {};
      try {
        existing = JSON.parse(existingJson);
      } catch {
        // empty or malformed — start fresh
      }
      const merged = { ...existing, ...configData };
      if (Array.isArray(existing.disabledExtensions)) {
        const combined = new Set([
          ...(existing.disabledExtensions as string[]),
          ...disabledExtensions,
        ]);
        merged.disabledExtensions = [...combined];
      }
      return `${openTag}${JSON.stringify(merged)}${closeTag}`;
    },
  );

  if (branding?.appName) {
    result = result.replace(
      /<title>[^<]*<\/title>/,
      `<title>${branding.appName}</title>`,
    );
  }

  return result;
}

function injectBranding(html: string, branding: BrandingConfig): string {
  let result = html.replace(
    /(<script\s+id="jupyter-config-data"[^>]*>)\s*(\{[^]*?\})\s*(<\/script>)/,
    (_match, openTag: string, existingJson: string, closeTag: string) => {
      let existing: Record<string, unknown> = {};
      try {
        existing = JSON.parse(existingJson);
      } catch {
        // empty or malformed — start fresh
      }
      if (branding.appName) existing.appName = branding.appName;
      if (branding.faviconUrl) existing.faviconUrl = branding.faviconUrl;
      return `${openTag}${JSON.stringify(existing)}${closeTag}`;
    },
  );

  if (branding.appName) {
    result = result.replace(
      /<title>[^<]*<\/title>/,
      `<title>${branding.appName}</title>`,
    );
  }

  return result;
}

// ---------- factory ----------

export function createWorkspaceAssetsHandler(
  options?: WorkspaceAssetsHandlerOptions,
) {
  const gatewayBaseUrl =
    options?.gatewayBaseUrl ??
    process.env.JUPYTER_GATEWAY_BASE_URL ??
    '/api/workspace/gateway/';

  const assetRoot = options?.assetRoot ?? defaultAssetRoot();

  const disabledExtensions = options?.additionalDisabledExtensions
    ? [...REMOTE_DISABLED_EXTENSIONS, ...options.additionalDisabledExtensions]
    : REMOTE_DISABLED_EXTENSIONS;

  const branding: BrandingConfig | undefined =
    options?.appName || options?.faviconUrl
      ? { appName: options.appName, faviconUrl: options.faviconUrl }
      : undefined;

  return function handler(req: NextApiRequest, res: NextApiResponse): void {
    const { tier, path: pathSegments } = req.query;

    if (typeof tier !== 'string' || !ALLOWED_TIERS.has(tier)) {
      res.status(404).end('Not found');
      return;
    }

    const segments: string[] = Array.isArray(pathSegments)
      ? pathSegments
      : pathSegments
        ? [pathSegments]
        : [];

    const tierRoot = nodePath.join(assetRoot, tier);
    const requestedPath = nodePath.join(tierRoot, ...segments);
    const resolved = nodePath.normalize(requestedPath);

    // Security: reject any path that escapes the tier root directory
    if (
      !resolved.startsWith(tierRoot + nodePath.sep) &&
      resolved !== tierRoot
    ) {
      res.status(403).end('Forbidden');
      return;
    }

    let filePath = resolved;

    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        const indexPath = nodePath.join(filePath, 'index.html');
        if (fs.existsSync(indexPath)) {
          filePath = indexPath;
        } else {
          res.status(404).end('Not found');
          return;
        }
      }
    } catch {
      res.status(404).end('Not found');
      return;
    }

    const ext = nodePath.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const isBuildAsset =
      filePath.includes(nodePath.join(tier, 'build')) ||
      filePath.includes(nodePath.join(tier, 'extensions'));

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    if (nodePath.basename(filePath) === 'service-worker.js') {
      res.setHeader('Service-Worker-Allowed', '/');
    }

    const isRemoteLabHtml =
      tier === 'remote' &&
      ext === '.html' &&
      filePath.includes(nodePath.join('lab', 'index.html'));

    if (isRemoteLabHtml) {
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      try {
        const html = fs.readFileSync(filePath, 'utf-8');
        const injected = injectRemoteConfig(
          html,
          req,
          gatewayBaseUrl,
          disabledExtensions,
          branding,
        );
        res.status(200).send(injected);
      } catch {
        res.status(500).end('Internal server error');
      }
      return;
    }

    // Non-remote HTML (e.g. free-tier lab) — apply branding if configured
    const isHtmlResponse = ext === '.html';
    if (isHtmlResponse && branding) {
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      try {
        const html = fs.readFileSync(filePath, 'utf-8');
        res.status(200).send(injectBranding(html, branding));
      } catch {
        res.status(500).end('Internal server error');
      }
      return;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Cache-Control',
      isBuildAsset
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=3600, must-revalidate',
    );

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      res.status(500).end('Internal server error');
    });
    stream.pipe(res);
  };
}

/** Default handler — for one-liner re-exports */
const defaultHandler = createWorkspaceAssetsHandler();
export default defaultHandler;
