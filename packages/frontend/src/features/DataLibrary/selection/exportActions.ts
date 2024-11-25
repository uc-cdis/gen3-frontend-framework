import { DataActionFunction } from './registeredActions';
import { fetchFencePresignedURL } from '@gen3/core';

const PRESIGNED_URL_TEMPLATE_VARIABLE = '{{PRESIGNED_URL}}';
interface SendPFBToURLParameters {
  presignedURL: string;
  targetURLTemplate: string;
}

export const sendPFBToURL: DataActionFunction = async (
  params,
  done?: () => void,
) => {
  const { presignedURL, targetURLTemplate } =
    params as unknown as SendPFBToURLParameters;
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

  return new Promise<void>((done) => {
    if (done) done();
  });
};
