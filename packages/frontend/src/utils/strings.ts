import { capitalize } from 'lodash';

export const stripTrailingSlash = (str: string): string => {
  return str.endsWith('/') ? str.slice(0, -1) : str;
};

export const SPECIAL_CASE_FIELDS = {
  icd_10_code: 'ICD-10 Code',
};

export const toDisplayName = (field: string): string => {
  const parsed = field.split('.');
  const fieldName = parsed.at(-1);

  if (!fieldName) return 'NotSet';

  return fieldName
    .split('_')
    .map((w) => capitalize(w))
    .join(' ');
};

/*
  Function to convert counts to a string with units
  For example: count = 100 units = 'cases' => '100 Cases'
  Function should handle pluralization
 */
export const toCountsString = (
  counts: number | undefined,
  units: string,
): string => {
  if (!counts) return `No ${capitalize(pluralize(units))}`;
  // return a string with counts and units handling pluralization
  const unitDisplay = counts === 1 ? units : pluralize(units);
  return `${counts.toLocaleString()} ${capitalize(unitDisplay)}`;
};

// Helper function to handle basic pluralization
const pluralize = (word: string): string => {
  // Handle special cases
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  } else if (
    word.endsWith('s') ||
    word.endsWith('x') ||
    word.endsWith('z') ||
    word.endsWith('ch') ||
    word.endsWith('sh')
  ) {
    return word + 'es';
  } else {
    return word + 's';
  }
};
