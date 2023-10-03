import { useEffect, useState, useMemo } from 'react';
import { JSONPath } from 'jsonpath-plus';
import { JSONObject, useGetMDSQuery, usePrevious } from '@gen3/core';
import { useMiniSearch } from 'react-minisearch';
import { DiscoveryDataLoaderProps } from '../types';
import isEqual from 'lodash/isEqual';

const extractValue = (document: JSONObject, field: string) => {
  const result = JSONPath({ path: field, json: document });
  return result?.length ? result[0] : undefined;
};

export const useLoadAllData = ({
  pagination,
  searchTerms,
  discoveryConfig,
  guidType = 'unregistered_discovery_metadata',
  maxStudies = 10000,
  studyField = 'gen3_discovery',
}: DiscoveryDataLoaderProps) => {
  const prevSearchTerms = usePrevious(searchTerms);
  const prevPagination = usePrevious(pagination);

  const searchOverFields =
    discoveryConfig?.features.search?.searchBar?.searchableTextFields || [];
  const uidField = discoveryConfig?.minimalFieldMapping?.uid || 'guid';

  const [mdsData, setMDSData] = useState<Array<JSONObject>>([]);
  const { search, searchResults, addAll, removeAll } = useMiniSearch([], {
    fields: searchOverFields,
    storeFields: [uidField],
    idField: uidField,
    extractField: extractValue,
  });
  const [filteredData, setFilteredData] = useState<Array<JSONObject>>([]);
  const prevMDSData = usePrevious(mdsData);

  // request all the metadata from the server
  const { data, isUninitialized, isFetching, isLoading, isSuccess, isError } =
    useGetMDSQuery({
      url: 'https://healdata.org/mds', //TODO remove after development
      guidType: guidType,
      offset: 0,
      pageSize: maxStudies,
    });

  useEffect(() => {
    // we have the data, so set it and build the search index
    if (data && isSuccess && prevMDSData !== data.data) {
      const studyData = Object.values(data.data).reduce(
        (acc: JSONObject[], cur) => {
          acc.push(cur[studyField] as JSONObject);
          return acc;
        },
        [],
      );
      setMDSData(studyData);
      removeAll();
      addAll(studyData);
      setFilteredData(
        studyData.slice(
          pagination.offset,
          pagination.offset + pagination.pageSize,
        ),
      );
    }
  }, [
    addAll,
    data,
    isSuccess,
    pagination.offset,
    pagination.pageSize,
    removeAll,
  ]);

  useEffect(() => {
    console.log('searchResults', searchResults && searchResults?.length);
    if (searchResults && searchResults.length > 0) {
      console.log('searchResults', searchResults);
      setFilteredData(searchResults);

      // const results = searchResults?.reduce((acc: JSONObject[], cur) => {
      //   const found = mdsData.find((entry) => entry[uidField] === cur.uid);
      //   if (found) {
      //     acc.push(found);
      //   }
      //   return acc;
      // }, []);
      // setFilteredData(results);
    }
    // setFilteredData(mdsData.slice(pagination.offset, pagination.offset + pagination.pageSize));
  }, [mdsData, searchResults, searchTerms, uidField]);

  useEffect(() => {
    // we have the data, so set it and build the search index
    if (data && isSuccess && searchTerms.length > 0) {
      search(searchTerms);
    }
    // eslint-disable-next-line no-sparse-arrays
  }, [data, isSuccess, prevSearchTerms, search, searchTerms]);

  return {
    data: filteredData,
    //   hits: filteredData === mdsData ? mdsData?.length ?? -1  : filteredData.length,
    hits: mdsData?.length ?? -1,
    isUninitialized,
    isFetching,
    isLoading,
    isSuccess,
    isError,
  };
};
