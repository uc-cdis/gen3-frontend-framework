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

export const removeMultipleSlashes = (str: string): string => {
  return str.replace(/\/+/g, '/');
};

// next/image does not automatically prepend basePath to local image sources,
// so config-driven paths (e.g. "/images/foo.png") need it added explicitly.
export const withBasePath = (basePath: string, src: string): string => {
  if (!src) return basePath;
  if (/^https?:\/\//.test(src)) return src;
  if (basePath && src.startsWith(basePath)) return src;
  return removeMultipleSlashes(`${basePath}/${src}`);
};
