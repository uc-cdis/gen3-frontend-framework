import {
  Equals,
  ExcludeIfAny,
  Excludes,
  Exists,
  FilterSet,
  GreaterThan,
  GreaterThanOrEquals,
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
} from './types';
import {
  buildNestedGQLFilter,
  convertFilterToGqlFilter,
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
  handleOperation,
  isGQLIntersection,
  isGQLUnion,
} from './filters';

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
export const buildNestedWithParentPathGQLFilter = (
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

export const buildCohortGqlOperator = (
  fs: FilterSet | undefined,
): GQLFilter | undefined => {
  if (!fs || !fs.root) return undefined;

  const fsKeys = Object.keys(fs.root);
  // if no keys return undefined
  if (fsKeys.length === 0) return undefined;

  // TODO consider changing FilterSet: mode to support joinOrToAll as FilterSet mode
  // find key using keyword "joinOrToAll"
  const joinOrToAllKey = fsKeys.filter((x) => x.includes('joinOrToAll'));

  switch (fs.mode) {
    case 'and':
      if (joinOrToAllKey.length === 1) {
        const firstJoinOrToAllKey = joinOrToAllKey[0];

        // Remove firstJoinOrToAllKey from Array
        fsKeys.splice(fsKeys.indexOf(firstJoinOrToAllKey), 1);

        const firstJoinOrToAllObj = fs.root[firstJoinOrToAllKey];
        // make sure type is or/ Union
        if (firstJoinOrToAllObj.operator === 'or') {
          return {
            or: firstJoinOrToAllObj?.operands.map((orObj) => {
              // go through each or statement and add all other filters to it
              return {
                and: [
                  convertFilterToNestedGqlFilter(orObj),
                  ...fsKeys.map((k): GQLFilter => {
                    return convertFilterToNestedGqlFilter(fs.root[k]);
                  }),
                ],
              };
            }),
          };
        } else {
          console.error(
            `function buildCohortGqlOperator expecting "or" received "${firstJoinOrToAllObj.operator}" on key "${firstJoinOrToAllKey}"`,
          );
        }
      } else if (joinOrToAllKey.length > 1) {
        console.error(
          `function buildCohortGqlOperator expecting only one joinOrToAll received: ${joinOrToAllKey.length}`,
          fsKeys,
        );
      }
      return {
        // TODO: Replace fixed AND with cohort top level operation like Union or Intersection
        [fs.mode]: fsKeys.map((k): GQLFilter => {
          return convertFilterToGqlFilter(fs.root[k]);
        }),
      };
    case 'or':
      return {
        [fs.mode]: fsKeys.map((k): GQLFilter => {
          return convertFilterToGqlFilter(fs.root[k]);
        }),
      };
  }
};

/**
 * Merged two FilterSets returning the merged pair.
 * @param a - first FilterSet
 * @param b - other FilterSet
 */
export const joinFilters = (a: FilterSet, b: FilterSet): FilterSet => {
  return { mode: a.mode, root: { ...a.root, ...b.root } };
};

export const convertFilterSetToOperation = (
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

export const extractContents = (
  filter: GQLFilter,
): readonly GQLFilter[] | undefined => {
  if (isGQLUnion(filter)) {
    return filter.or;
  }
  if (isGQLIntersection(filter)) {
    return filter.and;
  }
  return undefined;
};

export class ToGqlAllNested implements OperationHandler<GQLFilter> {
  handleEquals = (op: Equals): GQLEqual | GQLNestedFilter => {
    if (op.field.includes('.')) {
      const leafField = op.field.split('.').at(-1) ?? 'unset';
      return buildNestedGQLFilter(op.field, {
        '=': { [leafField]: op.operand },
      }) as GQLNestedFilter;
    }
    return {
      '=': {
        [op.field]: op.operand,
      },
    };
  };
  handleNotEquals = (op: NotEquals): GQLNotEqual | GQLNestedFilter => {
    if (op.field.includes('.')) {
      const leafField = op.field.split('.').at(-1) ?? 'unset';
      return buildNestedGQLFilter(op.field, {
        '!=': { [leafField]: op.operand },
      }) as GQLNestedFilter;
    }
    return {
      '!=': {
        [op.field]: op.operand,
      },
    };
  };
  handleLessThan = (op: LessThan): GQLLessThan | GQLNestedFilter => {
    if (op.field.includes('.')) {
      const leafField = op.field.split('.').at(-1) ?? 'unset';
      return buildNestedGQLFilter(op.field, {
        '<': { [leafField]: op.operand },
      }) as GQLNestedFilter;
    }
    return {
      '<': {
        [op.field]: op.operand,
      },
    };
  };
  handleLessThanOrEquals = (
    op: LessThanOrEquals,
  ): GQLLessThanOrEquals | GQLNestedFilter => {
    if (op.field.includes('.')) {
      const leafField = op.field.split('.').at(-1) ?? 'unset';
      return buildNestedGQLFilter(op.field, {
        '<=': { [leafField]: op.operand },
      }) as GQLNestedFilter;
    }
    return {
      '<=': {
        [op.field]: op.operand,
      },
    };
  };
  handleGreaterThan = (op: GreaterThan): GQLGreaterThan | GQLNestedFilter => {
    if (op.field.includes('.')) {
      const leafField = op.field.split('.').at(-1) ?? 'unset';
      return buildNestedGQLFilter(op.field, {
        '>': { [leafField]: op.operand },
      }) as GQLNestedFilter;
    }
    return {
      '>': {
        [op.field]: op.operand,
      },
    };
  };
  handleGreaterThanOrEquals = (
    op: GreaterThanOrEquals,
  ): GQLGreaterThanOrEquals | GQLNestedFilter => {
    if (op.field.includes('.')) {
      const leafField = op.field.split('.').at(-1) ?? 'unset';
      return buildNestedGQLFilter(op.field, {
        '>=': { [leafField]: op.operand },
      }) as GQLNestedFilter;
    }
    return {
      '>=': {
        [op.field]: op.operand,
      },
    };
  };

  handleIncludes = (op: Includes): GQLIncludes | GQLNestedFilter => {
    if (op.field.includes('.')) {
      const leafField = op.field.split('.').at(-1) ?? 'unset';
      return buildNestedGQLFilter(op.field, {
        in: { [leafField]: op.operands },
      }) as GQLNestedFilter;
    }
    return {
      in: {
        [op.field]: op.operands,
      },
    };
  };

  handleExcludes = (op: Excludes): GQLExcludes | GQLNestedFilter => {
    if (op.field.includes('.')) {
      const leafField = op.field.split('.').at(-1) ?? 'unset';
      return buildNestedGQLFilter(op.field, {
        exclude: { [leafField]: op.operands },
      }) as GQLNestedFilter;
    }
    return {
      exclude: {
        [op.field]: op.operands,
      },
    };
  };

  handleExcludeIfAny = (
    op: ExcludeIfAny,
  ): GQLExcludeIfAny | GQLNestedFilter => {
    if (op.field.includes('.')) {
      const leafField = op.field.split('.').at(-1) ?? 'unset';
      return buildNestedGQLFilter(op.field, {
        excludeifany: { [leafField]: op.operands },
      }) as GQLNestedFilter;
    }
    return {
      excludeifany: {
        [op.field]: op.operands,
      },
    };
  };

  handleIntersection = (op: Intersection): GQLIntersection => ({
    and: op.operands.map((x) =>
      convertFilterToGqlFilter(x),
    ) as ReadonlyArray<GQLFilter>,
  });

  handleUnion = (op: Union): GQLUnion => ({
    or: op.operands.map((x) => convertFilterToGqlFilter(x)),
  });

  handleMissing = (op: Missing): GQLMissing | GQLNestedFilter => {
    if (op.field.includes('.')) {
      const leafField = op.field.split('.').at(-1) ?? 'unset';
      return buildNestedGQLFilter(op.field, {
        is: { [leafField]: 'MISSING' },
      }) as GQLNestedFilter;
    }
    return {
      is: {
        [op.field]: 'MISSING',
      },
    };
  };

  handleExists = (op: Exists): GQLExists | GQLNestedFilter => {
    if (op.field.includes('.')) {
      const leafField = op.field.split('.').at(-1) ?? 'unset';
      return buildNestedGQLFilter(op.field, {
        not: { [leafField]: op?.operand ?? null },
      }) as GQLNestedFilter;
    }
    return {
      not: {
        [op.field]: op?.operand ?? null,
      },
    };
  };

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

export const convertFilterToNestedGqlFilter = (
  filter: Operation,
): GQLFilter => {
  const handler: OperationHandler<GQLFilter> = new ToGqlAllNested();
  return handleOperation(handler, filter);
};

export const convertFilterSetToNestedGqlFilter = (
  fs: FilterSet,
  toplevelOp: 'and' | 'or' = 'and',
): GQLFilter => {
  const fsKeys = Object.keys(fs.root);
  // if no keys return undefined
  if (fsKeys.length === 0) return { and: [] };

  return toplevelOp === 'and'
    ? { and: fsKeys.map((key) => convertFilterToNestedGqlFilter(fs.root[key])) }
    : { or: fsKeys.map((key) => convertFilterToNestedGqlFilter(fs.root[key])) };
};
