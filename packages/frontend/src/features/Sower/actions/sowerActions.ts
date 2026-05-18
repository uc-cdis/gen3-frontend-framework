import { BoundCreateAndExportAction, DispatchJobParams } from '@gen3/core';
import { findCreateJobAction, findSendResultsAction } from './sowerJobsFactory';
import { hasSendToAction } from './utils';

/**
 * Called from a ActionButton. This function dispatchs a sower job by first creating the
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
 */
export const buildSowerJob = (
  action?: string,
  parameters?: Record<string, any>,
  onError?: (error: Error) => void,
): DispatchJobParams | null => {
  if (!action) {
    if (onError) onError(new Error('No jobAction provided'));
    return null;
  }
  if (!parameters) {
    if (onError) onError(new Error('No jobParameters provided'));
    return null;
  }

  // find the job action

  const jobAction = findCreateJobAction(action);
  if (!jobAction) {
    if (onError) onError(new Error(`${action} not registered`));
    return null;
  }

  try {
    const jobBody = jobAction(parameters);
    console.log('jobBody', jobBody);
    return jobBody;
  } catch (error) {
    if (onError) onError(error as Error);
    return null;
  }
};

export const bindSowerJob = (
  action: string,
  parameters: Record<string, any>,
  onError?: (error: Error) => void,
): BoundCreateAndExportAction | null => {
  if (!action) {
    if (onError) onError(new Error('No jobAction provided'));
    return null;
  }
  if (!parameters) {
    if (onError) onError(new Error('No jobParameters provided'));
    return null;
  }

  const jobAction = findCreateJobAction(action);
  if (!jobAction) {
    if (onError) onError(new Error(`${action} not registered`));
    return null;
  }

  // look for a send action
  let sendAction = undefined;
  if (hasSendToAction(parameters)) {
    sendAction = findSendResultsAction(parameters.sendAction.actionName);
    if (!sendAction) {
      if (onError)
        onError(
          new Error(
            `Send action ${parameters.sendAction.actionName} not registered`,
          ),
        );
      return null;
    }
  }


  return {
    createAction: {
      actionName: action,
      parameters: parameters,
      actionFunction: jobAction,
    },
    ...(sendAction && {
      sendAction: {
        actionName: parameters.sendAction.actionName,
        parameters: parameters.sendAction.parameters ?? {},
        actionFunction: sendAction,
      },
    }),
  };
};
