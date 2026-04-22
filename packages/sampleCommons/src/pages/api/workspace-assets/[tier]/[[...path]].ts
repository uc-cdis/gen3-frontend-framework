import type { NextApiRequest, NextApiResponse } from 'next';
import { createWorkspaceAssetsHandler } from '@gen3/jupyter-workspaces/server';

const upstreamHandler = createWorkspaceAssetsHandler({
  // Route JupyterLite remote-mode kernel WebSocket traffic through revproxy's
  // /lw-workspace/proxy/ nginx block → ambassador-service (ExternalName → Emissary)
  // → JEG.  Next.js API routes cannot handle WebSocket upgrades, so we must
  // bypass them and use the nginx path that has allow_upgrade + long timeouts.
  gatewayBaseUrl: '/lw-workspace/proxy/',
});
const VECTIS_WORKSPACE_APP_NAME = 'Vectis Workspaces';
const VECTIS_FAVICON_URL = '/icons/Vectis_Logo_Colored_LightTheme.svg';

function injectVectisBranding(html: string, req: NextApiRequest) {
  const isRemoteTierRequest =
    (Array.isArray(req.query.tier) ? req.query.tier[0] : req.query.tier) ===
    'remote';
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
      // Prefer referer origin when host header dropped a non-default port.
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
    resolvedHost = 'localhost:30080';
  }

  const absoluteRemoteBaseUrl = `${resolvedProto}://${resolvedHost}/lw-workspace/proxy/`;

  const withConfig = html.replace(
    /(<script\s+id="jupyter-config-data"[^>]*>)\s*(\{[^]*?\})\s*(<\/script>)/,
    (_match, openTag: string, existingJson: string, closeTag: string) => {
      let existing: Record<string, unknown> = {};
      try {
        existing = JSON.parse(existingJson) as Record<string, unknown>;
      } catch {
        existing = {};
      }

      const existingDisabled = Array.isArray(existing.disabledExtensions)
        ? (existing.disabledExtensions as string[])
        : [];
      const remoteDisabledExtensions = isRemoteTierRequest
        ? [...existingDisabled, '@jupyterlite/pyodide-kernel-extension:kernel']
        : existingDisabled;

      const merged = {
        ...existing,
        appName: VECTIS_WORKSPACE_APP_NAME,
        faviconUrl: VECTIS_FAVICON_URL,
        ...(remoteDisabledExtensions.length > 0
          ? {
              disabledExtensions: Array.from(new Set(remoteDisabledExtensions)),
            }
          : {}),
        ...(isRemoteTierRequest
          ? {
              // Use an absolute URL so JupyterLite does not resolve WS endpoints
              // relative to /workspace-api/workspace-assets/remote/.
              remoteBaseUrl: absoluteRemoteBaseUrl,
              // Route all kernel ops through jeg-proxy so JupyterLite sees merged
              // Python3 (container) + JEG GPU kernelspecs. The handler routes
              // Python3 kernel launches/channels to the container; GPU kernel
              // launches are gated (403) with a message to use the Kernel Panel.
              remoteKernelsBaseUrl: `${resolvedProto}://${resolvedHost}/lw-workspace/proxy/jeg-proxy`,
              fullThemesUrl:
                '/workspace-api/workspace-assets/remote/build/themes',
            }
          : {}),
      };

      return `${openTag}${JSON.stringify(merged)}${closeTag}`;
    },
  );

  return withConfig.replace(
    /<title>[^<]*<\/title>/,
    `<title>${VECTIS_WORKSPACE_APP_NAME}</title>`,
  );
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const originalSend = res.send.bind(res);

  res.send = ((body: unknown) => {
    if (
      typeof body === 'string' &&
      body.includes('id="jupyter-config-data"') &&
      body.includes('<title>')
    ) {
      return originalSend(injectVectisBranding(body, req));
    }

    return originalSend(body);
  }) as typeof res.send;

  return upstreamHandler(req, res);
}
