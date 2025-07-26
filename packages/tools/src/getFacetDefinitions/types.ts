export type IndexAndField = {
  index: string; // guppyIndex
  indexAlias?: string; // alias for index, e.g. tabTitle
  field: string; // name of field in index
};

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
  | 'toggle'
  | 'multiselect'
  | 'upload'
  | 'text'
  | 'age_in_years'
  | 'unknown';

export const stringToFacetType = (input: string): FacetType => {
  const validFacetTypes: FacetType[] = [
    'enum',
    'exact',
    'range',
    'age',
    'year',
    'years',
    'days',
    'percent',
    'datetime',
    'toggle',
    'multiselect',
    'upload',
    'text',
    'age_in_years',
  ];

  if (validFacetTypes.includes(input as FacetType)) {
    return input as FacetType;
  }

  return 'unknown';
};

export interface AllowableRange {
  readonly minimum: number;
  readonly maximum: number;
}

export interface FacetDefinition {
  readonly description?: string; //description from _mapping
  readonly field: string; // full name of field
  readonly dataField?: string; // deprecated
  readonly index: string | null; // what dataType is this facet for
  readonly type: FacetType; // classified type based on type + name: e.g. age, year, enumeration, etc
  readonly range?: AllowableRange; // range of value types
  readonly hasData?: boolean; // does this facet have data?
  readonly label?: string; // label for facet
  readonly sharedWithIndices?: Array<IndexAndField>; // if this filter is denormalized across indices
  readonly moveValuesToBottom?: Array<string>;
  readonly excludeValues?: Array<string>;
}
