import { GEN3_INDEXD_API } from '../../constants';
import { gen3Api } from '../gen3';
import { KeyValuePair } from '../../types';

export interface IndexdMetadataRequestParams {
  filters: KeyValuePair[];
  params?: {
    limit?: number;
    page?: number;
    size?: number;
    form?: 'bundle' | 'object' | 'all';
    urls_metadata?: string;
    metadata?: string;
    hash?: string;
    uploader?: string;
    ids?: string;
    urls?: string[];
    acl?: string;
    authz?: string;
    negate_params?: string;
    start?: string;
  }
}

export interface IndexObject {
  acl: string[];
  authz: string[];
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

export interface IndexdResponse {
  acl: string | null;
  authz: string | null;
  file_name: string | null;
  hashes: string | null;
  ids: string | null;
  limit: number;
  metadata: Record<string, unknown>;
  page: number | null;
  did: string;
  size: number | null;
  start: number | null;
  urls: string[];
  urls_metadata: string | null;
  version: string | null;
  records: Array<IndexObject>;
}

export const indexdApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getIndexdMetdata: builder.query<
      IndexdResponse,
      IndexdMetadataRequestParams
    >({
      query: ({ filters, params } : IndexdMetadataRequestParams) => {
        const query = filters.reduce(
          (acc, filter) => `${acc}&${filter.key}=${filter.value}`,
          '',
        );

        const formattedParams : [string, string][] = [];

        Object.entries(params || {}).forEach(([k, v]) => {
          if (v) {
            if (typeof v === "number") {
              formattedParams.push([k, v.toString()])
            } else if (Array.isArray(v)) {
              v.forEach(v => formattedParams.push([k, v]))
            } else {
              formattedParams.push([k, v])
            }
          }
        });

        const queryString = new URLSearchParams(formattedParams).toString();

        return `${GEN3_INDEXD_API}/index?${query}&${queryString}`;
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
