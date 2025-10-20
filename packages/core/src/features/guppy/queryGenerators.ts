export const customQueryStrForField = (
  field: string,
  query: string,
  depth: number = 0,
): string => {
  const indent = '  '.repeat(depth);
  const splittedFieldArray = field.split('.');
  const splittedField = splittedFieldArray.shift();

  if (splittedFieldArray.length === 0) {
    return `${indent}${splittedField} ${query}`;
  }

  return `${indent}${splittedField} {
${customQueryStrForField(splittedFieldArray.join('.'), query, depth + 1)}
${indent}}`;
};

// TODO: refactor the function below using customQueryStrForEachField and a wrapper function that passes the query
export const histogramQueryStrForEachField = (field: string): string => {
  const splittedFieldArray = field.split('.');
  const splittedField = splittedFieldArray.shift();
  if (splittedFieldArray.length === 0) {
    return `
    ${splittedField} {
      histogram {
        key
        count
      }
    }`;
  }
  return `
  ${splittedField} {
    ${histogramQueryStrForEachField(splittedFieldArray.join('.'))}
  }`;
};

export const statsQueryStrForEachField = (field: string): string => {
  const splittedFieldArray = field.split('.');
  const splittedField = splittedFieldArray.shift();
  if (splittedFieldArray.length === 0) {
    return `
    ${splittedField} {
      histogram {
                count
                min
                max
                avg
                sum
      }
    }`;
  }
  return `
  ${splittedField} {
    ${statsQueryStrForEachField(splittedFieldArray.join('.'))}
  }`;
};

export const nestedHistogramQueryStrForEachField = (
  mainField: string,
  numericAggAsText: boolean,
) => `
  ${mainField} {
    ${numericAggAsText ? 'asTextHistogram' : 'histogram'} {
      key
      count
      missingFields {
        field
        count
      }
      termsFields {
        field
        count
        terms {
          key
          count
        }
      }
    }
  }`;

export const rawDataQueryStrForEachField = (field: string): string => {
  const splitFieldArray = field.split('.');
  const splitField = splitFieldArray.shift();
  if (splitFieldArray.length === 0) {
    return `
    ${splitField}
    `;
  }
  return `
  ${splitField} {
    ${rawDataQueryStrForEachField(splitFieldArray.join('.'))}
  }`;
};
