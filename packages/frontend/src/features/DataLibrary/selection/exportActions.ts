import {
  fetchFencePresignedURL,
  FileItem,
  HTTPError,
  isFileItem,
} from '@gen3/core';
import { notifications } from '@mantine/notifications';
import { HTTPUserFriendlyErrorMessages } from '../modals/utils';
import { DataActionFunction } from './types';

const PRESIGNED_URL_TEMPLATE_VARIABLE = '{{PRESIGNED_URL}}';
interface SendExistingPFBToURLParameters {
  targetURLTemplate: string;
}

const isSendExistingPFBToURLParameters = (
  value: unknown,
): value is SendExistingPFBToURLParameters => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    'targetURLTemplate' in candidate &&
    typeof candidate.targetURLTemplate === 'string'
  );
};

export const sendExistingPFBToURL: DataActionFunction = async (
  validatedSelections,
  params,
  done = () => null,
  error = () => null,
  onAbort = () => null,
  signal = undefined,
) => {
  if (!isSendExistingPFBToURLParameters(params)) {
    console.error('Invalid parameters for sendPFBToURL action:', params);
    return;
  }
  const { targetURLTemplate } = params;
  // get the selection

  if (validatedSelections.length !== 1 || !isFileItem(validatedSelections[0])) {
    notifications.show({
      id: 'data-library-send-existing-pfb-to-url-validate-length',
      position: 'bottom-center',
      withCloseButton: true,
      autoClose: 5000,
      title: 'Action Error',
      message: 'Invalid data passed to send PFB to URL',
      color: 'red',
      loading: false,
    });
    return;
  }
  const { guid, id } = validatedSelections[0] as FileItem;

  // get the pre-signed URL for the selected PFB
  try {
    const presignedURL = await fetchFencePresignedURL({
      guid: guid ?? id, //TODO: fix this to use id only
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
      if (done) done(targetURL);
    });
  } catch (error: any) {
    if (error instanceof HTTPError) {
      notifications.show({
        id: 'data-library-send-existing-pfb-to-url-validate-length',
        position: 'bottom-center',
        withCloseButton: true,
        autoClose: 5000,
        title: 'Action Error',
        message:
          error.status in HTTPUserFriendlyErrorMessages
            ? HTTPUserFriendlyErrorMessages[error.status]
            : 'An error has occurred to prevent exporting PFB',
        color: 'red',
        loading: false,
      });
    }
    console.error('Error sending PFB to URL', error);
    return new Promise<void>(() => {
      error(error as Error);
    });
  }
};
