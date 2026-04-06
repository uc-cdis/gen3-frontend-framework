import pluralize from '@theothergothamdev/pluralize-ts';

/**
 * Convert label to pluralized (optional title case)
 * @returns {string} Pluralized formatted word
 * @param label {string} Word to pluralize
 */
export const labelToPlural = (label: string) => {
  return pluralize(label);
};
