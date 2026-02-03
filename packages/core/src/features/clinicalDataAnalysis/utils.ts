import { FromToRange } from '../../types/ranges';
import {
  Intersection,
  isOperationWithField,
  NumericFromTo,
  Operation,
} from '../filters';

/**
 * Constructs a nested operation object based on the provided field and leaf operand.
 * If the field does not contain a dot '.', it either assigns the field to the leaf operand (if applicable)
 * or returns the leaf operand as is. When the field contains dots, it splits the field into parts,
 * creates a "nested" operation for the root field, and recursively constructs the nested structure
 * for the remaining portion of the field.
 *
 * @param {string} field - The hierarchical field path, with segments separated by dots (e.g., "root.child").
 * @param {Operation} leafOperand - The operation to be nested within the specified path.
 * @returns {Operation} A nested operation object that represents the structured path and operand.
 */
export const buildNested = (
  field: string,
  leafOperand: Operation,
): Operation => {
  if (!field.includes('.')) {
    if (isOperationWithField(leafOperand))
      return {
        ...leafOperand,
        field: field,
      } as Operation;
    else return leafOperand;
  }

  const splitFieldArray = field.split('.');
  const rootField = splitFieldArray.shift();

  return {
    operator: 'nested',
    path: rootField ?? '',
    operand: buildNested(splitFieldArray.join('.'), leafOperand),
  };
};

/**
 * Constructs a nested operation object based on the provided field and leaf operand.
 * If the field does not contain a dot '.', it either assigns the field to the leaf operand (if applicable)
 * or returns the leaf operand as is. When the field contains dots, it splits the field into parts,
 * creates a "nested" operation for the root field, and recursively constructs the nested structure
 * for the remaining portion of the field.
 *
 * @param {string} field - The hierarchical field path, with segments separated by dots (e.g., "root.child").
 * @param {Operation} leafOperand - The operation to be nested within the specified path.
 * @returns {Operation} A nested operation object that represents the structured path and operand.
 */
export const buildGqlNested = (
  field: string,
  leafOperand: Operation,
): Operation => {
  if (!field.includes('.')) {
    if (isOperationWithField(leafOperand))
      return {
        ...leafOperand,
        field: field,
      } as Operation;
    else return leafOperand;
  }

  const splitFieldArray = field.split('.');
  const rootField = splitFieldArray.shift();

  return {
    operator: 'nested',
    path: rootField ?? '',
    operand: buildNested(splitFieldArray.join('.'), leafOperand),
  };
};

/**
 * Given a range compute the key if possibly matches a predefined range
 * otherwise classify as "custom"
 * @param range - Range to classify
 * @param precision - number of values after the decimal point
 */
export const classifyRangeType = (
  range?: FromToRange<number>,
  precision = 1,
): string => {
  if (range === undefined) return 'custom';
  if (
    range.fromOp == '>=' &&
    range.toOp == '<' &&
    range.from !== undefined &&
    range.to !== undefined
  )
    // builds a range "key"
    return `${range.from.toFixed(precision)}-${range.to.toFixed(precision)}`;

  return 'custom';
};

/**
 *  TODO: Move this to gen3/core
 */

export interface Range<T> {
  field: string;
  content: ReadonlyArray<{ ranges: FromToRange<T>[] }>;
}

export const convertRangeToGql = <T = string>(range: Range<T>): string => {
  const { field, content } = range;
  const gql = content.map((content) => {
    const { ranges } = content;
    return ranges.map((range) => {
      const { from, to, fromOp, toOp } = range;
      return `${field}${fromOp}${from}${toOp}${to}`;
    });
  });
  return gql.join(' OR ');
};

export const convertNumericFromToArrayToFilters = (
  field: string,
  range: NumericFromTo,
  case_filters: Operation,
): Intersection => {
  const { from, to } = range;
  return {
    operator: 'and',
    operands: [
      case_filters,
      buildNested(field, { operator: '>=', field, operand: from }),
      buildNested(field, { operator: '<', field, operand: to }),
    ],
  } satisfies Intersection;
};

export const rawDataQueryStrForEachField = (field: string): string => {
  const splitFieldArray = field.split('.');
  const splitField = splitFieldArray.shift();
  let middleQuery: string = '';
  if (splitFieldArray.length === 0) {
    middleQuery = `${splitField} { histogram { count } }`;
  } else {
    middleQuery = `${splitField} { ${rawDataQueryStrForEachField(splitFieldArray.join('.'))} }`;
  }
  return middleQuery;
};

interface NamedFilterRawDataParams {
  type: string;
  field: string;
  rangeName: string;
}

export const buildAliasedNestedCountsQuery = ({
  type,
  field,
  rangeName,
}: NamedFilterRawDataParams) => {
  const dataParams = [`filter: $${rangeName}`];
  const dataTypeLine = `${rangeName} : ${type} (accessibility: $accessibility ${dataParams}) {`;
  const processedFields = rawDataQueryStrForEachField(field);
  return `${dataTypeLine} ${processedFields} }`;
};

export const buildRangeFilters = (
  field: string,
  case_filters: Operation,
  ranges: Array<NumericFromTo>,
  rangeBaseName: string,
) => {
  const filters = Object.values(ranges).reduce(
    (acc: Record<string, any>, rangeValue, idx) => {
      acc[`${rangeBaseName}_${idx}`] = convertNumericFromToArrayToFilters(
        field,
        rangeValue,
        case_filters,
      );
      return acc;
    },
    {},
  );

  return filters;
};

export const buildRangeQuery = (
  field: string,
  case_filters: Operation,
  ranges: Array<NumericFromTo>,
  rangeBaseName: string = 'range',
  index: string = 'cases',
  indexPrefix: string = '',
) => {
  const rangeFilters = buildRangeFilters(
    field,
    case_filters,
    ranges,
    rangeBaseName,
  );

  let query = `query rangeQuery ($accessibility: Accessibility, ${Object.keys(
    rangeFilters,
  )
    .map((rangeKey) => `$${rangeKey}: JSON`)
    .join(',')} ) { ${indexPrefix}_aggregation {`;
  Object.keys(rangeFilters).forEach((rangeKey) => {
    const rangeQuery = buildAliasedNestedCountsQuery({
      type: index,
      field,
      rangeName: rangeKey,
    });
    query += rangeQuery + ' \n';
  });

  query += `}}`;

  return {
    query: query,
    variables: rangeFilters as Operation,
  };
};
