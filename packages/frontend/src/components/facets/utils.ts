import {
  AggregationsData,
  buildNestedFilterForOperation,
  CombineMode,
  CoreState,
  EnumFilterValue,
  extractEnumFilterValue,
  FacetDefinition,
  fieldNameToLabel,
  HistogramData,
  HistogramDataArray,
  Includes,
  IndexAndField,
  Intersection,
  isOperationWithField,
  isOperatorWithFieldAndArrayOfOperands,
  isUnion,
  NumericFromTo,
  Operation,
  OperatorWithFieldAndArrayOfOperands,
  selectIndexedFilterByName,
  selectSharedFilters,
  selectShouldShareFilters,
  SharedFieldMapping,
  updateCohortFilter,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';
import {
  ClearFacetFunction,
  FacetSortType,
  FieldToName,
  FromToRange,
  SortType,
  UpdateFacetFilterFunction,
} from './types';
import { isArray } from 'lodash';
import { TabConfig } from '../../features/CohortBuilder/types';
import { JSONPath } from 'jsonpath-plus';

export const getAllFieldsFromFilterConfigs = (
  filterTabConfigs: ReadonlyArray<TabConfig>,
) =>
  filterTabConfigs.reduce((acc, cur) => acc.concat(cur.fields), [] as string[]);

interface ExplorerResultsData {
  [key: string]: Record<string, any>;
}

export const getByPath = (obj: unknown, path: string) => {
  if (!obj) return undefined;
  const segments = path.split('.').filter(Boolean);
  return segments.reduce<any>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as any)) {
      return (acc as any)[key];
    }
    return undefined;
  }, obj as any);
};

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

export const processDefinedRangeData = (
  data: Record<string, any>,
  ranges: ReadonlyArray<NumericFromTo>,
  field: string,
  index: string,
  indexPrefix: string = '',
): Record<string, number> => {
  if (!data) return {};

  const valueData = JSONPath({
    json: data,
    path: '$..count',
    resultType: 'value',
  });

  const pointerData = JSONPath({
    json: data,
    path: '$..count',
    resultType: 'pointer',
  });

  const buckets = pointerData.reduce(
    (acc: Record<string, number>, pointer: string, index: number) => {
      const parts = pointer.split('/');
      if (parts.length < 4) return acc;
      const key = parts[3];
      if (key in acc) acc[key] += valueData[index];
      else acc[key] = valueData[index];

      return acc;
    },
    {},
  );

  return buckets;
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
        ? addIntersectionToIncludes({
            operator: 'in',
            field: fieldName,
            operands: values,
          } as Includes)
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
  sharedFieldMapping?: SharedFieldMapping,
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
        fieldNameToLabel(fieldKey);

      const facetDef = facetDefinitionsFromConfig[fieldKey] ?? {};

      return {
        ...acc,
        [fieldKey]: {
          field: fieldKey,
          dataField: dataField, // get the last part of the nested field name
          // this is to maintain compatibility with gitops but should be deprecated
          type: facetDef.type ?? type,
          index: index,
          description: facetDef.description ?? 'Not Available',
          label: facetDef.label ?? facetName,
          // assumption is that the initial data has the min and max values
          sharedWithIndices:
            (sharedFieldMapping &&
              fieldKey in sharedFieldMapping &&
              sharedFieldMapping[fieldKey].filter((x) => x.index !== index)) ??
            undefined,
          moveValuesToBottom: facetDef?.moveValuesToBottom,
          excludeValues: facetDef?.excludeValues,
          range: facetDef?.range
            ? {
                minimum:
                  facetDef.range?.minimum ??
                  Math.floor(Number(value[0].key[0])),
                maximum:
                  facetDef?.range?.maximum ??
                  Math.floor(Number(value[0].key[1])),
              } // prefer config-defined range (if any)
            : type === 'range' // if computed type is range use that
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

/**
 * Update Guppy filters: process nested fields and have the final
 * leaf be filtered
 * @param index
 */
export const useUpdateFilters = (index: string) => {
  const dispatch = useCoreDispatch();
  // update the filter for this facet

  const shouldShareFilters = useCoreSelector((state) =>
    selectShouldShareFilters(state),
  );
  const sharedFilters = useCoreSelector((state) => selectSharedFilters(state));

  return (field: string, filter: Operation) => {
    if (shouldShareFilters && field in sharedFilters) {
      sharedFilters[field].forEach((x: IndexAndField) => {
        dispatch(
          updateCohortFilter({
            index: x.index,
            field: x.field,
            filter: buildNestedFilterForOperation(x.field, filter),
          }),
        );
      });
    } else {
      dispatch(
        updateCohortFilter({
          index: index,
          field: field,
          filter: buildNestedFilterForOperation(field, filter),
        }),
      );
    }
  };
};

/**
 * Process any filter but do not nest enve if field is delimited with '.'
 * leaf be filtered
 * @param index
 */
export const useUpdateFiltersFlat = (index: string) => {
  const dispatch = useCoreDispatch();
  // update the filter for this facet

  const shouldShareFilters = useCoreSelector((state) =>
    selectShouldShareFilters(state),
  );
  const sharedFilters = useCoreSelector((state) => selectSharedFilters(state));

  return (field: string, filter: Operation) => {
    if (shouldShareFilters && field in sharedFilters) {
      sharedFilters[field].forEach((x: IndexAndField) => {
        dispatch(
          updateCohortFilter({
            index: x.index,
            field: x.field,
            filter: filter,
          }),
        );
      });
    } else {
      dispatch(
        updateCohortFilter({
          index: index,
          field: field,
          filter: filter,
        }),
      );
    }
  };
};

export const useGetFacetFilters = (index: string, field: string): Operation => {
  return (
    useCoreSelector((state: CoreState) =>
      selectIndexedFilterByName(state, index, field),
    ) ?? {
      operator: 'and',
      operands: [],
    }
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

/**
 * Represents a function that adds an intersection filter operation.
 *
 * @param {Operation} filter - The filter operation to be intersected with.
 * @returns {Operation} An object representing a new operation that combines
 *                      the provided filter with an "and" logical operator.
 */
export const addIntersectionToIncludes = (filter: Includes): Operation => {
  if (!isOperatorWithFieldAndArrayOfOperands(filter)) return filter;

  const values: EnumFilterValue = extractEnumFilterValue(filter);

  // if (!values || values.length === 0) return filter;

  return {
    operator: 'and',
    operands: values.map((x) => {
      return {
        operator: filter.operator,
        operands: [x],
        field: filter.field,
      } as Includes;
    }),
  };
};

/**
 * Removes the intersection from a filter operation if the intersection contains only one operand.
 *
 * @param {Operation} filter - The filter operation to be evaluated.
 * @returns {Operation|undefined} The single operand of the intersection if the intersection has only one operand, otherwise undefined.
 */
export const removeIntersectionFromEnum = (
  filter: Intersection,
): OperatorWithFieldAndArrayOfOperands | undefined => {
  if (filter.operands.length === 0) return undefined;
  if (!filter.operands.every((x) => isOperationWithField(x))) return undefined;

  const values = filter.operands.reduce(
    (acc, x) => {
      extractEnumFilterValue(x).map((y) => acc.push(y));
      return acc;
    },
    [] as Array<string | number>,
  );
  return {
    operator: filter.operands[0].operator,
    field: filter.operands[0].field,
    operands: values,
  } as OperatorWithFieldAndArrayOfOperands;
};

/**
 * Maps a facet sort type to a corresponding sort type.
 *
 * @param {FacetSortType} facetSort - The facet sort type represented as a string in the format "type-direction".
 * @returns {SortType} - The mapped sort type object containing type and direction.
 */
export const mapFacetSortToSortType = (facetSort: FacetSortType): SortType => {
  // Default fallback values
  const defaultSort: SortType = {
    type: 'value',
    direction: 'dsc',
  };

  // Validate input
  if (!facetSort) {
    console.warn(
      `Invalid facetSort: expected string, got ${typeof facetSort}. Using default.`,
    );
    return defaultSort;
  }

  const parts = facetSort.split('-');

  // Check if we have exactly 2 parts
  if (parts.length !== 2) {
    console.warn(
      `Invalid facetSort format: expected 'type-direction', got '${facetSort}'. Using default.`,
    );
    return defaultSort;
  }

  const [type, direction] = facetSort.split('-');
  return {
    type: type === 'label' ? 'alpha' : 'value',
    direction: direction as 'asc' | 'dsc',
  };
};

export const compareKeysAscending = (
  a: string | number,
  b: string | number,
): number => {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  // If only one value is a number, move numbers to one end
  // (in this case, numbers will come before strings)
  if (typeof a === 'number') return -1;
  if (typeof b === 'number') return 1;
  // If both are strings, sort alphabetically
  return a.localeCompare(b);
};
export const compareKeysDescending = (
  a: string | number,
  b: string | number,
): number => {
  if (typeof a === 'number' && typeof b === 'number') {
    return b - a;
  }
  // If only one value is a number, move numbers to one end
  // (in this case, numbers will come before strings)
  if (typeof a === 'number') return 1;
  if (typeof b === 'number') return -1;
  // If both are strings, sort alphabetically
  return b.localeCompare(a);
};
