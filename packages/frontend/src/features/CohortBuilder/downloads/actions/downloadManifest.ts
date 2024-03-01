import {
  downloadJSONDataFromGuppy, Equals,
  FilterSet,
  GuppyDownloadDataParams, Includes,
  JSONObject,
} from '@gen3/core';
import { ManifestFieldsConfig } from '../../types';
import { handleDownload } from './utils';

const ADDITIONAL_FILE_FIELDS = ['md5sum', 'file_name', 'file_size'];

export const downloadToManifestAction = async (
  params: Record<string, any>,
  done?: () => void,
  onError?: (error: Error) => void,
  onAbort?: () => void,
  signal?: AbortSignal,
  dataFormat?: string,
): Promise<void> => {

  const mappingConfig: ManifestFieldsConfig = {
    referenceIdFieldInDataIndex: params.referenceIdFieldInDataIndex,
    referenceIdFieldInResourceIndex: params.referenceIdFieldInDataIndex,
    resourceIndexType: params.resourceIndexType,
    resourceIdField: params.resourceIdField,
  };
  const {
    referenceIdFieldInDataIndex,
    referenceIdFieldInResourceIndex,
    resourceIndexType,
    resourceIdField,
  } = mappingConfig;

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
    let rawData;
    try {
      // the additionalFields are hardcoded, so it's possible they may
      // not be available in Guppy's index. Try to download the additional fields
      // first, and if the download fails, download only the referenceIDField.
      rawData = await downloadJSONDataFromGuppy({
        parameters: {
          ...cohortFilterParams,
          fields: [referenceIdFieldInDataIndex, ...ADDITIONAL_FILE_FIELDS],
        },
        onAbort: onAbort,
        signal: signal,
      });
    } catch (err) {
      rawData = await downloadJSONDataFromGuppy({
        parameters: {
          ...cohortFilterParams,
          fields: [referenceIdFieldInDataIndex],
        },
        onAbort: onAbort,
        signal: signal,
      });
    }
    return rawData;
  }
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
    ) ;
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
              }  as Equals ,
            }
          : {}),
      },
    };

    let resultManifest;
    try {
      resultManifest = await downloadJSONDataFromGuppy({
        parameters: {
          ...cohortFilterParams,
          type: resourceIndexType,
          filter: refIdsFilter,
          fields: [
            referenceIdFieldInResourceIndex,
            resourceIdField,
            ...ADDITIONAL_FILE_FIELDS,
          ],
        },
        onAbort: onAbort,
        signal: signal,
      });
    } catch (err) {
      resultManifest = await downloadJSONDataFromGuppy({
        parameters: {
          ...cohortFilterParams,
          type: resourceIndexType,
          filter: refIdsFilter,
          fields: [referenceIdFieldInResourceIndex, resourceIdField],
        },
        onAbort: onAbort,
        signal: signal,
      });
    }
    resultManifest = resultManifest.filter(
      (x: JSONObject) => !!x[resourceIdField],
    );
    /* eslint-disable no-param-reassign */
    resultManifest.forEach((x: JSONObject) => {
      if (typeof x[resourceIdField] === 'string') {
        x[resourceIdField] = [x[resourceIdField]];
      }
    });
    handleDownload(resultManifest, params.filename);
    done && done();
  } catch (err: any) {
    onError && onError(err);
  }
};
