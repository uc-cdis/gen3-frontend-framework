import {
  addSowerJob,
  type CoreDispatch,
  type CreateAndExportActionConfig,
  type DispatchJobParams,
  useSubmitSowerJobMutation,
  isFetchBaseQueryError,
} from '@gen3/core';
import { notifications } from '@mantine/notifications';
import {
  findCreateJobAction,
  findSendResultsAction,
} from './TwoStepActionButton';
import { SowerJobNotFoundError, SendResultsActionNotFoundError } from './types';

export const submitSowerJob = async (
  actions: CreateAndExportActionConfig,
  jobParameters: Record<string, any>,
  dispatch: CoreDispatch,
  dispatchJobToSower: ReturnType<typeof useSubmitSowerJobMutation>[0],
) => {
  try {
    const createSowerJobAction = findCreateJobAction(
      actions.createAction.actionName,
    );

    // if there is a send action, make sure it is defined
    if (actions?.sendJobAction) {
      // will throw error if not found (handled below)
      // why no variable is needed
      findSendResultsAction(actions.sendJobAction.actionName);
    }

    const sowerDispatchJobConfig = createSowerJobAction({
      ...actions.createAction.parameters,
      ...jobParameters,
    });
    const timestamp = Date.now();

    console.log('jobConfig', sowerDispatchJobConfig);
    const { uid, name, status } = await dispatchJobToSower(
      sowerDispatchJobConfig,
    ).unwrap();
    console.log('submit job', uid);
    // Register with global monitor
    // add Job to slice so we can both manage and persist it
    dispatch(
      addSowerJob({
        jobId: uid,
        name,
        status,
        part: 1,
        config: actions,
        created: timestamp,
        updated: timestamp,
      }),
    );
  } catch (e: unknown) {
    console.log('error', e);
    if (isFetchBaseQueryError(e)) {
      const errMsg = 'error' in e ? e.error : JSON.stringify(e.data);
      notifications.show({
        title: 'Error from Service',
        message: errMsg,
        color: 'red',
      });
    } else if (e instanceof SowerJobNotFoundError)
      notifications.show({
        title: 'Error: submit job action not found',
        message: e.message,
        color: 'red',
      });
    else if (e instanceof SendResultsActionNotFoundError)
      notifications.show({
        title: 'Error: send results action not found',
        message: e.message,
        color: 'red',
      });
    else
      notifications.show({
        title: 'Error',
        message: 'Failed to start job',
        color: 'red',
      });
  }
};
