import { useEffect, useState } from 'react';
import {
  DiscoverDataHookResponse,
  DiscoveryDataLoaderProps,
} from '../../types';

export const useAggMetaMDSProxy = ({
  pagination,
  searchTerms,
  advancedSearchTerms,
  discoveryConfig,
  guidType = 'discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
}: DiscoveryDataLoaderProps): DiscoverDataHookResponse => {
  const [data, setData] = useState([{ test: 1 }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const url = 'https://jsonplaceholder.typicode.com/posts';
  console.log('searchTerms', searchTerms);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url);
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
  }, []);

  console.log('data', data);
  return {
    data: data,
    hits: data.length,
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
