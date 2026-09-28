import type { DownloadFromGuppyParams, GuppyDownloadDataParams } from './types';
import { GEN3_GUPPY_API } from '../../constants';
import { selectCSRFToken } from '../user/userSliceRTK';
import { coreStore } from '../../store';
import { convertFilterSetToGqlFilter } from '../filters';
import { jsonToFormat } from './conversion';
import { isJSONObject } from '../../types';
import { JSONPath } from 'jsonpath-plus';
import { getCookie } from 'cookies-next';

export type FetchConfig = {
  method: string;
  headers: Headers;
  body: string;
};

const prepareUrl = (apiUrl: string) => `${apiUrl}/download`;

const prepareFetchConfig = (
  parameters: GuppyDownloadDataParams,
  csrfToken?: string,
): FetchConfig => {
  const headers: Headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(csrfToken !== undefined && { 'X-CSRF-Token': csrfToken }),
  });

  if (process.env.NODE_ENV === 'development') {
    const accessToken = getCookie('credentials_token');
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      type: parameters.type,
      filter: convertFilterSetToGqlFilter(parameters.filter),
      accessibility: parameters.accessibility,
      fields: parameters?.fields,
      sort: parameters?.sort,
    }),
  };
};

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
      if (parameters?.rootPath) {
        jsonData = JSONPath({
          json: jsonData,
          path: `$.[${parameters.rootPath}]`,
          resultType: 'value',
        });
      }
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
    .then((blob) => onDone?.(blob))
    .catch((error) => {
      if (error.name == 'AbortError') {
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
    if (parameters?.rootPath) {
      jsonData = JSONPath({
        json: jsonData,
        path: `$.[${parameters.rootPath}]`,
        resultType: 'value',
      });
    }
    return jsonData;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      onAbort?.();
    }
    throw new Error(error);
  }
};
