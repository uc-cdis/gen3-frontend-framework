import { gen3Api } from '../gen3';
import { GEN3_API } from '../../constants';
import { DownloadStatus, JobOutput, JobStatus } from './types';
import { DOWNLOAD_FAIL_STATUS, DOWNLOAD_SUCCEEDED_MESSAGE } from './constants';
import { FetchArgs } from '@reduxjs/toolkit/query/react';

export interface DownloadStatusResponse {
  downloadStatus: DownloadStatus;
}

type JobListResponse = Array<JobStatus>;

const jobAPIPath = `${GEN3_API}job/`;

/**
 * Creates a loadingStatusApi for checking the status of a sower data download job
 * @param getJobList Shows the list of jobs currently running
 *  @see https://petstore.swagger.io/?url=https://raw.githubusercontent.com/uc-cdis/sower/master/openapis/openapi.yaml#/sower/list
 * @param getDownloadStatus Shows the status of a selected job
 * @returns: A sower job response dict which returns job information of file downloads
 */
export const loadingStatusApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getJobList: builder.query<JobListResponse, void>({
      query: () => `${jobAPIPath}/list`,
    }),
    getDownloadStatus: builder.query<DownloadStatus, string | FetchArgs>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const statusResponse = await fetchWithBQ({
          headers: {
            credentials: 'include',
          },
          url: `${jobAPIPath}/status?UID=${arg}`,
        });

        if (statusResponse.error)
          return {
            error: statusResponse.error,
          };

        if (!statusResponse.data)
          return {
            data: { ...DOWNLOAD_FAIL_STATUS, uid: arg } as DownloadStatus,
          };

        const { status } = statusResponse.data as JobStatus;

        if (status === 'Failed') {
          const { output } = statusResponse.data as JobOutput;

          return {
            data: {
              ...DOWNLOAD_FAIL_STATUS,
              uid: arg,
              message: { ...DOWNLOAD_FAIL_STATUS.message, content: output },
            } as DownloadStatus,
          };
        }

        if (status === 'Completed') {
          const statusResponse = await fetchWithBQ({
            headers: {
              credentials: 'include',
            },
            url: `${jobAPIPath}/output?UID=${arg}`,
          });
          const { output } = statusResponse.data as JobOutput;
          if (statusResponse.error)
            return {
              error: statusResponse.error,
            };

          if (!statusResponse.data)
            return {
              data: {
                ...DOWNLOAD_FAIL_STATUS,
                uid: arg,
                message: { ...DOWNLOAD_FAIL_STATUS.message, content: output },
              } as DownloadStatus,
            };

          try {
            const regexp = /^https?:\/\/(\S+)\.s3\.amazonaws\.com\/(\S+)/gm;
            if (!new RegExp(regexp).test(output)) {
              throw new Error('Invalid download URL');
            }
            return {
              data: {
                inProgress: false,
                message: {
                  title: 'Your download is ready',
                  content: {
                    msg: DOWNLOAD_SUCCEEDED_MESSAGE,
                    url: output,
                  },
                  active: true,
                },
                uid: arg,
              } as DownloadStatus,
            };
          } catch (e) {
            return {
              data: {
                ...DOWNLOAD_FAIL_STATUS,
                uid: arg,
                message: { ...DOWNLOAD_FAIL_STATUS.message, content: output },
              } as DownloadStatus,
            };
          }
        }

        return {
          data: {
            inProgress: true,
            message: {
              title: 'Your download is pending',
              content: 'pending',
              active: true,
            },
            uid: arg,
          } as DownloadStatus,
        };
      },
    }),
  }),
});

export const { useGetJobListQuery, useGetDownloadStatusQuery } =
  loadingStatusApi;
