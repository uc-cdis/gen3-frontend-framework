import { useEffect, useState, useMemo } from 'react';
import { JSONPath } from 'jsonpath-plus';
import { JSONObject, useGetMDSQuery, usePrevious } from '@gen3/core';
import { useMiniSearch } from 'react-minisearch';
import MiniSearch from 'minisearch';
import {
  AdvancedSearchFilters,
  DiscoveryDataLoaderProps,
  KeyValueSearchFilter,
  SearchTerms,
} from '../types';
import filterByAdvSearch from './filterByAdvSearch';
import { getFilterValuesByKey, hasSearchTerms } from '../Search/utils';
import { processAllSummaries } from './utils';
import { StatisticsDataResponse } from '../Statistics';
import { SummaryStatistics } from '../Statistics/types';

interface QueryType {
  term: string;
  fields: string[];
  combineWith: 'AND' | 'OR';
}

const buildMiniSearchKeywordQuery = (terms: SearchTerms) => {
  return {
    combineWith: 'AND',
    queries: terms.keyword.keywords,
  };

  // TODO: see if minisearch can handle this
  // const a = {
  //   combineWith: 'AND',
  //   queries: Object.keys(terms.advancedSearchTerms.filters).map((field) => {
  //     const filter = terms.advancedSearchTerms.filters[field];
  //     return {
  //       combineWith: 'AND',
  //       queries: Object.entries(filter).reduce((acc, [term, selected]) => {
  //         if (selected) acc.push({ term, fields: [`advancedSearch.${field}`], combineWith: 'AND' });
  //         return acc;
  //       }, [] as QueryType[]),
  //     };
  //   }),
  // };
};

const extractValue = (document: JSONObject, field: string) => {
  // TODO See if mimi search can handle the for advanced search
  // if (field.startsWith('advancedSearch.')) {
  //   if (isSearchKVArray(document['advancedSearch'])) {
  //   const key = field.split('.')[-1];
  //   const result = document['advancedSearch'].filter(x => x.key === key);
  //   return result.reduce((acc, cur) => {
  //     acc.push(cur.value);
  //     return acc;
  //   }, [] as string[]).join(" ");
  //
  // }

  const result = JSONPath({ path: field, json: document });
  return result?.length ? result[0] : undefined;
};

const suffixes = (term: string, minLength: number): string[] => {
  if (term == null) {
    return [];
  }

  const tokens: string[] = [];

  for (let i = 0; i <= term.length - minLength; i++) {
    tokens.push(term.slice(i));
  }

  return tokens;
};

const processAdvancedSearchTerms = (
  advSearchFilters: AdvancedSearchFilters,
  data: JSONObject[],
  uidField: string,
): ReadonlyArray<KeyValueSearchFilter> => {
  return advSearchFilters.filters.map((filter) => {
    const { key, keyDisplayName } = filter;
    const values = getFilterValuesByKey(
      key,
      data,
      advSearchFilters.field,
      uidField,
    );
    return {
      key,
      keyDisplayName,
      valueDisplayNames: values.reduce((acc, cur) => {
        acc[cur] = cur;
        return acc;
      }, {} as Record<string, string>),
    };
  });
};

export const useLoadAllData = ({
  pagination,
  searchTerms,
  advancedSearchTerms,
  discoveryConfig,
  guidType = 'unregistered_discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
}: DiscoveryDataLoaderProps) => {

  const searchOverFields =
    discoveryConfig?.features.search?.searchBar?.searchableTextFields || [];
  const uidField = discoveryConfig?.minimalFieldMapping?.uid || 'guid';

  const [mdsData, setMDSData] = useState<Array<JSONObject>>([]);
  const [advancedSearchFilterValues, setAdvancedSearchFilterValues] = useState<
    ReadonlyArray<KeyValueSearchFilter>
  >([]);

  const [summaryStatistics, setSummaryStatistics] = useState<SummaryStatistics>(
    {},
  );
  const {
    search,
    searchResults,
    addAll,
    removeAll,
    clearSearch,
    clearSuggestions,
  } = useMiniSearch([], {
    fields: searchOverFields,
    storeFields: [uidField],
    idField: uidField,
    extractField: extractValue,
    processTerm: (term) => suffixes(term, 3),
    searchOptions: {
      processTerm: MiniSearch.getDefault('processTerm'),
      prefix: true,
    },
  });
  const [filteredData, setFilteredData] = useState<Array<JSONObject>>([]);
  const prevMDSData = usePrevious(mdsData);

  const clearSearchTerms = () => {
    clearSearch();
    clearSuggestions();
  };

  // request all the metadata from the server
  const { data, isUninitialized, isFetching, isLoading, isSuccess, isError } =
    useGetMDSQuery({
      url: 'https://healdata.org/mds', //TODO remove after development
      guidType: guidType,
      offset: 0,
      pageSize: maxStudies,
    });

  useEffect(() => {
    // we have the data, so set it and build the search index and get the advanced search filter values
    if (data && isSuccess && prevMDSData !== data.data) {
      const studyData = Object.values(data.data).reduce(
        (acc: JSONObject[], cur) => {
          acc.push(cur[studyField] as JSONObject);
          return acc;
        },
        [],
      );
      setMDSData(studyData);
      removeAll();
      addAll(studyData);
      setFilteredData(
        studyData.slice(
          pagination.offset,
          pagination.offset + pagination.pageSize,
        ),
      );

      // set the advanced search filter values read from the loaded data
      setAdvancedSearchFilterValues(
        processAdvancedSearchTerms(
          discoveryConfig.features.advSearchFilters,
          studyData,
          uidField,
        ),
      );
    }
  }, [
    addAll,
    data,
    isSuccess,
    pagination.offset,
    pagination.pageSize,
    removeAll,
  ]);

  useEffect(() => {
    const filterKeywordSearchResults = () => {
      return searchResults && searchResults.length > 0
        ? searchResults
        : mdsData;
    };

    const filterAdvancedSearchResults = (input: JSONObject[]): JSONObject[] => {
      return filterByAdvSearch(input, advancedSearchTerms, discoveryConfig);
    };

    const filterByPagination = (input: JSONObject[]): JSONObject[] => {
      return input.slice(
        pagination.offset,
        pagination.offset + pagination.pageSize,
      );
    };

    setFilteredData(
      filterByPagination(
        filterAdvancedSearchResults(filterKeywordSearchResults()),
      ),
    );
  }, [
    advancedSearchTerms,
    discoveryConfig,
    mdsData,
    pagination.offset,
    pagination.pageSize,
    searchResults,
  ]);

  // if there is a search term, search the index
  useEffect(() => {
    if (data && isSuccess && hasSearchTerms(searchTerms)) {
      search(buildMiniSearchKeywordQuery(searchTerms));
    }
  }, [data, isSuccess, search, searchTerms]);

  useEffect(() => {
    setSummaryStatistics( processAllSummaries(filteredData, discoveryConfig.aggregations));
  }, [filteredData, discoveryConfig.aggregations]);

  const useGetSummaryStatistics = (name: string): StatisticsDataResponse => {
    return summaryStatistics[name];
  };

  return {
    data: filteredData,
    //   hits: filteredData === mdsData ? mdsData?.length ?? -1  : filteredData.length,
    hits:
      searchResults && searchResults.length
        ? searchResults.length
        : mdsData?.length ?? -1,
    clearSearchTerms,
    advancedSearchFilterValues,
    useGetSummaryStatistics,
    isUninitialized,
    isFetching,
    isLoading,
    isSuccess,
    isError,
  };
};
