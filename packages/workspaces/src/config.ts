import { JupyterWorkspaceConfig } from '@/types';

export const DEFAULT_WORKSPACE_CONFIG: JupyterWorkspaceConfig = {
  gateway: {
    upstreamUrl: 'http://localhost:8889',
    pathPrefix: '/api/workspace/gateway/',
  },
  proxyPort: 8890,
  wsPingIntervalMs: 30000,
  assetBaseUrl: '/api/workspace-assets',
  workspaceRoutes: [
    '/workspaces/jupyter',
    '/workspaces/jupyter-lite',
    '/workspaces/jupyter-kernel',
  ],
};
