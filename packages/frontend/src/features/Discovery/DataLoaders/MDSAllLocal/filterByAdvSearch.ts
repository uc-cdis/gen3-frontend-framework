import { JSONObject } from '@gen3/core';
import { AdvancedSearchTerms } from '../../Search/types';
import { DiscoveryIndexConfig, isSearchKVArray } from '../../types';

/**
 *
 * @param studies
 * @param advancedSearchTerms
 * @param config
 */
const filterByAdvSearch = (
  studies: JSONObject[],
  advancedSearchTerms: AdvancedSearchTerms,
  config: DiscoveryIndexConfig,
): JSONObject[] => {
  // leave if advanced search filters are not enabled

  if (
    config.features?.advSearchFilters === undefined ||
    !config.features.advSearchFilters.enabled
  ) {
    return studies;
  }

  // if no filters active, show all studies
  const noFiltersActive = Object.values(advancedSearchTerms.filters).every(
    (selectedValues) => {
      if (Object.values(selectedValues).length === 0) {
        return true;
      }
      return Object.values(selectedValues).every((selected) => !selected);
    },
  );

  if (noFiltersActive) {
    return studies;
  }

  // Combine within filters as AND
  if (advancedSearchTerms.operation === 'AND') {
    return studies.filter((study) =>
      Object.keys(advancedSearchTerms.filters).every((filterName) => {
        const filterValues = Object.keys(
          advancedSearchTerms.filters[filterName],
        );
        // Handle the edge case where no values in this filter are selected
        if (filterValues.length === 0) {
          return true;
        }

        if (config.features?.advSearchFilters?.field === undefined) {
          return false;
        }

        const studyFilters = study[config.features.advSearchFilters.field];
        if (!isSearchKVArray(studyFilters)) {
          return false;
        }

        if (!studyFilters || !studyFilters.length) {
          return false;
        }

        const studyFilterValues = studyFilters
          .filter(({ key }) => key === filterName)
          .map(({ value }) => value);
        return filterValues.every((value) => studyFilterValues.includes(value));
      }),
    );
  }

  // Combine within filters as OR
  return studies.filter((study) =>
    Object.keys(advancedSearchTerms.filters).some((filterName) => {
      const filterValues = Object.keys(advancedSearchTerms.filters[filterName]);
      // Handle the edge case where no values in this filter are selected
      if (filterValues.length === 0) {
        return true;
      }

      if (config.features?.advSearchFilters?.field === undefined) {
        return false;
      }

      const studyFilters = study[config.features.advSearchFilters?.field];

      if (!isSearchKVArray(studyFilters)) {
        return false;
      }

      if (!studyFilters || !studyFilters.length) {
        return false;
      }

      return studyFilters.some(
        ({ key, value }) => key === filterName && filterValues.includes(value),
      );
    }),
  );
};

export default filterByAdvSearch;
