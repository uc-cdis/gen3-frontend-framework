import { gen3Api } from "../gen3/gen3Api";

export interface CSRFToken {
  readonly csrfToken: string;
}

export const csrfApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getCSRF: builder.query<CSRFToken, void>({
      query: () => "_status",
      transformResponse: (response: Record<string, string>, _meta) => {
        return {
          csrfToken: response["csrfToken"]
        };
      }
    }),
  }),
});

export const {
  useGetCSRFQuery,
} = csrfApi;
;
