import { gen3Api } from '../gen3';
import { GEN3_REQUESTOR_API } from '../../constants';

export interface RequestQueryBody {
  policy_id?: string;
  resource_display_name?: string;
  resource_id?: string;
  resource_path?: string;
  resource_paths?: string[];
  role_ids?: string[];
  status?: string;
  username?: string;
}

export interface RequestorResponse {
  resource_display_name?: string | null;
  updated_time?: string;
  resource_id?: string;
  request_id?: string;
  username?: string;
  status?: string;
  revoke?: boolean;
  policy_id?: string;
  created_time?: string;
}

export interface RequestListQuery {
  policy_ids: Array<string>;
  resource_ids: Array<string>;
  status: string;
  revoke: boolean;
}

/**
 * Converts a Partial<RequestListQuery> object to a URL query string
 * @param params - The parameters to convert
 * @returns A formatted query string (including the leading '?')
 */
export const convertToQueryString = (
  params: Partial<RequestListQuery>,
): string | undefined => {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }

  const queryParts: string[] = [];

  // Handle policy_ids array
  if (params.policy_ids && params.policy_ids.length > 0) {
    params.policy_ids.forEach((id) => {
      queryParts.push(`policy_id=${encodeURIComponent(id)}`);
    });
  }

  if (params.resource_ids && params.resource_ids.length > 0) {
    params.resource_ids.forEach((id) => {
      queryParts.push(`resource_id=${encodeURIComponent(id)}`);
    });
  }

  // Handle status
  if (params.status !== undefined) {
    queryParts.push(`status=${encodeURIComponent(params.status)}`);
  }

  // Handle revoke
  if (params.revoke !== undefined) {
    queryParts.push(`revoke=${params.revoke}`);
  }

  return queryParts.length > 0 ? `?${queryParts.join('&')}` : undefined;
};

/**
 * Defines requester service using a base URL and expected endpoints. Derived from gen3Api core API.
 *
 * @param endpoints - Defines endpoints used in discovery page
 *  @param request - Queries Requestor service
 *    @see https://github.com/uc-cdis/requestor?tab=readme-ov-file#requestor
 *    @see https://petstore.swagger.io/?url=https://raw.githubusercontent.com/uc-cdis/requestor/master/docs/openapi.yaml#/Query/list_requests_request_get
 * @returns: Object of request made
 */

//TODO convert snakeCase yTpes o camelCase by adding transform respomse
export const requestorApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    status: builder.query<RequestorResponse, RequestListQuery | void>({
      // get status of requestor service
      query: () => `${GEN3_REQUESTOR_API}/_status`,
    }),
    request: builder.query<RequestorResponse, Partial<RequestListQuery>>({
      query: (params?) => {
        const strParams = params ? convertToQueryString(params) : undefined;
        return `${GEN3_REQUESTOR_API}/request${strParams ?? ''}`;
      },
    }),
    userRequest: builder.query<
      Array<RequestorResponse>,
      Partial<RequestListQuery> | undefined
    >({
      // get a list of requests
      query: (params?) => {
        const strParams = params ? convertToQueryString(params) : undefined;
        return `${GEN3_REQUESTOR_API}/request/user${strParams ?? ''}`;
      },
    }),
    requestById: builder.query<RequestorResponse, string>({
      query: (requestId) => `${GEN3_REQUESTOR_API}/request/${requestId}`,
    }),
    createRequest: builder.mutation<RequestorResponse, RequestQueryBody>({
      query: (queryBody: RequestQueryBody) => ({
        url: `${GEN3_REQUESTOR_API}/request`,
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryBody),
      }),
    }),
  }),
});

export const {
  useCreateRequestMutation,
  useRequestQuery,
  useLazyRequestQuery,
  useStatusQuery: useRequestorStatusQuery,
  useRequestByIdQuery,
  useUserRequestQuery,
} = requestorApi;
