import { gen3Api } from "../gen3/gen3Api";

export interface CSRFToken {
  readonly csrfToken: string;
}

export const csrfApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getCSRF: builder.query<CSRFToken, void>({
      query: () => "_status",
      transformResponse: (response: Record<string, any>, _meta)  => {
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

// export const selectCSRFToken = csrfApi.endpoints.getCSRF.select();
