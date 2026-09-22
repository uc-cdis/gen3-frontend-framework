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
import { bindSowerOutputJob } from './actions/sowerActions';

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
          console.log('fetch output', data, error);
          if (error) {
            setOutputStageError();
            // notify
            return;
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
