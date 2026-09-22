import { notifications } from '@mantine/notifications';
import type { JobOutputAction } from '@gen3/core';
import { isObject, isString } from '@gen3/core';

interface BaseOutputActionParameters extends Record<string, unknown> {
  output?: string;
  guid: string;
}

export interface NotificationOutputActionParameters extends BaseOutputActionParameters {
  message: string;
}

export const isBaseOutputActionParameters = (
  x: unknown,
): x is BaseOutputActionParameters =>
  isObject(x) &&
  isString(x['guid']) &&
  (x['output'] === undefined || isString(x['output']));

export const isNotificationOutputActionParameters = (
  x: unknown,
): x is NotificationOutputActionParameters =>
  isBaseOutputActionParameters(x) &&
  isString((x as Record<string, unknown>)['message']);

export const notificationOutputAction: JobOutputAction = async ({
  parameters,
  onError = () => null,
}) => {
  if (!isNotificationOutputActionParameters(parameters)) {
    onError(new Error('notificationOutputAction: invalid parameters'));
    return;
  }
  const { guid, message } = parameters;
  notifications.show({
    title: 'Job Complete Default Notification',
    message: `${guid} completed: ${message}`,
  });
};
