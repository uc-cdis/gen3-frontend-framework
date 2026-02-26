import { DiscoveryConfig, DiscoveryIndexConfig } from '../../types';

export const IsColumnSearchable = (
  column: any,
  discoveryConfig: DiscoveryIndexConfig,
  selectedFieldsForSearchIndexing: string[],
): boolean => {
  const allConfiguredSearchableTextFields =
    discoveryConfig?.features?.search?.searchBar?.searchableTextFields;
  if (allConfiguredSearchableTextFields) {
    const searchableTextFields =
      selectedFieldsForSearchIndexing.length > 0
        ? selectedFieldsForSearchIndexing
        : allConfiguredSearchableTextFields;
    const isSearchableField = searchableTextFields
      ? searchableTextFields.includes(column.id)
      : false;

    return isSearchableField;
  }
  return false;
};
