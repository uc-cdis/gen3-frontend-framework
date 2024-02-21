import { JSONObject } from '../../types';
import { gen3Api } from '../gen3';
import { GEN3_MDS_API } from '../../constants';

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
  guidType: string;
  studyField: string;
}

// Define a service using a base URL and expected endpoints
export const metadataApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getAggMDS: builder.query<MetadataResponse, MetadataRequestParams>({
      query: ({ offset, pageSize } : MetadataRequestParams) => {
        return `${GEN3_MDS_API}/aggregate/metadata?flatten=true&pagination=true&offset=${offset}&limit=${pageSize}`;
      },
      transformResponse: (response: Record<string, any>, _meta, params) => {
        return {
          data: response.results.map((x: JSONObject) => {
            const objValues = Object.values(x);
            const firstValue = objValues ? objValues.at(0) as JSONObject : undefined;
            return firstValue ? firstValue[params.studyField] : undefined;
          }),
          hits: response.pagination.hits
        };
      },
    }),
    getMDS: builder.query<MetadataResponse, MetadataRequestParams>({
      query: ({  guidType, offset, pageSize }) => {
        return `${GEN3_MDS_API}/metadata?data=True&_guid_type=${guidType}&limit=${pageSize}&offset=${offset}`;
      },
      transformResponse: (response: Record<string, any>, _meta) => {

        return {
          data: Object.keys(response).map((guid) => response[guid]),
          hits: Object.keys(response).length,
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
