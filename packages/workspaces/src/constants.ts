import { GEN3_API } from '@gen3/core';

export const GEN3_HATCHERY_API =
  process.env.NEXT_PUBLIC_GEN3_HATCHERY_API || '/api/workspace/hatchery';

export const GEN3_KERNEL_API =
  process.env.NEXT_PUBLIC_GEN3_KERNEL_API ||
  `${GEN3_API}/lw-workspace/proxy/jeg-panel/api`;

export const GEN3_WORKSPACES_API =
  process.env.NEXT_PUBLIC_GEN3_WORKSPACES_API || `${GEN3_API}/lw-workspace`;
