import { useState } from 'react';
import type { GetDataProps, GetDataResponse } from '../types';
import { processAuthorizations } from '../utils';
import type { CoreState } from '@gen3/core';
import {
  type IndexedMetadataFilters,
  type JSONObject,
  type ResourceAuthzMapping,
  selectAuthzMappingData,
  selectMeshAuthzMapping,
  useCoreSelector,
  useGetIndexAggMDSQuery,
} from '@gen3/core';
import type {
  DiscoveryDataLoaderProps,
  DiscoveryIndexConfig,
} from '../../types';
import { isArrayOfString } from '../../../../utils/isType';
import { useLoadAllData } from '../MDSAllLocal/DataLoader';
import { useDeepCompareEffect } from 'use-deep-compare';
import { useStudiesWithIds } from '../useStudiesWithIds';

const EMPTY_MESH_AUTHZ: ResourceAuthzMapping = {};

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

const extractFilterEmptyFromConfig = (
  config?: DiscoveryIndexConfig,
): IndexedMetadataFilters | undefined => {
  if (!config) {
    // throw an error or return default value
    return undefined;
  }
  if (config.features?.dataLoader?.dataFetchArgs?.hasEnoughData) {
    return config.features.dataLoader.dataFetchArgs
      .hasEnoughData as unknown as IndexedMetadataFilters;
  }
  return undefined;
};

const useGetIndexedMDSData = ({
  guidType = 'unregistered_discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
  discoveryConfig,
}: Partial<GetDataProps>): GetDataResponse => {
  const [mdsData, setMDSData] = useState<Array<JSONObject>>([]);

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
    filterEmpty: extractFilterEmptyFromConfig(discoveryConfig),
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
      const studyData = studiesWithIds;
      if (discoveryConfig?.features?.authorization.enabled) {
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
    } else setMDSData([]);
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

export const useLoadAllIndexedAggMDSData = ({
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
    dataHook: useGetIndexedMDSData,
    selectedAccessLevels,
  });
