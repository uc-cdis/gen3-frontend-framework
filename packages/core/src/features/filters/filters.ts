import { isEqual } from 'lodash';
import {
  EnumFilterValue,
  Equals,
  ExcludeIfAny,
  Excludes,
  Exists,
  FilterSet,
  FilterValue,
  GreaterThan,
  GreaterThanOrEquals,
  ifOperationWithField,
  Includes,
  Intersection,
  LessThan,
  LessThanOrEquals,
  Missing,
  NestedFilter,
  NotEquals,
  Operation,
  OperationHandler,
  OperationWithField,
  Union,
} from './types';

export type OperatorWithFieldAndArrayOfOperands =
  | Includes
  | Excludes
  | ExcludeIfAny;

export const isOperationWithField = (
  operation: OperationWithField | Operation,
): operation is OperationWithField => {
  return (operation as OperationWithField)?.field !== undefined;
};

export const isOperatorWithFieldAndArrayOfOperands = (
  operation: unknown,
): operation is OperatorWithFieldAndArrayOfOperands => {
  if (
    typeof operation === 'object' &&
    operation !== null &&
    'operands' in operation &&
    Array.isArray(operation.operands) &&
    'field' in operation &&
    typeof operation.field === 'string' // Assuming `field` should be a string
  ) {
    const { operator } = operation as OperatorWithFieldAndArrayOfOperands;
    return (
      operator === 'in' ||
      operator === 'includes' ||
      operator === 'excludes' ||
      operator === 'excludeifany'
    );
  }
  return false;
};

export const extractFilterValue = (op: Operation): FilterValue => {
  const valueExtractorHandler = new ValueExtractorHandler();
  return handleOperation<FilterValue>(valueExtractorHandler, op);
};
export const extractEnumFilterValue = (op: Operation): EnumFilterValue => {
  const enumValueExtractorHandler = new EnumValueExtractorHandler();
  const results = handleOperation<EnumFilterValue | undefined>(
    enumValueExtractorHandler,
    op,
  );
  return results ?? [];
};

const assertNever = (x: never): never => {
  throw Error(`Exhaustive comparison did not handle: ${x}`);
};

export const handleOperation = <T>(
  handler: OperationHandler<T>,
  op: Operation,
): T => {
  switch (op.operator) {
    case '=':
      return handler.handleEquals(op);
    case '!=':
      return handler.handleNotEquals(op);
    case '<':
      return handler.handleLessThan(op);
    case '<=':
      return handler.handleLessThanOrEquals(op);
    case '>':
      return handler.handleGreaterThan(op);
    case '>=':
      return handler.handleGreaterThanOrEquals(op);
    case 'and':
      return handler.handleIntersection(op);
    case 'or':
      return handler.handleUnion(op);
    case 'nested':
      return handler.handleNestedFilter(op);
    case 'in':
    case 'includes':
      return handler.handleIncludes(op);
    case 'excludeifany':
      return handler.handleExcludeIfAny(op);
    case 'excludes':
      return handler.handleExcludes(op);
    case 'exists':
      return handler.handleExists(op);
    case 'missing':
      return handler.handleMissing(op);
    default:
      return assertNever(op);
  }
};

/**
 * Return true if a FilterSet's root value is an empty object
 * @param fs - FilterSet to test
 */
export const isFilterEmpty = (fs: FilterSet): boolean => isEqual({}, fs);

export interface FilterGroup {
  readonly filterIndex: number;
  readonly filter: FilterSet;
}

export interface GQLEqual {
  '=': {
    [key: string]: string | number | boolean;
  };
}

export interface GQLNotEqual {
  '!=': {
    [key: string]: string | number;
  };
}

export interface GQLLessThan {
  '<': {
    [key: string]: string | number;
  };
}

export interface GQLLessThanOrEquals {
  '<=': {
    [key: string]: string | number;
  };
}

export interface GQLGreaterThan {
  '>': {
    [key: string]: string | number;
  };
}

export interface GQLGreaterThanOrEquals {
  '>=': {
    [key: string]: string | number;
  };
}

export interface GQLIncludes {
  in: {
    [key: string]: ReadonlyArray<string | number>;
  };
}

export interface GQLExcludes {
  exclude: {
    [key: string]: ReadonlyArray<string | number>;
  };
}

export interface GQLExists {
  not: {
    [key: string]: string | number;
  };
}

export interface GQLMissing {
  is: {
    [key: string]: 'MISSING';
  };
}

export interface GQLExcludeIfAny {
  excludeifany: {
    [key: string]: ReadonlyArray<string | number>;
  };
}

export interface NumericFromTo {
  readonly from: number;
  readonly to: number;
}

export interface GQLRange {
  range: {
    [key: string]: ReadonlyArray<{ ranges: NumericFromTo[] }>;
  };
}

/**
 * Type guard to check if an object is a GQLIntersection
 * @param value - The value to check
 * @returns True if the value is a GQLIntersection
 */
export const isGQLIntersection = (value: unknown): value is GQLIntersection => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'and' in value &&
    Array.isArray((value as GQLIntersection).and)
  );
};

export interface GQLIntersection {
  and: ReadonlyArray<GQLFilter>;
}

export interface GQLUnion {
  or: ReadonlyArray<GQLFilter>;
}

/**
 * Type guard to check if an object is a GQLIntersection
 * @param value - The value to check
 * @returns True if the value is a GQLIntersection
 */
export const isGQLUnion = (value: unknown): value is GQLUnion => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'or' in value &&
    Array.isArray((value as GQLUnion).or)
  );
};

type NestedContents = GQLFilter & {
  path: string;
};

export interface GQLNestedFilter {
  nested: NestedContents;
}

export type GQLFilter =
  | GQLEqual
  | GQLNotEqual
  | GQLLessThan
  | GQLLessThanOrEquals
  | GQLGreaterThan
  | GQLGreaterThanOrEquals
  | GQLIncludes
  | GQLExcludes
  | GQLExcludeIfAny
  | GQLIntersection
  | GQLUnion
  | GQLExists
  | GQLMissing
  | GQLNestedFilter;

export class ToGqlHandler implements OperationHandler<GQLFilter> {
  handleEquals = (op: Equals): GQLEqual => ({
    '=': {
      [op.field]: op.operand,
    },
  });
  handleNotEquals = (op: NotEquals): GQLNotEqual => ({
    '!=': {
      [op.field]: op.operand,
    },
  });
  handleLessThan = (op: LessThan): GQLLessThan => ({
    '<': {
      [op.field]: op.operand,
    },
  });
  handleLessThanOrEquals = (op: LessThanOrEquals): GQLLessThanOrEquals => ({
    '<=': {
      [op.field]: op.operand,
    },
  });
  handleGreaterThan = (op: GreaterThan): GQLGreaterThan => ({
    '>': {
      [op.field]: op.operand,
    },
  });
  handleGreaterThanOrEquals = (
    op: GreaterThanOrEquals,
  ): GQLGreaterThanOrEquals => ({
    '>=': {
      [op.field]: op.operand,
    },
  });

  handleIncludes = (op: Includes): GQLIncludes => ({
    in: {
      [op.field]: op.operands,
    },
  });

  handleExcludes = (op: Excludes): GQLExcludes => ({
    exclude: {
      [op.field]: op.operands,
    },
  });

  handleExcludeIfAny = (op: ExcludeIfAny): GQLExcludeIfAny => ({
    excludeifany: {
      [op.field]: op.operands,
    },
  });

  handleIntersection = (op: Intersection): GQLIntersection => ({
    and: op.operands.map((x) =>
      convertFilterToGqlFilter(x),
    ) as ReadonlyArray<GQLFilter>,
  });

  handleUnion = (op: Union): GQLUnion => ({
    or: op.operands.map((x) => convertFilterToGqlFilter(x)),
  });

  handleMissing = (op: Missing): GQLMissing => ({
    is: {
      [op.field]: 'MISSING',
    },
  });

  handleExists = (op: Exists): GQLExists => ({
    not: {
      [op.field]: op?.operand ?? null,
    },
  });

  handleNestedFilter = (op: NestedFilter): GQLNestedFilter => {
    const child: GQLFilter = convertFilterToGqlFilter(op.operand);
    return {
      nested: {
        path: op.path,
        ...child,
      },
    } as GQLNestedFilter;
  };
}

export const convertFilterToGqlFilter = (filter: Operation): GQLFilter => {
  const handler: OperationHandler<GQLFilter> = new ToGqlHandler();
  return handleOperation(handler, filter);
};

export const convertFilterSetToGqlFilter = (
  fs: FilterSet,
  toplevelOp: 'and' | 'or' = 'and',
): GQLFilter => {
  const fsKeys = Object.keys(fs.root);
  // if no keys return undefined
  if (fsKeys.length === 0) return { and: [] };

  return toplevelOp === 'and'
    ? { and: fsKeys.map((key) => convertFilterToGqlFilter(fs.root[key])) }
    : { or: fsKeys.map((key) => convertFilterToGqlFilter(fs.root[key])) };
};

export interface GqlOperationHandler<T> {
  handleEquals: (op: GQLEqual) => T;
  handleNotEquals: (op: GQLNotEqual) => T;
  handleLessThan: (op: GQLLessThan) => T;
  handleLessThanOrEquals: (op: GQLLessThanOrEquals) => T;
  handleGreaterThan: (op: GQLGreaterThan) => T;
  handleGreaterThanOrEquals: (op: GQLGreaterThanOrEquals) => T;
  handleIncludes: (op: GQLIncludes) => T;
  handleExcludes: (op: GQLExcludes) => T;
  handleExcludeIfAny: (op: GQLExcludeIfAny) => T;
  handleIntersection: (op: GQLIntersection) => T;
  handleUnion: (op: GQLUnion) => T;
  handleNestedFilter: (op: GQLNestedFilter) => T;
  handleExists: (op: GQLExists) => T;
  handleMissing: (op: GQLMissing) => T;
}

export const handleGqlOperation = <T>(
  handler: GqlOperationHandler<T>,
  op: GQLFilter,
): T => {
  const operationKeys = Object.keys(op);

  if (operationKeys.includes('=')) {
    return handler.handleEquals(op as GQLEqual);
  }
  if (operationKeys.includes('!=')) {
    return handler.handleNotEquals(op as GQLNotEqual);
  }
  if (operationKeys.includes('<')) {
    return handler.handleLessThan(op as GQLLessThan);
  }
  if (operationKeys.includes('<=')) {
    return handler.handleLessThanOrEquals(op as GQLLessThanOrEquals);
  }
  if (operationKeys.includes('>')) {
    return handler.handleGreaterThan(op as GQLGreaterThan);
  }
  if (operationKeys.includes('>=')) {
    return handler.handleGreaterThanOrEquals(op as GQLGreaterThanOrEquals);
  }
  if (operationKeys.includes('in')) {
    return handler.handleIncludes(op as GQLIncludes);
  }
  if (operationKeys.includes('exclude')) {
    return handler.handleExcludes(op as GQLExcludes);
  }
  if (operationKeys.includes('excludeifany')) {
    return handler.handleExcludeIfAny(op as GQLExcludeIfAny);
  }
  if (operationKeys.includes('and')) {
    return handler.handleIntersection(op as GQLIntersection);
  }
  if (operationKeys.includes('or')) {
    return handler.handleUnion(op as GQLUnion);
  }
  if (operationKeys.includes('nested')) {
    return handler.handleNestedFilter(op as GQLNestedFilter);
  }
  if (operationKeys.includes('is')) {
    return handler.handleExists(op as GQLExists);
  }
  if (operationKeys.includes('not')) {
    return handler.handleMissing(op as GQLMissing);
  }
  return assertNever(op as never);
};

export const convertGqlFilterToFilter = (gqlFilter: GQLFilter): Operation => {
  const handler: GqlOperationHandler<Operation> = new ToOperationHandler();
  return handleGqlOperation(handler, gqlFilter);
};

/**
 * Convert GQL to Filterset
 * Note assumes all GqlOperators have one field: value
 */
class ToOperationHandler implements GqlOperationHandler<Operation> {
  handleEquals = (op: GQLEqual): Equals => {
    const [field, value] = Object.entries(op['='])[0];
    return {
      operator: '=',
      field: field,
      operand: value,
    };
  };
  handleNotEquals = (op: GQLNotEqual): NotEquals => {
    const [field, value] = Object.entries(op['!='])[0];
    return {
      operator: '!=',
      field: field,
      operand: value,
    };
  };
  handleLessThan = (op: GQLLessThan): LessThan => {
    const [field, value] = Object.entries(op['<'])[0];
    return {
      operator: '<',
      field: field,
      operand: value,
    };
  };
  handleLessThanOrEquals = (op: GQLLessThanOrEquals): LessThanOrEquals => {
    const [field, value] = Object.entries(op['<='])[0];
    return {
      operator: '<=',
      field: field,
      operand: value,
    };
  };
  handleGreaterThan = (op: GQLGreaterThan): GreaterThan => {
    const [field, value] = Object.entries(op['>'])[0];
    return {
      operator: '>',
      field: field,
      operand: value,
    };
  };
  handleGreaterThanOrEquals = (
    op: GQLGreaterThanOrEquals,
  ): GreaterThanOrEquals => {
    const [field, value] = Object.entries(op['>='])[0];
    return {
      operator: '>=',
      field: field,
      operand: value,
    };
  };
  handleIncludes = (op: GQLIncludes): Includes => {
    const [field, value] = Object.entries(op.in)[0];
    return {
      operator: 'in',
      field: field,
      operands: value,
    };
  };
  handleExcludes = (op: GQLExcludes): Excludes => {
    const [field, value] = Object.entries(op.exclude)[0];
    return {
      operator: 'excludes',
      field: field,
      operands: value,
    };
  };
  handleExcludeIfAny = (op: GQLExcludeIfAny): ExcludeIfAny => {
    const [field, value] = Object.entries(op.excludeifany)[0];

    return {
      operator: 'excludeifany',
      field: field,
      operands: value,
    };
  };
  handleIntersection = (op: GQLIntersection): Intersection => ({
    operator: 'and',
    operands: op.and.map(convertGqlFilterToFilter),
  });
  handleUnion = (op: GQLUnion): Union => ({
    operator: 'or',
    operands: op.or.map(convertGqlFilterToFilter),
  });
  handleExists = (op: GQLExists): Exists => {
    const [field, value] = Object.entries(op.not)[0];
    return {
      operator: 'exists',
      field: field,
      operand: value,
    };
  };
  handleMissing = (op: GQLMissing): Missing => {
    const field = Object.keys(op.is)[0];
    return {
      operator: 'missing',
      field: field,
    };
  };
  handleNestedFilter = (op: GQLNestedFilter): NestedFilter => ({
    operator: 'nested',
    path: op.nested.path,
    operand: convertGqlFilterToFilter(op.nested),
  });
}

/**
 * Extract the operand values, if operands themselves have values, otherwise undefined.
 */
export class ValueExtractorHandler implements OperationHandler<FilterValue> {
  handleEquals: (op: Equals) => string | number | boolean = (op: Equals) =>
    op.operand;
  handleNotEquals: (op: NotEquals) => string | number = (op: NotEquals) =>
    op.operand;
  handleIncludes: (op: Includes) => ReadonlyArray<string | number> = (
    op: Includes,
  ) => op.operands;
  handleExcludes: (op: Excludes) => ReadonlyArray<string | number> = (
    op: Excludes,
  ) => op.operands;
  handleExcludeIfAny: (op: ExcludeIfAny) => ReadonlyArray<string | number> = (
    op: ExcludeIfAny,
  ) => op.operands;
  handleGreaterThanOrEquals: (op: GreaterThanOrEquals) => string | number = (
    op: GreaterThanOrEquals,
  ) => op.operand;
  handleGreaterThan: (op: GreaterThan) => string | number = (op: GreaterThan) =>
    op.operand;
  handleLessThan: (op: LessThan) => string | number = (op: LessThan) =>
    op.operand;
  handleLessThanOrEquals: (op: LessThanOrEquals) => string | number = (
    op: LessThanOrEquals,
  ) => op.operand;
  handleIntersection: (op: Intersection) => undefined = (_arg: Intersection) =>
    undefined;
  handleUnion: (op: Union) => undefined = (_: Union) => undefined;
  handleNestedFilter: (op: NestedFilter) => undefined = (_: NestedFilter) =>
    undefined;
  handleExists: (op: Exists) => undefined = (_: Exists) => undefined;
  handleMissing: (op: Missing) => undefined = (_: Missing) => undefined;
}

/**
 * Extract the operand values, if operands themselves have values, otherwise undefined.
 */
export class EnumValueExtractorHandler
  implements OperationHandler<EnumFilterValue | undefined>
{
  handleEquals: (_: Equals) => undefined = (_: Equals) => undefined;
  handleNotEquals: (_: NotEquals) => undefined = (_: NotEquals) => undefined;
  handleIncludes: (op: Includes) => ReadonlyArray<string | number> = (
    op: Includes,
  ) => op.operands;
  handleExcludes: (op: Excludes) => ReadonlyArray<string | number> = (
    op: Excludes,
  ) => op.operands;
  handleExcludeIfAny: (op: ExcludeIfAny) => ReadonlyArray<string | number> = (
    op: ExcludeIfAny,
  ) => op.operands;
  handleGreaterThanOrEquals: (_: GreaterThanOrEquals) => undefined = (
    _: GreaterThanOrEquals,
  ) => undefined;
  handleGreaterThan: (_: GreaterThan) => undefined = (_: GreaterThan) =>
    undefined;
  handleLessThan: (op: LessThan) => undefined = (_: LessThan) => undefined;
  handleLessThanOrEquals: (op: LessThanOrEquals) => undefined = (
    _: LessThanOrEquals,
  ) => undefined;
  handleIntersection: (op: Intersection) => undefined = (_: Intersection) =>
    undefined;
  handleUnion: (op: Union) => undefined = (_: Union) => undefined;
  handleNestedFilter: (op: NestedFilter) => EnumFilterValue | undefined = (
    op: NestedFilter,
  ) => {
    return extractEnumFilterValue(op.operand);
  };
  handleExists: (op: Exists) => undefined = (_: Exists) => undefined;
  handleMissing: (op: Missing) => undefined = (_: Missing) => undefined;
}

export const appendFilterToOperation = (
  filter: Intersection | Union | undefined,
  addition: Intersection | Union | undefined,
): Intersection | Union => {
  if (filter === undefined && addition === undefined)
    return { operator: 'and', operands: [] };
  if (addition === undefined && filter) return filter;
  if (filter === undefined && addition) return addition;
  return { ...filter, operands: [...(filter?.operands || []), addition] } as
    | Intersection
    | Union;
};

export const filterSetToOperation = (
  fs: FilterSet | undefined,
): Operation | undefined => {
  if (!fs) return undefined;
  switch (fs.mode) {
    case 'and':
      return Object.keys(fs.root).length == 0
        ? undefined
        : {
            operator: fs.mode,
            operands: Object.keys(fs.root).map((k): Operation => {
              return fs.root[k];
            }),
          };
  }
  return undefined;
};

/**
 * Constructs a nested operation object based on the provided field and leaf operand.
 * If the field does not contain a dot '.', it either assigns the field to the leaf operand (if applicable)
 * or returns the leaf operand as is. When the field contains dots, it splits the field into parts,
 * creates a "nested" operation for the root field, and recursively constructs the nested structure
 * for the remaining portion of the field.
 *
 * @param {string} field - The hierarchical field path, with segments separated by dots (e.g., "root.child").
 * @param {Operation} leafOperand - The operation to be nested within the specified path.
 * @param parentPath - The parent path of the current field. Guppy nested filters require a parent path.
 * @param depth
 * @returns {Operation} A nested operation object that represents the structured path and operand.
 */
export const buildNestedGQLFilter = (
  field: string,
  leafOperand: GQLFilter,
  parentPath: string | undefined = undefined,
): GQLFilter => {
  if (!field.includes('.')) {
    return leafOperand;
  }

  const splitFieldArray = field.split('.');
  const nextField = splitFieldArray.shift();

  if (!nextField) {
    console.warn('Invalid field path:', field);
    return leafOperand;
  }

  const currentPath = parentPath ? `${parentPath}.${nextField}` : nextField;

  return {
    nested: {
      path: currentPath,
      ...buildNestedGQLFilter(
        splitFieldArray.join('.'),
        leafOperand,
        currentPath,
      ),
    },
  };
};

/**
 * Constructs a nested operation object based on the provided field and leaf operand.
 * If the field does not contain a dot '.', it either assigns the field to the leaf operand (if applicable)
 * or returns the leaf operand as is. When the field contains dots, it splits the field into parts,
 * creates a "nested" operation for the root field, and recursively constructs the nested structure
 * for the remaining portion of the field.
 *
 * @param {string} field - The hierarchical field path, with segments separated by dots (e.g., "root.child").
 * @param {Operation} leafOperand - The operation to be nested within the specified path.
 * @param parentPath - The parent path of the current field. Guppy nested filters require a parent path.
 * @returns {Operation} A nested operation object that represents the structured path and operand.
 */
export const buildNestedFilterForOperation = (
  field: string,
  leafOperand: Operation,
  parentPath: string | undefined = undefined,
): Operation => {
  if (!field.includes('.')) {
    // at the end of the path
    if (ifOperationWithField(leafOperand)) {
      // update the field for operations with a field
      return { ...leafOperand, field };
    }
    return leafOperand;
  }

  const splitFieldArray = field.split('.');
  const nextField = splitFieldArray.shift();

  if (!nextField) {
    console.warn('Invalid field path:', field);
    return leafOperand;
  }

  const currentPath = parentPath ? `${parentPath}.${nextField}` : nextField;

  return {
    operator: 'nested',
    path: currentPath,
    operand: buildNestedFilterForOperation(
      splitFieldArray.join('.'),
      leafOperand,
      currentPath,
    ),
  } as NestedFilter;
};
