import {
  CombineMode,
  DataFetchingResult,
  EnumFilterValue,
  FacetDefinition,
  IndexAndField,
  NumericFromTo,
  Operation,
} from '@gen3/core';
import React, { ComponentType, ReactNode } from 'react';

export type QueryOptions = Record<string, unknown>;

export interface EnumChartProps {
  readonly field: string;
  readonly data: Record<string, number>;
  readonly selectedEnums: readonly string[];
  readonly isSuccess: boolean;
  readonly showTitle: boolean;
  readonly maxBins: number;
  readonly height: number;
  readonly valueLabel?: string;
}

export interface FacetCardProps<T extends FacetCommonHooks> {
  readonly field: string;
  readonly hooks: T;
  readonly valueLabel: string;
  readonly description?: string;
  readonly facetName?: string;
  readonly facetBtnToolTip?: string;
  readonly showSearch?: boolean;
  readonly showFlip?: boolean;
  readonly showSettings?: boolean;
  readonly isFacetView?: boolean;
  readonly showPercent?: boolean;
  readonly startShowingData?: boolean;
  readonly hideIfEmpty?: boolean;
  readonly width?: string;
  readonly dismissCallback?: (arg0: string) => void;
  readonly sharedWithIndices?: Array<IndexAndField>;
  readonly Chart?: React.FC<EnumChartProps>;
  readonly queryOptions?: QueryOptions;
  readonly moveValuesToBottom?: Array<string>;
  readonly excludeValues?: Array<string>;

  readonly header?: {
    readonly Panel: ComponentType<{ children: ReactNode }>; // optional header component
    readonly Label: ComponentType<{ children: ReactNode }>; // optional facet label component
    readonly iconStyle?: string; // optional facet button component
  };
}

// required functions
export type ClearFacetFunction = (field: string) => void;
export type ClearIndexedFacetFunction = (index: string, field: string) => void;
export type GetTotalCountsFunction = () => number;
export type UpdateFacetFilterFunction = (
  field: string,
  filter: Operation,
) => void;
export type SelectFacetFilterFunction = (field: string) => Operation;

export interface EnumFacetData {
  readonly data?: Record<string, number>;
  readonly isSuccess: boolean;
  readonly enumValues?: Array<string>;
}

// hook types for facets
export type ClearFacetHook = () => ClearFacetFunction;
export type UpdateFacetFilterHook = () => UpdateFacetFilterFunction;
export type GetFacetDataFunction = (
  field: string,
) => EnumFacetResponse | RangeFacetResponse;
export type GetEnumFacetDataFunction = (field: string) => EnumFacetResponse;
export type GetRangeFacetDataFunction = (field: string) => RangeFacetResponse;
export type GetRangeFacetWithDefinedRangesDataFunction = (
  field: string,
  ranges: ReadonlyArray<NumericFromTo>,
) => RangeFacetResponse;

export type FieldNameToTitleFunction = (
  field: string,
  sections?: number,
) => string;

export type GetFacetCombineModeFunction = (field: string) => CombineMode;
export type SetFacetCombineModeFunction = (
  field: string,
  combineMode: CombineMode,
) => void;

export type EnumOperandValue = ReadonlyArray<string | number>;

export type EnumFacetDataChangedFunction = (
  data: Array<[string | number, number]>,
) => void;

export interface FacetCommonHooks {
  useClearFilter: ClearFacetHook;
  /**
   * Hook that takes the API field and returns a human readable field name
   */
  useFieldNameToTitle: () => (field: string, sections?: number) => string;
  useToggleExpandFilter?: () => (field: string, expanded: boolean) => void;
  useFilterExpanded?: (field: string) => boolean;
  usePopulateFacetData?: (
    facets: FacetDefinition[],
    queryOptions?: QueryOptions,
  ) => void;
}

export interface FacetDataHooks extends FacetCommonHooks {
  useUpdateFacetFilters: UpdateFacetFilterHook;
  useGetFacetFilters: SelectFacetFilterFunction;
  useGetFacetData: GetFacetDataFunction; // gets data for EnumFacets and ToggleFacet
  useTotalCounts?: GetTotalCountsFunction;
}

export interface EnumFacetDataHooks extends FacetDataHooks {
  useGetCombineMode: GetFacetCombineModeFunction;
  useUpdateCombineMode: SetFacetCombineModeFunction;
}

export type ToggleFacetDataHooks = FacetDataHooks;

export interface RangeFacetHooks extends FacetCommonHooks {
  useUpdateFacetFilters: UpdateFacetFilterHook;
  useGetFacetData: GetRangeFacetDataFunction;
}

export type AdvancedRangeFacetHooks = FacetCommonHooks & {
  /**
   * Hook that returns range values and counts
   */
  useGetRangeFacetData: GetRangeFacetDataFunction;
  /**
   * Hook that returns the currently selected filters
   */
  useGetFacetFilters: SelectFacetFilterFunction;
};

export interface CustomFacetHooks {
  /**
   * Hook that returns a list of a user's currently selected custom facets
   */
  readonly useCustomFacets: () => DataFetchingResult<FacetDefinition[]>;
  /**
   * Hook that returns facets available for a user to add to their custom facets, option to return only facets
   * with data
   */
  readonly useAvailableCustomFacets: (
    usedFacets: readonly string[],
    onlyFiltersWithValues: boolean,
    queryOptions?: QueryOptions,
  ) => {
    data: Record<string, FacetDefinition>;
  };
  /**
   * Hook to add a custom filter to a user's panel
   */
  readonly useAddCustomFilter: () => (filter: string) => void;
  /**
   * Hook to remove a custom filter to a user's panel
   */
  readonly useRemoveCustomFilter: () => (filter: string) => void;
}

export interface FacetResponse {
  readonly data?: Record<string, number>;
  readonly isSuccess: boolean;
  readonly isFetching: boolean;
  readonly error?: unknown;
}

export interface EnumFacetResponse extends FacetResponse {
  readonly enumFilters?: EnumFilterValue;
  readonly combineMode?: CombineMode;
}

export function isEnumFacetResponse(
  facetResponse: FacetResponse,
): facetResponse is EnumFacetResponse {
  return 'enumFilters' in facetResponse;
}

export interface RangeFacetResponse extends FacetResponse {
  readonly rangeFilters?: FromToRange<number>;
}

export type RangeFromOp = '>' | '>=';
export type RangeToOp = '<' | '<=';

export interface FromToRangeValues<T> {
  readonly from?: T;
  readonly to?: T;
}

export interface FromToRange<T> extends FromToRangeValues<T> {
  readonly fromOp?: RangeFromOp;
  readonly toOp?: RangeToOp;
}

export interface FieldToName {
  readonly field: string;
  readonly name: string;
}

export type NumericRangeFacetHooks = FacetDataHooks & {
  /**
   * Hook that returns range values and counts
   */
  useGetRangeFacetData: GetRangeFacetWithDefinedRangesDataFunction;
  /**
   * Hook that returns the currently selected filters
   */
  useGetFacetFilters: SelectFacetFilterFunction;
};

export type NumericFacetCardProps = FacetCardProps<NumericRangeFacetHooks> & {
  readonly rangeDatatype?: string;
  readonly minimum: number | undefined;
  readonly maximum: number | undefined;
  readonly clearValues?: boolean;
};

// compact string representation of SortType for config file
export type FacetSortType =
  | 'value-asc'
  | 'value-dsc'
  | 'label-asc'
  | 'label-desc';

/**
 * Sort type for enum buckets
 */
export interface SortType {
  type: 'value' | 'alpha';
  direction: 'asc' | 'dsc';
}

export interface SelectedFields {
  category: string;
  fields: Array<FacetDefinition>;
  selectedFields: Array<string>;
  updateSelectedField: (facet: string) => void;
}

export interface CohortBuilderCategoryConfig {
  readonly label: string;
  readonly facets: ReadonlyArray<string>;
  readonly queryOptions?: QueryOptions;
}
export type FacetRequiredHooks = EnumFacetDataHooks | RangeFacetHooks;

export interface EnumChartProps {
  readonly field: string;
  readonly data: Record<string, number>;
  readonly selectedEnums: readonly string[];
  readonly isSuccess: boolean;
  readonly showTitle: boolean;
  readonly maxBins: number;
  readonly height: number;
  readonly valueLabel?: string;
}
