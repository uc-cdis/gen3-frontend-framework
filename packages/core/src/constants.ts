export const GEN3_COMMONS_NAME = process.env.GEN3_COMMONS_NAME || 'gen3';
export const GEN3_API = process.env.NEXT_PUBLIC_GEN3_API || 'https://localhost';
export const GEN3_DOMAIN = process.env.NEXT_PUBLIC_GEN3_DOMAIN || 'localhost';
export const GUID_PREFIX_PATTERN = /^dg.[a-zA-Z0-9]+\//;


/**
 *  Service Specific Constants
 */
export const GEN3_GUPPY_API = process.env.NEXT_PUBLIC_GEN3_GUPPY_API || `${GEN3_API}/guppy`;
export const GEN3_MDS_API = process.env.NEXT_PUBLIC_GEN3_MDS_API || `${GEN3_API}/mds`;
export const GEN3_DOWNLOADS_ENDPOINT = process.env.NEXT_PUBLIC_GEN3_DOWNLOADS_ENDPOINT || 'downloads';
export const GEN3_FENCE_API = process.env.NEXT_PUBLIC_GEN3_FENCE_API || GEN3_API;
export const GEN3_AI_SEARCH_API = process.env.NEXT_PUBLIC_GEN3_AI_SEARCH_API || `${GEN3_API}/ai-search`;
export const GEN3_AUTHZ_API = process.env.NEXT_PUBLIC_GEN3_AUTHZ_API || `${GEN3_API}/authz`;

export const GEN3_WTS_API = process.env.NEXT_PUBLIC_GEN3_WTS_API || `${GEN3_API}/lw-workspace`

export enum Accessibility {
  ACCESSIBLE = 'accessible',
  UNACCESSIBLE = 'unaccessible',
  ALL = 'all',
}

export const FILE_FORMATS = {
  JSON: 'json',
  TSV: 'tsv',
  CSV: 'csv',
};

export const FILE_DELIMITERS = {
  tsv: '\t',
  csv: ',',
};
