import { JSONObject } from '@gen3/core';
import { AdvancedSearchFilters, KeyValueSearchFilter } from '../../types';
import { getFilterValuesByKey } from '../../Search/utils';

// From /features/Discovery/DataLoaders/MDSAllLocal/DataLoader.ts
export const processAdvancedSearchTerms = (
  advSearchFilters: AdvancedSearchFilters,
  data: JSONObject[],
  uidField: string,
): ReadonlyArray<KeyValueSearchFilter> => {
  console.log('advSearchFilters HERE!', advSearchFilters);
  return advSearchFilters.filters.map((filter) => {
    const { key, keyDisplayName } = filter;
    const values = getFilterValuesByKey(
      key,
      data,
      advSearchFilters.field,
      uidField,
    );
    return {
      key,
      keyDisplayName,
      valueDisplayNames: values.reduce(
        (acc, cur) => {
          acc[cur] = cur;
          return acc;
        },
        {} as Record<string, string>,
      ),
    };
  });
};
