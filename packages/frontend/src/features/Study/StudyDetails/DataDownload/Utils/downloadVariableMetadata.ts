import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { queryMultipleMDSRecords } from '@gen3/core';
import type { JSONObject } from '@gen3/core';
import { generateFilenameWithoutPrefix } from './generateFilenameWithoutPrefix';
import { sanitizeFileName } from '../../../../../utils/fileNames';

export interface VariableMetadataRecords {
  dataDictionaries: Record<string, string>;
  cdeMetadata: Record<string, string>;
}

const FILE_EXTENSION = '.json';

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
    zip.file(
      `${folder}/${sanitizeFileName(name, FILE_EXTENSION)}`,
      JSON.stringify(content),
    );
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
  saveAs(blob, `${generateFilenameWithoutPrefix('vlmd', studyUID)}.zip`);
};
