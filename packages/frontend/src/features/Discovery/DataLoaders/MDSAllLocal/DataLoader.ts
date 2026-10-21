import { useCallback, useEffect, useMemo, useState } from 'react';
import { JSONPath } from 'jsonpath-plus';
import type {
  AggregationsData,
  CoreState,
  JSONObject,
  MetadataPaginationParams,
} from '@gen3/core';
import {
  type ResourceAuthzMapping,
  selectAuthzMappingData,
  selectMeshAuthzMapping,
  useCoreSelector,
  useGetAggMDSQuery,
  useGetMDSQuery,
} from '@gen3/core';
import { useMiniSearch } from 'react-minisearch';
import type {
  AdvancedSearchFilters,
  DiscoverDataHookResponse,
  DiscoveryDataLoaderProps,
  KeyValueSearchFilter,
  SearchTerms,
  SelectedTags,
} from '../../types';
import filterByAdvSearch from './../processData/filterByAdvSearch';
import { hasSearchTerms } from '../../Search/utils';
import {
  addCommonsToTags,
  processAdvancedSearchTerms,
  processAllSummaries,
  processAuthorizations,
  processChartData,
} from '../utils';
import type { SummaryStatisticsConfig } from '../../Statistics';
import type { SummaryStatistics } from '../../Statistics/types';
import { useDeepCompareEffect } from 'use-deep-compare';
import type { GetDataProps, GetDataResponse, MetadataDataHook } from '../types';
import { getManualSortingAndPagination } from '../../utils';
import { useStudiesWithIds } from '../useStudiesWithIds';
import filterByAccessLevels from '../processData/filterByAccessLevels';
import { filterByTags, processTagCategoryData } from '../processData';

const EMPTY_MESH_AUTHZ: ResourceAuthzMapping = {};

// module-level so the reference is stable; an inline literal is a new object
// every render and re-runs effects that depend on it
const DISABLED_ADV_SEARCH_FILTERS: AdvancedSearchFilters = {
  enabled: false,
  field: '',
  displayName: '',
  filters: [],
};

const NO_SELECTED_TAGS: SelectedTags = {};

// TODO remove after debugging
// import { reactWhatChanged as RWC } from 'react-what-changed';

// Lowercase and remove punctuation/symbols; returning null makes MiniSearch
// discard terms that are nothing but punctuation.
const stripPunctuation = (term: string): string | null => {
  const cleaned = term.toLowerCase().replace(/[\p{P}\p{S}]/gu, '');
  return cleaned.length > 0 ? cleaned : null;
};

const buildMiniSearchKeywordQuery = (terms: SearchTerms) => {
  const keywords = terms.keyword.keywords?.filter((x) => x.length > 0) ?? [];
  // TODO See if minisearch can handle this
  // const res = keywords.join(" ");
  // const res =  {
  //   combineWith: 'AND',
  //   queries: keywords ?? [],
  // };

  return keywords[0];

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
  // TODO See if miniSearch can handle the for advanced search
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

const useGetMDSData = ({
  guidType = 'unregistered_discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
  discoveryConfig,
}: Partial<GetDataProps>): GetDataResponse => {
  const [mdsData, setMDSData] = useState<Array<JSONObject>>([]);

  const {
    data,
    isUninitialized,
    isFetching,
    isLoading,
    isSuccess,
    isError: queryIsError,
  } = useGetMDSQuery({
    guidType: guidType,
    studyField: studyField,
    offset: 0,
    pageSize: maxStudies,
  });

  const uidField = discoveryConfig?.minimalFieldMapping?.uid || 'guid';

  const studies = useMemo(
    () =>
      data
        ? Object.values(data.data)
            .map((entry) => entry[studyField] as JSONObject | undefined)
            .filter((study): study is JSONObject => !!study)
        : undefined,
    [data, studyField],
  );
  const { studiesWithIds, missingIdCount } = useStudiesWithIds(
    studies,
    uidField,
  );
  const studyData = useMemo(
    () => studiesWithIds.map((study) => addCommonsToTags(study)),
    [studiesWithIds],
  );

  const authMapping = useCoreSelector((state: CoreState) =>
    selectAuthzMappingData(state),
  );

  const isMesh = !!discoveryConfig?.features?.authorization?.isMesh;
  // the mapping is fetched once at app level (Gen3ModalsProvider), so read it from the store
  const meshAuthz = useCoreSelector((state: CoreState) =>
    selectMeshAuthzMapping(state),
  );

  // non-mesh commons use the empty mapping right away;
  // mesh commons wait for the query to succeed; a failure sets isError
  const meshAuthzMapping =
    isMesh && meshAuthz.data ? meshAuthz.data : EMPTY_MESH_AUTHZ;
  const isMeshAuthzResolved = !isMesh || meshAuthz.isSuccess;

  // derived, not stored: stays in sync with the queries and clears on a successful refetch
  const isError = queryIsError || (isMesh && meshAuthz.isError);

  useDeepCompareEffect(() => {
    if (data && isSuccess && isMeshAuthzResolved) {
      if (discoveryConfig?.features?.authorization?.enabled) {
        setMDSData(
          processAuthorizations(
            studyData,
            discoveryConfig,
            {
              default: authMapping,
            },
            meshAuthzMapping,
          ),
        );
      } else setMDSData(studyData);
    }
  }, [
    authMapping,
    data,
    studyData,
    discoveryConfig,
    isSuccess,
    isMeshAuthzResolved,
    meshAuthzMapping,
  ]);

  return {
    mdsData,
    missingIdCount,
    isUninitialized,
    isFetching: isFetching || (isMesh && meshAuthz.isLoading),
    isLoading:
      isLoading || (isMesh && !isMeshAuthzResolved && !meshAuthz.isError),
    isSuccess: isSuccess && isMeshAuthzResolved,
    isError,
  };
};

const useGetAggMDSData = ({
  guidType = 'unregistered_discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
  discoveryConfig,
}: Partial<GetDataProps>): GetDataResponse => {
  const [mdsData, setMDSData] = useState<Array<JSONObject>>([]);

  const {
    data,
    isUninitialized,
    isFetching,
    isLoading,
    isSuccess,
    isError: queryIsError,
  } = useGetAggMDSQuery({
    guidType: guidType,
    studyField: studyField,
    offset: 0,
    pageSize: maxStudies,
  });

  const uidField = discoveryConfig?.minimalFieldMapping?.uid || 'guid';
  const { studiesWithIds, missingIdCount } = useStudiesWithIds(
    data?.data,
    uidField,
  );

  const authMapping = useCoreSelector((state: CoreState) =>
    selectAuthzMappingData(state),
  );

  const isMesh = !!discoveryConfig?.features?.authorization?.isMesh;
  // the mapping is fetched once at app level (Gen3ModalsProvider), so read it from the store
  const meshAuthz = useCoreSelector((state: CoreState) =>
    selectMeshAuthzMapping(state),
  );

  // non-mesh commons use the empty mapping right away;
  // mesh commons wait for the query to succeed; a failure sets isError
  const meshAuthzMapping =
    isMesh && meshAuthz.data ? meshAuthz.data : EMPTY_MESH_AUTHZ;
  const isMeshAuthzResolved = !isMesh || meshAuthz.isSuccess;

  useDeepCompareEffect(() => {
    if (data && isSuccess && isMeshAuthzResolved) {
      const withCommonsTags = studiesWithIds.map((x) => addCommonsToTags(x));

      if (discoveryConfig?.features?.authorization.enabled) {
        setMDSData(
          processAuthorizations(
            withCommonsTags,
            discoveryConfig,
            {
              default: authMapping,
            },
            meshAuthzMapping,
          ),
        );
      } else setMDSData(withCommonsTags);
    }
  }, [
    authMapping,
    data,
    studiesWithIds,
    discoveryConfig,
    isSuccess,
    isMeshAuthzResolved,
    meshAuthzMapping,
  ]);

  // derived, not stored: stays in sync with the queries and clears on a successful refetch
  const isError = queryIsError || (isMesh && meshAuthz.isError);

  return {
    mdsData,
    missingIdCount,
    isUninitialized,
    isFetching: isFetching || (isMesh && meshAuthz.isLoading),
    isLoading:
      isLoading || (isMesh && !isMeshAuthzResolved && !meshAuthz.isError),
    isSuccess: isSuccess && isMeshAuthzResolved,
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
    discoveryConfig?.features?.search?.searchBar?.searchableTextFields || [];
  const uidField = discoveryConfig?.minimalFieldMapping?.uid || 'guid';

  const [searchedData, setSearchedData] = useState<Array<JSONObject>>([]);
  const [suggestions, setSuggestions] = useState<Array<string>>([]);
  const {
    search,
    autoSuggest,
    searchResults,
    suggestions: miniSearchSuggestions,
    addAll,
    removeAll,
    clearSearch,
    clearSuggestions,
  } = useMiniSearch([], {
    fields: searchOverFields,
    storeFields: [uidField],
    idField: uidField,
    tokenize: (string, _fieldName) => string.split(/[\s\p{P}\p{S}]+/u),
    extractField: extractValue,
    processTerm: stripPunctuation,
    searchOptions: {
      processTerm: stripPunctuation,
    },
  });

  const isSearching = hasSearchTerms(searchTerms);

  const clearSearchTerms = useCallback(() => {
    clearSearch();
    clearSuggestions();
  }, [clearSearch, clearSuggestions]);

  useDeepCompareEffect(() => {
    // we have the data, so set it and build the search index and get the advanced search filter values
    if (mdsData && isSuccess && mdsData.length > 0) {
      removeAll();
      addAll(mdsData);
    }
  }, [addAll, isSuccess, mdsData, removeAll]);

  useEffect(() => {
    if (mdsData && isSearching) {
      const searchQuery = buildMiniSearchKeywordQuery(searchTerms);
      if (searchQuery) {
        search(searchQuery);
        autoSuggest(searchQuery);
      }
    }
  }, [autoSuggest, isSearching, mdsData, search, searchTerms]);

  useDeepCompareEffect(() => {
    const filterKeywordSearchResults = () => {
      return searchResults ? searchResults : mdsData;
    };

    const filterAdvancedSearchResults = (input: JSONObject[]): JSONObject[] => {
      return filterByAdvSearch(
        input,
        searchTerms.advancedSearchTerms,
        discoveryConfig,
      );
    };

    setSearchedData(filterAdvancedSearchResults(filterKeywordSearchResults()));

    const terms = new Set<string>();
    miniSearchSuggestions?.slice(0, 100).forEach((suggestion) => {
      suggestion.terms.forEach((term) => {
        terms.add(term);
      });
    });
    setSuggestions([...terms]);
  }, [
    discoveryConfig,
    mdsData,
    miniSearchSuggestions,
    searchResults,
    searchTerms.advancedSearchTerms,
  ]);

  return {
    searchedData: isSearching ? searchedData : mdsData,
    clearSearchTerms: clearSearchTerms,
    suggestions: suggestions,
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
    [],
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
  guidType = 'discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
  dataHook,
  selectedAccessLevels,
}: DiscoveryDataLoaderProps & {
  dataHook: MetadataDataHook;
}): DiscoverDataHookResponse => {
  const uidField = discoveryConfig?.minimalFieldMapping?.uid || 'guid';
  const dataGuidType = discoveryConfig?.guidType ?? guidType;
  const dataStudyField = discoveryConfig?.studyField ?? studyField;
  const [summaryStatistics, setSummaryStatistics] = useState<SummaryStatistics>(
    [],
  );
  const [chartData, setChartData] = useState<AggregationsData>({});

  const {
    mdsData,
    missingIdCount,
    isUninitialized,
    isFetching,
    isLoading,
    isSuccess,
    isError,
  } = dataHook({
    studyField: dataStudyField,
    guidType: dataGuidType,
    maxStudies,
    discoveryConfig,
  });

  const manualSortingAndPagination =
    getManualSortingAndPagination(discoveryConfig);

  const tagCategoryData = processTagCategoryData(mdsData, discoveryConfig);

  const { advancedSearchFilterValues } = useGetAdvancedSearchFilterValues({
    data: mdsData,
    advancedSearchFilters:
      discoveryConfig.features?.advSearchFilters ?? DISABLED_ADV_SEARCH_FILTERS,
    uidField,
  });

  const { searchedData, clearSearchTerms, suggestions } = useSearchMetadata({
    discoveryConfig,
    searchTerms,

    mdsData,
    isSuccess,
  });

  // memoized: filter() returns a new array, and usePagination's effect depends
  // on this reference, so recomputing it every render loops forever
  const accessLevelFiltered = useMemo(
    () => filterByAccessLevels(searchedData, selectedAccessLevels),
    [searchedData, selectedAccessLevels],
  );

  // fully filtered data: search → access levels → tags
  const filteredByTags = useMemo(
    () =>
      filterByTags(
        accessLevelFiltered,
        searchTerms.selectedTags ?? NO_SELECTED_TAGS,
        discoveryConfig,
      ),
    [accessLevelFiltered, searchTerms.selectedTags, discoveryConfig],
  );

  // TODO: determine if this is even needed
  const { paginatedData } = usePagination({
    data: filteredByTags,
    pagination,
  });

  useEffect(() => {
    setSummaryStatistics(
      processAllSummaries(filteredByTags, discoveryConfig?.aggregations),
    );
    if (
      discoveryConfig.features.chartsSection?.charts &&
      filteredByTags.length > 0
    )
      setChartData(
        processChartData(
          filteredByTags,
          Object.keys(discoveryConfig.features.chartsSection.charts),
        ),
      );
  }, [
    filteredByTags,
    discoveryConfig?.aggregations,
    discoveryConfig.features.chartsSection?.charts,
  ]);

  return {
    data: manualSortingAndPagination ? paginatedData : filteredByTags,
    hits: filteredByTags.length,
    missingIdCount: missingIdCount ?? 0,
    clearSearch: clearSearchTerms,
    suggestions: suggestions,
    advancedSearchFilterValues,
    summaryStatistics,
    charts: chartData,
    tagCategoryData: tagCategoryData,
    dataRequestStatus: {
      isUninitialized,
      isFetching,
      isLoading,
      isSuccess,
      isError,
    },
  };
};

export const useLoadAllMDSData = ({
  pagination,
  searchTerms,
  advancedSearchTerms,
  discoveryConfig,
  guidType = 'discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
  selectedAccessLevels,
}: DiscoveryDataLoaderProps) =>
  useLoadAllData({
    pagination,
    searchTerms,
    advancedSearchTerms,
    discoveryConfig,
    guidType,
    maxStudies,
    studyField,
    dataHook: useGetMDSData,
    selectedAccessLevels,
  });

export const useLoadAllAggMDSData = ({
  pagination,
  searchTerms,
  advancedSearchTerms,
  discoveryConfig,
  guidType = 'discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
  selectedAccessLevels,
}: DiscoveryDataLoaderProps) =>
  useLoadAllData({
    pagination,
    searchTerms,
    advancedSearchTerms,
    discoveryConfig,
    guidType,
    maxStudies,
    studyField,
    dataHook: useGetAggMDSData,
    selectedAccessLevels,
  });
