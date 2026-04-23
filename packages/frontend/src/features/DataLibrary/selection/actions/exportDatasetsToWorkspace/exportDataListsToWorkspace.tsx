import { DataActionFunction } from '../../types';
import {
  fetchJSONDataFromURL,
  GEN3_MANIFEST_API,
  HttpMethod,
  ManifestItem,
} from '@gen3/core';
import { isValidFileItemWithParentDatasetNameAndID } from '../../../types';

interface ExportDataListToWorkspaceParameters {
  keysToRemove: Array<string>;
}

const omitKeys = <T extends Record<string, unknown>>(
  obj: T,
  keys: readonly string[] = [],
): Omit<T, string> => {
  if (!keys.length) return obj;

  const toRemove = new Set(keys);
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !toRemove.has(k)),
  ) as Omit<T, string>;
};

export const exportDataListToWorkspace: DataActionFunction = async (
  validatedSelections,
  params?: Partial<ExportDataListToWorkspaceParameters>,
  onDone = () => null,
  onError = () => null,
  onAbort = () => null,
  signal = undefined,
) => {
  // first need to get file manifest

  const { keysToRemove } = params || {};

  try {
    const fileManifest = validatedSelections.reduce((acc, item) => {
      if (isValidFileItemWithParentDatasetNameAndID(item)) {
        const manifestItem: ManifestItem = {
          object_id: item.id,
          ...(item.name ? { file_name: item.name } : {}),
          ...(item.size ? { file_size: Number(item.size) } : {}),
          dataset_id: item.datasetId,
          ...item,
        };

        acc.push(
          omitKeys(
            manifestItem as Record<string, unknown>,
            keysToRemove,
          ) as ManifestItem,
        );
      }
      return acc;
    }, [] as Array<ManifestItem>);

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
