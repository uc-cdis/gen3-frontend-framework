import { IndexAndField } from '../guppy/types';

export type FacetType =
  | 'enum'
  | 'exact'
  | 'range'
  | 'age'
  | 'age_in_years'
  | 'year'
  | 'years'
  | 'days'
  | 'percent'
  | 'numeric_range'
  | 'datetime'
  | 'toggle'
  | 'multiselect'
  | 'upload';

export interface AllowableRange {
  readonly minimum: number;
  readonly maximum: number;
}

export interface FacetDefinition {
  readonly description?: string; //description from _mapping
  readonly field: string; // full name of field
  readonly dataField?: string; // deprecated
  readonly index: string; // what dataType is this facet for
  readonly type: FacetType; // classified type based on type + name: e.g. age, year, enumeration, etc
  readonly range?: AllowableRange; // range of value types
  readonly hasData?: boolean; // does this facet have data?
  readonly label?: string; // label for facet
  readonly sharedWithIndices?: Array<IndexAndField>; // if this filter is denormalized across indices
  readonly moveValuesToBottom?: Array<string>;
  readonly excludeValues?: Array<string>;
}
