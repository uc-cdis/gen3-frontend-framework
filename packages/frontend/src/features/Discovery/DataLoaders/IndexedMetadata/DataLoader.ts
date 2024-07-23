import { useCallback, useEffect, useState } from 'react';
import { GetDataProps, GetDataResponse } from '../types';
import { processAuthorizations } from '../utils';
import {
  useCoreSelector,
  useGetIndexAggMDSQuery,
  selectAuthzMappingData,
  CoreState,
  type JSONObject,
} from '@gen3/core';
import { DiscoveryDataLoaderProps, DiscoveryIndexConfig } from '../../types';
import { isArrayOfString } from '../../../../utils/isType';
import { useLoadAllData } from '../MDSAllLocal/DataLoader';

const extractIndexArrayFromConfig = (
  config?: DiscoveryIndexConfig,
): Array<string> => {
  if (!config) {
    // throw an error or return default value
    return [];
  }
  const dataFetchArgs = config.features?.dataLoader?.dataFetchArgs;

  if (!dataFetchArgs?.indexKeys) return [];

  if (isArrayOfString(dataFetchArgs.indexKeys)) {
    return dataFetchArgs.indexKeys;
  }

  return [];
};

const useGetIndexedMDSData = ({
  guidType = 'unregistered_discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
  discoveryConfig,
}: Partial<GetDataProps>): GetDataResponse => {
  const [mdsData, setMDSData] = useState<Array<JSONObject>>([]);
  const [isError, setIsError] = useState(false);

  const indexKeys = extractIndexArrayFromConfig(discoveryConfig);
  const {
    data,
    isUninitialized,
    isFetching,
    isLoading,
    isSuccess,
    isError: queryIsError,
  } = useGetIndexAggMDSQuery({
    guidType: guidType,
    studyField: studyField,
    offset: 0,
    pageSize: maxStudies,
    indexKeys: indexKeys,
  });

  const authMapping = useCoreSelector((state: CoreState) =>
    selectAuthzMappingData(state),
  );

  useEffect(() => {
    if (data && isSuccess) {
      const studyData = data.data;
      if (discoveryConfig?.features?.authorization.enabled) {
        setMDSData(
          processAuthorizations(studyData, discoveryConfig, authMapping),
        );
      } else setMDSData(studyData);
    } else setMDSData([]);
  }, [authMapping, data, discoveryConfig, isSuccess, studyField]);

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

export const useLoadAllIndexedAggMDSData = ({
  pagination,
  searchTerms,
  advancedSearchTerms,
  discoveryConfig,
  guidType = 'discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
}: DiscoveryDataLoaderProps) =>
  useLoadAllData({
    pagination,
    searchTerms,
    advancedSearchTerms,
    discoveryConfig,
    guidType,
    maxStudies,
    studyField,
    dataHook: useGetIndexedMDSData,
  });
