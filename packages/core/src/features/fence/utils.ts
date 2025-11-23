import { FetchError } from './types';

export const isFetchError = <T>(obj: unknown): obj is FetchError<T> => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const { url, status, statusText, text } = obj as Partial<FetchError<T>>;

  return (
    typeof url === 'string' &&
    typeof status === 'number' &&
    typeof statusText === 'string' &&
    typeof text === 'string'
  );
};

/**
 * Template for fence error response dict
 * @returns: An error dict response from a RESTFUL API request
 */
export const buildFetchError = async <T>(
  res: Response,
  request?: T,
): Promise<FetchError<T>> => {
  return {
    url: res.url,
    status: res.status,
    statusText: res.statusText,
    text: await res.text(),
    request: request,
  };
};
