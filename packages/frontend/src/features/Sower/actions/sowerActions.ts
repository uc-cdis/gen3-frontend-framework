import type {
  BoundJobActionConfig,
  DispatchJobParameters,
  JobBuilderAction,
  JobOutputAction,
} from '@gen3/core';
import {
  findCreateJobAction,
  findSendResultsAction,
} from './sowerActionFactory';
import { hasOutputAction } from './utils';

/**
 * Called from a SowerActionButton. This function dispatches a sower job by first creating the
 * action and then submit it to sower.
 * @param params
 * @param done
 * @param onError
 */
// export const submitJobAction = (
//   params: Record<string, any>,
//   done?: () => void,
//   onError?: (error: Error) => void,
// ): Promise<void> => {
//   try {
//     const { action } = params;
//
//     console.log(action);
//
//     const jobBody = buildSowerJob(action, params);
//     if (!jobBody) return Promise.resolve();
//
//     dispatchJob(jobBody);
//
//     if (done) done();
//     return Promise.resolve();
//   } catch (error) {
//     if (onError) onError(error as Error);
//     return Promise.reject(error);
//   }
// };

/**
 * Uses the action and parameters to build the body of the sower job
 * @param action
 * @param parameters
 * @param onError
 * @returns null if error or if no action is provided
 */
export const buildSubmitSowerJob = (
  action?: string,
  parameters?: Record<string, any>,
  onError?: (error: Error) => void,
): DispatchJobParameters | null => {
  if (!action) {
    if (onError) onError(new Error('No jobAction provided'));
    return null;
  }
  if (!parameters) {
    if (onError) onError(new Error('No jobParameters provided'));
    return null;
  }

  // find the job action

  let jobAction: JobBuilderAction | null;

  try {
    jobAction = findCreateJobAction(action);
  } catch (error) {
    if (onError) {
      onError(error as Error);
    }
    return null;
  }

  if (jobAction === null) return null;

  try {
    const jobBody = jobAction(parameters);
    console.log('jobBody', jobBody);
    return jobBody;
  } catch (error) {
    if (onError) onError(error as Error);
    return null;
  }
};

export const bindSowerOutputJob = (
  action?: string,
  parameters?: Record<string, any>,
  onError?: (error: Error) => void,
): BoundJobActionConfig<JobOutputAction> | null => {
  if (!action) {
    if (onError) onError(new Error('No jobAction provided'));
    return null;
  }
  if (!parameters) {
    if (onError) onError(new Error('No jobParameters provided'));
    return null;
  }

  if (!hasOutputAction(parameters)) {
    return null;
  }
  const outputAction = findSendResultsAction(parameters.sendAction.actionName);
  if (!outputAction) {
    if (onError)
      onError(
        new Error(
          `Send action ${parameters.sendAction.actionName} not registered`,
        ),
      );
    return null;
  }

  return {
    actionName: parameters.sendAction.actionName,
    parameters: parameters.sendAction.parameters ?? {},
    actionFunction: outputAction,
  };
};
