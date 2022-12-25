import {  fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { coreCreateApi } from '../../api';
import {Reducer, Middleware} from '@reduxjs/toolkit';

export interface Metadata {
    readonly entries:Array<Record<string, unknown>>
}

export interface CrosswalkInfo {
  readonly from: string;
  readonly to: string;
}

export interface CrosswalkArray {
  readonly mapping : ReadonlyArray<CrosswalkInfo>
}

interface CrossWalkParams {
  readonly ids: string;
  readonly fields: {
    from: string;
    to: string;
  }
}

// Define a service using a base URL and expected endpoints
export const metadataApi = coreCreateApi({
  reducerPath: 'metadataApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://brh.data-commons.org/mds/' }),
  endpoints: (builder) => ({
    getMetadata: builder.query<Metadata, string>({
      query: () => 'aggregate/metadata',
    }),
    getTags: builder.query<Metadata, string>({
      query: () => 'tags',
    }),
    getData: builder.query<Metadata, string>({
      query: (params) => ( { url: `metadata?${params}`} )
    }),
    getCrosswalkData: builder.query<CrosswalkArray, CrossWalkParams>({
      query: (params) => ( { url: `metadata?${params.ids}`} ),
      transformResponse: (response: Record<string, any>, _meta, params ) => {
        return { mapping :  Object.values(response).map((x): CrosswalkInfo => {
          return { from: x.ids[params.fields.from], to: x.ids[params.fields.to] };
        })};
      }
    }),
  }),
});


export const { useGetMetadataQuery, useGetTagsQuery, useGetDataQuery, useGetCrosswalkDataQuery } = metadataApi;
export const mdsReducerPath:string = metadataApi.reducerPath;
export const mdsReducer: Reducer = metadataApi.reducer as Reducer;
export const mdsReducerMiddleware = metadataApi.middleware as Middleware;
