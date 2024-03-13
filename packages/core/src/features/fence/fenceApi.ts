import { gen3Api } from '../gen3';
import { Gen3Response } from '../../dataAccess';
import { GEN3_FENCE_ENDPOINT } from '../../constants';

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

export const loginProvidersApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getLoginProviders: builder.query<Gen3FenceLoginProviders, void>({
      query: () => `${GEN3_FENCE_ENDPOINT}/user/login`,
    }),
  }),
});

export const { useGetLoginProvidersQuery } = loginProvidersApi;

export interface FetchRequest {
  readonly hostname: string;
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

export const fetchFence = async <T>(
  request: FetchRequest,
): Promise<Gen3FenceResponse<T>> => {
  console.log("fetchFence request", request)
  const res = await fetch(`${request.hostname}${request.endpoint}`, {
    method: request.method,
    headers: request.headers,
    body: 'POST' === request.method ? JSON.stringify(request.body) : null,
  });
  if (res.ok) return { data: await res.json() };

  throw await buildFetchError(res, request);
};
