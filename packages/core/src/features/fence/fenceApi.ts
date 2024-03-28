import { gen3Api } from '../gen3';
import { Gen3Response } from '../../dataAccess';
import { GEN3_FENCE_API } from '../../constants';

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
  readonly method: 'GET' | 'POST';
  readonly body?: object;
  readonly headers?: Record<string, string>;
  readonly csrfToken?: string;
}

export interface Gen3FenceRequest {
  readonly hostname: string;
  readonly endpoint: string;
  readonly method: 'GET' | 'POST';
  readonly body?: object;
}

export type Gen3FenceResponse<H> = Gen3Response<H>;

export interface FetchError<T> {
  readonly url: string;
  readonly status: number;
  readonly statusText: string;
  readonly text: string;
  readonly request?: T;
}

/**
 * Template for fence error response dict
 * @returns: An error dict reponse from a RESTFUL API request
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
  request: FetchRequest,
): Promise<Gen3FenceResponse<T>> => {
  const res = await fetch(`${GEN3_FENCE_API}${request.endpoint}`, {
    method: request.method,
    headers: request.headers,
    body: 'POST' === request.method ? JSON.stringify(request.body) : null,
  });
  if (res.ok) return { data: await res.json() };

  throw await buildFetchError(res, request);
};
