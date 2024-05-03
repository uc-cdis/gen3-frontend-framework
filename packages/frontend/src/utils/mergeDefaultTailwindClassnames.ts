import { twMerge } from 'tailwind-merge';

type RecordType = Record<string, string>;

/**
 * Merges default and user values for Tailwind classnames.
 *
 * @param {RecordType} defaultValues - The default values for the classnames.
 * @param {RecordType} userValues - The user-defined values for the classnames.
 * @param {boolean} merge - Whether to merge the default and user values. Default is true.
 * @returns {RecordType} - The merged default and user values for the classnames.
 */
export const mergeDefaultTailwindClassnames = (defaultValues: RecordType, userValues: RecordType, merge = true): RecordType => {
  const defaultKeys = Object.keys(defaultValues);
  const mergedValues = { ...defaultValues, ...userValues };

  if (merge) {
    defaultKeys.forEach(key => {
      if (userValues[key]) {
        mergedValues[key] = twMerge(defaultValues[key], userValues[key]);
      }
    });
  }

  return mergedValues;
};
