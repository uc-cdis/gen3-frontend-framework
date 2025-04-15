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

const assembleMetadata = (
  keysToRemove: Array<string>,
  selectedResources: Array<Record<string, unknown>>,
) => {
  return selectedResources.map((obj) => {
    const clonedObj = cloneDeep(obj);
    // if there are keysToRemove, remove them
    if (keysToRemove) {
      return removeKeys(clonedObj, keysToRemove);
    }
    // Otherwise just return the cloned object
    return clonedObj;
  });
};

export const exportMetadataToWorkspace: DataActionFunction = async (
  validatedSelections,
  params,
  onDone = () => null,
  onError = () => null,
  onAbort = () => null,
  signal = undefined,
) => {
  // first need to get file manifest
  try {
    const fileManifest = selectionToManifest(validatedSelections);

    // next get the metadata from the dataset id
    const metadataIds = extractDatasetIds(validatedSelections);
    const metadata = queryMultipleMDSRecords(
      metadataIds,
      params?.mds_version,
      signal,
    );

    const filteredMetadata = assembleMetadata(
      params?.keysToRemove,
      Object.values(metadata),
    );

    // save files manifest
    await fetchJSONDataFromURL(
      `${GEN3_MANIFEST_API}`,
      true,
      'POST' as HttpMethod,
      JSON.stringify(fileManifest),
      signal,
    );

    // save the metadata
    await fetchJSONDataFromURL(
      `${GEN3_MANIFEST_API}`,
      true,
      'POST' as HttpMethod,
      JSON.stringify(filteredMetadata),
      signal,
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name == 'AbortError') {
        onAbort?.();
      }
      onError?.(error);
    } else onError?.(new Error('unknown error'));
  } finally {
    onDone?.();
  }
};
