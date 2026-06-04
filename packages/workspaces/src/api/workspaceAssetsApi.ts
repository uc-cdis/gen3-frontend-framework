import type { NextApiRequest, NextApiResponse } from 'next';
import { createWorkspaceAssetsHandler } from '../server';

const upstreamHandler = createWorkspaceAssetsHandler({
  // Route JupyterLite remote-mode kernel WebSocket traffic through revproxy's
  // /lw-workspace/proxy/ nginx block → ambassador-service (ExternalName → Emissary)
  // → JEG.  Next.js API routes cannot handle WebSocket upgrades, so we must
  // bypass them and use the nginx path that has allow_upgrade + long timeouts.
  gatewayBaseUrl: '/lw-workspace/proxy/',
});

const VECTIS_WORKSPACE_APP_NAME = 'Vectis Workspaces';
const VECTIS_FAVICON_URL = '/icons/Vectis_Logo_Colored_LightTheme.svg';

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
 * Return the first value of a header that Node.js may (in rare edge cases)
 * expose as an array. `host` and `referer` are always strings in practice,
 * but this keeps the helper safe for any header name.
 */
function firstHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function resolveOrigin(req: NextApiRequest): {
  proto: string;
  host: string;
} {
  const forwardedProto = firstHeader(req.headers['x-forwarded-proto']);
  const forwardedHost = firstHeader(req.headers['x-forwarded-host']);
  // `host` is always a single string per Node.js HTTP spec; firstHeader is
  // used for type-safety only.
  const hostHeader = firstHeader(req.headers.host);
  const refererHeader = firstHeader(req.headers.referer);

  let proto = (forwardedProto ?? '').trim();
  let host = (forwardedHost || hostHeader || '').trim();

  if (refererHeader) {
    try {
      const refererUrl = new URL(refererHeader);
      // Prefer referer origin when the host header dropped a non-default port.
      if (!host || !host.includes(':')) {
        host = refererUrl.host;
      }
      // Only fall back to referer protocol when nothing better is available.
      if (!proto) {
        proto = refererUrl.protocol.replace(':', '');
      }
    } catch {
      // Ignore malformed referer; keep header-derived values.
    }
  }

  return {
    proto: proto || 'http',
    host: host || 'localhost:30080',
  };
}

function injectVectisBranding(html: string, req: NextApiRequest): string {
  const isRemoteTierRequest =
    (Array.isArray(req.query.tier) ? req.query.tier[0] : req.query.tier) ===
    'remote';

  // Resolve origin only when needed (remote tier).
  const absoluteRemoteBaseUrl = isRemoteTierRequest
    ? (() => {
        const { proto, host } = resolveOrigin(req);
        return { base: `${proto}://${host}/lw-workspace/proxy/`, proto, host };
      })()
    : null;

  const withConfig = html.replace(
    /(<script\s+id="jupyter-config-data"[^>]*>)([\s\S]*?)(<\/script>)/,
    (_match, openTag: string, rawContent: string, closeTag: string) => {
      // Strip leading/trailing whitespace left by the template.
      const trimmed = rawContent.trim();
      // Verify the captured content looks like a JSON object before parsing.
      if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
        console.error(
          '[vectis-branding] jupyter-config-data content is not a JSON object; skipping merge.',
        );
        return _match;
      }

      let existing: Record<string, unknown> = {};
      try {
        existing = JSON.parse(trimmed) as Record<string, unknown>;
      } catch (err) {
        console.error(
          '[vectis-branding] Failed to parse jupyter-config-data JSON; skipping merge.',
          err,
        );
        return _match;
      }

      const existingDisabled = Array.isArray(existing.disabledExtensions)
        ? (existing.disabledExtensions as string[])
        : [];
      const remoteDisabledExtensions = isRemoteTierRequest
        ? [...existingDisabled, '@jupyterlite/pyodide-kernel-extension:kernel']
        : existingDisabled;

      const merged: Record<string, unknown> = {
        ...existing,
        appName: VECTIS_WORKSPACE_APP_NAME,
        faviconUrl: VECTIS_FAVICON_URL,
        ...(remoteDisabledExtensions.length > 0
          ? {
              disabledExtensions: Array.from(new Set(remoteDisabledExtensions)),
            }
          : {}),
        ...(isRemoteTierRequest && absoluteRemoteBaseUrl
          ? {
              // Use an absolute URL so JupyterLite does not resolve WS endpoints
              // relative to /workspace-api/workspace-assets/remote/.
              remoteBaseUrl: absoluteRemoteBaseUrl.base,
              // Route all kernel ops through jeg-proxy so JupyterLite sees merged
              // Python3 (container) + JEG GPU kernelspecs. The handler routes
              // Python3 kernel launches/channels to the container; GPU kernel
              // launches are gated (403) with a message to use the Kernel Panel.
              remoteKernelsBaseUrl: `${absoluteRemoteBaseUrl.proto}://${absoluteRemoteBaseUrl.host}/lw-workspace/proxy/jeg-proxy`,
              fullThemesUrl:
                '/workspace-api/workspace-assets/remote/build/themes',
            }
          : {}),
      };

      console.log('[vectis-branding] Merged config:', merged);

      return `${openTag}${JSON.stringify(merged)}${closeTag}`;
    },
  );

  // Escape the app name before placing it into the HTML title element.
  return withConfig.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(VECTIS_WORKSPACE_APP_NAME)}</title>`,
  );
}

function isHtmlResponse(res: NextApiResponse): boolean {
  const contentType = res.getHeader('content-type');
  if (typeof contentType === 'string') return contentType.includes('text/html');
  if (Array.isArray(contentType))
    return contentType.some((v) => v.includes('text/html'));
  return false;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const originalSend = res.send.bind(res);

  console.log('Workspace assets handler called');

  res.send = ((body: unknown) => {
    if (
      typeof body === 'string' &&
      isHtmlResponse(res) &&
      body.includes('id="jupyter-config-data"') &&
      body.includes('<title>')
    ) {
      return originalSend(injectVectisBranding(body, req));
    }
    return originalSend(body);
  }) as typeof res.send;

  return upstreamHandler(req, res);
}
