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

  // Return only studies where __accessible matches one of the values in selected access levels
  return studies.filter((study) =>
    selectedAccessLevels.includes(study.__accessible),
  );
};
export default filterByAccessLevels;
