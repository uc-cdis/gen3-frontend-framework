import {
  Equals,
  ExcludeIfAny,
  Excludes,
  Exists,
  FilterSet,
  GreaterThan,
  GreaterThanOrEquals,
  handleOperation,
  Includes,
  Intersection,
  LessThan,
  LessThanOrEquals,
  Missing,
  NestedFilter,
  NotEquals,
  Operation,
  OperationHandler,
  Union,
} from '../filters';
import {
  Api32FilterContinuous,
  Api32FilterDiscrete,
  Api32Filters,
  isApi32FilterContinuous,
  isApi32FilterDiscrete,
} from './types';

type ApiFilter =
  | Api32Filters
  | Api32FilterDiscrete
  | Api32FilterContinuous
  | null;

const createEmptyApi32Filters = (): Required<Api32Filters> => ({
  discrete: [],
  continuous: [],
});

const appendApiFilter = (
  acc: Required<Api32Filters>,
  result: ApiFilter,
): void => {
  if (result === null) return;

  if (isApi32FilterDiscrete(result)) {
    acc.discrete.push(result);
    return;
  }

  if (isApi32FilterContinuous(result)) {
    acc.continuous.push(result);
    return;
  }

  if (result.discrete) acc.discrete.push(...result.discrete);
  if (result.continuous) acc.continuous.push(...result.continuous);
};

const reduceOperationsToApi32Filters = (
  operands: ReadonlyArray<Operation>,
): Api32Filters => {
  return operands.reduce((acc, operand) => {
    appendApiFilter(acc, convertFilterToApiFilter(operand));
    return acc;
  }, createEmptyApi32Filters());
};

export const convertFilterToApiFilter = (filter: Operation): ApiFilter => {
  return handleOperation(new ToApiFilter(), filter);
};

export class ToApiFilter implements OperationHandler<ApiFilter> {
  handleEquals = (_op: Equals): null => null;
  handleNotEquals = (_op: NotEquals): null => null;
  handleLessThan = (_op: LessThan): null => null;
  handleLessThanOrEquals = (_op: LessThanOrEquals): null => null;
  handleGreaterThan = (_op: GreaterThan): null => null;
  handleGreaterThanOrEquals = (_op: GreaterThanOrEquals): null => null;

  handleIncludes = (op: Includes): Api32FilterDiscrete => ({
    name: op.field,
    values: op.operands.map(String),
  });

  handleExcludes = (_op: Excludes): null => null;
  handleExcludeIfAny = (_op: ExcludeIfAny): null => null;

  handleIntersection = (op: Intersection): Api32Filters => {
    return reduceOperationsToApi32Filters(op.operands);
  };

  handleUnion = (op: Union): ApiFilter => {
    return reduceOperationsToApi32Filters(op.operands);
  };

  handleMissing = (_op: Missing): null => null;
  handleExists = (_op: Exists): null => null;
  handleNestedFilter = (_op: NestedFilter): null => null;
}

export const convertFilterSetToApiFilter = (fs: FilterSet): Api32Filters => {
  const fsMembers = Object.values(fs.root);
  // if no keys return undefined
  if (fsMembers.length === 0) return {};

  return reduceOperationsToApi32Filters(fsMembers);
};
