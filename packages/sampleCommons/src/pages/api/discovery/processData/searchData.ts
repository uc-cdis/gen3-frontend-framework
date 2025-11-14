import MiniSearch from 'minisearch';
import { JSONObject } from '@gen3/core';

const searchData = (
  data: Array<JSONObject>,
  searchTerms: Array<string>,
  discoveryConfig: any,
) => {
  const searchOverFields =
    discoveryConfig?.features?.search?.searchBar?.searchableTextFields || [];
  const uidField = discoveryConfig?.minimalFieldMapping?.uid || '_hdp_uid';

  // from https://github.com/lucaong/minisearch
  const miniSearch = new MiniSearch({
    fields: searchOverFields, // fields to index for full-text search
    storeFields: uidField, // fields to return with search results
  });

  // Index all documents
  const searchableData = data.map((doc, index) => ({
    id: `${index + 1}`, // Example: generating simple IDs
    ...doc,
  }));
  miniSearch.addAll(searchableData);

  // Convert Search Terms into single string
  const searchTermsSpaceSeparated = searchTerms.join(' ');
  console.log('searchTermsSpaceSeparated', searchTermsSpaceSeparated);
  // Search with default options
  const searchResults = miniSearch.search(searchTermsSpaceSeparated);
  return searchResults;
};

export default searchData;
