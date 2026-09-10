import { gen3Api } from '../gen3';
import { GEN3_SOWER_API } from '../../constants';
import type { DispatchJobWithAction, JobStatus, JobWithActions } from './types';
import { SowerJobStage, SowerJobStatus } from './types';
import { addSowerJob } from './sowerJobListSlice';

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
    submitSowerJob: builder.mutation<
      DispatchJobResponse,
      DispatchJobWithAction
    >({
      query: (params) => ({
        url: `${GEN3_SOWER_API}/dispatch`,
        method: 'POST',
        body: params.dispatchJob,
        validateStatus: (response) => {
          if ('originalStatus' in response)
            return response.status === 200 && response.originalStatus === 200;
          return response.status === 200;
        },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        const timestamp = Date.now();
        const payload: JobWithActions = {
          uid: data.uid,
          actions: _arg,
          created: timestamp,
          updated: timestamp,
          status: SowerJobStatus.Running,
          stage: SowerJobStage.JobDispatched,
        };
        dispatch(addSowerJob(payload));
      },
      transformErrorResponse(response) {
        if ('originalStatus' in response)
          return { error: response.originalStatus };
        return { error: response };
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
