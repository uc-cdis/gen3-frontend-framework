import { JSONObject } from '@gen3/core';
import {
  AdvancedSearchTerms,
  DiscoveryIndexConfig,
  SearchKV,
} from '../types/discoveryApi';

/**
 * Filters a list of studies based on an array of allowed accessibility levels.
 * * @param studies - The array of study objects
 * @param selectedAccessibility - Array of numbers (AccessLevel enums)
 * @returns Filtered array of studies
 */
const filterByAccessibility = (
  studies: any[],
  selectedAccessibility: number[],
) => {
  // If no filters are selected, return the full list
  if (selectedAccessibility.length === 0) {
    return studies;
  }

  // Return only studies where __accessible matches one of the values in selectedAccessibility
  return studies.filter((study) =>
    selectedAccessibility.includes(study.__accessible),
  );
};
export default filterByAccessibility;
