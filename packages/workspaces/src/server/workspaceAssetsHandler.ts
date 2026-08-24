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
 *
 * `workspaceAssetsApi` (this package's default wiring) builds its options from
 * `<GEN3_FRONTEND_CONFIGURATION_ROOT>/<GEN3_COMMONS_NAME>/workspaceAssets.json`,
 * so per-commons branding and gateway routing need no code changes.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import nodePath from 'path';
import fs from 'fs';
import { getCookie } from 'cookies-next';

const MAX_FILE_SIZE_BYTES = 67108864; // 64 * 1024 * 1024

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
  /**
   * `<title>` override for served JupyterLite HTML. Defaults to `appName` when
   * omitted; set it when the window title should differ from the config-data
   * `appName` JupyterLite reports internally.
   */
  pageTitle?: string;
  /**
   * Origin-relative path used to build the absolute `remoteKernelsBaseUrl`
   * injected into the remote tier (e.g. `/lw-workspace/proxy/jeg-proxy`).
   * The origin is resolved per-request from forwarding headers so JupyterLite
   * does not resolve kernel endpoints relative to the assets route.
   * Omitted → `remoteKernelsBaseUrl` is not injected.
   */
  remoteKernelsPath?: string;
  /** Override for the remote tier's `fullThemesUrl` (default: `/workspace-api/workspace-assets/remote/build/themes`). */
  fullThemesUrl?: string;
}

// ---------- constants ----------

const ALLOWED_TIERS = new Set(['free', 'remote']);

const SAFE_SEGMENT_RE = /^@?[A-Za-z0-9._-]+$/;

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

const DEFAULT_FULL_THEMES_URL =
  '/workspace-api/workspace-assets/remote/build/themes';

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

const ASSETS_ROOT_PATH =
  process.env.JUPYTER_ASSETS_ROOT_PATH || '/gen3/jupyter-workspaces/assets';

function defaultAssetRoot(): string {
  return ASSETS_ROOT_PATH.startsWith('/')
    ? ASSETS_ROOT_PATH
    : nodePath.join(process.cwd(), ASSETS_ROOT_PATH);
}
interface BrandingConfig {
  appName?: string;
  faviconUrl?: string;
  pageTitle?: string;
}

const DEFAULT_REMOTE_BRANDING: BrandingConfig = {
  appName: 'JupyterLite',
  faviconUrl: '/favicon2.ico',
};

/** Escape characters that are special inside an HTML text node / attribute. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Replace the document title with the configured page title (or app name).
 * Values originate from a server-side config file, but they are escaped so a
 * stray `<` in a commons name cannot break out of the title element.
 */
function replaceTitle(html: string, branding: BrandingConfig): string {
  const title = branding.pageTitle ?? branding.appName;
  if (!title) return html;
  return html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(title)}</title>`,
  );
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

interface RemoteInjectionConfig {
  gatewayBaseUrl: string;
  disabledExtensions: string[];
  fullThemesUrl: string;
  remoteKernelsPath?: string;
  branding?: BrandingConfig;
}

function injectRemoteConfig(
  html: string,
  req: NextApiRequest,
  config: RemoteInjectionConfig,
): string {
  const {
    gatewayBaseUrl,
    disabledExtensions,
    fullThemesUrl,
    remoteKernelsPath,
  } = config;
  const branding = config.branding ?? DEFAULT_REMOTE_BRANDING;

  const { proto, host } = resolveOrigin(req);
  const absoluteGatewayBase = `${proto}://${host}${gatewayBaseUrl}`;

  // Inject server-side JEG token — overrides any client-supplied auth header.
  // This ensures calls from JupyterLite's own serverconnection.js are also authenticated.

  let accessToken = undefined;
  if (process.env.NODE_ENV === 'development') {
    // NOTE: This cookie can only be accessed from the client side
    // in development mode. Otherwise, the cookie is set as httpOnly
    accessToken = getCookie('credentials_token');
  }

  const configData: Record<string, unknown> = {
    remoteBaseUrl: absoluteGatewayBase,
    remoteToken: accessToken,
    disabledExtensions,
    fullThemesUrl,
    // Required so JupyterLab sets window.jupyterapp, which the parent
    // frame uses for polling readiness and attaching remote kernels.
    exposeAppInBrowser: 'true',
  };

  if (remoteKernelsPath) {
    // Absolute so JupyterLite does not resolve kernel ops relative to
    // /workspace-api/workspace-assets/remote/. Routing all kernel traffic
    // through jeg-proxy lets JupyterLite see merged container + JEG kernelspecs.
    configData.remoteKernelsBaseUrl = `${proto}://${host}${remoteKernelsPath}`;
  }

  if (branding?.appName) configData.appName = branding.appName;
  if (branding?.faviconUrl) configData.faviconUrl = branding.faviconUrl;

  const result = html.replace(
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

  return replaceTitle(result, branding);
}

function injectBranding(html: string, branding: BrandingConfig): string {
  const result = html.replace(
    /(<script\s+id="jupyter-config-data"[^>]*>)\s*(\{[^]*?\})\s*(<\/script>)/,
    (_match, openTag: string, existingJson: string, closeTag: string) => {
      let existing: Record<string, unknown> = {};
      try {
        existing = JSON.parse(existingJson);
      } catch (error: unknown) {
        // empty or malformed — start fresh
        if (error instanceof Error) {
          console.warn('Failed to parse existing JSON', error.message);
        } else {
          console.warn('Failed to parse existing JSON', error);
        }
      }
      if (branding.appName) existing.appName = branding.appName;
      if (branding.faviconUrl) existing.faviconUrl = branding.faviconUrl;
      return `${openTag}${JSON.stringify(existing)}${closeTag}`;
    },
  );

  return replaceTitle(result, branding);
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

  // Keep this in for logging purposes
  console.log('jupyterlite assets root:', assetRoot);

  const disabledExtensions = options?.additionalDisabledExtensions
    ? [...REMOTE_DISABLED_EXTENSIONS, ...options.additionalDisabledExtensions]
    : REMOTE_DISABLED_EXTENSIONS;

  const branding: BrandingConfig | undefined =
    options?.appName || options?.faviconUrl || options?.pageTitle
      ? {
          appName: options.appName,
          faviconUrl: options.faviconUrl,
          pageTitle: options.pageTitle,
        }
      : undefined;

  const remoteInjectionConfig: RemoteInjectionConfig = {
    gatewayBaseUrl,
    disabledExtensions,
    fullThemesUrl: options?.fullThemesUrl ?? DEFAULT_FULL_THEMES_URL,
    remoteKernelsPath: options?.remoteKernelsPath,
    branding,
  };

  // Build the allowed-file sets once at factory time (not per-request) to
  // avoid unbounded I/O on every incoming request (CWE-770).
  const walkDir = (dir: string, set: Set<string>): void => {
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = nodePath.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(full, set);
        } else {
          set.add(full);
        }
      }
    } catch {
      // Tier directory doesn't exist yet — set remains empty and handler will 404.
    }
  };

  const allowedFilesByTier: Record<string, Set<string>> = {
    free: new Set<string>(),
    remote: new Set<string>(),
  };
  for (const tier of ALLOWED_TIERS) {
    walkDir(nodePath.resolve(assetRoot, tier), allowedFilesByTier[tier]);
  }

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

    let tierRoot: string;
    if (tier === 'free') {
      tierRoot = nodePath.resolve(assetRoot, 'free');
    } else if (tier === 'remote') {
      tierRoot = nodePath.resolve(assetRoot, 'remote');
    } else {
      res.status(404).end('Not found');
      return;
    }

    const safeSegments: string[] = [];
    for (const seg of segments) {
      if (
        typeof seg !== 'string' ||
        !SAFE_SEGMENT_RE.test(seg) ||
        seg === '.' ||
        seg === '..'
      ) {
        res.status(403).end('Forbidden');
        return;
      }
      safeSegments.push(nodePath.basename(seg));
    }

    // JupyterLite's service worker intercepts api/* calls in-browser.
    // When it doesn't (Cockle not installed, SW not yet active, etc.),
    // requests fall through here. Return JSON 404 so extensions handle
    // the error gracefully instead of throwing a JSON parse error.
    if (safeSegments[0] === 'api') {
      res
        .status(404)
        .setHeader('Content-Type', 'application/json; charset=utf-8')
        .end(JSON.stringify({ message: 'Not found' }));
      return;
    }

    const allowedFiles = allowedFilesByTier[tier];

    const candidatePath = nodePath.resolve(tierRoot, ...safeSegments);
    const candidateIndex = nodePath.join(candidatePath, 'index.html');

    console.log('serving jupyterlite asset from', candidatePath);

    let filePath: string;
    if (allowedFiles.has(candidatePath)) {
      filePath = candidatePath;
    } else if (allowedFiles.has(candidateIndex)) {
      filePath = candidateIndex;
    } else {
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

    if (process.env.NODE_ENV === 'development') {
      // In dev there is no fence service to plant the access_token cookie, so
      // we derive it from credentials_token (which is NOT httpOnly in dev) and
      // set it here. The browser will then send it automatically with every
      // subsequent request to the same origin — including JupyterLite's direct
      // calls to /lw-workspace/proxy/jeg-proxy/api/kernelspecs (which bypass
      // the Next.js proxy and therefore need the cookie on the wire).
      const accessToken = req.cookies?.['credentials_token'];
      if (accessToken) {
        res.setHeader(
          'Set-Cookie',
          `access_token=${encodeURIComponent(accessToken)}; Path=/; SameSite=Lax`,
        );
      }
    }

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
        const injected = injectRemoteConfig(html, req, remoteInjectionConfig);
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

    const stat = fs.statSync(filePath);
    if (stat.size > MAX_FILE_SIZE_BYTES) {
      res.status(413).end('File too large');
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      res.status(500).end('Internal server error');
    });
    stream.pipe(res);
  };
}

/**
 * Default handler — for one-liner re-exports.
 *
 * Built lazily on first request: `createWorkspaceAssetsHandler` walks both tier
 * asset trees at factory time, and this module is imported transitively by
 * `next.config.js` (via `@gen3/workspaces/server`), where that I/O is wasted.
 */
let lazyDefaultHandler:
  ReturnType<typeof createWorkspaceAssetsHandler> | undefined;

const defaultHandler = (req: NextApiRequest, res: NextApiResponse): void => {
  if (!lazyDefaultHandler) {
    lazyDefaultHandler = createWorkspaceAssetsHandler();
  }
  return lazyDefaultHandler(req, res);
};

export default defaultHandler;
