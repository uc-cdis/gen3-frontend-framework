export const MAX_FILE_NAME_LENGTH = 250;

const INVALID_FILE_NAME_CHARS = /[^a-zA-Z0-9[\]() ._-]/;

const RESERVED_WINDOWS_FILE_NAMES = new Set([
  'CON',
  'PRN',
  'AUX',
  'NUL',
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((n) => [`COM${n}`, `LPT${n}`]),
]);

export const isReservedWindowsFileName = (name: string): boolean =>
  RESERVED_WINDOWS_FILE_NAMES.has(name.toUpperCase());

export const hasInvalidFileNameChars = (name: string): boolean =>
  INVALID_FILE_NAME_CHARS.test(name);

/**
 * Returns an error message if the name cannot safely be used as a file name, otherwise null.
 */
export const validateFileName = (name: string): string | null => {
  if (name.length > MAX_FILE_NAME_LENGTH)
    return `Name cannot exceed ${MAX_FILE_NAME_LENGTH} characters`;
  if (isReservedWindowsFileName(name))
    return 'Name is a reserved file name, please choose a different one';
  if (hasInvalidFileNameChars(name))
    return 'Name can only use alphanumeric characters and []() ._-';
  return null;
};

/**
 * Makes a name safe to use as a file name: removes invalid characters, trims it so the name
 * plus extension fits the length limit, and avoids reserved Windows names.
 */
export const sanitizeFileName = (name: string, extension = ''): string => {
  let baseName = name
    .replace(new RegExp(INVALID_FILE_NAME_CHARS, 'g'), '')
    .substring(0, MAX_FILE_NAME_LENGTH - extension.length);
  if (isReservedWindowsFileName(baseName)) {
    baseName += '_';
  }
  return `${baseName}${extension}`;
};
