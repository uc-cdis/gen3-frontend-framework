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
    request: builder.query<RequestorResponse, RequestQueryBody>({
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
  useRequestQuery,
  useLazyRequestQuery,
} = requestorApi;
