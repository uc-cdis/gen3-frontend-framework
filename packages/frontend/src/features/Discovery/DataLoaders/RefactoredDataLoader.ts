import { useEffect, useState } from 'react';
import { JSONPath } from 'jsonpath-plus';
import {
  JSONObject,
  MetadataPaginationParams,
  useGetMDSQuery,
} from '@gen3/core';
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
import { SummaryStatisticsConfig } from '../Statistics';
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

interface GetDataProps {
  guidType: string;
  maxStudies: number;
  studyField: string;
}

const useGetData = ({
  guidType = 'unregistered_discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
}: Partial<GetDataProps>) => {
  const [mdsData, setMDSData] = useState<Array<JSONObject>>([]);
  const [isError, setIsError] = useState(false);

  const { data, isUninitialized, isFetching, isLoading, isSuccess, isError: queryIsError } =
    useGetMDSQuery({
      url: 'https://healdata.org/mds',
      guidType: guidType,
      offset: 0,
      pageSize: maxStudies,
    });

  useEffect(() => {
    if (data && isSuccess) {
      const studyData = Object.values(data.data).reduce(
        (acc: JSONObject[], cur) => {
          return cur[studyField] ? [...acc, cur[studyField] as JSONObject] : acc;
        },
        [],
      );
      setMDSData(studyData);
    }
  }, [data, isSuccess, studyField]);

  useEffect(() => {
    if (queryIsError) {
      setIsError(true);
    }
  }, [queryIsError]);

  return {
    mdsData,
    isUninitialized,
    isFetching,
    isLoading,
    isSuccess,
    isError,
  };
};

interface SearchMetadataProps {
  discoveryConfig: any;
  searchTerms: SearchTerms;
  mdsData: JSONObject[];
  isSuccess: boolean;
}

const useSearchMetadata = ({
  discoveryConfig,
  searchTerms,
  mdsData,
                             isSuccess,
}: SearchMetadataProps) => {
  const searchOverFields =
    discoveryConfig?.features.search?.searchBar?.searchableTextFields || [];
  const uidField = discoveryConfig?.minimalFieldMapping?.uid || 'guid';

  const [searchedData, setSearchedData] = useState<Array<JSONObject>>([]);

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

  const isSearching = hasSearchTerms(searchTerms);

  const clearSearchTerms = () => {
    clearSearch();
    clearSuggestions();
  };

  useEffect(() => {
    // we have the data, so set it and build the search index and get the advanced search filter values
    if (mdsData && isSuccess) {
      removeAll();
      addAll(mdsData);
    }
  }, [addAll, isSuccess, mdsData, removeAll]);

  useEffect(() => {
    if (mdsData && isSearching) {
      search(buildMiniSearchKeywordQuery(searchTerms));
    }
  }, [mdsData, search, searchTerms, isSearching]);

  useEffect(() => {
    const filterKeywordSearchResults = () => {
      return searchResults && searchResults.length > 0
        ? searchResults
        : mdsData;
    };

    const filterAdvancedSearchResults = (input: JSONObject[]): JSONObject[] => {
      return filterByAdvSearch(
        input,
        searchTerms.advancedSearchTerms,
        discoveryConfig,
      );
    };

    setSearchedData(filterAdvancedSearchResults(filterKeywordSearchResults()));
  }, [
    discoveryConfig,
    mdsData,
    searchResults,
    searchTerms.advancedSearchTerms,
  ]);

  return {
    searchedData: isSearching ? searchedData : mdsData,
    clearSearchTerms: clearSearchTerms,
  };
};

interface PaginationHookProps {
  data: JSONObject[];
  pagination: MetadataPaginationParams;
}

const usePagination = ({ data, pagination }: PaginationHookProps) => {
  const [paginatedData, setPaginatedData] = useState<JSONObject[]>([]);

  useEffect(() => {
    const updatePaginatedData = () => {
      setPaginatedData(
        data.slice(pagination.offset, pagination.offset + pagination.pageSize),
      );
    };

    updatePaginatedData();
  }, [data, pagination.offset, pagination.pageSize]);

  useEffect(() => {
    const updatePaginatedData = () => {
      setPaginatedData(
        data.slice(pagination.offset, pagination.offset + pagination.pageSize),
      );
    };

    updatePaginatedData();
  }, [data, pagination.offset, pagination.pageSize]);

  return {
    paginatedData,
  };
};

interface AdvancedSearchFilterValuesHookProps {
  data: JSONObject[];
  advancedSearchFilters: AdvancedSearchFilters;
  uidField: string;
}

const useGetAdvancedSearchFilterValues = ({
  data,
  advancedSearchFilters,
  uidField,
}: AdvancedSearchFilterValuesHookProps) => {
  const [advancedSearchFilterValues, setAdvancedSearchFilterValues] = useState<
    ReadonlyArray<KeyValueSearchFilter>
  >([]);

  useEffect(() => {
    if (data) {
      setAdvancedSearchFilterValues(
        processAdvancedSearchTerms(advancedSearchFilters, data, uidField),
      );
    }
  }, [advancedSearchFilters, data, uidField]);

  return {
    advancedSearchFilterValues,
  };
};

interface SummaryStatisticsHookProps {
  data: JSONObject[];
  aggregationConfig: SummaryStatisticsConfig[];
}

const useGetSummaryStatistics = ({
  data,
  aggregationConfig,
}: SummaryStatisticsHookProps) => {
  const [summaryStatistics, setSummaryStatistics] = useState<SummaryStatistics>(
    {},
  );

  useEffect(() => {
    setSummaryStatistics(processAllSummaries(data, aggregationConfig));
  }, [data, aggregationConfig]);

  return {
    summaryStatistics,
  };
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

  const uidField = discoveryConfig?.minimalFieldMapping?.uid || 'guid';

  const {
    mdsData,
    isUninitialized,
    isFetching,
    isLoading,
    isSuccess,
    isError,
  } = useGetData({
    guidType,
    maxStudies,
    studyField,
  });

  const { advancedSearchFilterValues } = useGetAdvancedSearchFilterValues({
    data: mdsData,
    advancedSearchFilters: advancedSearchTerms,
    uidField,
  });

  const { searchedData, clearSearchTerms } = useSearchMetadata({
    discoveryConfig,
    searchTerms,
    mdsData,
    isSuccess,
  });

  const { paginatedData } = usePagination({
    data: searchedData,
    pagination,
  });

  const { summaryStatistics } = useGetSummaryStatistics({
    data: paginatedData,
    aggregationConfig: discoveryConfig?.aggregations,
  });

  return {
    data: paginatedData,
    hits: searchedData.length ?? -1,
    clearSearchTerms,
    advancedSearchFilterValues,
    summaryStatistics,
    isUninitialized,
    isFetching,
    isLoading,
    isSuccess,
    isError,
  };
};
