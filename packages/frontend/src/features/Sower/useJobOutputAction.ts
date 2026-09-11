import { useEffect } from 'react';
import {
  selectSowerJobList,
  SowerJobStage,
  SowerJobStatus,
  updateSowerJob,
  useCoreDispatch,
  useCoreSelector,
  useLazyGetSowerOutputQuery,
} from '@gen3/core';

/**
 * Watches the sower job list for completed jobs that have a sendJobAction pending.
 * When found, fetches the job output and executes the sendJobAction exactly once
 * (stage is advanced to SendJobOutput before the fetch to prevent double-execution).
 *
 * Mount this hook once near the top of the Sower feature tree.
 */
const useJobOutputAction = () => {
  const jobs = useCoreSelector(selectSowerJobList);
  const dispatch = useCoreDispatch();
  const [fetchOutput] = useLazyGetSowerOutputQuery();

  console.log('jobs', jobs);

  useEffect(() => {
    const pending = jobs.filter(
      (j) =>
        j.status === 'Completed' && j.stage === SowerJobStage.JobDispatched,
    );

    console.log('pending jobs', pending);

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
        .then(({ data, error }) => {
          if (error) {
            // notify
            return;
          }
          job.actions?.outputActionFunction?.actionFunction({
            parameters: {
              ...job.actions?.outputActionFunction?.parameters,
              output: data?.output ?? '',
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
