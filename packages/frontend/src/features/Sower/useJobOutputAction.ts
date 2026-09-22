import { useEffect, useRef } from 'react';
import {
  selectSowerJobsList,
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
const useJobOutputAction: () => void = () => {
  const jobs = useCoreSelector(selectSowerJobsList);
  const dispatch = useCoreDispatch();
  const [fetchOutput] = useLazyGetSowerOutputQuery();
  // Held in a ref so the effect dependency array only reacts to job list
  // changes, not to RTK Query trigger identity changes between renders.
  const fetchOutputRef = useRef(fetchOutput);
  useEffect(() => {
    fetchOutputRef.current = fetchOutput;
  }, [fetchOutput]);

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

      const setOutputStageError = () => {
        dispatch(
          updateSowerJob({
            jobId: job.uid,
            stage: SowerJobStage.SendJobOutput,
            status: SowerJobStatus.Failed,
          }),
        );
      };

      fetchOutputRef
        .current(job.uid)
        .then(async ({ data, error }) => {
          if (error) {
            setOutputStageError();
            // notify
            return;
          }
          if (!job.actions.outputActionFunction) {
            console.warn(
              `useJobOutputAction: job ${job.uid} has no outputActionFunction`,
            );
            return;
          }
          await job.actions.outputActionFunction.actionFunction({
            parameters: {
              ...job.actions.outputActionFunction.parameters,
              output: data?.output,
              guid: job.uid,
            },
          });
        })
        .catch((err: Error) => {
          setOutputStageError();
          console.error(
            `useJobOutputAction: failed to fetch output for job ${job.uid}`,
            err,
          );
        });
    }
  }, [jobs, dispatch]);
};

export default useJobOutputAction;
