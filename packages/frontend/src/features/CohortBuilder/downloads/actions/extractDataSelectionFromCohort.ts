import {
  Accessibility,
  DatasetOrCohort,
  downloadJSONDataFromGuppy,
  FilterSet,
  GuppyDownloadDataParams,
  JSONObject,
} from '@gen3/core';
import {
  createDatasets,
  processFilesForDataLibrary,
} from './addCohortToDataLibrary';

interface ExtractDataSelectionFromCohortParams {
  index: string;
  accessibility?: Accessibility;
  fileFields: string[];
  datasetIdField: string;
  libraryDataItemMapping?: Record<string, string>;
  dataPath?: string;
  cohortFilters: FilterSet;
}

export interface ExtractDataSelectionFromCohortResult {
  ok: boolean;
  datasets: DatasetOrCohort;
  error?: {
    kind: 'abort' | 'invalid-args' | 'network' | 'unknown';
    message: string;
  };
}

const toErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message || 'Unknown error';
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown error';
  }
};

/**
 * Accepts either:
 * - a JSONPath fragment like "*" or "data.items"
 * - a full JSONPath like "$.*" or "$.data.items"
 * and normalizes to a valid JSONPath string.
 */
const normalizeJsonPath = (dataPath: string): string => {
  const trimmed = (dataPath ?? '').trim();
  if (!trimmed) return '$.*';
  if (trimmed.startsWith('$')) return trimmed;
  if (trimmed.startsWith('.')) return `$${trimmed}`;
  return `$.${trimmed}`;
};

export async function extractDataSelectionFromCohort({
  cohortFilters,
  index,
  accessibility = Accessibility.ALL,
  fileFields,
  libraryDataItemMapping,
  datasetIdField = 'dataset_id',
  dataPath = '*',
}: ExtractDataSelectionFromCohortParams): Promise<ExtractDataSelectionFromCohortResult> {
  if (!index || !Array.isArray(fileFields) || fileFields.length === 0) {
    return {
      ok: false,
      datasets: {},
      error: {
        kind: 'invalid-args',
        message:
          'Missing required parameters: fileIndex and non-empty fileFields.',
      },
    };
  }

  const fileInformationParameters: GuppyDownloadDataParams = {
    filter: cohortFilters,
    type: index,
    fields: fileFields,
    accessibility: accessibility,
    format: 'json',
  };

  try {
    const raw = (await downloadJSONDataFromGuppy({
      parameters: fileInformationParameters,
    })) as JSONObject[];

    const path = normalizeJsonPath(dataPath);
    const files = processFilesForDataLibrary(raw, path, libraryDataItemMapping);

    const datasets = createDatasets(files, datasetIdField);

    return { ok: true, datasets };
  } catch (err: unknown) {
    const message = toErrorMessage(err);
    const kind = message.toLowerCase().includes('abort') ? 'abort' : 'unknown';

    return {
      ok: false,
      datasets: {},
      error: { kind, message },
    };
  }
}
