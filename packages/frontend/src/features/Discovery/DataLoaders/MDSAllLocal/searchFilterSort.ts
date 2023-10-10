import filterByTags from './filterByTags';
import filterByAdvSearch from './filterByAdvSearch';
import { DiscoveryConfig,  SearchTerms, AccessFilters } from "../../types";
import { AccessSortDirection, AdvancedSearchTerms } from "../../Search/types";
import { JSONObject } from "@gen3/core";

;


interface ParametersForDoSearchFilterSort {
  studies: JSONObject[],
  jsSearch: any,
  searchTerms: SearchTerms;
  config: DiscoveryConfig,
  filterState: AdvancedSearchTerms,
  accessFilters: AccessFilters,
  accessibleFieldName?: string,
  accessSortDirection?: AccessSortDirection,
}

const searchFilterSort = (parametersForDoSearchFilterSort: ParametersForDoSearchFilterSort) => {
  const {
    studies,
    searchTerms,
    jsSearch,
    config,
    filterState,
    accessFilters,
    accessibleFieldName =  '__accessible',
    accessSortDirection= AccessSortDirection.DESCENDING,
  } = parametersForDoSearchFilterSort;
  let filteredResources = studies;
  // perform keyword search
  if (jsSearch && searchTerms.keyword.keywords && searchTerms.keyword.keywords.length > 0) {
    filteredResources = jsSearch.search(searchTerms.keyword.keywords.join(' '));
  }
  filteredResources = filterByTags(
    filteredResources,
    searchTerms.selectedTags,
    config,
  );

  if (
    config.features.advSearchFilters
    && config.features.advSearchFilters.enabled
  ) {
    filteredResources = filterByAdvSearch(
      filteredResources,
      filterState,
      config,
    );
  }

  if (config.features.authorization.enabled) {
    filteredResources  = filteredResources.filter(
      (resource) => accessFilters[resource[accessibleFieldName] as number],
    );
  }


  filteredResources = filteredResources.sort((a : JSONObject, b : JSONObject) => {
    if (typeof a[accessibleFieldName] === 'number' && typeof b[accessibleFieldName] === 'number') {
      const left = a[accessibleFieldName] as number;
      const right = b[accessibleFieldName] as number;
      if (accessSortDirection === AccessSortDirection.DESCENDING) {
        return left -right;
      }
      if (accessSortDirection === AccessSortDirection.ASCENDING) {
        return right - left;
      }
    }
    return 0;
  });

  return filteredResources;
};
export default searchFilterSort;
