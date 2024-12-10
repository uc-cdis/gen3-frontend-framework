import { DataActionFunction } from './registeredActions';
import { fetchFencePresignedURL, FileItem, isFileItem } from '@gen3/core';
import { notifications } from '@mantine/notifications';

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

  console.log('sendExistingPFBToURL', guid, id, targetURLTemplate);
  // get the pre-signed URL for the selected PFB
  try {
    console.log('fetchFencePresignedURL');
    const presignedURL = await fetchFencePresignedURL({
      guid: guid ?? id, //TODO: fix this to use id only
      onAbort: onAbort,
      signal: signal,
    });
    console.log('received presignedURL', presignedURL);

    // the PFB export target URL is a template URL that should have a {{PRESIGNED_URL}} template
    // variable in it.
    const signedURL = encodeURIComponent(presignedURL);
    const targetURL = targetURLTemplate.replace(
      PRESIGNED_URL_TEMPLATE_VARIABLE,
      signedURL,
    );
    console.log('targetURL', targetURL);
    return new Promise<void>(() => {
      if (window) window.open(targetURL, '_blank', 'noopener,noreferrer');
      if (done) done(targetURL);
    });
  } catch (e: unknown) {
    console.error('Error sending PFB to URL', e);
    return new Promise<void>(() => {
      error(e as Error);
    });
  }
};
