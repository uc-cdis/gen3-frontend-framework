
import { GuppyDownloadQueryParams } from './types';
import { GEN3_GUPPY_API } from '../../constants';

interface GuppyFileDownloadRequestParams extends GuppyDownloadQueryParams {
  readonly format: string;
  readonly filename: string;
  readonly total: number;
}

type DownloadOptions = {
  method: 'GET' | 'POST';
  parameters?: GuppyFileDownloadRequestParams;
  requestHeaders?: Record<string, string>;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
};

export const downloadFromGuppy = ({
                           parameters,
                           method = 'POST',
                           requestHeaders = {},
                           onStart = () => null,
                           onEnd = () => null,
                           onError = () => null,
                         }: DownloadOptions) => {
  if (onStart) {
    onStart();
  }
  const url = new URL(GEN3_GUPPY_API + '/download');
  if (parameters) {
    url.search = new URLSearchParams(parameters as any).toString();
  }
  fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...requestHeaders,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.blob();
    })
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = parameters?.filename || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (onEnd) {
        onEnd();
      }
    })
    .catch((error) => {
      if (onError) {
        onError(error);
      }
    });
};
