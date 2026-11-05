import { GEN3_API, GEN3_WORKSPACE_API } from '@gen3/core';

// TODO: migrate this to @gen3/core

export const GEN3_HATCHERY_API =
  GEN3_WORKSPACE_API || '/workspace-api/workspace/hatchery'; // get replaced by revproxy

export const GEN3_KERNEL_API =
  process.env.GEN3_KERNEL_API || `${GEN3_API}/lw-workspace/proxy/jeg-panel/api`;

export const GEN3_JEG_GATEWAY_API =
  process.env.JEG_GATEWAY_API || `${GEN3_API}/lw-workspace/proxy/jeg-panel/api`;

// TODO: resolve this with @gen3/core
export const GEN3_WORKSPACES_API =
  GEN3_WORKSPACE_API || `${GEN3_API}/lw-workspace`;

export const JEG_SERVICE_API =
  'http://jupyter-enterprise-gateway.jupyter-pods.svc.cluster.local:8888';
