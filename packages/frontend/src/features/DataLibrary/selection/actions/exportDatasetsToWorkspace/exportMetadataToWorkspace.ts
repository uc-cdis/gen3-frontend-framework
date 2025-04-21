import { DataActionFunction } from '../../types';
import { extractDatasetIds, selectionToManifest } from '../../utils';

import {
  fetchJSONDataFromURL,
  GEN3_MANIFEST_API,
  HttpMethod,
  queryMultipleMDSRecords,
} from '@gen3/core';
import { get, unset, cloneDeep } from 'lodash';

const removeKeys = (obj: object, keysToRemove: Array<string>) => {
  keysToRemove.forEach((key) => {
    if (key.includes('.')) {
      const [firstKey, ...nestedKeys] = key.split('.');
      const nestedObj = get(obj, firstKey);
      unset(nestedObj, nestedKeys.join('.'));
    } else {
      unset(obj, key);
    }
  });
  return obj;
};

/**
 * Processes and assembles metadata by cloning objects, removing specified keys, and optionally accessing a defined metadata root.
 *
 * @param {Array<string>} keysToRemove - A list of keys to remove from each object in the selected resources after cloning.
 * @param {Array<Record<string, unknown>>} selectedResources - An array of resource objects to process and format.
 * @param {string} metadataRoot - The root key that holds the metadata in the objects. If present, this root is used as a starting point.
 * @returns {Array<Record<string, unknown>>} A new array of processed objects with the specified keys removed and metadata root applied when applicable.
 */
const assembleMetadata = (
  selectedResources: Array<Record<string, unknown>>,
  metadataRoot: string,
  keysToRemove?: Array<string>,
) => {
  return selectedResources.map((obj) => {
    const clonedObj = cloneDeep(
      !obj[metadataRoot] ? obj : (obj[metadataRoot] as typeof obj),
    );
    // if there are keysToRemove, remove them
    if (keysToRemove) {
      return removeKeys(clonedObj, keysToRemove);
    }
    // Otherwise just return the cloned object
    return clonedObj;
  });
};

interface ExportMetadataToWorkspaceParameters {
  keysToRemove: Array<string>;
  metadataRoot: string;
  useAggMDS: boolean;
  verifyExternalLogins: boolean;
}

export const exportMetadataToWorkspace: DataActionFunction = async (
  validatedSelections,
  params?: Partial<ExportMetadataToWorkspaceParameters>,
  onDone = () => null,
  onError = () => null,
  onAbort = () => null,
  signal = undefined,
) => {
  // first need to get file manifest
  try {
    const fileManifest = selectionToManifest(validatedSelections);

    if (params?.verifyExternalLogins) {
      const externalLogins = fileManifest.filter(
        (file) => file.type === 'file' && file.external_login,
      );
      if (externalLogins.length > 0) {
        throw new Error(
          'Cannot export metadata for files with external logins. Please remove external logins before exporting metadata.',
        );
      }
    }

    // next get the metadata from the dataset id
    const metadataIds = extractDatasetIds(validatedSelections);
    const metadata = await queryMultipleMDSRecords(
      metadataIds,
      params?.useAggMDS,
      signal,
    );

    const metadataObjects = Object.values(metadata).map(
      (metadataObj) => metadataObj as Record<string, unknown>,
    );

    const filteredMetadata = assembleMetadata(
      metadataObjects,
      params?.metadataRoot ?? 'gen3_discovery',
      params?.keysToRemove,
    );

    // save the metadata
    await fetchJSONDataFromURL(
      `${GEN3_MANIFEST_API}/metadata`,
      true,
      'POST' as HttpMethod,
      JSON.stringify(filteredMetadata),
      signal,
    );

    // save files manifest
    await fetchJSONDataFromURL(
      `${GEN3_MANIFEST_API}/`,
      true,
      'POST' as HttpMethod,
      JSON.stringify(fileManifest),
      signal,
    );

    onDone?.();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name == 'AbortError') {
        onAbort?.();
      }
      onError?.(error);
    } else onError?.(new Error('unknown error'));
  }
};
