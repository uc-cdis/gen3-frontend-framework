import MiniSearch from 'minisearch';
import { JSONObject } from '@gen3/core';
import { JSONPath } from 'jsonpath-plus';

const searchData = (
  data: Array<JSONObject>,
  searchTerms: Array<string>,
  discoveryConfig: any,
) => {
  const searchOverFields =
    discoveryConfig?.features?.search?.searchBar?.searchableTextFields || [];
  const uidField = discoveryConfig?.minimalFieldMapping?.uid || 'guid';
  const extractValue = (document: JSONObject, field: string) => {
    const result = JSONPath({ path: field, json: document });
    return result?.length ? result[0] : undefined;
  };

  // from https://github.com/lucaong/minisearch
  const miniSearch = new MiniSearch({
    fields: searchOverFields, // fields to index for full-text search
    storeFields: [uidField],
    idField: uidField,
    tokenize: (string, _fieldName) => string.split(' '),
    extractField: extractValue,
  });

  // Index all documents
  miniSearch.addAll(data);

  // Convert Search Terms into single string
  const searchTermsSpaceSeparated = searchTerms.join(' ');
  // Search with default options
  const miniSearchResults = miniSearch.search(searchTermsSpaceSeparated);
  // Extract _hdp_uid values from the mini search results
  const uidsToFilter = miniSearchResults.map((item) => item._hdp_uid);
  // filter the data with the search results uids
  const finalSearchResults = data.filter((item) =>
    uidsToFilter.includes(item._hdp_uid),
  );

  return finalSearchResults;
};

export default searchData;
