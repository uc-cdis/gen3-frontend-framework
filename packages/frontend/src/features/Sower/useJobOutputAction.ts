import { useEffect } from 'react';
import {
  selectSowerJobsList,
  SowerJobStage,
  SowerJobStatus,
  updateSowerJob,
  updateSowerJobOutputError,
  useCoreDispatch,
  useCoreSelector,
  useLazyGetSowerOutputQuery,
} from '@gen3/core';
import { bindSowerOutputJob } from './actions/sowerActionUtils';
import { isValidUrl } from '../../utils/isUrl';

/**
 * Watches the sower job list for completed jobs that have a sendJobAction pending.
 * When found, fetches the job output and executes the sendJobAction exactly once
 * (stage is advanced to SendJobOutput before the fetch to prevent double-execution).
 *
 * Mount this hook once near the top of the Sower feature tree.
 */
const useJobOutputAction: () => void = () => {
  const jobs = useCoreSelector(selectSowerJobsList);
  const dispatch = useCoreDispatch();
  const [fetchOutput] = useLazyGetSowerOutputQuery();

  useEffect(() => {
    const pending = jobs.filter(
      (j) =>
        j.status === 'Completed' && j.stage === SowerJobStage.JobDispatched,
    );

    for (const job of pending) {
      // Advance stage immediately to prevent re-entry on the next render cycle.
      dispatch(
        updateSowerJob({
          jobId: job.uid,
          stage: SowerJobStage.SendJobOutput,
          status: SowerJobStatus.Completed,
        }),
      );

      fetchOutput(job.uid)
        .then(async ({ data, error }) => {
          if (error) {
            console.warn(
              `useJobOutputAction: job ${job.uid} failed to fetch output`,
            );
            return;
          }

          if (!data) {
            console.warn(
              `useJobOutputAction: job ${job.uid} has no output data`,
            );
            return;
          }

          // if there is a mesdage and not a output url
          // then set the output error and continue to display the message
          if (!isValidUrl(data.output)) {
            console.warn(
              `useJobOutputAction: job ${job.uid} has invalid output URL setting to failed`,
            );
            dispatch(
              updateSowerJobOutputError({
                jobId: job.uid,
                outputGUID: data.output,
                outputError: true,
              }),
            );
          }

          if (!job.actions.outputAction) {
            console.warn(
              `useJobOutputAction: job ${job.uid} has no outputActionFunction`,
            );
            return;
          }

          // bind the output action function
          const outputAction = bindSowerOutputJob(
            job.actions.outputAction.name,
            job.actions.outputAction.parameters,
          );

          // execute the output action function
          await outputAction?.actionFunction({
            parameters: {
              ...job.actions.outputAction.parameters,
              output: data.output,
              guid: job.uid,
            },
          });
        })
        .catch((err: Error) => {
          console.error(
            `useJobOutputAction: failed to fetch output for job ${job.uid}`,
            err,
          );
        });
    }
  }, [jobs, dispatch, fetchOutput]);
};

export default useJobOutputAction;
