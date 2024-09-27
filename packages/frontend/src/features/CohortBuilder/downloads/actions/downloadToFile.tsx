import { downloadFromGuppyToBlob, GuppyDownloadDataParams } from '@gen3/core';
import { handleDownload } from './utils';

export const downloadToFileAction = async (
  params: Record<string, any>,
  done?: () => void,
  onError?: (error: Error) => void,
  onAbort?: () => void,
  signal?: AbortSignal,
): Promise<void> => {
  // call the downloadFromGuppy function
  await downloadFromGuppyToBlob({
    parameters: params as GuppyDownloadDataParams,
    onDone: (data: Blob) => {
      handleDownload(data, params.filename);
      if (done) done();
    },
    onError: (error: Error) => {
      if (onError) onError(error);
    },
    onAbort: () => {
      if (onAbort) onAbort();
    },
    signal,
  });
};
