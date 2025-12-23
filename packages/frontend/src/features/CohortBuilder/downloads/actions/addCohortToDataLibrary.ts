import {
  Accessibility,
  coreStore,
  DataLibraryDataset,
  DatasetOrCohort,
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

const DEFAULT_FILE_MANIFEST_FIELDS = [
  'file_name',
  'file_size',
  'md5sum',
  'object_id',
];
const DEFUALT_DATA_LIBRARY_FIELDS = [
  'file_name',
  'file_size',
  'md5sum',
  'object_id',
  'data_format',
];

export const processFilesForManifest = (
  data: JSONObject[],
  path = '',
  fieldMapping: Record<string, string> = {
    file_name: 'file_name',
    file_size: 'file_size',
    md5sum: 'md5Sum',
    object_id: 'object_id',
    dataset_id: 'dataset_id',
  },
) => mapDataToMappingDefinition(data, path, fieldMapping);

export const processFilesForDataLibrary = (
  data: JSONObject[],
  path = '',
  fieldMapping: Record<string, string> = {
    name: 'name',
    size: 'size',
    md5sum: 'md5Sum',
    guid: 'guid',
    type: 'type',
  },
) => mapDataToMappingDefinition(data, path, fieldMapping);

export const mapDataToMappingDefinition = (
  manifestData: JSONObject[],
  path: string,
  fieldMapping: Record<string, string> = {
    file_name: 'file_name',
    file_size: 'file_size',
    md5sum: 'md5Sum',
    object_id: 'object_id',
  },
  copyAllFields: boolean = false,
) => {
  return manifestData.reduce(
    (acc, data) => {
      const root = JSONPath({ path: path, json: data });
      if (root?.length > 0) {
        root[0].forEach((dataFileItem: any) => {
          const manifestEntry = Object.keys(fieldMapping).reduce(
            (entry: Record<string, any>, field) => {
              // use jsonpath to find data
              if (fieldMapping[field] in dataFileItem) {
                entry[field] = dataFileItem[fieldMapping[field]];
              } else if (copyAllFields) {
                entry[field] = dataFileItem[field];
              }
              return entry;
            },
            {},
          );
          if (manifestEntry['object_id'] !== undefined) {
            acc.push(manifestEntry);
          }
        });
      }
      return acc;
    },

    [] as Record<string, JSONObject>[],
  );
};

export const createDataset = (data: Record<string, any>[], field: string) =>
  data.reduce<DatasetOrCohort>((acc, item) => {
    const key = String(item[field]);
    const existing = acc[key];

    if (!existing) {
      acc[key] = {
        id: key,
        name: item?.name,
        members: {
          [key]: item as FileItem,
        },
        itemType: 'Dataset',
      } as DataLibraryDataset;
    } else if (existing.itemType === 'Dataset') {
      // existing is now narrowed to DataLibraryDataset
      existing.members[key] = item as FileItem;
    }

    return acc;
  }, {});

export interface ExportCohortData extends Record<string, any> {
  datasetIdField: string;
  fileIndex: string;
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

export interface ExportCohortDataToDataLibraryParams extends ExportCohortData {
  libraryDataItemMapping?: Record<string, string>;
}

/* TODO: complete this function */
// export const addCohortDataFilesToDataLibraryAsDataset = async (
//   params: Record<string, any>,
//   done?: () => void,
//   onError?: (error: Error) => void,
//   onAbort?: () => void,
//   signal?: AbortSignal,
//   manifestFieldMapping: Record<string, string> = {},
//   dataFormat?: string,
// ): Promise<void> => {
//   // query the cohort data using the cohort as filters, and the fields needed for the data object
//
//   const cohort = selectCurrentCohortFilters(coreStore.getState());
//   const cohortName = selectCurrentCohortFilters(coreStore.getState())?.name;
//
//   const {
//     fileIndex,
//     cohortIndex,
//     accessibility,
//     datasetIdField,
//     fileIdField,
//     fileFields,
//     libraryDataItemMapping,
//   } = params as ExportCohortDataToDataLibraryParams;
//
//   // get the files information
//
//   const cohortFilters = cohort[cohortIndex] ?? EmptyFilterSet;
//
//   const fileInformationParameters: GuppyDownloadDataParams = {
//     filter: cohortFilters,
//     type: fileIndex,
//     fields: fileFields,
//     accessibility: accessibility,
//     format: 'json',
//   };
//
//   try {
//     let cohortDatafiles = await downloadJSONDataFromGuppy({
//       parameters: fileInformationParameters,
//       onAbort: onAbort,
//       signal: signal,
//     });
//     cohortDatafiles = processFilesForDataLibrary(
//       cohortDatafiles,
//       libraryDataItemMapping,
//     );
//     if (cohortDatafiles.length === 0) {
//       throw new Error('No data found for the current filters');
//     }
//
//     // create a list using the cohort name and the data files
//     const dataset = createDataset(cohortDatafiles, datasetIdField);
//
//     // add/update dataset to the data library
//
//     // add/update a list using the current cohort name
//     const str = JSON.stringify(resultFileManifest, null, 2);
//     const blob = new Blob([str], {
//       type: 'application/json;charset=utf-8',
//     });
//     if (done) done();
//   } catch (err) {
//     let resultErr;
//     if (typeof err === 'string') resultErr = new Error(err);
//     if (err instanceof Error) resultErr = err;
//     if (!resultErr) resultErr = new Error('unknown error in download manifest');
//
//     if (onError) onError(resultErr);
//   }
// };

export const exportCohortToWorkspace = async (
  params: Record<string, any>,
  done?: () => void,
  onError?: (error: Error) => void,
  onAbort?: () => void,
  signal?: AbortSignal,
): Promise<void> => {
  // query the cohort data using the cohort as filters, and the fields needed for the data object

  const cohort = selectCurrentCohortFilters(coreStore.getState());
  const cohortName = selectCurrentCohortFilters(coreStore.getState())?.name;

  const {
    fileIndex,
    cohortIndex,
    accessibility,
    metadataIndex,
    fileFields,
    manifestFieldMapping,
    metadataFields,
    dataPath = '',
  } = params as ExportCohortDataToWorkspaceParams;

  // get the files information

  const cohortFilters = cohort[cohortIndex] ?? EmptyFilterSet;

  const fileQueryParameters: GuppyDownloadDataParams = {
    filter: cohortFilters,
    type: fileIndex,
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

    // add/update dataset to the data library

    // add/update a list using the current cohort name
    if (done) done();
  } catch (err) {
    let resultErr;
    if (typeof err === 'string') resultErr = new Error(err);
    if (err instanceof Error) resultErr = err;
    if (!resultErr) resultErr = new Error('unknown error in download manifest');

    if (onError) onError(resultErr);
  }
};
