import { useEffect, useState } from 'react';

import {
  JSONObject,
  MetadataPaginationParams,
  useGetAggMDSQuery,
} from '@gen3/core';
import {
  AdvancedSearchFilters,
  DiscoverDataHookResponse,
  DiscoveryDataLoaderProps,
  KeyValueSearchFilter,
  SearchTerms,
} from '../../types';

import { getFilterValuesByKey, hasSearchTerms } from '../../Search/utils';

// TODO remove after debugging
// import { reactWhatChanged as RWC } from 'react-what-changed';

interface QueryType {
  term: string;
  fields: string[];
  combineWith: 'AND' | 'OR';
}

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
      valueDisplayNames: values.reduce(
        (acc, cur) => {
          acc[cur] = cur;
          return acc;
        },
        {} as Record<string, string>,
      ),
    };
  });
};

interface GetDataProps {
  offset: number;
  guidType: string;
  pageSize: number;
  studyField: string;
}

const useGetData = ({
  offset = 0,
  pageSize = 10,
  guidType = 'discovery_metadata',
  studyField = 'gen3_discovery',
}: Partial<GetDataProps>) => {
  const [mdsData, setMDSData] = useState<Array<JSONObject>>([]);
  const [isError, setIsError] = useState(false);
  const [total, setTotal] = useState(0);

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
    offset: offset,
    pageSize: pageSize,
  });

  useEffect(() => {
    if (data && isSuccess) {
      setMDSData(data.data);
      setTotal(data.hits);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    if (queryIsError) {
      setIsError(true);
    }
  }, [queryIsError]);

  return {
    mdsData,
    total,
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

interface PaginationHookProps {
  data: JSONObject[];
  pagination: MetadataPaginationParams;
}

interface AdvancedSearchFilterValuesHookProps {
  data: JSONObject[];
  advancedSearchFilters: AdvancedSearchFilters;
  uidField: string;
}

export const useAggMDSServer = ({
  pagination,
  searchTerms,
  advancedSearchTerms,
  discoveryConfig,
  guidType = 'discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
}: DiscoveryDataLoaderProps): DiscoverDataHookResponse => {
  const uidField = discoveryConfig?.minimalFieldMapping?.uid || 'guid';
  const dataGuidType = discoveryConfig?.guidType ?? guidType;
  const dataStudyField = discoveryConfig?.studyField ?? studyField;
  const {
    mdsData,
    total,
    isUninitialized,
    isFetching,
    isLoading,
    isSuccess,
    isError,
  } = useGetData({
    ...pagination,
    studyField: dataStudyField,
    guidType: dataGuidType,
  });

  return {
    data: mdsData,
    hits: total,
    suggestions: [],
    summaryStatistics: [],
    charts: {},
    advancedSearchFilterValues: [],
    dataRequestStatus: {
      isUninitialized,
      isFetching,
      isLoading,
      isSuccess,
      isError,
    },
  };
};
