import MiniSearch from 'minisearch';
import { JSONObject } from '@gen3/core';
import { JSONPath } from 'jsonpath-plus';

const searchData = (
  data: Array<JSONObject>,
  searchTerms: Array<string>,
  selectedFieldsForSearchIndexing: Array<string>,
  discoveryConfig: any,
) => {
  console.log('discoveryConfig in searchData', discoveryConfig);
  console.log('searchTerms pre-processing', searchTerms);
  // do not execute search if there are no search terms
  if (searchTerms.length === 0 || searchTerms.every((item) => item === ''))
    return data;

  let searchOverFields;
  if (selectedFieldsForSearchIndexing.length > 0) {
    searchOverFields = selectedFieldsForSearchIndexing;
  } else {
    searchOverFields =
      discoveryConfig?.features?.search?.searchBar?.searchableTextFields || [];
  }

  const uidField = discoveryConfig?.minimalFieldMapping?.uid || '_hdp_uid';
  // Convert Search Terms into single string
  const searchTermsSpaceSeparated = searchTerms.join(' ').trim();

  const extractValue = (document: JSONObject, field: string) => {
    const result = JSONPath({ path: field, json: document });
    return result?.length ? result[0] : undefined;
  };

  const miniSearch = new MiniSearch({
    fields: searchOverFields, // fields to index for full-text search
    storeFields: [uidField],
    idField: uidField,
    tokenize: (string, _fieldName) => string.split(' '),
    extractField: extractValue,
  });

  // Index all documents
  miniSearch.addAll(data);

  // Search with default options
  const miniSearchResults = miniSearch.search(searchTermsSpaceSeparated);
  // Extract _hdp_uid values from the mini search results
  const uidsToFilter = miniSearchResults.map((item) => item._hdp_uid);
  // filter the original data with the search results uids array
  const finalSearchResults = data.filter((item) =>
    uidsToFilter.includes(item._hdp_uid),
  );
  return finalSearchResults;
};

export default searchData;
