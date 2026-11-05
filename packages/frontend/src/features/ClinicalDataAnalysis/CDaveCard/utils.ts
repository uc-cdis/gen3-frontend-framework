import { FilterSet, isIncludes } from '@gen3/core';

export const getObjectIdsFromFilter = (
  filter: FilterSet,
  uniqueIdField: string,
): ReadonlyArray<string> | null => {
  // Check if the filter only contains the uniqueIdField
  const rootKeys = Object.keys(filter?.root || {});
  if (
    rootKeys.length === 1 &&
    rootKeys[0] === uniqueIdField &&
    isIncludes(filter.root[uniqueIdField]) &&
    filter.root[uniqueIdField]?.operands
  ) {
    return filter.root[uniqueIdField].operands.map((id) => id.toString());
  }
  return null;
};
