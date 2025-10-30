import {
  buildNestedFilterForOperation,
  Intersection,
  NumericFromTo,
  Operation,
} from '../filters';
import { FromToRange } from '../../types';

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
  isNested: boolean = true,
): Intersection => {
  const { from, to } = range;
  return {
    operator: 'and',
    operands: [
      isNested
        ? buildNestedFilterForOperation(field, {
            operator: '>=',
            field,
            operand: from,
          })
        : { operator: '>=', field, operand: from },
      isNested
        ? buildNestedFilterForOperation(field, {
            operator: '<',
            field,
            operand: to,
          })
        : { operator: '<', field, operand: to },
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
  prefix?: string;
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
  ranges: Array<NumericFromTo>,
  rangeBaseName: string,
  isNested: boolean = true,
) => {
  const filters = Object.entries(ranges).reduce(
    (acc: Record<string, Operation>, [, rangeValue], idx) => {
      acc[`${rangeBaseName}_${idx}`] = convertNumericFromToArrayToFilters(
        field,
        rangeValue,
        isNested,
      );
      return acc;
    },
    {},
  );

  return filters;
};

export const buildRangeQuery = (
  field: string,
  ranges: Array<NumericFromTo>,
  rangeBaseName: string = 'range',
  index: string = 'cases',
  indexPrefix: string = '',
  isNested: boolean = true,
) => {
  const rangeFilters = buildRangeFilters(
    field,
    ranges,
    rangeBaseName,
    isNested,
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
    filters: rangeFilters,
  };
};
