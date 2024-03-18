import pluralize from 'pluralize';


/**
* Convert label to pluralized (optional title case)
* @param {label} string - a label to convert to title
* @param {titleCase} boolean - Should first letter be capitalized default false
* @returns {string} Pluralized formatted word
*/
export const labelToPlural = (label:string, titleCase = false) => {
  const pluralizedLabel = pluralize(label);
  if (titleCase) {
    return pluralizedLabel.charAt(0).toUpperCase() + pluralizedLabel.slice(1);
  }
  return pluralizedLabel.toLowerCase();
};
