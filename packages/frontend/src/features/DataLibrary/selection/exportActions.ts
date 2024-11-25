import { DataActionFunction } from './registeredActions';

const PRESIGNED_URL_TEMPLATE_VARIABLE = '{{PRESIGNED_URL}}';

export const sendPFBToURL: DataActionFunction = (params, done?: () => void) => {
  const { presignedURL, targetURLTemplate } = params;
  const signedURL = encodeURIComponent(presignedURL);
  // the PFB export target URL is a template URL that should have a {{PRESIGNED_URL}} template
  // variable in it.
  const targetURL = targetURLTemplate.replace(
    PRESIGNED_URL_TEMPLATE_VARIABLE,
    signedURL,
  );

  return new Promise<void>((done) => {
    if (done) done();
  });
};
