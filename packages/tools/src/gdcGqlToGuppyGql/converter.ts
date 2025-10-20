

// a handler to convert from gql to guppy gql

import {
  Operation,
  GQLFilter,
  GQLEqual,
  GQLNotEqual,
  GQLLessThan,
  GQLLessThanOrEquals,
  GQLGreaterThan,
  GQLGreaterThanOrEquals, GQLIncludes, GQLExcludes, GQLExcludeIfAny, GQLIntersection, GQLUnion,
} from '@gen3/core';
import {
  convertGqlFilterToFilter,
  GqlEquals, GqlExcludeIfAny, GqlExcludes, GqlGreaterThan, GqlGreaterThanOrEquals, GqlIncludes, GqlIntersection,
  GqlLessThan, GqlLessThanOrEquals,
  GqlNotEquals,
  GqlOperation,
  GqlOperationHandler, GqlUnion,
  handleGqlOperation,
} from './gdcApi/filters';


class FromGDCToGen3 implements GqlOperationHandler<GQLFilter> {
  handleEquals = (op: GqlEquals): GQLEqual => ({
    "=" : { [op.content.field]: op.content.value}
  });
  handleNotEquals = (op: GqlNotEquals): GQLNotEqual => ({
    "!=" : { [op.content.field]: op.content.value}
  });
  handleLessThan = (op: GqlLessThan): GQLLessThan => ({
    "<" : { [op.content.field]: op.content.value}
  });
  handleLessThanOrEquals = (op: GqlLessThanOrEquals): GQLLessThanOrEquals => ({
    "<=" : { [op.content.field]: op.content.value}
  });
  handleGreaterThan = (op: GqlGreaterThan): GQLGreaterThan => ({
    ">" : { [op.content.field]: op.content.value}
  });
  handleGreaterThanOrEquals = (
    op: GqlGreaterThanOrEquals,
  ): GQLGreaterThanOrEquals => ({
    ">=" : { [op.content.field]: op.content.value}
  });

  // handleMissing = (op: GqlMissing): Missing => ({
  //   operator: "missing",
  //   field: op.content.field,
  // });
  // handleExists = (op: GqlExists): Exists => ({
  //   operator: "exists",
  //   field: op.content.field,
  // });

  handleIncludes = (op: GqlIncludes): GQLIncludes => ({
    "in": { [op.content.field]: op.content.value}
  });
  handleExcludes = (op: GqlExcludes): GQLExcludes => ({
    "exclude": { [op.content.field]: op.content.value}
  });
  handleExcludeIfAny = (op: GqlExcludeIfAny): GQLExcludeIfAny => ({
    "excludeifany": { [op.content.field]: op.content.value instanceof Array ? op.content.value : [op.content.value]}
  });
  handleIntersection = (op: GqlIntersection): GQLIntersection => ({
    and: op.content.map(convertGDCFilterToGen3Filter),
  });
  handleUnion = (op: GqlUnion): GQLUnion => ({
    or: op.content.map(convertGDCFilterToGen3Filter),
  });
}

export const convertGDCFilterToGen3Filter = (
  gqlFilter: GqlOperation,
): GQLFilter => {
  const handler: GqlOperationHandler<GQLFilter> = new FromGDCToGen3();
  return handleGqlOperation(handler, gqlFilter);
};