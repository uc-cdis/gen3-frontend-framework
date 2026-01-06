import {
  Accessibility,
  coreStore,
  DataLibraryDataset,
  downloadJSONDataFromGuppy,
  EmptyFilterSet,
  fetchJSONDataFromURL,
  FileItem,
  GEN3_MANIFEST_API,
  GuppyDownloadDataParams,
  HttpMethod,
  JSONObject,
  selectCurrentCohortFilters,
} from '@gen3/core';
import { JSONPath } from 'jsonpath-plus';

export const processFilesForManifest = (
  data: JSONObject[],
  path = '',
  fieldMapping: Record<string, string> = {
    file_name: 'file_name',
    file_size: 'file_size',
    md5sum: 'md5Sum',
    object_id: 'object_id',
  },
) => mapDataToMappingDefinition(data, path, fieldMapping);

export const processFilesForDataLibrary = (
  data: JSONObject[],
  path = '$.*',
  fieldMapping: Record<string, string> = {
    name: 'name',
    size: 'size',
    md5sum: 'md5Sum',
    guid: 'guid',
    type: 'type',
    dataset_id: 'dataset_id',
  },
): Record<string, JSONObject>[] =>
  mapDataToMappingDefinition(data, path, fieldMapping);

export const mapDataToMappingDefinition = (
  manifestData: JSONObject[],
  path: string,
  fieldMapping: Record<string, string> = {
    file_name: 'file_name',
    file_size: 'file_size',
    md5sum: 'md5Sum',
    id: 'id',
    dataset_id: 'dataset_id',
  },
): Record<string, JSONObject>[] => {
  const missing: JSONObject[] = [];
  const results = manifestData.reduce(
    (acc: Record<string, JSONObject>[], data) => {
      const root = JSONPath({ path: path, json: data });
      if (root?.length > 0) {
        root[0].forEach((dataFileItem: any) => {
          const manifestEntry = Object.keys(fieldMapping).reduce(
            (entry: Record<string, any>, field) => {
              if (fieldMapping[field] in dataFileItem) {
                entry[field] = dataFileItem[fieldMapping[field]];
              }
              return entry;
            },
            {},
          );
          if (manifestEntry['id'] !== undefined) {
            // only add if we have an object_id
            acc.push(manifestEntry);
          } else {
            missing.push(manifestEntry);
          }
        });
      }
      return acc;
    },
    [],
  );
  if (missing.length > 0) {
    console.warn(
      `The following files were not added to the manifest because they do not have an object_id: ${JSON.stringify(
        missing,
      )}`,
    );
  }
  return results;
};

/**
 * Given a flattened list of data items where the with a dataset_id, create an array of datasets
 * @param data
 * @param field
 */
export const createDatasets = (data: Record<string, any>[], field: string) =>
  data.reduce<Record<string, DataLibraryDataset>>((acc, item, index) => {
    // for every item in the data
    // get it's dataset is and add it to the acc
    const datasetId = String(item[field]); // get the id of the dataset or cohort
    const entryExists = acc[datasetId];
    const fileItem = item as FileItem;
    if (entryExists && entryExists.itemType === 'Dataset') {
      entryExists.members[fileItem.id] = fileItem;
    } else {
      acc[datasetId] = {
        id: datasetId,
        name: item?.name ?? `${datasetId}-${index}`,
        members: {
          [fileItem.id]: fileItem,
        },
        itemType: 'Dataset',
      };
    }
    return acc;
  }, {});

export interface ExportCohortData extends Record<string, any> {
  datasetIdField: string;
  index: string;
  cohortIndex: string;
  fileIdField: string;
  fileFields: string[];
  accessibility: Accessibility;
}

export interface ExportCohortDataToWorkspaceParams extends ExportCohortData {
  manifestFieldMapping?: Record<string, string>;
  metadataFields: string[];
  metadataIndex: string;
  dataPath?: string;
}

const REQUIRED_FIELDS = [
  'datasetIdField',
  'fileIndex',
  'cohortIndex',
  'fileIdField',
  'fileFields',
];

export interface ExportCohortDataToDataLibraryParams extends ExportCohortData {
  libraryDataItemMapping?: Record<string, string>;
}

/* TODO: complete this function */
export const addCohortDataFilesToDataLibraryAsDataset = async (
  params: Record<string, any>,
  done?: (params?: unknown) => void,
  onError?: (error: Error) => void,
  onAbort?: () => void,
  signal?: AbortSignal,
  onComplete?: (arg?: any) => void,
): Promise<void> => {
  // query the cohort data using the cohort as filters, and the fields needed for the data object

  const cohort = selectCurrentCohortFilters(coreStore.getState());
  const {
    index,
    cohortIndex,
    accessibility,
    datasetIdField = 'dataset_id',
    fileIdField,
    fileFields,
    libraryDataItemMapping,
    dataPath = '*',
  } = params as ExportCohortDataToDataLibraryParams;

  // test if all required fields are present
  if (REQUIRED_FIELDS.some((field) => !(field in params))) {
    if (onError)
      onError(
        new Error(`Missing required fields: ${REQUIRED_FIELDS.join(', ')}`),
      );
    return;
  }

  const cohortFilters = cohort[cohortIndex] ?? EmptyFilterSet;

  const fileInformationParameters: GuppyDownloadDataParams = {
    filter: cohortFilters,
    type: index,
    fields: fileFields,
    accessibility: accessibility,
    format: 'json',
  };

  try {
    let cohortDatafiles = await downloadJSONDataFromGuppy({
      parameters: fileInformationParameters,
      onAbort: onAbort,
      signal: signal,
    });
    cohortDatafiles = processFilesForDataLibrary(
      cohortDatafiles,
      `$.${dataPath}`,
      libraryDataItemMapping,
    );
    if (cohortDatafiles.length === 0) {
      throw new Error('No data found for the current filters');
    }

    // create a list using the cohort name and the data files
    const datasets = createDatasets(cohortDatafiles, datasetIdField);
    // add/update dataset to the data library
    if (done) done(); // clear the notification

    if (onComplete) onComplete(datasets);
  } catch (err) {
    let resultErr;
    if (typeof err === 'string') resultErr = new Error(err);
    if (err instanceof Error) resultErr = err;
    if (!resultErr) resultErr = new Error('unknown error in download manifest');
    if (onError) onError(resultErr);
  }
};

export const exportCohortToWorkspace = async (
  params: Record<string, any>,
  done?: () => void,
  onError?: (error: Error) => void,
  onAbort?: () => void,
  signal?: AbortSignal,
): Promise<void> => {
  // query the cohort data using the cohort as filters, and the fields needed for the data object

  const cohort = selectCurrentCohortFilters(coreStore.getState());

  const {
    index,
    cohortIndex,
    accessibility,
    metadataIndex,
    fileFields,
    manifestFieldMapping,
    metadataFields,
    dataPath = '',
  } = params as ExportCohortDataToWorkspaceParams;

  // add check for required fields
  // get the files information

  const cohortFilters = cohort[cohortIndex] ?? EmptyFilterSet;

  const fileQueryParameters: GuppyDownloadDataParams = {
    filter: cohortFilters,
    type: index,
    fields: fileFields,
    accessibility: accessibility,
    format: 'json',
  };

  const metadataQueryParameters: GuppyDownloadDataParams = {
    filter: cohortFilters,
    type: cohortIndex,
    fields: metadataFields,
    accessibility: accessibility,
    format: 'json',
  };

  try {
    let cohortDatafiles = await downloadJSONDataFromGuppy({
      parameters: fileQueryParameters,
      onAbort: onAbort,
      signal: signal,
    });
    cohortDatafiles = processFilesForManifest(
      cohortDatafiles,
      dataPath,
      manifestFieldMapping,
    );

    if (cohortDatafiles.length === 0) {
      throw new Error('No data found for the current filters');
    }

    const cohortMetaData = await downloadJSONDataFromGuppy({
      parameters: metadataQueryParameters,
      onAbort: onAbort,
      signal: signal,
    });

    // save files manifest
    await fetchJSONDataFromURL(
      `${GEN3_MANIFEST_API}/`,
      true,
      'POST' as HttpMethod,
      JSON.stringify(cohortDatafiles),
      signal,
    );

    // save the metadata
    await fetchJSONDataFromURL(
      `${GEN3_MANIFEST_API}/metadata`,
      true,
      'POST' as HttpMethod,
      JSON.stringify(cohortMetaData),
      signal,
    );

    if (done) done();
  } catch (err) {
    let resultErr;
    if (typeof err === 'string') resultErr = new Error(err);
    if (err instanceof Error) resultErr = err;
    if (!resultErr) resultErr = new Error('unknown error in download manifest');

    if (onError) onError(resultErr);
  }
};
