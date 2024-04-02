import {
  downloadJSONDataFromGuppy, Equals,
  FilterSet,
  GuppyDownloadDataParams, Includes,
  JSONObject,
} from '@gen3/core';
import { handleDownload } from './utils';
import { TextEncoder } from 'util';
global.TextEncoder = TextEncoder;

/**
 * Process the manifest data given the data and the fields to include in the manifest.
 * Check if the item in the data contains the fields to include in the manifest.
 * if not, remove the item from the data.
 * @param data
 * @param resourceIdField
 * @param manifestFields
 */
export const processManifest = (data: JSONObject[], resourceIdField: string, manifestFields: string[]) => {
  return data.filter((item) => {
    const hasAllFields = manifestFields.every((field) => {
      return item[field] !== undefined;
    });
    return hasAllFields && item[resourceIdField] !== undefined;
  });
};

export interface DownloadToManifestParams extends Record<string, any>{
  resourceIndexType: string;
  resourceIdField: string;
  referenceIdFieldInDataIndex?: string;
  referenceIdFieldInResourceIndex?: string;
  fileFields?: string[];
}

export const downloadToManifestAction = async (
  params: Record<string, any>,
  done?: () => void,
  onError?: (error: Error) => void,
  onAbort?: () => void,
  signal?: AbortSignal,
  dataFormat?: string,
): Promise<void> => {

  const {
    referenceIdFieldInDataIndex,
    referenceIdFieldInResourceIndex,
    resourceIndexType,
    resourceIdField,
    fileFields,
  } = params;

  const manifestFields = fileFields ?? [];
  const manifestFilename = params?.filename ?? `${params.type}_manifest.json`;

  const cohortFilterParams: GuppyDownloadDataParams = {
    filter: params.filter,
    type: params.type,
    fields: params.fields,
    accessibility: params.accessibility,
    sort: params.sort,
    format: 'json',
  };

  // getting data from the same index.
  if (params.type === resourceIndexType) {
    try {
      let resultManifest = await downloadJSONDataFromGuppy({
        parameters: {
          ...cohortFilterParams,
          fields: [referenceIdFieldInDataIndex, ...manifestFields],
        },
        onAbort: onAbort,
        signal: signal,
      });
      resultManifest = processManifest(resultManifest, resourceIdField, manifestFields);
      if (resultManifest.length === 0) {
        throw new Error('No data found for the current filters');
      }
      const bytes = new TextEncoder().encode(JSON.stringify(resultManifest));
      const blob = new Blob([bytes], {
        type: "application/json;charset=utf-8"
      });
      handleDownload(blob, manifestFilename);
      done && done();
    } catch (err: any) {
      onError && onError(err);
    }
    return;
  }
  // join data from two different indices
  try {
    // get a list of reference IDs from the data index using the current cohort filters
    let refIDList = await downloadJSONDataFromGuppy({

      parameters: {
        ...cohortFilterParams,
        fields: [referenceIdFieldInDataIndex],
      },
      onAbort: onAbort,
      signal: signal,
    });
    // get the reference IDs from the list
    refIDList = refIDList.map(
      (item: JSONObject) => item[referenceIdFieldInDataIndex],
    );
    // create a filter of the ids to use in the resource index
    const refIdsFilter: FilterSet = {
      mode: 'and',
      root: {
        manifest_ids: {
          operator: 'in',
          operands: refIDList as string[],
          field: referenceIdFieldInResourceIndex,
        } as Includes,
        ...(dataFormat
          ? {
            data_format: {
              operator: '=',
              operand: dataFormat,
              field: 'data_format',
            } as Equals,
          }
          : {}),
      },
    };

    let resultManifest = await downloadJSONDataFromGuppy({
      parameters: {
        ...cohortFilterParams,
        type: resourceIndexType,
        filter: refIdsFilter,
        fields: [
          referenceIdFieldInResourceIndex,
          resourceIdField,
          ...manifestFields
        ],
      },
      onAbort: onAbort,
      signal: signal,
    });

    resultManifest = resultManifest.filter(
      (x: JSONObject) => !!x[resourceIdField],
    );
    /* eslint-disable no-param-reassign */
    resultManifest.forEach((x: JSONObject) => {
      if (typeof x[resourceIdField] === 'string') {
        x[resourceIdField] = [x[resourceIdField]];
      }
    });
    const bytes = new TextEncoder().encode(JSON.stringify(resultManifest));
    const blob = new Blob([bytes], {
      type: "application/json;charset=utf-8"
    });
    handleDownload(blob, manifestFilename);
    done && done();
  } catch (err: any) {
    onError && onError(err);
  }
};
