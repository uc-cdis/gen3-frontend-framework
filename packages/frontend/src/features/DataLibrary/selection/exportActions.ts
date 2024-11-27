import { DataActionFunction } from './registeredActions';
import { fetchFencePresignedURL } from '@gen3/core';

const PRESIGNED_URL_TEMPLATE_VARIABLE = '{{PRESIGNED_URL}}';
interface SendPFBToURLParameters {
  targetURLTemplate: string;
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

export const sendPFBToURL: DataActionFunction = async (
  params,
  done = () => null,
  error = () => null,
  onAbort = () => null,
  signal = undefined,
) => {
  if (!isSendPFBToURLParameters(params)) {
    console.error('Invalid parameters for sendPFBToURL action:', params);
    return;
  }
  const { targetURLTemplate } = params as SendPFBToURLParameters;

  // get the presigned URL for the selected PFB
  try {
    const presignedURL = await fetchFencePresignedURL({
      guid: 'dg.4503/d470e2bc-d4f8-4088-815a-4333780d2bf0',
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
  } catch (e: unknown) {
    return new Promise<void>(() => {
      error(e as Error);
    });
  }
};
