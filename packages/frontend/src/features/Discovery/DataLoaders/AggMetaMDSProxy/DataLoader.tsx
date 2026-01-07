import { useEffect, useState } from 'react';
import {
  DiscoverDataHookResponse,
  DiscoveryDataLoaderProps,
} from '../../types';
import { useDeepCompareEffect } from 'use-deep-compare';
export const useAggMetaMDSProxy = ({
  pagination,
  searchTerms,
  advancedSearchTerms,
  discoveryConfig,
  guidType = 'discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
}: DiscoveryDataLoaderProps): DiscoverDataHookResponse => {
  const [data, setData] = useState([{ displayData: [], hits: 0 }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const url = 'https://jsonplaceholder.typicode.com/posts';
  const apiUrl = 'http://localhost:3000/api/discovery';

  const params = {
    discoveryConfig: discoveryConfig,
    pagination: {
      offset: pagination.offset,
      pageSize: pagination.pageSize,
    },
    searchTerms: searchTerms,
    sorting: [],
    selectedFieldsForSearchIndexing: [],
    /*       selectedFieldsForSearchIndexing: [
        'study_metadata.minimal_info.study_name',
      ],
 */ selectedTags: {},
    /*       selectedTags: {
        SPARC: true,
        Dataverse: true,
      }, */
  };

  console.log('searchTerm', searchTerms.keyword.keywords);

  // useEffect(() => {
  useDeepCompareEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // const response = await fetch(url);
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
  }, [searchTerms, pagination.pageSize, pagination.offset]);

  return {
    data: data.displayedData,
    hits: data.hits,
    suggestions: [],
    summaryStatistics: [],
    charts: {},
    advancedSearchFilterValues: [],
    dataRequestStatus: {
      isUninitialized: false,
      isFetching: loading,
      isLoading: loading,
      isSuccess: error,
      isError: error,
    },
  };
};
