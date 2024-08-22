import { DownloadFromGuppyParams, GuppyDownloadDataParams } from './types';
import { GEN3_GUPPY_API } from '../../constants';
import { selectCSRFToken } from '../user';
import { coreStore } from '../../store';
import { convertFilterSetToGqlFilter } from '../filters';
import { jsonToFormat } from './conversion';
import { isJSONObject } from '../../types';
import { JSONPath } from 'jsonpath-plus';
import { useGetFieldsForIndexQuery } from './guppySlice';

/**
 * Represents a configuration for making a fetch request.
 *
 * @typedef {Object} FetchConfig
 * @property {string} method - The HTTP method to use for the request.
 * @property {Object<string, string>} headers - The headers to include in the request.
 * @property {string} body - The request body.
 */
export type FetchConfig = {
  method: string;
  headers: Record<string, string>;
  body: string;
};

/**
 * Prepares a URL for downloading by appending '/download' to the provided apiUrl.
 *
 * @param {string} apiUrl - The base URL to be used for preparing the download URL.
 * @returns {URL} - The prepared download URL as a URL object.
 */
const prepareUrl = (apiUrl: string) => new URL(apiUrl + '/download');

/**
 * Prepares a fetch configuration object for downloading files from Guppy.
 *
 * @param {GuppyFileDownloadRequestParams} parameters - The parameters to include in the request body.
 * @param {string} csrfToken - The CSRF token to include in the request headers.
 * @returns {FetchConfig} - The prepared fetch configuration object.
 */
const prepareFetchConfig = (
  parameters: GuppyDownloadDataParams,
  csrfToken?: string,
): FetchConfig => {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken !== undefined && { 'X-CSRF-Token': csrfToken }),
      // TODO: Add credentials
    },
    body: JSON.stringify({
      type: parameters.type,
      filter: convertFilterSetToGqlFilter(parameters.filter),
      accessibility: parameters.accessibility,
      fields: parameters?.fields,
      sort: parameters?.sort,
    }),
  };
};

/**
 * Downloads a file from Guppy using the provided parameters.
 * It will optionally convert the data to the specified format.
 *
 * @param {DownloadFromGuppyParams} parameters - The parameters to use for the download request.
 * @param onStart - The function to call when the download starts.
 * @param onDone - The function to call when the download is done.
 * @param onError - The function to call when the download fails.
 * @param onAbort - The function to call when the download is aborted.
 * @param signal - AbortSignal to use for the request.
 */
export const downloadFromGuppyToBlob = async ({
  parameters,
  onStart = () => null,
  onDone = (_: Blob) => null,
  onError = (_: Error) => null,
  onAbort = () => null,
  signal = undefined,
}: DownloadFromGuppyParams) => {
  const csrfToken = selectCSRFToken(coreStore.getState());
  onStart?.();

  const url = prepareUrl(GEN3_GUPPY_API);
  const fetchConfig = prepareFetchConfig(parameters, csrfToken);

  fetch(url.toString(), {
    ...fetchConfig,
    ...(signal ? { signal: signal } : {}),
  } as RequestInit)
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      let jsonData = await response.json();
      if (parameters?.rootPath && parameters.rootPath) {
        // if rootPath is provided, extract the data from the rootPath
        jsonData = JSONPath({
          json: jsonData,
          path: `$.[${parameters.rootPath}]`,
          resultType: 'value',
        });
      }
      // convert the data to the specified format and return a Blob
      let str = '';
      if (parameters.format === 'json') {
        str = JSON.stringify(jsonData);
      } else {
        const convertedData = await jsonToFormat(jsonData, parameters.format);
        if (isJSONObject(convertedData)) {
          str = JSON.stringify(convertedData, null, 2);
        } else {
          str = convertedData;
        }
      }
      return new Blob([str], {
        type: 'application/json',
      });
    })
    .then((blob) => {
      onDone?.(blob);
    })
    .catch((error) => {
      // Abort is handle as an exception
      if (error.name == 'AbortError') {
        // handle abort()
        onAbort?.();
      }
      onError?.(error);
    });
};

export const downloadJSONDataFromGuppy = async ({
  parameters,
  onAbort = () => null,
  signal = undefined,
}: DownloadFromGuppyParams) => {
  const csrfToken = selectCSRFToken(coreStore.getState());

  const url = prepareUrl(GEN3_GUPPY_API);
  const fetchConfig = prepareFetchConfig(parameters, csrfToken);
  try {
    const response = await fetch(url.toString(), {
      ...fetchConfig,
      ...(signal ? { signal: signal } : {}),
    } as RequestInit);

    let jsonData = await response.json();
    if (parameters?.rootPath && parameters.rootPath) {
      // if rootPath is provided, extract the data from the rootPath
      jsonData = JSONPath({
        json: jsonData,
        path: `$.[${parameters.rootPath}]`,
        resultType: 'value',
      });
    }
    // convert the data to the specified format and return a Blob
    return jsonData;
  } catch (error: any) {
    // Abort is handle as an exception
    if (error.name == 'AbortError') {
      // handle abort()
      onAbort?.();
    }
    throw new Error(error);
  }
};

export const useGetIndexFields = (index: string) => {
  const { data } = useGetFieldsForIndexQuery(index);
  return data ?? [];
};
