import { createElement } from 'react';
import { notifications } from '@mantine/notifications';
import type { JobOutputAction } from '@gen3/core';
import { fetchFencePresignedURL, isObject, isString } from '@gen3/core';
import { modals } from '@mantine/modals';

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

export const showSowerJobCompleteModalOutputAction: JobOutputAction = async ({
  parameters,
  onError = () => null,
}) => {
  const { jobId, message } = parameters;

  modals.openContextModal({
    modal: 'jobSaveOutputModal',
    title: 'Save Job Output',
    innerProps: {
      message: message ?? 'Your file is ready',
      jobId,
    },
  });
};

const PRESIGNED_URL_TEMPLATE_VARIABLE = '{{PRESIGNED_URL}}';
interface SendPFBToURLParameters {
  targetURLTemplate: string;
  output: string; // presigned URL returned by the export job
  linkLabel?: string;
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
    typeof candidate.targetURLTemplate === 'string' &&
    typeof candidate.output === 'string' &&
    (candidate.linkLabel === undefined ||
      typeof candidate.linkLabel === 'string')
  );
};

export const sendPFBToURL: JobOutputAction = async ({
  parameters,
  onDone = () => null,
  onError = () => null,
}) => {
  if (!isSendPFBToURLParameters(parameters)) {
    onError(new Error('Invalid parameters for sendPFBToURL action'));
    return;
  }
  const { targetURLTemplate, output, linkLabel } = parameters;

  // the PFB export target URL is a template URL that should have a {{PRESIGNED_URL}} template
  // variable in it.
  const targetURL = targetURLTemplate.replace(
    PRESIGNED_URL_TEMPLATE_VARIABLE,
    encodeURIComponent(output.trim()),
  );
  // show a link instead of calling window.open: the job finishes long after the
  // user's click, so browsers would block the popup
  notifications.show({
    title: 'Export Ready',
    autoClose: false,
    message: createElement(
      'a',
      {
        href: targetURL,
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'text-utility-link underline',
      },
      linkLabel ?? 'Open export destination',
    ),
  });
  onDone();
};
