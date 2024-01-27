export const BATCH_EXPORT_JOB_PREFIX = 'batch-export';
export const GUID_PREFIX_PATTERN = /^dg.[a-zA-Z0-9]+\//;
export const DOWNLOAD_UNAUTHORIZED_MESSAGE =
  'Unable to authorize download. Please refresh the page and ensure you are logged in.';
export const DOWNLOAD_STARTED_MESSAGE =
  'Please remain on this page until your download completes. When your download is ready, ' +
  'it will begin automatically. You can close this window.';
export const DOWNLOAD_SUCCEEDED_MESSAGE =
  'Your download has been prepared. If your download doesn\'t start automatically, please follow this direct link:';
export const JOB_POLLING_INTERVAL = 5000;

export const DOWNLOAD_FAIL_STATUS = {
  inProgress: false,
  message: {
    title: 'Download failed',
    content:
      'There was a problem preparing your download. Please consider using the Gen3 SDK for Python (w/ CLI) to download these files via a manifest.',

    active: true,
  },
};
