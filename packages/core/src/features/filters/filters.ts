import { isEqual } from 'lodash';
import {
  EnumFilterValue,
  Equals,
  ExcludeIfAny,
  Excludes,
  FilterSet,
  FilterValue,
  GreaterThan,
  GreaterThanOrEquals,
  Includes,
  Intersection,
  LessThan,
  LessThanOrEquals,
  NestedFilter,
  NotEquals,
  Operation,
  OperationHandler,
  Union
} from './types';
import { extractEnumFilterValue } from './utils';

const assertNever = (x: never): never => {
  throw Error(`Exhaustive comparison did not handle: ${x}`);
};

export const handleOperation = <T>(
  handler: OperationHandler<T>,
  op: Operation
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
      return handler.handleIncludes(op);
    case 'excludeifany':
      return handler.handleExcludeIfAny(op);
    case 'excludes':
      return handler.handleExcludes(op);
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
    [key: string]: string | number;
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

export interface GQLExcludeIfAny {
  excludeifany: {
    [key: string]: ReadonlyArray<string | number>;
  };
}

export interface GQLIntersection {
  and: ReadonlyArray<GQLFilter>;
}

export interface GQLUnion {
  or: ReadonlyArray<GQLFilter>;
}

type NestedContents = GQLFilter & {
  path: string;
}

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
      op: GreaterThanOrEquals
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
        convertFilterToGqlFilter(x)
    ) as ReadonlyArray<GQLFilter>,
  });

  handleUnion = (op: Union): GQLUnion => ({
    or: op.operands.map((x) => convertFilterToGqlFilter(x)),
  });


  handleNestedFilter = (op: NestedFilter): GQLNestedFilter => {
    const child : GQLFilter = convertFilterToGqlFilter(op.operand);
    return {
      nested: {
        path: op.path,
        ...child
      }
    } as GQLNestedFilter;
  };
}

 const convertFilterToGqlFilter = (filter: Operation): GQLFilter => {
  const handler: OperationHandler<GQLFilter> = new ToGqlHandler();
  return handleOperation(handler, filter);
};

export const convertFilterSetToGqlFilter = (
  fs: FilterSet,
  toplevelOp: 'and' | 'or' = 'and'
): GQLFilter => {
  const fsKeys = Object.keys(fs.root);
  // if no keys return undefined
  if (fsKeys.length === 0) return { and: [] };

  return toplevelOp === 'and'
    ? { and: fsKeys.map((key) => convertFilterToGqlFilter(fs.root[key])) }
    : { or: fsKeys.map((key) => convertFilterToGqlFilter(fs.root[key])) };
};


/**
 * Extract the operand values, if operands themselves have values,  otherwise undefined.
 */
export class ValueExtractorHandler implements OperationHandler<FilterValue> {
  handleEquals: (op: Equals) => string | number = (op: Equals) => op.operand;
  handleNotEquals: (op: NotEquals) => string | number = (op: NotEquals) =>
    op.operand;
  handleIncludes: (op: Includes) => ReadonlyArray<string | number> = (
    op: Includes
  ) => op.operands;
  handleExcludes: (op: Excludes) => ReadonlyArray<string | number> = (
      op: Excludes
  ) => op.operands;
  handleExcludeIfAny: (op: ExcludeIfAny) => ReadonlyArray<string | number> = (
      op: ExcludeIfAny
  ) => op.operands;
  handleGreaterThanOrEquals: (op: GreaterThanOrEquals) => string | number = (
    op: GreaterThanOrEquals
  ) => op.operand;
  handleGreaterThan: (op: GreaterThan) => string | number = (op: GreaterThan) =>
    op.operand;
  handleLessThan: (op: LessThan) => string | number = (op: LessThan) =>
    op.operand;
  handleLessThanOrEquals: (op: LessThanOrEquals) => string | number = (
    op: LessThanOrEquals
  ) => op.operand;
  handleIntersection: (op: Intersection) => undefined = (_: Intersection) =>
    undefined;
  handleUnion: (op: Union) => undefined = (_: Union) => undefined;
  handleNestedFilter: (op: NestedFilter) => undefined = (_: NestedFilter) =>
    undefined;
}

/**
 * Extract the operand values, if operands themselves have values,  otherwise undefined.
 */
export class EnumValueExtractorHandler
  implements OperationHandler<EnumFilterValue | undefined>
{
  handleEquals: (_: Equals) => undefined = (_: Equals) => undefined;
  handleNotEquals: (_: NotEquals) => undefined = (_: NotEquals) => undefined;
  handleIncludes: (op: Includes) => ReadonlyArray<string | number> = (
    op: Includes
  ) => op.operands;
  handleExcludes: (op: Excludes) => ReadonlyArray<string | number> = (
      op: Excludes
  ) => op.operands;
  handleExcludeIfAny: (op: ExcludeIfAny) => ReadonlyArray<string | number> = (
      op: ExcludeIfAny
  ) => op.operands;
  handleGreaterThanOrEquals: (_: GreaterThanOrEquals) => undefined = (
    _: GreaterThanOrEquals
  ) => undefined;
  handleGreaterThan: (_: GreaterThan) => undefined = (_: GreaterThan) =>
    undefined;
  handleLessThan: (op: LessThan) => undefined = (_: LessThan) => undefined;
  handleLessThanOrEquals: (op: LessThanOrEquals) => undefined = (
    _: LessThanOrEquals
  ) => undefined;
  handleIntersection: (op: Intersection) => undefined = (_: Intersection) =>
    undefined;
  handleUnion: (op: Union) => undefined = (_: Union) => undefined;
  handleNestedFilter: (op: NestedFilter) => EnumFilterValue | undefined = (op: NestedFilter) => {
      return extractEnumFilterValue(op.operand);
  };
}
