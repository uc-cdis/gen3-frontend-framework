import {
  convertFilterSetToGqlFilter,
  type DispatchJobParameters,
  type FilterSet,
  type JobBuilderAction,
} from '@gen3/core';
import { sowerJobBuilderRegistry } from '../../../Sower/actions/sowerActionFactory';
import type { DownloadToManifestParams } from './downloadManifest';

interface BuildPFBFromCohortParams extends Record<string, unknown> {
  filter: FilterSet;
  index: string;
}

/**
 * Creates an export to PFB action to submit to sower
 * @param params
 */
const buildPFBFromCohort: JobBuilderAction = (params) => {
  const { filter, index } = params as BuildPFBFromCohortParams;
  return {
    action: 'export',
    input: {
      filters: convertFilterSetToGqlFilter(filter),
      root_node: index,
    },
  };
};

/**
 * Creates an export to PFB action to submit to sower
 * @param params
 */
const buildPFBFromFiles: JobBuilderAction = (params) => {
  const { filter, index } = params as BuildPFBFromCohortParams;
  return {
    action: 'export-files',
    input: {
      filters: convertFilterSetToGqlFilter(filter),
      root_node: index,
    },
  };
};

interface ExportFileToZipParams extends DownloadToManifestParams {
  filename: string;
}

interface ExportFileToZip {
  fileManifest: Array<unknown>;
  externalFileMetadata: Array<unknown>;
}

// given the file manifest parameters build the sower job body

/**
 * Creates an export zip files action to submit to sower
 * @param params
 */
const exportFileManifestToZip: JobBuilderAction = (params) => {
  let resultManifest: DispatchJobParameters = {
    action: 'batch-export',
    input: {
      file_manifest: [],
      external_file_metadata: [],
    },
  };

  const onDone = (args?: unknown) => {
    const { fileManifest, externalFileMetadata } = args as ExportFileToZip;
    resultManifest = {
      action: 'batch-export',
      input: {
        file_manifest: fileManifest ?? [],
        external_file_metadata: externalFileMetadata ?? [],
      },
    };
  };

  console.log('exportFileManifestToZip', resultManifest);

  return resultManifest;
};

export const registerCohortSowerActions = () => {
  sowerJobBuilderRegistry.register('export-cohort-to-pfb', buildPFBFromCohort);
  sowerJobBuilderRegistry.register('export-files-to-pfb', buildPFBFromFiles);
  sowerJobBuilderRegistry.register(
    'download-manifest-to-zip',
    exportFileManifestToZip,
  );
};
