import { gen3Api } from '../gen3';
import { GEN3_SOWER_API } from '../../constants';
import { JSONObject } from '../../types';
import { JobStatus } from './types';

const processResults = (results: any[], ids: string[]) => {
  // Extract Function: Processes the results and handles any errors
  return results.reduce(
    (acc, { error, data }, index) => {
      // Destructuring
      if (error) {
        acc.errors[ids[index]] = error;
      } else {
        acc.data[ids[index]] = data;
      }
      return acc;
    },
    { data: {}, errors: {} }, // Renaming: combinedResults
  );
};

export interface DispatchJobParams {
  action: string;
  input: JSONObject;
}

export interface DispatchJobResponse {
  uid: string;
  name: string;
  status: string;
}

type JobListResponse = Array<JobStatus>;
type JobsListResponse = Record<string, DispatchJobResponse>;

/**
 * Creates a loadingStatusApi for checking the status of a sower data download job
 * @param getJobList Shows the list of jobs currently running
 *  @see https://petstore.swagger.io/?url=https://raw.githubusercontent.com/uc-cdis/sower/master/openapis/openapi.yaml#/sower/list
 * @param getDownloadStatus Shows the status of a selected job
 * @returns: A sower job response dict which returns job information of file downloads
 */
export const sowerStatusApi = gen3Api.injectEndpoints({
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
    }),
    getSowerJobStatus: builder.query<DispatchJobResponse, string>({
      query: (uid) => `${GEN3_SOWER_API}/status?UID=${uid}`,
    }),
    getSowerJobsStatus: builder.query<JobsListResponse, string[]>({
      async queryFn(ids, _queryApi, _extraOptions, fetchWithBQ) {
        const results = await Promise.all(
          ids.map((id) => fetchWithBQ(`items/${id}`)),
        );
        const combinedResults = processResults(results, ids); // Renamed variable
        return { data: combinedResults };
      },
    }),
    getSowerOutput: builder.query<DispatchJobResponse, string>({
      query: (uid) => `${GEN3_SOWER_API}/output?UID=${uid}`,
    }),
    getSowerServiceStatus: builder.query<JSON, void>({
      query: () => `${GEN3_SOWER_API}/_status`,
    }),
  }),
});

export const {
  useGetSowerJobListQuery,
  useLazyGetSowerJobListQuery,
  useSubmitSowerJobMutation,
  useGetSowerJobStatusQuery,
  useLazyGetSowerJobStatusQuery,
  useGetSowerOutputQuery,
  useLazyGetSowerOutputQuery,
  useGetSowerJobsStatusQuery,
  useGetSowerServiceStatusQuery,
} = sowerStatusApi;
