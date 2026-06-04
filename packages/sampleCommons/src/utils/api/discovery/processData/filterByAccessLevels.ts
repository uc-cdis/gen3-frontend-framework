import { AccessLevel } from '@gen3/frontend/utils';
/**
 * Filters a list of studies based on an array of allowed accessibility levels.
 * * @param studies - The array of study objects
 * @param selectedAccessLevels - Array of numbers (AccessLevel enums)
 * @returns Filtered array of studies
 */
const filterByAccessLevels = (
  studies: any[],
  selectedAccessLevels: number[],
) => {
  // If no filters are selected, return the full list
  if (selectedAccessLevels.length === 0) {
    return studies;
  }

  // For “Mixed Availability”: selecting either “Available” or “Request Access” or
  // from the data availability filter will cause these “Mixed Availability” studies to be included in the filtered results
  // so the prescence of either available or request access access level
  // should add mixed availablility access leve to selected access levels
  if (
    selectedAccessLevels.includes(AccessLevel.ACCESSIBLE) ||
    selectedAccessLevels.includes(AccessLevel.UNACCESSIBLE)
  ) {
    selectedAccessLevels.push(AccessLevel.MIXED);
  }
  // Return only studies where __accessible matches one of the values in selected access levels
  return studies.filter((study) =>
    selectedAccessLevels.includes(study.__accessible),
  );
};
export default filterByAccessLevels;
