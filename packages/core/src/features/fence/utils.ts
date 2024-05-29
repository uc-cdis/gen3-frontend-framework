import { FetchError, Gen3FenceResponse } from './types';
import { GEN3_FENCE_API } from '../../constants';
import { FetchRequest } from './fenceApi';

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
/**
 * Template for a standard fence request
 * @returns: response data
 */
export const fetchFence = async <T>({
  endpoint,
  headers,
  body = {},
  method = 'GET',
  isJSON = true,
}: FetchRequest): Promise<Gen3FenceResponse<T>> => {
  const res = await fetch(`${GEN3_FENCE_API}${endpoint}`, {
    method: method,
    headers: headers,
    body: 'POST' === method ? JSON.stringify(body) : null,
  });

  if (res.ok)
    return {
      data: isJSON ? await res.json() : await res.text(),
      status: res.status,
    };

  throw await buildFetchError(res, {
    endpoint,
    method,
    headers,
    body,
  });
};
