import type { JobBuilderAction } from '@gen3/core';

interface ExportFilesToZip {
  fileManifest: Array<unknown>;
  externalFileMetadata: Array<unknown>;
}

export interface BuildExportToFiles {
  fileMetadata: Record<string, ExportFilesToZip>;
  zipFilename: string;
}

/**
 * Creates an export to PFB action to submit to sower
 * @param params - parameters of type BuildExportToFiles
 */
export const buildExportFilesToZipJob: JobBuilderAction = (params) => {
  // TODO: tighten the typing for this.
  const { zipFilename, fileMetadata } = params as unknown as BuildExportToFiles;
  return {
    action: 'batch-export',
    input: {
      zip_filename: zipFilename,
      file_metadata: fileMetadata,
    },
  };
};
