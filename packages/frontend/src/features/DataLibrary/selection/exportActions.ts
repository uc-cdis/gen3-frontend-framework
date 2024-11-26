import { DataActionFunction } from './registeredActions';
import { fetchFencePresignedURL } from '@gen3/core';

const PRESIGNED_URL_TEMPLATE_VARIABLE = '{{PRESIGNED_URL}}';
interface SendPFBToURLParameters {
  presignedURL: string;
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
    typeof candidate.presignedURL === 'string' &&
    typeof candidate.targetURLTemplate === 'string'
  );
};

export const sendPFBToURL: DataActionFunction = async (
  params,
  done?: () => void,
) => {
  if (!isSendPFBToURLParameters(params)) {
    console.error('Invalid parameters for sendPFBToURL action:', params);
    return;
  }
  const { presignedURL, targetURLTemplate } = params as SendPFBToURLParameters;
  const signedURL = encodeURIComponent(presignedURL);
  // the PFB export target URL is a template URL that should have a {{PRESIGNED_URL}} template
  // variable in it.
  const targetURL = targetURLTemplate.replace(
    PRESIGNED_URL_TEMPLATE_VARIABLE,
    signedURL,
  );

  // get the presigned URL:

  const presignedUrl = await fetchFencePresignedURL({
    guid: 'dg.4503/d470e2bc-d4f8-4088-815a-4333780d2bf0',
  });

  console.log('presignedURL:', presignedURL);

  return new Promise<void>((done) => {
    if (done) done();
  });
};
