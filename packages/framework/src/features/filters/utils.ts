const FieldNameOverrides: Record<string, string> = {};

const COMMON_PREPOSITIONS = [
  'a',
  'an',
  'and',
  'at',
  'but',
  'by',
  'for',
  'in',
  'is',
  'nor',
  'of',
  'on',
  'or',
  'out',
  'so',
  'the',
  'to',
  'up',
  'yet',
];

const capitalize = (s: string): string =>
  s.length > 0 ? s[0].toUpperCase() + s.slice(1) : '';

export const trimFirstFieldNameToTitle = (
  fieldName: string,
  trim = false,
): string => {
  if (trim) {
    const source = fieldName.slice(fieldName.indexOf('.') + 1);
    return fieldNameToTitle(source ? source : fieldName, 0);
  }
  return fieldNameToTitle(fieldName);
};

/**
 * Converts a filter name to a title,
 * For example files.input.experimental_strategy will get converted to Experimental Strategy
 * if sections == 2 then the output would be Input Experimental Strategy
 * @param fieldName input filter expected to be: string.firstpart_secondpart
 * @param sections number of "sections" string.string.string to got back from the end of the field
 */

export const fieldNameToTitle = (fieldName: string, sections = 1): string => {
  if (fieldName in FieldNameOverrides) {
    return FieldNameOverrides[fieldName];
  }
  if (fieldName === undefined) return 'No Title';

  return fieldName
    .split('.')
    .slice(-sections)
    .map((s) => s.split('_'))
    .flat()
    .map((word) =>
      COMMON_PREPOSITIONS.includes(word) ? word : capitalize(word),
    )
    .join(' ');
};

/**
 * Extracts the index name from the field name
 * @param fieldName
 */
export const extractIndexFromFullFieldName = (fieldName: string): string =>
  fieldName.split('.')[0];

/**
 * prepend the index name to the field name
 */
export const prependIndexToFieldName = (
  fieldName: string,
  index: string,
): string => `${index}.${fieldName}`;

/**
 * extract the field name from the index.field name
 */
export const extractFieldNameFromFullFieldName = (fieldName: string): string =>
  fieldName.split('.').slice(1).join('.');

/**
 * extract the field name and the index from the index.field name returning as a tuple
 */
export const extractIndexAndFieldNameFromFullFieldName = (
  fieldName: string,
): [string, string] => {
  const [index, ...rest] = fieldName.split('.');
  return [index, rest.join('.')];
};
