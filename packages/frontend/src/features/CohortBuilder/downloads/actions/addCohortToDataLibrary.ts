import {
  Accessibility,
  coreStore,
  downloadJSONDataFromGuppy,
  EmptyFilterSet,
  GuppyDownloadDataParams,
  JSONObject,
  selectCurrentCohortFilters,
} from '@gen3/core';

export const processFiles = (
  data: JSONObject[],
  manifestFields: string[],
  idField: string,
  fieldMapping: Record<string, string> = {},
) => {
  return data.filter((item) => {
    const hasAllFields = manifestFields.every((field) => {
      return item[field] !== undefined;
    });
    return hasAllFields && item[idField] !== undefined;
  });
};

export interface ExportCohortDataToWorkspace extends Record<string, any> {
  datasetIdField: string;
  fileIndex: string;
  cohortIndex: string;
  fileIdField: string;
  fileFields: string[];
  metadataFields: string[];
  accessibility: Accessibility;
}

export const addCohortDataFilesToDataLibraryAsDataset = async (
  params: Record<string, any>,
  done?: () => void,
  onError?: (error: Error) => void,
  onAbort?: () => void,
  signal?: AbortSignal,
  manifestFieldMapping: Record<string, string> = {},
  dataFormat?: string,
): Promise<void> => {
  // query the cohort data using the cohort as filters, and the fields needed for the data object

  const cohort = selectCurrentCohortFilters(coreStore.getState());

  console.log('cohort is', cohort);

  const {
    fileIndex,
    cohortIndex,
    accessibility,
    datasetIdField,
    fileIdField,
    fileFields,
    metadataFields,
  } = params as ExportCohortDataToWorkspace;

  // get the files information

  const cohortFilters = cohort[cohortIndex] ?? EmptyFilterSet;

  const fileInformationParameters: GuppyDownloadDataParams = {
    filter: cohortFilters,
    type: fileIndex,
    fields: fileFields,
    accessibility: accessibility,
    format: 'json',
  };

  try {
    let resultFileManifest = await downloadJSONDataFromGuppy({
      parameters: fileInformationParameters,
      onAbort: onAbort,
      signal: signal,
    });
    resultFileManifest = processFiles(
      resultFileManifest,
      fileFields,
      fileIdField,
    );
    if (resultFileManifest.length === 0) {
      throw new Error('No data found for the current filters');
    }
    const str = JSON.stringify(resultFileManifest, null, 2);
    const blob = new Blob([str], {
      type: 'application/json;charset=utf-8',
    });
    if (done) done();
  } catch (err) {
    let resultErr;
    if (typeof err === 'string') resultErr = new Error(err);
    if (err instanceof Error) resultErr = err;
    if (!resultErr) resultErr = new Error('unknown error in download manifest');

    if (onError) onError(resultErr);
  }
};
