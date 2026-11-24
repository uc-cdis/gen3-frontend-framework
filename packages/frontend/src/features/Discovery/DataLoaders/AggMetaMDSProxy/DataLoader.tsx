import { useState } from 'react';
import type {
  CategoryObject,
  DiscoverDataHookResponse,
  DiscoveryDataLoaderProps,
  KeyValueSearchFilter,
} from '../../types';
import { useDeepCompareEffect } from 'use-deep-compare';
import type { JSONObject } from '@gen3/core';
import { processAllSummaries } from '../utils';

interface ProxyData {
  displayedData: JSONObject[];
  hits: number;
  suggestions: string[];
  tagCategoryData: CategoryObject[];
  advancedSearchFilterValues: ReadonlyArray<KeyValueSearchFilter>;
}

export const useAggMetaMDSProxy = ({
  pagination,
  searchTerms,
  selectedFieldsForSearchIndexing,
  searchMode,
  discoveryConfig,
  sorting,
  selectedTags,
  selectedAccessLevels,
  guidType = 'discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
}: DiscoveryDataLoaderProps): DiscoverDataHookResponse => {
  const [data, setData] = useState<ProxyData>({
    displayedData: [],
    hits: 0,
    suggestions: [],
    tagCategoryData: [],
    advancedSearchFilterValues: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const apiUrl = '/frontend-api/discovery';

  const params = {
    discoveryConfig: discoveryConfig,
    pagination: pagination,
    searchTerms: searchTerms,
    sorting: sorting,
    selectedFieldsForSearchIndexing: selectedFieldsForSearchIndexing,
    searchMode: searchMode,
    selectedTags: selectedTags,
    selectedAccessLevels: selectedAccessLevels,
  };

  useDeepCompareEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(true);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [
    searchTerms,
    pagination,
    sorting,
    selectedFieldsForSearchIndexing,
    searchMode,
    selectedTags,
    selectedAccessLevels,
  ]);

  const summaryStatistics = processAllSummaries(
    data.displayedData,
    discoveryConfig?.aggregations,
  );
  // update value count to reflect total number of studies
  summaryStatistics[0].value = data.hits;

  return {
    data: data.displayedData,
    hits: data.hits,
    suggestions: data.suggestions,
    summaryStatistics: summaryStatistics,
    charts: {},
    advancedSearchFilterValues: data.advancedSearchFilterValues,
    tagCategoryData: data.tagCategoryData,
    dataRequestStatus: {
      isUninitialized: false,
      isFetching: loading,
      isLoading: loading,
      isSuccess: error,
      isError: error,
    },
  };
};
