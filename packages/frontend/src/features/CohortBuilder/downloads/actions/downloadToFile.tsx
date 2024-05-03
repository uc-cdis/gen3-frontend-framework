import { downloadFromGuppyToBlob, GuppyDownloadDataParams } from '@gen3/core';
import { handleDownload } from './utils';


export const downloadToFileAction = async (
  params: Record<string, any> ,
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
      done && done();
    },
    onError: (error: Error) => {
      onError && onError(error);
    },
    onAbort: () => {
      onAbort && onAbort();
    },
    signal,
  });
};
