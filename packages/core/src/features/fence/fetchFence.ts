import { type FetchRequest, type Gen3FenceResponse } from './types';
import { GEN3_FENCE_API } from '../../constants';
import { buildFetchError } from './utils';


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
    credentials: 'include',
    headers: headers,
    body: 'POST' === method ? JSON.stringify(body) : null,
  }, );

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
