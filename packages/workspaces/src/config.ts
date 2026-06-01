import { JupyterWorkspaceConfig } from './types';
import { WorkspaceTierInformation } from './workspace/Tiers/types';

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

export const WORKSPACE_TIER_INFORMATION: Record<
  string,
  WorkspaceTierInformation
> = {
  free: {
    tier: 'free',
    toolbar: {
      label: 'JupyterLite',
      description: 'Running via JupyterLite',
      requiresStopping: false,
    },
    settings: {
      showKernels: true,
    },
  },
};
