export const GEN3_API = process.env.NEXT_PUBLIC_GEN3_API;
export const GEN3_DOMAIN = process.env.NEXT_PUBLIC_GEN3_DOMAIN;
export const GEN3_USER_API = process.env.NEXT_PUBLIC_GEN3_USER_API;
export const GUID_PREFIX_PATTERN = /^dg.[a-zA-Z0-9]+\//;
export const GEN3_JOB_API = process.env.NEXT_PUBLIC_GEN3_JOB_API;

export const GEN3_GUPPY_API = process.env.NEXT_PUBLIC_GEN3_GUPPY_API;

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
