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
  operator: 'in' | 'includes';
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
  readonly operand: string | number;
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
  | Exists
  | ExcludeIfAny
  | Missing
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
  | Excludes
  | Missing
  | Exists;

type OperandsType = Includes | Excludes | ExcludeIfAny | Intersection | Union;

export interface FilterSet {
  readonly root: Record<string, Operation>;
  readonly mode: 'and' | 'or';
}

export const isFilterSet = (input: any): input is FilterSet => {
  if (typeof input !== 'object' || input === null) {
    return false;
  }
  const { root, mode } = input;

  if (typeof root !== 'object' || root === null) {
    return false;
  }

  if (!['and', 'or'].includes(mode)) {
    return false;
  }

  return true;
};

export const isUnion = (value: unknown): value is Union => {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Union).operator === 'or' &&
    Array.isArray((value as Union).operands)
  );
};
export const isIntersection = (value: unknown): value is Intersection => {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Intersection).operator === 'and' &&
    Array.isArray((value as Intersection).operands)
  );
};

/**
 * Type guard for Union or Intersection
 * @param o - operator to check
 * @category Filters
 */
export const isIntersectionOrUnion = (
  o: Operation,
): o is Intersection | Union =>
  (o as Intersection).operator === 'and' || (o as Union).operator === 'or';

export const isOperandsType = (
  operation: Operation,
): operation is OperandsType => {
  return (operation as OperandsType)?.operands !== undefined;
};

export const isNestedFilter = (
  operation: Operation,
): operation is NestedFilter => {
  return (operation as NestedFilter).operator === 'nested';
};

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
  handleExists: (op: Exists) => T;
  handleMissing: (op: Missing) => T;
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

export type IndexedFilterSet = Record<string, FilterSet>;

export const isIndexedFilterSetEmpty = (filters: IndexedFilterSet): boolean =>
  Object.values(filters).every(
    (filterSet) => Object.keys(filterSet).length === 0,
  );

export type UnionOrIntersection = Union | Intersection;

export const EmptyFilterSet: FilterSet = { mode: 'and', root: {} };
