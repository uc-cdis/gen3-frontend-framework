import { twMerge } from 'tailwind-merge';
import { StylingOverrideWithMergeControl, StylingMergeMode } from '../types';

type RecordType = Record<string, string>;

/**
 * Merges default and user values for Tailwind classnames.
 *
 * @param {RecordType} defaultValues - The default values for the classnames.
 * @param {RecordType} userValues - The user-defined values for the classnames.
 * @param {StylingMergeMode} mode - Whether to merge or replace the default and user values. Default is merge.
 * @returns {RecordType} - The merged default and user values for the classnames.
 */
export const mergeDefaultTailwindClassnames = (
  defaultValues: RecordType,
  { mode, ...userValues} : StylingOverrideWithMergeControl
): RecordType => {
  const defaultKeys = Object.keys(defaultValues);
  const mergedValues = { ...defaultValues, ...userValues };

  if (mode === 'merge') {
    defaultKeys.forEach((key) => {
      if (userValues[key]) {
        mergedValues[key] = twMerge(defaultValues[key], userValues[key]);
      }
    });
  }

  if (mode === 'replace') {
    defaultKeys.forEach((key) => {
      if (userValues[key]) {
        mergedValues[key] = userValues[key];
      }
    });
  }

  return mergedValues;
};
