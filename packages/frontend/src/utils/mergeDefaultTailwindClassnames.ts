import { twMerge } from 'tailwind-merge';
import {
  StylingOverrideWithMergeControl,
  StylingMergeMode,
  StylingOverride,
} from '../types';

/**
 * Merges default and user values for Tailwind classnames.
 *
 * @param {StylingOverride} defaultValues - The default values for the classnames.
 * @param {StylingOverride} userValues - The user-defined values for the classnames.
 * @param {StylingMergeMode} mode - Whether to merge or replace the default and user values. Default is merge.
 * @returns {StylingOverride} - The merged default and user values for the classnames.
 */
export const mergeDefaultTailwindClassnames = (
  defaultValues: StylingOverride,
  { mode = 'merge', ...userValues }: StylingOverrideWithMergeControl,
): StylingOverride => {
  const defaultKeys = Object.keys(defaultValues);
  const mergedValues = { ...defaultValues };

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

export const mergeTailwindClassnameWithDefault = (
  userValues: string | undefined,
  defaultValues: string,
): string => (userValues ? twMerge(defaultValues, userValues) : defaultValues);
