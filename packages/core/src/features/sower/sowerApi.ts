import { gen3Api } from '../gen3';
import { GEN3_SOWER_API } from '../../constants';
import { JSONObject } from '../../types';
import { JobStatus } from './types';

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

/**
 * Creates a loadingStatusApi for checking the status of a sower data download job
 * @param getJobList Shows the list of jobs currently running
 *  @see https://petstore.swagger.io/?url=https://raw.githubusercontent.com/uc-cdis/sower/master/openapis/openapi.yaml#/sower/list
 * @param getDownloadStatus Shows the status of a selected job
 * @returns: A sower job response dict which returns job information of file downloads
 */
export const loadingStatusApi = gen3Api.injectEndpoints({
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
  useGetSowerOutputQuery,
  useGetSowerServiceStatusQuery,
} = loadingStatusApi;
