import Pluralize from 'typescript-pluralize';

/**
 * Convert label to pluralized (optional title case)
 * @param {label} string - a label to convert to title
 * @param {titleCase} boolean - Should the first letter be capitalized default false
 * @returns {string} Pluralized formatted word
 */
export const labelToPlural = (label: string) => {
  return Pluralize.plural(label);
};
