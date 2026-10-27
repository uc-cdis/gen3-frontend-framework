import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { queryMultipleMDSRecords } from '@gen3/core';
import type { JSONObject } from '@gen3/core';

export interface VariableMetadataRecords {
  dataDictionaries: Record<string, string>;
  cdeMetadata: Record<string, string>;
}

const MAX_FILE_NAME_LENGTH = 250;
const FILE_EXTENSION = '.json';
const INVALID_FILE_NAME_CHARS = /[^a-zA-Z0-9[\]() ._-]+/g;
const INVALID_WINDOWS_FILE_NAMES = [
  'CON',
  'PRN',
  'AUX',
  'NUL',
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((n) => [`COM${n}`, `LPT${n}`]),
];

export const sanitizeFileName = (name: string): string => {
  let baseName = name
    .replace(INVALID_FILE_NAME_CHARS, '')
    .substring(0, MAX_FILE_NAME_LENGTH - FILE_EXTENSION.length);
  if (INVALID_WINDOWS_FILE_NAMES.includes(baseName)) {
    baseName += '_';
  }
  return `${baseName}${FILE_EXTENSION}`;
};

/**
 * Reads the data dictionary and CDE name -> MDS guid maps from the study's
 * variable-level metadata field. Returns undefined if there is nothing to download.
 */
export const getVariableMetadataRecords = (
  study: JSONObject,
  variableMetadataFieldName?: string,
): VariableMetadataRecords | undefined => {
  if (!variableMetadataFieldName) return undefined;
  const variableMetadata = study[variableMetadataFieldName] as
    | {
        data_dictionaries?: Record<string, string>;
        common_data_elements?: Record<string, string>;
      }
    | undefined;
  const dataDictionaries = variableMetadata?.data_dictionaries ?? {};
  const cdeMetadata = variableMetadata?.common_data_elements ?? {};
  if (
    Object.keys(dataDictionaries).length + Object.keys(cdeMetadata).length ===
    0
  ) {
    return undefined;
  }
  return { dataDictionaries, cdeMetadata };
};

const today = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const addRecordsToZip = (
  zip: JSZip,
  folder: string,
  records: Record<string, string>,
  fetched: Record<string, unknown>,
  contentField: string,
  recordKind: string,
  failed: string[],
) => {
  for (const [name, guid] of Object.entries(records)) {
    const content = (fetched[guid] as JSONObject | undefined)?.[contentField];
    if (content === undefined) {
      failed.push(`${recordKind} with name "${name}"`);
      continue;
    }
    zip.file(`${folder}/${sanitizeFileName(name)}`, JSON.stringify(content));
  }
};

/**
 * Fetches each data dictionary and CDE record from MDS, zips them into
 * data_dictionaries/ and common_data_elements/ folders, and saves the zip.
 * Throws if any record could not be retrieved.
 */
export const downloadVariableMetadata = async (
  records: VariableMetadataRecords,
  studyUID?: string,
  studyName?: string,
): Promise<void> => {
  const guids = [
    ...Object.values(records.dataDictionaries),
    ...Object.values(records.cdeMetadata),
  ];
  const fetched = await queryMultipleMDSRecords(guids);

  const zip = new JSZip();
  const failed: string[] = [];
  addRecordsToZip(
    zip,
    'data_dictionaries',
    records.dataDictionaries,
    fetched,
    'data_dictionary',
    'data dictionary',
    failed,
  );
  addRecordsToZip(
    zip,
    'common_data_elements',
    records.cdeMetadata,
    fetched,
    'cde_metadata',
    'common data element',
    failed,
  );
  if (failed.length > 0) {
    throw new Error(
      `Study with name ${studyName || 'N/A'} cannot download ${failed.join(' and ')}. Please try again later and contact support.`,
    );
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const prefix = `${window.location.hostname}${studyUID ? `-${studyUID}` : ''}-${today()}`;
  saveAs(blob, `${prefix}-vars.zip`);
};
