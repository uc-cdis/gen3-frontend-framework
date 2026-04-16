import { gen3Api } from '../gen3';
import { GEN3_SOWER_API } from '../../constants';
import { JobStatus } from './types';
import { setSowerJobDatetime } from './sowerJobDatetime';

export interface DispatchJobParams {
  action: string;
  input: Record<string, unknown>;
}

export interface DispatchJobResponse {
  uid: string;
  name: string;
  status: string;
}

export type JobListResponse = Array<JobStatus>;

/**
 * Creates a loadingStatusApi for checking the status of a sower data download job
 * @param getJobList Shows the list of jobs currently running
 *  @see https://petstore.swagger.io/?url=https://raw.githubusercontent.com/uc-cdis/sower/master/openapis/openapi.yaml#/sower/list
 * @param getDownloadStatus Shows the status of a selected job
 * @returns: A sower job response dict which returns job information of file downloads
 */
export const sowerJobApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getSowerJobList: builder.query<JobListResponse, void>({
      query: () => `${GEN3_SOWER_API}/list`,
    }),
    submitSowerJob: builder.mutation<DispatchJobResponse, DispatchJobParams>({
      query: (params) => ({
        url: `${GEN3_SOWER_API}/dispatch`,
        method: 'POST',
        body: params,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setSowerJobDatetime(data.uid));
      },
    }),
    getSowerJobStatus: builder.query<DispatchJobResponse, string>({
      query: (uid) => `${GEN3_SOWER_API}/status?UID=${uid}`,
    }),
    getMultipleSowerJobStatus: builder.query<
      Record<string, DispatchJobResponse>,
      string[]
    >({
      queryFn: async (arg, _queryApi, _extraOptions, fetchWithBQ) => {
        const statuses: Record<string, DispatchJobResponse> = {};
        for (const uid of arg) {
          const result = await fetchWithBQ(
            `${GEN3_SOWER_API}/status?UID=${uid}`,
          );
          if (result.error) {
            return { error: result.error };
          } else {
            statuses[uid] = result.data as DispatchJobResponse;
          }
        }

        return { data: statuses };
      },
    }),
    getSowerOutput: builder.query<{ output: string }, string>({
      query: (uid) => `${GEN3_SOWER_API}/output?UID=${uid}`,
    }),
    getSowerServiceStatus: builder.query<JSON, void>({
      query: () => `${GEN3_SOWER_API}/_status`,
    }),
  }),
});

export type GetSowerJobListQueryType =
  typeof sowerJobApi.endpoints.getSowerJobList.Types.QueryDefinition;

export const {
  useGetSowerJobListQuery,
  useLazyGetSowerJobListQuery,
  useSubmitSowerJobMutation,
  useGetSowerJobStatusQuery,
  useLazyGetSowerJobStatusQuery,
  useGetSowerOutputQuery,
  useLazyGetSowerOutputQuery,
  useGetSowerServiceStatusQuery,
  useLazyGetMultipleSowerJobStatusQuery,
} = sowerJobApi;

export const sowerApiReducer = sowerJobApi.reducer;
