import { JSONObject } from '../../types';
import { gen3Api } from '../gen3';

export interface Metadata {
  readonly entries: Array<Record<string, unknown>>;
}

export interface CrosswalkInfo {
  readonly from: string;
  readonly to: string;
}

export interface CrosswalkArray {
  readonly mapping: ReadonlyArray<CrosswalkInfo>;
}

interface CrossWalkParams {
  readonly ids: string;
  readonly fields: {
    from: string;
    to: string;
  };
}

export interface MetadataResponse {
  data: Array<JSONObject>;
  hits: number;
}

export interface MetadataPaginationParams {
  pageSize: number;
  offset: number;
}

export interface MetadataRequestParams extends MetadataPaginationParams {
  url?: string;
  guidType: string;
}

// Define a service using a base URL and expected endpoints
export const metadataApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getAggMDS: builder.query<
      MetadataResponse,
      MetadataRequestParams
    >({
      query: ({ url, offset, pageSize }) => {
        if (url) {
          return `${url}/aggregate/metadata?flatten=true&pagination=true&offset=${offset}&limit=${pageSize}`;
        }
        return 'aggregate/metadata?flatten=true&pagination=true&offset=${offset}&limit=${pageSize}';
      },
      transformResponse: (response: Record<string, any>, _meta, params) => {
        return {
          data: response.results.map(
            (x: JSONObject) =>
              (Object.values(x)?.at(0) as JSONObject)[params.guidType],
          ),
          hits: response.pagination.hits,
        };
      },
    }),
    getMDS: builder.query<MetadataResponse, MetadataRequestParams>({
      query: ({ url, guidType, offset, pageSize }) => {
        if (url) {
          return `${url}/metadata?data=True&_guid_type=${guidType}&limit=${pageSize}&offset=${offset}`;
        } else {
          return `metadata?data=True&_guid_type=${guidType}&limit=${pageSize}&offset=${offset}`;
        }
      },
      transformResponse: (response: Record<string, any>, _meta, params) => {
        return {
          data: response.results.map(
            (x: JSONObject) =>
              (Object.values(x)?.at(0) as JSONObject)[params.guidType],
          ),
          hits: -1,
        };
      },
    }),
    getTags: builder.query<Metadata, string>({
      query: () => 'tags',
    }),
    getData: builder.query<Metadata, string>({
      query: (params) => ({ url: `metadata?${params}` }),
    }),
    getCrosswalkData: builder.query<CrosswalkArray, CrossWalkParams>({
      query: (params) => ({ url: `metadata?${params.ids}` }),
      transformResponse: (response: Record<string, any>, _meta, params) => {
        return {
          mapping: Object.values(response).map((x): CrosswalkInfo => {
            return {
              from: x.ids[params.fields.from],
              to: x.ids[params.fields.to],
            };
          }),
        };
      },
    }),
  }),
});

export const {
  useGetAggMDSQuery,
  useGetMDSQuery,
  useGetTagsQuery,
  useGetDataQuery,
  useGetCrosswalkDataQuery,
} = metadataApi;
