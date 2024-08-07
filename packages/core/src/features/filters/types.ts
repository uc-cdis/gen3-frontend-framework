export interface Intersection {
  operator: 'and';
  operands: ReadonlyArray<Operation>;
}

export interface Union {
  operator: 'or';
  operands: ReadonlyArray<Operation>;
}

export interface Equals {
  operator: '=';
  field: string;
  operand: number | string;
}

export interface NotEquals {
  operator: '!=';
  field: string;
  operand: number | string;
}

export interface Includes {
  operator: 'in';
  field: string;
  operands: ReadonlyArray<string | number>;
}

export interface Comparison {
  field: string;
  operand: string | number;
}

export interface LessThan extends Comparison {
  operator: '<';
}

export interface LessThanOrEquals extends Comparison {
  operator: '<=';
}

export interface GreaterThan extends Comparison {
  operator: '>';
}

export interface GreaterThanOrEquals extends Comparison {
  operator: '>=';
}

export interface Exists {
  readonly operator: 'exists';
  readonly field: string;
}

export interface Missing {
  readonly operator: 'missing';
  readonly field: string;
}

export interface ExcludeIfAny {
  readonly operator: 'excludeifany';
  readonly field: string;
  readonly operands: ReadonlyArray<string | number>;
}

export interface Excludes {
  readonly operator: 'excludes';
  readonly field: string;
  readonly operands: ReadonlyArray<string | number>;
}

export interface NestedFilter {
  operator: 'nested';
  path: string;
  operand: Operation;
}

export type Operation =
  | Intersection
  | Union
  | Includes
  | Equals
  | NotEquals
  | LessThan
  | LessThanOrEquals
  | GreaterThan
  | GreaterThanOrEquals
  | NestedFilter
  | ExcludeIfAny
  | Excludes;

export type OperationWithField =
  | Includes
  | Equals
  | NotEquals
  | LessThan
  | LessThanOrEquals
  | GreaterThan
  | GreaterThanOrEquals
  | ExcludeIfAny
  | Excludes;

export interface FilterSet {
  readonly root: Record<string, Operation>;
  readonly mode: 'and' | 'or';
}

export interface OperationHandler<T> {
  handleEquals: (op: Equals) => T;
  handleNotEquals: (op: NotEquals) => T;
  handleLessThan: (op: LessThan) => T;
  handleLessThanOrEquals: (op: LessThanOrEquals) => T;
  handleGreaterThan: (op: GreaterThan) => T;
  handleGreaterThanOrEquals: (op: GreaterThanOrEquals) => T;
  handleIncludes: (op: Includes) => T;
  handleExcludes: (op: Excludes) => T;
  handleExcludeIfAny: (op: ExcludeIfAny) => T;
  handleIntersection: (op: Intersection) => T;
  handleUnion: (op: Union) => T;
  handleNestedFilter: (op: NestedFilter) => T;
}

/**
 *  Operand types for filter operations
 */
export type EnumFilterValue = ReadonlyArray<string | number>;
export type RangeFilterValue = string | number;
export type SetFilterValue = ReadonlyArray<Operation>;
export type FilterValue =
  | EnumFilterValue
  | RangeFilterValue
  | SetFilterValue
  | undefined;

export type FacetBucket = {
  key: string;
  doc_count: number;
};

export type HistogramBucket = {
  key: string | [number, number];
  count: number;
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
  | 'toggle' // Note these support alternative UIs
  | 'multiselect';

export interface AllowableRange {
  readonly minimum?: number;
  readonly maximum?: number;
}

export interface FacetDefinition {
  readonly description?: string; //description from _mapping
  readonly field: string; // full name of field
  readonly dataField: string; //
  readonly index: string; // what dataType is this facet for
  readonly type: FacetType; // classified type based on type + name: e.g. age, year, enumeration, etc
  readonly range?: AllowableRange; // range of value types
  readonly hasData?: boolean; // does this facet have data
  readonly label?: string; // label for facet
}

export type IndexedFilterSet = Record<string, FilterSet>;
