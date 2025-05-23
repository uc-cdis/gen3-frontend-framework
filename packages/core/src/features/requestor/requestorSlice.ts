import { gen3Api } from '../gen3';
import { GEN3_REQUESTOR_API } from '../../constants';
import { RequestListQuery, RequestorResponse, RequestQueryBody } from './types';

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
export const requestorApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    status: builder.query<RequestorResponse, RequestListQuery | void>({
      // get status of requestor service
      query: () => `${GEN3_REQUESTOR_API}/_status`,
    }),
    request: builder.query<RequestorResponse, Partial<RequestListQuery>>({
      // get a list of requests
      query: (params?) => {
        if (params) {
          return `${GEN3_REQUESTOR_API}/request${convertToQueryString(params)}`;
        } else {
          return `${GEN3_REQUESTOR_API}/request`;
        }
      },
    }),
    userRequest: builder.query<
      Array<RequestorResponse>,
      Partial<RequestListQuery>
    >({
      // get a list of requests
      query: (params?) => {
        if (params) {
          return `${GEN3_REQUESTOR_API}/request/user${convertToQueryString(params)}`;
        } else {
          return `${GEN3_REQUESTOR_API}/request/user`;
        }
      },
    }),
    requestById: builder.query<RequestorResponse, string>({
      // get a list of requests
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
