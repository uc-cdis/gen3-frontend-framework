import { notifications } from '@mantine/notifications';
import type { JobOutputAction } from '@gen3/core';
import { fetchFencePresignedURL, isObject, isString } from '@gen3/core';

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

const PRESIGNED_URL_TEMPLATE_VARIABLE = '{{PRESIGNED_URL}}';
interface SendPFBToURLParameters {
  targetURLTemplate: string;
  guid: string;
}

const isSendPFBToURLParameters = (
  value: unknown,
): value is SendPFBToURLParameters => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    'targetURLTemplate' in candidate &&
    typeof candidate.targetURLTemplate === 'string'
  );
};

export const sendPFBToURL: JobOutputAction = async ({
  parameters,
  onDone = () => null,
  onError = () => null,
  onAbort = () => null,
  signal = undefined,
}) => {
  if (!isSendPFBToURLParameters(parameters)) {
    onError(new Error('Invalid parameters for sendPFBToURL action'));
    return;
  }
  const { targetURLTemplate, guid } = parameters as SendPFBToURLParameters;

  // get the presigned URL for the selected PFB
  try {
    const presignedURL = await fetchFencePresignedURL({
      guid: guid,
      onAbort: onAbort,
      signal: signal,
    });
    // the PFB export target URL is a template URL that should have a {{PRESIGNED_URL}} template
    // variable in it.
    const signedURL = encodeURIComponent(presignedURL);
    const targetURL = targetURLTemplate.replace(
      PRESIGNED_URL_TEMPLATE_VARIABLE,
      signedURL,
    );
    return new Promise<void>(() => {
      if (window) window.open(targetURL, '_blank', 'noopener,noreferrer');
      if (onDone) onDone();
    });
  } catch (e: unknown) {
    return new Promise<void>(() => {
      onError(e as Error);
    });
  }
};
