import { buildFetchError, type FetchRequest, GEN3_FENCE_API, type Gen3FenceResponse } from '@gen3/core/server';

/**
 * Performs an asynchronous HTTP request to the Gen3 Fence API and processes the response.
 *
 * @template T The expected type of the response data.
 * @param {FetchRequest} options The options for the fetch request.
 * @param {string} options.endpoint The API endpoint to which the request will be sent.
 * @param {Record<string, string>} options.headers An object representing the HTTP headers to include in the request.
 * @param {Record<string, any>} [options.body={}] The request body to send with the fetch, used if the HTTP method is POST.
 * @param {string} [options.method='GET'] The HTTP method for the request (e.g., 'GET', 'POST').
 * @param {boolean} [options.isJSON=true] Determines if the response should be parsed as JSON or returned as plain text.
 * @returns {Promise<Gen3FenceResponse<T>>} A promise that resolves to the parsed data and response status
 *                                          or rejects with an error if the request fails.
 * @throws {Error} Throws an error if the fetch request fails or the response is not successful.
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
    headers: {
      // Ensure Content-Type is set for JSON POSTs, but allow overrides via 'headers'
      ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
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
