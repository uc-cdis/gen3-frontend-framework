import {
  EnumFilterValue,
  FacetDefinition,
  FieldToName,
  HistogramData,
  HistogramDataArray,
  Includes,
  Operation,
  selectIndexedFilterByName,
  isOperationWithField,
  TabConfig,
  updateCohortFilter,
  useCoreDispatch,
  useCoreSelector,
  AggregationsData,
  CoreState
} from '@gen3/core';
import {ClearFacetFunction, FromToRange, UpdateFacetFilterFunction,} from './types';
import {isArray} from 'lodash';

export const getAllFieldsFromFilterConfigs = (
  filterTabConfigs: ReadonlyArray<TabConfig>
) => filterTabConfigs.reduce((acc, cur) => acc.concat(cur.fields), [] as string[]);



interface ExplorerResultsData {
  [key:string]: Record<string, any>;
}
export const processBucketData = (
  data?: HistogramDataArray
): Record<string, number> => {
  if (!data) return {};

  return data.reduce((acc : Record<string, number> , curr : HistogramData) => {
    if (isArray(curr.key)) return acc; // remove this line if you want to support array keys
    acc[curr.key] = curr.count;
    return acc;
  }, {} as Record<string, number>);
};

export const processRangeData = (
  data?: HistogramDataArray
): Record<string, number> => {
  if (!data) return {};

  console.log('processRangeData', data);

  return data.reduce((acc : Record<string, number> , curr : HistogramData) => {
    // TODO handle this better when keys are undefined
    console.log('processRangeData', curr);
    acc[`${curr.key?.[0]?.toString()}-${curr.key?.[1]?.toString()}`] = curr.count;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * Update the facet filter for an enumeration facet
 * @param fieldName - the name of the field
 * @param values  - the values to filter on
 * @param updateFacetFilters - the function to update the facet filters
 * @param clearFilters
 */
export const updateFacetEnum = (
  fieldName: string,
  values: EnumFilterValue,
  updateFacetFilters: UpdateFacetFilterFunction,
  clearFilters: ClearFacetFunction
): void => {
  if (values === undefined) return;
  if (values.length > 0) {
    // TODO: Assuming Includes by default but this might change to Include|Excludes
    updateFacetFilters(fieldName, {
      operator: 'in',
      field: fieldName,
      operands: values,
    } as Includes);
  }
  // no values remove the filter
  else {
    clearFilters(fieldName);
  }
};

// Process facets to determine if they are enum or range
export const classifyFacets = (
  data: AggregationsData,
  index: string,
  fieldMapping: ReadonlyArray<FieldToName>
): Record<string, FacetDefinition> => {
  if (!data) return {};

  // otherwise enum facet
  return Object.entries(data as AggregationsData).reduce((acc : Record<string, FacetDefinition>, [ fieldKey, value ] : [ string, HistogramDataArray]) => {

    const dataField = fieldKey.split('.')?.slice(-1)[0] ?? fieldKey;
    // check if range facet
    const type = (value.length === 1 && isArray(value[0].key)) ? 'range' : 'enum';

    return {
      ...acc,
      [fieldKey]: {
        field: fieldKey,
        dataField: dataField, // get the last part of nested field name
        // this is to maintain compatibility with gitops but should be deprecated
        type: type,
        index: index,
        description: 'Not Available',
        // assumption is that the initial data has the min and max values
        range: type === 'range' ? {
          minimum: Math.floor(Number(value[0].key[0])),
          maximum: Math.ceil(Number(value[0].key[1])),
        } : undefined,
      } as FacetDefinition,
    };
  }, {} as Record<string, FacetDefinition>);
};


export const buildNested = (field: string, leafOperand: Operation) : Operation => {
  if (!field.includes('.')) {
    if (isOperationWithField(leafOperand)) return {
    ...leafOperand,
      field: field
    } as Operation;
    else return leafOperand;
  }

  const splitFieldArray = field.split('.');
  const rootField = splitFieldArray.shift();

  return {
    operator: 'nested',
    path: rootField ?? '',
    operand: buildNested(splitFieldArray.join('.'), leafOperand)
  };
};

/**
 * Update Guppy filters: process nested fields and have the final
 * leaf be filter
 * @param index
 */
export const useUpdateFilters = (index: string) => {
  const dispatch = useCoreDispatch();
  // update the filter for this facet

  return (field: string, filter: Operation) => {
    dispatch(
      updateCohortFilter({ index: index, field: field, filter: buildNested(field, filter) })
    );
  };
};
export const useGetFacetFilters = (index: string, field: string): Operation | undefined => {
  return useCoreSelector((state : CoreState) =>
    selectIndexedFilterByName(state, index, field)
  );
};

/**
 * Given an operation, determine if range is open or closed and extract
 * the range values and operands as a NumericRange
 * @param filter - operation to test
 */
export const extractRangeValues = <T extends string | number>(
  filter?: Operation
): FromToRange<T> | undefined => {
  if (filter !== undefined) {
    switch (filter.operator) {
      case '>':
      case '>=':
        return {
          from: (filter.operand as T),
          fromOp: filter.operator,
        };
      case '<':
      case '<=':
        return {
          to: (filter.operand as T),
          toOp: filter.operator,
        };
      case 'and': {
        const a = extractRangeValues<T>(filter.operands[0]);
        const b = extractRangeValues<T>(filter.operands[1]);
        return (a && b ) ? { ...a, ...b } : a ?? b ?? undefined;
      }
      default:
        return undefined;
    }
  } else {
    return undefined;
  }
};
