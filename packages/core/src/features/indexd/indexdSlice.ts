import { GEN3_INDEXD_API } from '../../constants';
import { gen3Api } from '../gen3';
import { JSONObject, KeyValuePair } from '../../types';

export interface IndexdResponse {
  data: Array<JSONObject>;
  hits: number;
}

export interface IndexdMetadataRequestParams {
  limit?: number;
  filters: KeyValuePair[];
}

export interface IndexObject {
  acl: string[];
  authz: unknown[];
  baseid: string;
  content_created_date: string | null;
  content_updated_date: string | null;
  created_date: string;
  description: string | null;
  did: string;
  file_name: string;
  form: string | null;
  hashes: {
    crc: string;
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
  };
  metadata: Record<string, unknown>;
  rev: string;
  size: number;
  updated_date: string;
  uploader: string | null;
  urls: string[];
  urls_metadata: Record<string, Record<string, unknown>>;
  version: string | null;
}

export const indexdApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getIndexdMetdata: builder.query<
      IndexdResponse,
      IndexdMetadataRequestParams
    >({
      query: ({ filters, limit = 1000 }: IndexdMetadataRequestParams) => {
        const query = filters.reduce(
          (acc, filter) => `${acc}&${filter.key}=${filter.value}`,
          '',
        );
        return `${GEN3_INDEXD_API}/index?${query}&limit=${limit}`;
      },
    }),
    getIndexObject: builder.query<IndexObject, string>({
      query: (guid) => `${GEN3_INDEXD_API}/index/${guid}`,
    }),
  }),
});

export const {
  useGetIndexdMetdataQuery,
  useLazyGetIndexdMetdataQuery,
  useGetIndexObjectQuery,
  useLazyGetIndexObjectQuery,
} = indexdApi;
