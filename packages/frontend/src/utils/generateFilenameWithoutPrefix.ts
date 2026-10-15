/**
 * Generates a formatted filename based on the specified file category, GUID, and hostname.
 *
 * @param {string} fileCategory - The category of the file. Valid values are:
 *   - 'metadata': Generates a filename with the suffix '-meta'.
 *   - 'vlmd': Generates a filename with the suffix '-vars'.
 *   - 'manifest': Generates a filename with the suffix '-manifest'.
 *   - 'all_manifests': Generates a filename with the suffix '-manifests'.
 *   - 'file': Generates a filename with the suffix '-file'.
 *   - 'all_files': Generates a filename without a suffix.
 *   - For any other values, the function logs an error and returns an empty string.
 * @param {string} [guid=''] - An optional unique identifier that is added to the filename.
 *   If not provided, it is excluded from the filename.
 * @param {string} [hostname=''] - An optional hostname that is prepended to the filename.
 *   If not provided, it is excluded from the filename.
 * @returns {string} The generated filename based on the given parameters.
 */
const generateFilenameWithoutPrefix = (
  fileCategory: string,
  guid: string = '',
): string => {
  const hostname: string = window.location.hostname;
  const currentDateString = new Date(Date.now()).toISOString().slice(0, 10);
  const filenamePrefix = `${hostname}${guid ? `-${guid}` : ''}-${currentDateString}`;
  switch (fileCategory) {
    case 'metadata':
      return `${filenamePrefix}-meta`;
    case 'vlmd':
      return `${filenamePrefix}-vars`;
    case 'manifest':
      return `${filenamePrefix}-manifest`;
    case 'all_manifests':
      return `${filenamePrefix}-manifests`;
    case 'file':
      return `${filenamePrefix}-file`;
    case 'all_files':
      return `${filenamePrefix}`;
    default:
      console.error(
        'Unknown file category passed into GenerateFilenameWithoutPrefix(): ',
        fileCategory,
      );
      return '';
  }
};

export default generateFilenameWithoutPrefix;
