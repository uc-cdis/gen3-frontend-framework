import { NumericFacetCardProps, QueryOptions } from '../types';

export type NumericFacetProps = Omit<NumericFacetCardProps, 'facetName'> & {
  readonly rangeDatatype?: string;
  readonly minimum: number | undefined;
  readonly maximum: number | undefined;
  readonly clearValues?: boolean;
  readonly isFacetView: boolean;
};

/**
 * Represent a range. Used to configure a row
 * of a range list.
 */
export interface RangeBucketElement {
  readonly from: number;
  readonly to: number;
  readonly key: string; // key for facet range
  readonly label: string; // label for value
  readonly valueLabel?: string; // string representation of the count
  readonly value?: number; // count of items in range
}

export type NumericUnits = 'days' | 'years' | 'percent' | 'year';

export interface NumericFromTo {
  readonly from: number;
  readonly to: number;
}

export type GetNumericRangeFacetDataFunction = (
  field: string,
  ranges: ReadonlyArray<NumericFromTo>,
  queryOptions?: QueryOptions,
) => number;
