// a handler to convert from gql to guppy gql

import {
  buildNestedGQLFilter,
  GQLEqual,
  GQLExcludeIfAny,
  GQLExcludes,
  GQLExists,
  GQLFilter,
  GQLGreaterThan,
  GQLGreaterThanOrEquals,
  GQLIncludes,
  GQLIntersection,
  GQLLessThan,
  GQLLessThanOrEquals,
  GQLMissing,
  GQLNestedFilter,
  GQLNotEqual,
  GQLUnion,
} from '@gen3/core';
import {
  GqlEquals,
  GqlExcludeIfAny,
  GqlExcludes,
  GqlExists,
  GqlGreaterThan,
  GqlGreaterThanOrEquals,
  GqlIncludes,
  GqlIntersection,
  GqlLessThan,
  GqlLessThanOrEquals,
  GqlMissing,
  GqlNotEquals,
  GqlOperation,
  GqlOperationHandler,
  GqlUnion,
  handleGqlOperation,
} from './gdcApi/filters';

class FromGDCToGen3 implements GqlOperationHandler<GQLFilter> {
  handleEquals = (op: GqlEquals): GQLEqual => ({
    '=': { [op.content.field]: op.content.value },
  });
  handleNotEquals = (op: GqlNotEquals): GQLNotEqual | GQLNestedFilter => {
    if (op.content.field.indexOf('.') > 0) {
      const leafField = op.content.field.split('.').at(-1) ?? 'unset';
      return buildNestedGQLFilter(op.content.field, {
        '!=': { [leafField]: op.content.value },
      }) as GQLNestedFilter;
    } else return { '!=': { [op.content.field]: op.content.value } };
  };
  handleLessThan = (op: GqlLessThan): GQLLessThan => ({
    '<': { [op.content.field]: op.content.value },
  });
  handleLessThanOrEquals = (op: GqlLessThanOrEquals): GQLLessThanOrEquals => ({
    '<=': { [op.content.field]: op.content.value },
  });
  handleGreaterThan = (op: GqlGreaterThan): GQLGreaterThan => ({
    '>': { [op.content.field]: op.content.value },
  });
  handleGreaterThanOrEquals = (
    op: GqlGreaterThanOrEquals,
  ): GQLGreaterThanOrEquals => ({
    '>=': { [op.content.field]: op.content.value },
  });

  // handleMissing = (op: GqlMissing): Missing => ({
  //   operator: "missing",
  //   field: op.content.field,
  // });
  // handleExists = (op: GqlExists): Exists => ({
  //   operator: "exists",
  //   field: op.content.field,
  // });

  handleIncludes = (op: GqlIncludes): GQLIncludes | GQLFilter => {
    if (op.content.field.indexOf('.') > 0) {
      const leafField = op.content.field.split('.').at(-1) ?? 'unset';
      return buildNestedGQLFilter(op.content.field, {
        in: { [leafField]: op.content.value },
      });
    } else {
      return {
        in: {
          [op.content.field]: op.content.value,
        },
      };
    }
  };

  handleExcludes = (op: GqlExcludes): GQLExcludes => ({
    exclude: { [op.content.field]: op.content.value },
  });
  handleExcludeIfAny = (op: GqlExcludeIfAny): GQLExcludeIfAny => ({
    excludeifany: {
      [op.content.field]:
        op.content.value instanceof Array
          ? op.content.value
          : [op.content.value],
    },
  });
  handleMissing = (op: GqlMissing): GQLMissing => ({
    is: { [op.content.field]: op.content.value },
  });
  handleExists = (op: GqlExists): GQLExists => ({
    not: { [op.content.field]: op.content.value ?? 'EXISTS' },
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
