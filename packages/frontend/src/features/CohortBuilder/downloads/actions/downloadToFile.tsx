import { GuppyDownloadDataParams, downloadFromGuppy } from '@gen3/core';


const handleDownload = (data: Blob, filename: string) => {
  const aElement = document.createElement('a');
  const href = URL.createObjectURL(data);
  aElement.setAttribute('download', filename);
  aElement.href = href;
  aElement.setAttribute('target', '_blank');
  aElement.click();
  URL.revokeObjectURL(href);
};

export const downloadToFileAction = async (
  params: Record<string, any> ,
  done?: () => void,
  onError?: (error: Error) => void,
  onAbort?: () => void,
  signal?: AbortSignal,
): Promise<void> => {

  // call the downloadFromGuppy function
  await downloadFromGuppy({
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
