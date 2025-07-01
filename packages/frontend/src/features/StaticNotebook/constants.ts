import { GEN3_API } from '@gen3/core';

export const GEN3_STATIC_NOTEBOOK_API =
  process.env.GEN3_STATIC_NOTEBOOK_API || `${GEN3_API}/api/staticNotebook`;
export const GEN3_STATIC_NOTEBOOK_DIR =
  process.env.GEN3_STATIC_NOTEBOOK_DIR || 'htmlNotebooks';
export const GEN3_STATIC_NOTEBOOK_PATH =
  process.env.GEN3_STATIC_NOTEBOOK_PATH || '/public';
