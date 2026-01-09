import { useEffect, useState } from 'react';
import {
  DiscoverDataHookResponse,
  DiscoveryDataLoaderProps,
} from '../../types';
import { useDeepCompareEffect } from 'use-deep-compare';
import { processAdvancedSearchTerms } from './processAdvancedSearchTerms';
import { JSONObject } from '@gen3/core';
import { processAllSummaries } from '../utils';

interface ProxyData {
  displayedData: JSONObject[];
  hits: number;
  suggestions: string[];
}

export const useAggMetaMDSProxy = ({
  pagination,
  searchTerms,
  advancedSearchTerms,
  discoveryConfig,
  sorting,
  guidType = 'discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
}: DiscoveryDataLoaderProps): DiscoverDataHookResponse => {
  const [data, setData] = useState<ProxyData>({
    displayedData: [],
    hits: 0,
    suggestions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const uidField = discoveryConfig?.minimalFieldMapping?.uid || 'guid';
  const apiUrl = 'http://localhost:3000/api/discovery';

  const params = {
    discoveryConfig: discoveryConfig,
    pagination: pagination,
    searchTerms: searchTerms,
    sorting: sorting,
    selectedFieldsForSearchIndexing: [],
    /*       selectedFieldsForSearchIndexing: [
        'study_metadata.minimal_info.study_name',
      ],
     */
    selectedTags: {},
    /*       selectedTags: {
        SPARC: true,
        Dataverse: true,
      },
    */
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
    fetchData();
  }, [searchTerms, pagination, sorting]);

  let advancedSearchFilterValues = [] as any;
  const advancedSearchFilters = discoveryConfig.features?.advSearchFilters ?? {
    enabled: false,
    field: '',
    displayName: '',
    filters: [],
  };
  if (data.displayedData) console.log('data', data);
  advancedSearchFilterValues = processAdvancedSearchTerms(
    advancedSearchFilters,
    data.displayedData,
    uidField,
  );

  let summaryStatistics = processAllSummaries(
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
    advancedSearchFilterValues: advancedSearchFilterValues,
    dataRequestStatus: {
      isUninitialized: false,
      isFetching: loading,
      isLoading: loading,
      isSuccess: error,
      isError: error,
    },
  };
};
