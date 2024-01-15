export const GEN3_COMMONS_NAME = process.env.GEN3_COMMONS_NAME || 'gen3';
export const GEN3_API = process.env.NEXT_PUBLIC_GEN3_API || 'https://localhost';
export const GEN3_DOMAIN = process.env.NEXT_PUBLIC_GEN3_DOMAIN || 'localhost';
export const GUID_PREFIX_PATTERN = /^dg.[a-zA-Z0-9]+\//;

export const GEN3_DOWNLOADS_ENDPOINT = '/downloads';
/**
 *  Service Specific Constants
 */
export const GEN3_GUPPY_API = process.env.NEXT_PUBLIC_GEN3_GUPPY_API || '/guppy/';

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
