/**
 * Next.js API route for JupyterLite static assets.
 *
 * The handler options are read from a per-commons JSON file:
 *
 *   <GEN3_FRONTEND_CONFIGURATION_ROOT>/<GEN3_COMMONS_NAME>/workspaceAssets.json
 *
 * matching the convention used by the rest of the framework's server-side
 * configuration (see `FilesystemContent` / `GEN3_FRONTEND_CONFIGURATION_ROOT`).
 * The file is optional — DEFAULT_OPTIONS below is used when it is absent or
 * unreadable, so a bad config never takes down the whole assets route.
 *
 * The upstream handler is built lazily on first request rather than at import
 * time: `createWorkspaceAssetsHandler` recursively walks both tier asset trees
 * when constructed, and this module is imported transitively by
 * `next.config.js` (via `@gen3/workspaces/server`) where that I/O is wasted.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import nodePath from 'path';
import { GEN3_COMMONS_NAME } from '@gen3/core';
import {
  createWorkspaceAssetsHandler,
  type WorkspaceAssetsHandlerOptions,
} from '../server/workspaceAssetsHandler';

const CONFIG_ROOT = process.env.GEN3_FRONTEND_CONFIGURATION_ROOT || './config/';
const CONFIG_FILENAME = 'workspaceAssets.json';

const DEFAULT_OPTIONS: WorkspaceAssetsHandlerOptions = {
  // Route JupyterLite remote-mode kernel WebSocket traffic through revproxy's
  // /lw-workspace/proxy/ nginx block → ambassador-service (ExternalName → Emissary)
  // → JEG.  Next.js API routes cannot handle WebSocket upgrades, so we must
  // bypass them and use the nginx path that has allow_upgrade + long timeouts.
  gatewayBaseUrl: '/lw-workspace/proxy/',
  // Route all kernel ops through jeg-proxy so JupyterLite sees merged Python3
  // (container) + JEG GPU kernelspecs. The proxy routes Python3 kernel
  // launches/channels to the container; GPU kernel launches are gated (403)
  // with a message to use the Kernel Panel.
  remoteKernelsPath: '/lw-workspace/proxy/jeg-proxy',
  // The remote tier attaches to a real kernel gateway, so JupyterLite's
  // in-browser Pyodide kernel must not be offered alongside it.
  additionalDisabledExtensions: [
    '@jupyterlite/pyodide-kernel-extension:kernel',
  ],
  appName: GEN3_COMMONS_NAME,
};

const STRING_OPTIONS = [
  'gatewayBaseUrl',
  'assetRoot',
  'appName',
  'faviconUrl',
  'pageTitle',
  'remoteKernelsPath',
  'fullThemesUrl',
] as const satisfies ReadonlyArray<keyof WorkspaceAssetsHandlerOptions>;

function configFilePath(): string {
  return nodePath.resolve(
    process.cwd(),
    CONFIG_ROOT,
    GEN3_COMMONS_NAME,
    CONFIG_FILENAME,
  );
}

/**
 * Pick and type-check the known option keys. Unknown keys are ignored so a
 * config file can carry extra metadata without reaching the factory,
 * and a wrong-typed value falls back to its default instead of throwing.
 */
function parseOptions(raw: unknown): WorkspaceAssetsHandlerOptions {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    console.warn(
      `[workspace-assets] ${CONFIG_FILENAME} is not a JSON object; using defaults.`,
    );
    return DEFAULT_OPTIONS;
  }

  const source = raw as Record<string, unknown>;
  const parsed: WorkspaceAssetsHandlerOptions = {};

  for (const key of STRING_OPTIONS) {
    const value = source[key];
    if (value === undefined) continue;
    if (typeof value === 'string') {
      parsed[key] = value;
    } else {
      console.warn(
        `[workspace-assets] ignoring ${key}: expected a string, got ${typeof value}.`,
      );
    }
  }

  const extensions = source.additionalDisabledExtensions;

  // oxlint-disable-next-line no-console
  console.log(
    'addtional disabled extensions',
    source.additionalDisabledExtensions,
  );
  if (extensions !== undefined) {
    if (
      Array.isArray(extensions) &&
      extensions.every((entry) => typeof entry === 'string')
    ) {
      parsed.additionalDisabledExtensions = extensions;
    } else {
      console.warn(
        '[workspace-assets] ignoring additionalDisabledExtensions: expected an array of strings.',
      );
    }
  }

  // oxlint-disable-next-line no-console
  console.log('parsed options', parsed);

  return { ...DEFAULT_OPTIONS, ...parsed };
}

function loadOptions(): WorkspaceAssetsHandlerOptions {
  const file = configFilePath();
  try {
    return parseOptions(JSON.parse(fs.readFileSync(file, 'utf-8')));
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(
      `[workspace-assets] could not read ${file} (${reason}); using defaults.`,
    );
    return DEFAULT_OPTIONS;
  }
}

let upstreamHandler:
  ReturnType<typeof createWorkspaceAssetsHandler> | undefined;
let loadedConfigMtimeMs: number | undefined;

/** mtime of the config file, or undefined when it does not exist. */
function configMtimeMs(): number | undefined {
  try {
    return fs.statSync(configFilePath()).mtimeMs;
  } catch {
    return undefined;
  }
}

function getUpstreamHandler(): ReturnType<typeof createWorkspaceAssetsHandler> {
  if (process.env.NODE_ENV === 'development') {
    // Rebuild when the config file changes so edits don't need a dev-server
    // restart. Only the cheap stat runs per request — the expensive asset walk
    // happens on the first request and then only after a real config change.
    const mtimeMs = configMtimeMs();
    if (upstreamHandler && mtimeMs !== loadedConfigMtimeMs) {
      upstreamHandler = undefined;
    }
    loadedConfigMtimeMs = mtimeMs;
  }

  if (!upstreamHandler) {
    upstreamHandler = createWorkspaceAssetsHandler(loadOptions());
  }
  return upstreamHandler;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return getUpstreamHandler()(req, res);
}
