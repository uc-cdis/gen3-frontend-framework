import { gen3Api } from "../gen3/gen3Api";
import { CoreState } from "../../reducers";

export interface CSRFToken {
  readonly csrfToken: string;
}

export const csrfApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getCSRF: builder.query<CSRFToken, void>({
      query: () => "_status",
      transformResponse: (response: Record<string, any>, _meta)  => {
        return {
          csrfToken: response["csrf"]
        };
      }
    }),
  }),
});

export const {
  useGetCSRFQuery,
} = csrfApi;

export const selectCSRFToken = (state: CoreState): string => state.endpoint.csrfToken.csrfToken;
