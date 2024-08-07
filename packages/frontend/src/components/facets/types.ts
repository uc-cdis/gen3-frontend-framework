import { EnumFilterValue, Operation } from '@gen3/core';
import { ComponentType } from 'react';

export interface FacetCardProps<T extends FacetFilterHooks = FacetFilterHooks> {
  readonly field: string;
  readonly valueLabel: string;
  readonly description?: string;
  readonly facetName?: string;
  readonly dataHooks: T;
  readonly width?: string;
  readonly hideIfEmpty?: boolean;
  readonly showSearch?: boolean;
  readonly showFlip?: boolean;
  readonly showPercent?: boolean;
  readonly startShowingData?: boolean;
  readonly dismissCallback?: (_arg: string) => void;
  readonly header?: {
    Panel: React.ElementType<any>;
    Label: React.ElementType<any>;
    iconStyle?: string;
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

export interface FacetFilterHooks {
  useClearFilter: ClearFacetHook;
  useUpdateFacetFilters: UpdateFacetFilterHook;
  useGetFacetFilters: SelectFacetFilterFunction;
}

export interface FacetDataHooks extends FacetFilterHooks {
  useGetFacetData: GetFacetDataFunction; // gets data for EnumFacets and ToggleFacet
  useTotalCounts: GetTotalCountsFunction;
}

export interface FacetResponse {
  readonly data?: Record<string, number>;
  readonly isSuccess: boolean;
}

export interface EnumFacetResponse extends FacetResponse {
  readonly enumFilters?: EnumFilterValue;
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

/**
 * Sort type for range buckets
 */
export interface SortType {
  type: 'value' | 'alpha';
  direction: 'asc' | 'dsc';
}
