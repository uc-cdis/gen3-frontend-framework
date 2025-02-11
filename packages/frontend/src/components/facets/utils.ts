import {
  EnumFilterValue,
  FacetDefinition,
  HistogramData,
  HistogramDataArray,
  Includes,
  Operation,
  isUnion,
  selectIndexedFilterByName,
  isOperationWithField,
  updateCohortFilter,
  useCoreDispatch,
  useCoreSelector,
  fieldNameToTitle,
  AggregationsData,
  CoreState,
} from '@gen3/core';
import {
  ClearFacetFunction,
  FromToRange,
  UpdateFacetFilterFunction,
  FieldToName,
  CombineMode,
} from './types';
import { isArray } from 'lodash';
import { TabConfig } from '../../features/CohortBuilder/types';

export const getAllFieldsFromFilterConfigs = (
  filterTabConfigs: ReadonlyArray<TabConfig>,
) =>
  filterTabConfigs.reduce((acc, cur) => acc.concat(cur.fields), [] as string[]);

interface ExplorerResultsData {
  [key: string]: Record<string, any>;
}

export const processBucketData = (
  data?: HistogramDataArray,
): Record<string, number> => {
  if (!data) return {};

  return data.reduce(
    (acc: Record<string, number>, curr: HistogramData) => {
      if (isArray(curr.key)) return acc; // remove this line if you want to support array keys
      acc[curr.key] = curr.count;
      return acc;
    },
    {} as Record<string, number>,
  );
};

export const processRangeData = (
  data?: HistogramDataArray,
): Record<string, number> => {
  if (!data) return {};

  return data.reduce(
    (acc: Record<string, number>, curr: HistogramData) => {
      // TODO handle this better when keys are undefined
      acc[`${curr.key?.[0]?.toString()}-${curr.key?.[1]?.toString()}`] =
        curr.count;
      return acc;
    },
    {} as Record<string, number>,
  );
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
  clearFilters: ClearFacetFunction,
  combineMode: CombineMode = 'or',
): void => {
  if (values === undefined) return;
  if (values.length > 0) {
    // TODO: Assuming Includes by default but this might change to Include|Excludes
    updateFacetFilters(
      fieldName,
      combineMode === 'and'
        ? {
            operator: 'and',
            operands: [
              {
                operator: 'in',
                field: fieldName,
                operands: values,
              } as Includes,
            ],
          }
        : ({
            operator: 'in',
            field: fieldName,
            operands: values,
          } as Includes),
    );
  }
  // no values remove the filter
  else {
    clearFilters(fieldName);
  }
};

// Process facets to determine if they are enum, exact, or range
export const classifyFacets = (
  data: AggregationsData,
  index: string,
  fieldMapping: ReadonlyArray<FieldToName> = [],
  facetDefinitionsFromConfig: Record<string, FacetDefinition> = {},
): Record<string, FacetDefinition> => {
  if (typeof data !== 'object' || data === null) return {};

  // otherwise enum facet
  return Object.entries(data as AggregationsData).reduce(
    (
      acc: Record<string, FacetDefinition>,
      [fieldKey, value]: [string, HistogramDataArray],
    ) => {
      if (!value) return acc; // return if no data, which prevents an application crash
      const dataField = fieldKey.split('.')?.slice(-1)[0] ?? fieldKey;
      // check if range facet
      const type =
        value.length === 1 && isArray(value[0].key) ? 'range' : 'enum';
      const facetName =
        fieldMapping.find((x) => x.field === fieldKey)?.name ??
        fieldNameToTitle(fieldKey);

      const facetDef = facetDefinitionsFromConfig[fieldKey] ?? {};
      return {
        ...acc,
        [fieldKey]: {
          field: fieldKey,
          dataField: dataField, // get the last part of nested field name
          // this is to maintain compatibility with gitops but should be deprecated
          type: facetDef.type ?? type,
          index: index,
          description: facetDef.description ?? 'Not Available',
          label: facetDef.label ?? facetName,
          // assumption is that the initial data has the min and max values
          range:
            (facetDef.range ?? type === 'range')
              ? {
                  minimum: Math.floor(Number(value[0].key[0])),
                  maximum: Math.ceil(Number(value[0].key[1])),
                }
              : undefined,
        } as FacetDefinition,
      };
    },
    {} as Record<string, FacetDefinition>,
  );
};

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
 * Update Guppy filters: process nested fields and have the final
 * leaf be filtered
 * @param index
 */
export const useUpdateFilters = (index: string) => {
  const dispatch = useCoreDispatch();
  // update the filter for this facet

  return (field: string, filter: Operation) => {
    console.log('useUpdateFilters', index, filter);
    dispatch(
      updateCohortFilter({
        index: index,
        field: field,
        filter: buildNested(field, filter),
      }),
    );
  };
};
export const useGetFacetFilters = (index: string, field: string): Operation => {
  return useCoreSelector(
    (state: CoreState) =>
      selectIndexedFilterByName(state, index, field) ?? {
        operator: 'and',
        operands: [],
      },
  );
};

/**
 * Given an operation, determine if range is open or closed and extract
 * the range values and operands as a NumericRange
 * @param filter - operation to test
 */
export const extractRangeValues = <T extends string | number>(
  filter?: Operation,
): FromToRange<T> | undefined => {
  if (filter !== undefined) {
    switch (filter.operator) {
      case '>':
      case '>=':
        return {
          from: filter.operand as T,
          fromOp: filter.operator,
        };
      case '<':
      case '<=':
        return {
          to: filter.operand as T,
          toOp: filter.operator,
        };
      case 'and': {
        const a = extractRangeValues<T>(filter.operands[0]);
        const b = extractRangeValues<T>(filter.operands[1]);
        return a && b ? { ...a, ...b } : (a ?? b ?? undefined);
      }
      default:
        return undefined;
    }
  } else {
    return undefined;
  }
};

export const convertToStringArray = (
  inputArray: (string | number)[],
): string[] => inputArray.map(String);

/**
 * This function creates a new operation by combining the provided filter
 * with an 'and' logical operator. The resulting operation contains the filter
 * as its sole operand initially.
 *
 * @param {Operation} filter - The operation to be added as the first operand.
 * @returns {Operation} A new operation object with an 'and' operator and the given filter as its operand.
 */
export const addUnion = (filter: Operation): Operation => {
  return {
    operator: 'and',
    operands: [filter],
  };
};

/**
 * Removes a union operation and returns the sole operand if the union
 * operation contains only one operand. If the union operation has multiple
 * operands or if the input is not a union, returns undefined.
 *
 * @param {Operation} filter - The operation to evaluate and possibly modify, expected to be a union.
 * @returns {Operation | undefined} The sole operand of the union if it contains only one, or undefined otherwise.
 */
export const removeUnion = (filter: Operation): Operation | undefined => {
  if (isUnion(filter) && filter.operands.length === 1) {
    return filter.operands[0];
  }
  return undefined;
};
