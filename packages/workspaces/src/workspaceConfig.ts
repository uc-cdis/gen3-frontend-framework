/**
 * Configuration types for Jupyter Workspace infrastructure.
 *
 * In production, these values are typically provided via ConfigMap / environment
 * variables.  In local dev, sensible defaults are used.
 */

/** Server configuration for a Jupyter Gateway (standard jupyter-server). */
export interface GatewayServerConfig {
  /** Upstream URL of the real Jupyter server (e.g. "http://jupyter-gateway:8888") */
  upstreamUrl: string;
  /** URL path prefix used by the Next.js app to route to the gateway */
  pathPrefix: string;
}

/** Server configuration for Jupyter Enterprise Gateway (future). */
export interface EnterpriseGatewayConfig {
  /** Upstream URL of the JEG server */
  upstreamUrl: string;
  /** URL path prefix */
  pathPrefix: string;
}

/**
 * Configuration for a Hatchery-managed micro container.
 * Set via NEXT_PUBLIC_MICRO_CONTAINER_TAG (client-safe) and
 * the full config passed to HostedWorkspaceExperience / useMicroContainer.
 */
export interface MicroContainerConfig {
  /**
   * Substring matched against container names from Hatchery /options.
   * Should match the `name` field in hatchery.json for your micro container.
   * Read from NEXT_PUBLIC_MICRO_CONTAINER_TAG in the browser bundle.
   */
  identifierTag: string;
  /**
   * Override adaptive poll intervals (ms).
   * Default: 0 when not-running, 5000 when launching, 30000 when running.
   */
  statusPollMs?: Partial<{ launching: number; running: number }>;
  /**
   * Ambassador path prefix for the micro container's workload URL.
   * Default: "/lw-workspace/proxy/"
   */
  ambassadorPathPrefix?: string;
}

/** Top-level workspace infrastructure configuration. */
export interface JupyterWorkspaceConfig {
  /** Standard Jupyter Gateway (jupyter-server) */
  gateway: GatewayServerConfig;
  /** Enterprise Gateway — future use */
  jeg?: EnterpriseGatewayConfig;
  /** Micro container (Hatchery-managed) configuration for remote-tier workspaces */
  microContainer?: MicroContainerConfig;
  /** Port the dev proxy listens on (default 8890) */
  proxyPort: number;
  /** WebSocket ping interval in ms (default 30000) */
  wsPingIntervalMs: number;
  /** URL path base for workspace asset serving */
  assetBaseUrl: string;
  /** Workspace page routes that need COOP/COEP headers */
  workspaceRoutes: string[];
}

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
