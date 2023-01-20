import { GEN3_API } from "../../constants";
import { fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { coreCreateApi } from "../../api";
import { Middleware, Reducer } from "@reduxjs/toolkit";

export interface CSRFToken {
  readonly csrfToken: string;
}


export const csrfAPI = coreCreateApi({
  reducerPath: "csrfAPI",
  baseQuery: fetchBaseQuery({
    baseUrl:`${GEN3_API}`,
  }),
  endpoints: (builder) => ({
    getCSRF: builder.query<CSRFToken, void>({
      query: () => "/_status",
      transformResponse: (response: Record<string,any>, _meta)  => {
        return {
          csrfToken: response["csrf"]
        };
      }
    }),
  }),
});

export const {
  useGetCSRFQuery,
} = csrfAPI;

export const csrfReducerPath: string = csrfAPI.reducerPath;
export const csrfReducer: Reducer = csrfAPI.reducer as Reducer;
export const csrfReducerMiddleware = csrfAPI.middleware as Middleware;
