import { FilterSet, Operation } from '@gen3/core';
import { type CohortId, StorageEntity } from './types';
import { isIntersectionOrUnion, isNestedFilter } from '../filters';

export const defaultCohortNameGenerator = (): string =>
  `Custom cohort ${new Date()
    .toLocaleString('en-CA', {
      timeZone: 'America/Chicago',
      hour12: false,
    })
    .replace(',', '')}`;

export const isNameUnique = <T extends CohortId = CohortId>(
  entities: Array<StorageEntity<T>>,
  name: string,
  excludeId?: T,
): boolean => {
  const trimmedName = name.trim();
  if (!trimmedName) return false;

  return !entities.some(
    (cohort) =>
      cohort &&
      cohort.id !== excludeId &&
      cohort.name.trim().toLowerCase() === trimmedName.toLowerCase(),
  );
};

export const generateUniqueName = <T extends CohortId = CohortId>(
  entities: Array<StorageEntity<T>>,
  baseName: string,
): string => {
  const trimmedBaseName = baseName.trim();

  // If base name is unique, use it
  if (isNameUnique(entities, trimmedBaseName)) {
    return trimmedBaseName;
  }

  // Find a unique name by appending numbers
  let counter = 1;
  let uniqueName: string;

  do {
    uniqueName = `${trimmedBaseName} (${counter})`;
    counter++;
  } while (!isNameUnique(entities, uniqueName));

  return uniqueName;
};

/**
 * This function takes a FilterSet object and a prefix string as input.
 * It filters the root property of the FilterSet object and returns a
 * new FilterSet object that only contains filters with field names
 * that start with the specified prefix.
 *
 *  @param fs - The FilterSet object to filter
 *  @param prefix - The prefix to filter by
 *  @returns - A new FilterSet object that only contains filters with field names that start with the specified prefix
 *  @category Filters
 */
export const extractFiltersWithPrefixFromFilterSet = (
  fs: FilterSet | undefined,
  prefix: string,
): FilterSet => {
  if (fs === undefined || fs.root === undefined) {
    return { mode: 'and', root: {} } as FilterSet;
  }
  return Object.values(fs.root).reduce(
    (acc, filter: Operation) => {
      if (isIntersectionOrUnion(filter) || isNestedFilter(filter)) return acc;
      if (filter.field.startsWith(prefix)) {
        acc.root[filter.field] = filter;
      }
      return acc;
    },
    { mode: 'and', root: {} } as FilterSet,
  );
};
