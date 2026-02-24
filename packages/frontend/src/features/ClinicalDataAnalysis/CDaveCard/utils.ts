import { FilterSet, isIncludes } from '@gen3/core';

export const getObjectIdsFromFilter = (
  filter: FilterSet,
  objectIdField: string,
): ReadonlyArray<string> | null => {
  // Check if the filter only contains the objectIdField
  const rootKeys = Object.keys(filter?.root || {});
  if (
    rootKeys.length === 1 &&
    rootKeys[0] === objectIdField &&
    isIncludes(filter.root[objectIdField]) &&
    filter.root[objectIdField]?.operands
  ) {
    return filter.root[objectIdField].operands.map((id) => id.toString());
  }
  return null;
};
