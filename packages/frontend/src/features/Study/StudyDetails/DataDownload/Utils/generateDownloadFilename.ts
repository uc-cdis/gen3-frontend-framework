type DownloadFileCategory = 'metadata' | 'vlmd' | 'manifest';

const FILE_CATEGORY_SUFFIX: Record<DownloadFileCategory, string> = {
  metadata: 'meta',
  vlmd: 'vars',
  manifest: 'manifest',
};

const today = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/**
 * Builds a download file name, without extension, of the form
 * {hostname}-{studyUID}-{YYYY-MM-DD}-{suffix}
 */
export const generateDownloadFilename = (
  fileCategory: DownloadFileCategory,
  studyUID?: string,
): string => {
  const prefix = `${window.location.hostname}${studyUID ? `-${studyUID}` : ''}-${today()}`;
  return `${prefix}-${FILE_CATEGORY_SUFFIX[fileCategory]}`;
};
