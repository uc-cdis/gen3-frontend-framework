import { createSelector } from "@reduxjs/toolkit";
import { gen3Api } from "../gen3/gen3Api";
import { JSONObject } from "../../types";

export interface CSRFToken {
  readonly csrfToken: string;
}

export const csrfApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getCSRF: builder.query<CSRFToken, void>({
      query: () => "_status",
      transformResponse: (response: JSONObject) : CSRFToken  => {
        console.log("response", response);
        return { csrfToken: response["csrf"] as string};

        },
    }),
  }),
});

export const {
  useGetCSRFQuery,
} = csrfApi;

export const selectCSRFTokenData = csrfApi.endpoints.getCSRF.select();

export const selectCSRFToken = createSelector(
    selectCSRFTokenData,
    token => token?.data?.csrfToken,
);
