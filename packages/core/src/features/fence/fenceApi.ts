import { gen3Api } from '../gen3/gen3Api';
import { GEN3_FENCE_API, GEN3_REDIRECT_URL } from '../../constants';
import { fetchFence } from './utils';

export interface NameUrl {
  readonly name: string;
  readonly url: string;
}

export interface Gen3LoginProvider {
  readonly desc?: string;
  readonly id: string;
  readonly idp: string;
  readonly name: string;
  readonly secondary: boolean;
  readonly url: string;
  readonly urls: Array<NameUrl>;
}

export interface Gen3FenceLoginProviders {
  readonly default_provider: Gen3LoginProvider;
  readonly providers: Array<Gen3LoginProvider>;
}

/**
 * Creates a fence API endpoint for handling login processes
 * @param endpoints - defined endpoint query for logging in
 * @returns: The generated fence login API slice
 */
export const loginProvidersApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getLoginProviders: builder.query<Gen3FenceLoginProviders, void>({
      query: () => `${GEN3_FENCE_API}/user/login`,
    }),
  }),
});

export const { useGetLoginProvidersQuery } = loginProvidersApi;

export interface FetchRequest {
  readonly endpoint: string;
  readonly method?: 'GET' | 'POST';
  readonly body?: object;
  readonly headers?: Record<string, string>;
  readonly isJSON?: boolean;
}

export interface Gen3FenceResponse<H = JSONObject | string> {
  readonly data: H;
  readonly status: number; // HTTP Status code
}

export interface FetchError<T> {
  readonly url: string;
  readonly status: number;
  readonly statusText: string;
  readonly text: string;
  readonly request?: T;
}

/**
 * Template for fence error response dict
 * @returns: An error dict response from a RESTFUL API request
 */
const buildFetchError = async <T>(
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
export const fetchFence = async <T>(
  {
    endpoint,
    headers,
    body = { },
    method = 'GET',
    isJSON = true
  }: FetchRequest,

): Promise<Gen3FenceResponse<T>> => {
  const res = await fetch(`${GEN3_FENCE_API}${endpoint}`, {
    method: method,
    headers: headers,
    body: 'POST' === method ? JSON.stringify(body) : null,
  });

  if (res.ok) return {
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

/**
 * Logout from fence
 */

export const logoutFence = async (redirect = '/') =>
  await fetchFence({
    endpoint: `/user/logout?next=${GEN3_REDIRECT_URL}${redirect}`,
    method: 'GET',
  });
