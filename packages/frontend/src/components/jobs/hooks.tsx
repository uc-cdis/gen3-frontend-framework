import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useState } from 'react';
import {
  useSubmitSowerJobMutation,
  addSowerJob,
  removeSowerJob,
  selectSowerJobs,
  updateOutputGUID,
  SowerJobState,
  DispatchJobParams,
  JobWithActions,
  CreateAndExportActionConfig,
} from '@gen3/core';
/**
 * Custom hook for managing Sower job submissions and tracking
 */
export const useSowerJob = () => {
  const dispatch = useDispatch();
  const [submitJob, { isLoading: isSubmitting, isError }] =
    useSubmitSowerJobMutation();
  const activeJobs = useSelector(selectSowerJobs);
  const [lastSubmittedJobId, setLastSubmittedJobId] = useState<string | null>(
    null,
  );

  /**
   * Submit a job and automatically add it to tracking
   * @param jobParams Job parameters to submit
   * @param actionConfig Configuration for job actions
   */
  const submitAndTrackJob = useCallback(
    async (
      jobParams: DispatchJobParams,
      actionConfig: CreateAndExportActionConfig,
      jobName = jobParams.action,
    ) => {
      try {
        const response = await submitJob(jobParams).unwrap();

        // Add the job to the tracking list with complete metadata
        if (response?.uid) {
          const jobData: JobWithActions = {
            jobId: response.uid,
            config: actionConfig,
            part: 1,
            created: Date.now(),
            updated: Date.now(),
            name: jobName,
            status: response.status || 'Running',
          };

          dispatch(addSowerJob(jobData));
          setLastSubmittedJobId(response.uid);
          return response;
        }

        throw new Error('Job submission failed - no job ID returned');
      } catch (error) {
        console.error('Failed to submit job:', error);
        throw error;
      }
    },
    [submitJob, dispatch],
  );

  /**
   * Manually stop tracking a job
   */
  const stopTrackingJob = useCallback(
    (jobId: string) => {
      dispatch(removeSowerJob(jobId));
    },
    [dispatch],
  );

  /**
   * Get all jobs with a specific status
   */
  const getJobsByStatus = useCallback(
    (status: SowerJobState) => {
      return Object.values(activeJobs).filter((job) => job.status === status);
    },
    [activeJobs],
  );

  /**
   * Set the output GUID for a job
   */
  const setJobOutputGUID = useCallback(
    (jobId: string, outputGUID: string) => {
      dispatch(updateOutputGUID({ jobId, outputGUID }));
    },
    [dispatch],
  );

  /**
   * Check if there are any running jobs
   */
  const hasRunningJobs = useCallback(() => {
    return Object.values(activeJobs).some((job) => job.status === 'Running');
  }, [activeJobs]);

  /**
   * Get the latest submitted job
   */
  const getLastSubmittedJob = useCallback(() => {
    if (lastSubmittedJobId) {
      return activeJobs[lastSubmittedJobId];
    }
    return null;
  }, [lastSubmittedJobId, activeJobs]);

  return {
    submitAndTrackJob,
    stopTrackingJob,
    isSubmitting,
    isError,
    activeJobs,
    getJobsByStatus,
    setJobOutputGUID,
    hasRunningJobs,
    getLastSubmittedJob,
  };
};

export default useSowerJob;
