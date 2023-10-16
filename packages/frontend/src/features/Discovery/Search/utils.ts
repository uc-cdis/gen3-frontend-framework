import { JSONObject, JSONValue } from '@gen3/core';
import { SearchKV, SearchTerms } from '../types';

export const getFilterValuesByKey = (
  key: string,
  studies: JSONObject[],
  filtersField?: string,
  uidField?: string,
) => {
  const invalidResults = [] as string[];
  if (!studies) {
    return invalidResults;
  }

  if (!filtersField) {
    throw new Error(
      'Misconfiguration error: missing required configuration property `discoveryConfig.features.advSearchFilters.field`',
    );
  }

  if (!uidField) {
    throw new Error(
      'Misconfiguration error: missing required configuration property `discoveryConfig.features.advSearchFilters.field`',
    );
  }

  const filterValuesMap: Record<string, JSONValue> = {};
  studies.forEach((study) => {
    const studyFilters: SearchKV[] =
      (study[filtersField] as unknown as SearchKV[]) ?? [];

    if (!studyFilters) {
      // eslint-disable-next-line no-console
      console.warn(
        `Warning: expected to find property '${filtersField}' in study metadata for study ${
          study[uidField] ?? 'unknown'
        }, but could not find it! This study will not be filterable by the advanced search filters.`,
      );
      return invalidResults;
    }
    try {
      studyFilters.forEach((filterValue: SearchKV) => {
        if (filterValue.key === key) {
          filterValuesMap[filterValue.value] = true;
        }
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      // eslint-disable-next-line no-console
      console.error(
        `The above error appeared in study ${study[uidField] ?? 'unknown'}`,
      );
    }
  });
  return Object.keys(filterValuesMap);
};
//  function to check if search terms are empty
export const hasSearchTerms = (searchTerms: SearchTerms): boolean => {
  return (
    (searchTerms &&
      searchTerms.keyword.keywords &&
      searchTerms.keyword.keywords.length > 0) ||
    (searchTerms.advancedSearchTerms &&
      searchTerms.advancedSearchTerms.filters &&
      Object.values(searchTerms.advancedSearchTerms.filters).some(
        (selectedValues) => {
          return (
            selectedValues &&
            Object.values(selectedValues).some((selected) => selected)
          );
        },
      ))
  );
};
