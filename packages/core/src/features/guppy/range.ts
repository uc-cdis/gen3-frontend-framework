import { buildNestedFilterForOperation, FilterSet, Intersection, NumericFromTo, Operation, } from '../filters';
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

export const rawDataQueryStrForEachField = (field: string, asTextHistogram: boolean = false): string => {
  const splitFieldArray = field.split('.');
  const splitField = splitFieldArray.shift();
  let middleQuery: string = '';
  if (splitFieldArray.length === 0) {
    middleQuery = `${splitField} { ${asTextHistogram ? "histogram: asTextHistogram" :  "histogram"} { count } }`;
  } else {
    middleQuery = `${splitField} { ${rawDataQueryStrForEachField(splitFieldArray.join('.'), asTextHistogram)} }`;
  }
  return middleQuery;
};

interface NamedFilterRawDataParams {
  type: string;
  field: string;
  rangeName: string;
  prefix?: string;
  asTextHistogram?: boolean;
}

export const buildAliasedNestedCountsQuery = ({
  type,
  field,
  rangeName,
  asTextHistogram = false,
}: NamedFilterRawDataParams) => {
  const dataParams = [`filter: $${rangeName}`];
  const dataTypeLine = `${rangeName} : ${type} (accessibility: $accessibility ${dataParams}) {`;
  const processedFields = rawDataQueryStrForEachField(field, asTextHistogram);
  return `${dataTypeLine} ${processedFields} }`;
};

export const removeKey = (
  key: string | number,
  { [key]: _, ...rest }: Record<string, Operation>,
): Record<string, Operation> => rest;

export const buildRangeFilters = (
  field: string,
  ranges: Array<NumericFromTo>,
  filters: FilterSet,
  rangeBaseName: string,
  isNested: boolean = true,
) => {
  return Object.entries(ranges).reduce(
    (acc: Record<string, FilterSet>, [, rangeValue], idx) => {
      acc[`${rangeBaseName}_${idx}`] = {
        mode: filters.mode,
        root: {
          ...filters.root,
          [field]: convertNumericFromToArrayToFilters(
            field,
            rangeValue,
            isNested,
          ),
        },
      } satisfies FilterSet;
      return acc;
    },
    {},
  );
};

export const buildRangeQuery = (
  field: string,
  ranges: Array<NumericFromTo>,
  filters: FilterSet,
  rangeBaseName: string = 'range',
  index: string = 'cases',
  indexPrefix: string = '',
  isNested: boolean = true,
  asTextHistogram: boolean = false,
) => {
  const rangeFilters = buildRangeFilters(
    field,
    ranges,
    filters,
    rangeBaseName,
    isNested
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
       asTextHistogram
    });
    query += rangeQuery + ' \n';
  });

  query += `}}`;

  return {
    query: query,
    filters: rangeFilters,
  };
};
