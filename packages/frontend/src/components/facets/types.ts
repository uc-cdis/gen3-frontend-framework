import {
  EnumFilterValue,
  FacetDefinition,
  Operation,
  CombineMode,
  IndexAndField,
} from '@gen3/core';
import React, { ReactNode, ComponentType } from 'react';

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

  readonly header?: {
    readonly Panel: ComponentType<{ children: ReactNode }>; // optional header component
    readonly Label: ComponentType<{ children: ReactNode }>; // optional facet label component
    readonly iconStyle?: string; // optional facet button component
  };
}

export type FacetType =
  | 'enum'
  | 'exact'
  | 'range'
  | 'age'
  | 'year'
  | 'years'
  | 'days'
  | 'percent'
  | 'datetime'
  | 'toggle';

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
  useToggleExpandFilter?: () => (field: string, expanded: boolean) => void;
  useFilterExpanded?: (field: string) => boolean;
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

export type RangeFacetHooks = FacetCommonHooks & {
  /**
   * Hook that returns range values and counts
   */
  useGetRangeFacetData: GetRangeFacetDataFunction;
  /**
   * Hook that returns the currently selected filters
   */
  useGetFacetFilters: SelectFacetFilterFunction;
};

export interface FacetResponse {
  readonly data?: Record<string, number>;
  readonly isSuccess: boolean;
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

export type NumericRangeFacetHooks = FacetCommonHooks & {
  /**
   * Hook that returns range values and counts
   */
  useGetRangeFacetData: GetRangeFacetDataFunction;
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
