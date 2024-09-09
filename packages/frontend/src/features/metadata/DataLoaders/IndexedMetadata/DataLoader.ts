import { useCallback, useEffect, useState } from 'react';
import {
  MetadataQueryProps,
  GetDataResponse,
  MetadataLoaderProps,
  MetadataLoaderConfig,
} from '../types';
import { processAuthorizations } from '../utils';
import {
  useCoreSelector,
  useGetIndexAggMDSQuery,
  selectAuthzMappingData,
  CoreState,
  type JSONObject,
  type IndexedMetadataFilters,
} from '@gen3/core';
import { DiscoveryIndexConfig } from '../../../Discovery/types';
import { isArrayOfString } from '../../../../utils/isType';
import { useLoadAllData } from '../MDSAllLocal/DataLoader';

const extractIndexArrayFromConfig = (
  config?: MetadataLoaderConfig,
): Array<string> => {
  if (!config) {
    // throw an error or return default value
    return [];
  }
  const dataFetchArgs = config?.dataFetchArgs;

  if (!dataFetchArgs?.indexKeys) return [];

  if (isArrayOfString(dataFetchArgs.indexKeys)) {
    return dataFetchArgs.indexKeys;
  }

  return [];
};

const extractFilterEmptyFromConfig = (
  config?: MetadataLoaderConfig,
): IndexedMetadataFilters | undefined => {
  if (!config) {
    // throw an error or return default value
    return undefined;
  }
  if (config?.dataFetchArgs?.hasEnoughData) {
    return config.dataFetchArgs
      .hasEnoughData as unknown as IndexedMetadataFilters;
  }
  return undefined;
};

const useGetIndexedMDSData = ({
  guidType = 'unregistered_discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
  dataLoaderConfig,
  shouldUseAuthorization,
}: Partial<MetadataQueryProps>): GetDataResponse => {
  const [mdsData, setMDSData] = useState<Array<JSONObject>>([]);
  const [isError, setIsError] = useState(false);

  const indexKeys = extractIndexArrayFromConfig(dataLoaderConfig);
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
    filterEmpty: extractFilterEmptyFromConfig(dataLoaderConfig),
  });

  const authMapping = useCoreSelector((state: CoreState) =>
    selectAuthzMappingData(state),
  );

  useEffect(() => {
    if (data && isSuccess) {
      const studyData = data.data;
      if (shouldUseAuthorization) {
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
}: MetadataLoaderProps) =>
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
