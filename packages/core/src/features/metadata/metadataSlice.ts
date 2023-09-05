import {fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {coreCreateApi} from '../../api';
import Queue from 'queue';
import {Middleware, Reducer} from '@reduxjs/toolkit';

export interface Metadata {
    readonly entries: Array<Record<string, unknown>>
}

export interface CrosswalkInfo {
    readonly from: string;
    readonly to: string;
}

export interface CrosswalkArray {
    readonly mapping: ReadonlyArray<CrosswalkInfo>
}

interface CrossWalkParams {
    readonly ids: string;
}

// Define a service using a base URL and expected endpoints
export const metadataApi = coreCreateApi({
  reducerPath: 'metadataApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://data.midrc.org/mds/'
  }),
  endpoints: (builder) => ({
    getMetadata: builder.query<Metadata, string>({
      query: () => 'aggregate/metadata',
    }),
    getTags: builder.query<Metadata, string>({
      query: () => 'tags',
    }),
    getData: builder.query<Metadata, string>({
      query: (params) => ({url: `metadata?${params}`})
    }),
    getCrosswalkData: builder.query<
            CrosswalkArray,
            CrossWalkParams
        >({
          queryFn: async (arg, _queryApi, _extraOptions, fetchWithBQ) => {
            const queryMutiple = async (): Promise<CrosswalkInfo[]> => {
              let result = [] as CrosswalkInfo[];
              const queue = Queue({concurrency: 15});
              for (const id of arg.ids) {
                queue.push(async (callback) => {
                  const response = await fetchWithBQ(
                    {url: `metadata/${id}`}
                  );

                  if (response.error) {
                    return {error: response.error};
                  }
                  result = [
                    ...result,
                    {
                      from: (response.data as Record<string, any>)['crosswalk']['subject']['https://gen3.biodatacatalyst.nhlbi.nih.gov']['subject.submitter_id']['value'],
                      to: (response.data as Record<string, any>)['crosswalk']['subject']['https://data.midrc.org']['case.submitter_id']['value']
                    }
                  ];
                  if (callback) {
                    callback();
                  }
                  return result;
                });
              }

              return new Promise((resolve, reject) => {
                queue.start((err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(result);
                  }
                });
              });
            };

            const result = await queryMutiple();

            return {data: { mapping: result }};
          }
        })
  })
});


export const {useGetMetadataQuery, useGetTagsQuery, useGetDataQuery, useGetCrosswalkDataQuery} = metadataApi;
export const mdsReducerPath: string = metadataApi.reducerPath;
export const mdsReducer: Reducer = metadataApi.reducer as Reducer;
export const mdsReducerMiddleware = metadataApi.middleware as Middleware;
