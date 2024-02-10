import {
  GuppyDownloadDataParams,
  downloadFromGuppy,
} from '@gen3/core';

interface DownloadFileFromGuppyParams extends GuppyDownloadDataParams {
  filename: string;
}

export interface DownloadActionParams {
  done?: () => void;
  onError?: (error: Error) => void;
}

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
  params: DownloadFileFromGuppyParams,
  done?: () => void,
  onError?: (error: Error) => void,
  onAbort?: () => void,
  signal?: AbortSignal,
): Promise<void> => {
  const handleData = (data: Blob) => {
    handleDownload(data, params.filename);
    done && done();
  };

  downloadFromGuppy({
    parameters: params,
    onDone: (data: Blob) => handleData(data),
    onError: (error: Error) => {
      onError && onError(error);
    },
    onAbort: () => {
      onAbort && onAbort();
    },
    signal,
  });
};
