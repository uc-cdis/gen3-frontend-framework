import { JSONObject } from '../../types';
import { gen3Api } from '../gen3';
import Queue from 'queue';
import { GEN3_CROSSWALK_API, GEN3_MDS_API } from '../../constants';
import { JSONPath } from 'jsonpath-plus';
import { CrosswalkInfo, IndexedMetadataFilters } from './types';

export interface Metadata {
  readonly entries: Array<Record<string, unknown>>;
}

export type CrosswalkArray = Array<CrosswalkInfo>;

interface ToMapping {
  id: string;
  dataPath: string[];
}

interface CrossWalkParams {
  readonly ids: string[];
  readonly toPaths: Array<ToMapping>;
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

interface IndexedMetadataRequestParams extends MetadataRequestParams {
  indexKeys: Array<string>;
  filterEmpty?: IndexedMetadataFilters;
}

const HasEnoughData = (
  data: Record<string, any>,
  keys: string[],
  limit: number,
) => {
  const numEmptyKeys = keys.filter(
    (k) =>
      Object.hasOwn(data, k) &&
      typeof data[k] === 'string' &&
      data[k].trim() === '',
  ).length;
  return numEmptyKeys < limit;
};

/**
 * Defines metadataApi service using a base URL and expected endpoints. Derived from gen3Api core API.
 *
 * @param endpoints - Defines endpoints used in discovery page
 *  @param getAggMDS - Queries aggregate metadata service
 *    @see https://github.com/uc-cdis/metadata-service/blob/master/docs/agg_mds.md
 *    @see https://petstore.swagger.io/?url=https://raw.githubusercontent.com/uc-cdis/metadata-service/master/docs/openapi.yaml#/Aggregate/get_aggregate_metadata_aggregate_metadata_get
 *  @param getMDS - Queries normal metadata service
 *    @see https://petstore.swagger.io/?url=https://raw.githubusercontent.com/uc-cdis/metadata-service/master/docs/openapi.yaml#/Query/search_metadata_metadata_get
 *  @param getIndexAggMDS - queries the Aggregate Metadata service and returns all common passed in indexKeys
 *  @param getTags - Probably refering to Aggregate metadata service summary statistics query
 *    @see https://petstore.swagger.io/?url=https://raw.githubusercontent.com/uc-cdis/metadata-service/master/docs/openapi.yaml#/Aggregate/get_aggregate_tags_aggregate_tags_get
 *  @param getData - Looks like a duplicate of getMDS handler. unused in ./frontend package
 *  @param getCrosswalkData - Maps ids from one source to another
 * @returns: A guppy download API for fetching bulk metadata
 */
export const metadataApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getAggMDS: builder.query<MetadataResponse, MetadataRequestParams>({
      query: ({ offset, pageSize }: MetadataRequestParams) => {
        return `${GEN3_MDS_API}/aggregate/metadata?flatten=true&pagination=true&offset=${offset}&limit=${pageSize}`;
      },
      transformResponse: (response: Record<string, any>, _meta, params) => {
        return {
          data: response.results.map((x: JSONObject) => {
            const objValues = Object.values(x);
            const firstValue = objValues
              ? (objValues.at(0) as JSONObject)
              : undefined;
            return firstValue ? firstValue[params.studyField] : undefined;
          }),
          hits: response.pagination.hits,
        };
      },
    }),
    getIndexAggMDS: builder.query<
      MetadataResponse,
      IndexedMetadataRequestParams
    >({
      query: ({ pageSize }: IndexedMetadataRequestParams) => {
        return `${GEN3_MDS_API}/aggregate/metadata?limit=${pageSize}`;
      },
      transformResponse: (response: Record<string, any>, _meta, params) => {
        const dataFromIndexes = params.indexKeys.reduce(
          (acc, key) => {
            if (response[key]) {
              acc.push(...response[key]);
            }
            return acc;
          },
          [] as Array<Record<string, any>>,
        );

        return {
          data: (
            dataFromIndexes.map((x: JSONObject) => {
              const objValues = Object.values(x);
              const objIds = Object.keys(x);
              let firstValue = objValues
                ? (objValues.at(0) as JSONObject)
                : undefined;

              if (params?.filterEmpty) {
                // remove any data that has < limit if defined
                if (
                  firstValue &&
                  !HasEnoughData(
                    firstValue[params.studyField] as Record<string, any>,
                    params.filterEmpty.keys,
                    params.filterEmpty.limit,
                  )
                )
                  firstValue = undefined;
              }
              return firstValue
                ? {
                    gen3MDSGUID: objIds.at(0),
                    ...(firstValue[params.studyField] as Record<string, any>),
                  }
                : undefined;
            }) as JSONObject[]
          ).filter((x: JSONObject | undefined) => x !== undefined),
          hits: dataFromIndexes.length,
        };
      },
    }),
    getMDS: builder.query<MetadataResponse, MetadataRequestParams>({
      query: ({ guidType, offset, pageSize }) => {
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
    getMetadataById: builder.query<JSONObject, string>({
      query: (params) => ({ url: `${GEN3_MDS_API}/metadata/${params}` }),
    }),
    // TODO: Move this to own slice
    getCrosswalkData: builder.query<CrosswalkArray, CrossWalkParams>({
      queryFn: async (arg, _queryApi, _extraOptions, fetchWithBQ) => {
        const queryMultiple = async (): Promise<CrosswalkInfo[]> => {
          let result = [] as CrosswalkInfo[];
          const queue = Queue({ concurrency: 15 });
          for (const id of arg.ids) {
            queue.push(async (callback?: () => void) => {
              const response = await fetchWithBQ({
                url: `${GEN3_CROSSWALK_API}/metadata/${id}`,
              });

              if (response.error) {
                return { error: response.error };
              }

              const toData = arg.toPaths.reduce(
                (acc, path) => {
                  acc[path.id] =
                    JSONPath<string>({
                      json: response.data as Record<string, any>,
                      path: `$.[${path.dataPath}]`,
                      resultType: 'value',
                    })?.[0] ?? 'n/a';
                  return acc;
                },
                {} as Record<string, string>,
              );

              result = [
                ...result,
                {
                  from: id,
                  to: toData,
                },
              ];
              if (callback) callback();

              return result;
            });
          }

          return new Promise((resolve, reject) => {
            queue.start((err: unknown) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            });
          });
        };

        const result = await queryMultiple();
        return { data: result };
      },
    }),
  }),
});

export const {
  useGetAggMDSQuery,
  useGetMDSQuery,
  useGetTagsQuery,
  useGetDataQuery,
  useGetMetadataByIdQuery,
  useGetCrosswalkDataQuery,
  useLazyGetCrosswalkDataQuery,
  useGetIndexAggMDSQuery,
} = metadataApi;
