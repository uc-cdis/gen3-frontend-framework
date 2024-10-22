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
