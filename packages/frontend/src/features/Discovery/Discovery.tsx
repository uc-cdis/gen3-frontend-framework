import React, { useMemo, useState } from 'react';
import { DiscoveryConfig, DiscoveryTableDataHook } from './types';
import DiscoveryTable from './DiscoveryTable';
import DiscoveryProvider from './DiscoveryProvider';
import { Text } from '@mantine/core';
import AdvancedSearchPanel from './Search/AdvancedSearchPanel';
import { MRT_PaginationState, MRT_SortingState } from 'mantine-react-table';
import { useDisclosure } from '@mantine/hooks';
import { Button } from '@mantine/core';
import ActionBar from './ActionBar/ActionBar';
import SummaryStatisticPanel from './Statistics/SummaryStatisticPanel';
import { useLoadAllData, useLoadAllMDSData } from './DataLoaders/MDSAllLocal/DataLoader';
import { AdvancedSearchTerms, SearchCombination } from './Search/types';
import SearchInputWithSuggestions from './Search/SearchInputWithSuggestions';
import AISearchInput from './Search/AISearchInput';
import { getDiscoveryDataLoader } from './DataLoaders/registeredDataLoaders';

export interface DiscoveryProps {
  discoveryConfig: DiscoveryConfig;
}

const Discovery = ({
  discoveryConfig,
}: DiscoveryProps) => {

  const dataHook = useMemo(() => getDiscoveryDataLoader(discoveryConfig?.features.dataFetchFunction) ?? useLoadAllMDSData, []);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [searchBarTerm, setSearchBarTerm] = useState<string[]>([]);
  const [advancedSearchTerms, setAdvancedSearchTerms] =
    useState<AdvancedSearchTerms>({
      operation: SearchCombination.and,
      filters: {},
    });

  const searchParam = useMemo(() => {
    return {
      keyword: {
        operator: SearchCombination.and,
        keywords: searchBarTerm,
      },
      advancedSearchTerms: advancedSearchTerms,
    };
  }, [searchBarTerm, advancedSearchTerms]);

  // Get all required data from the data hook. This includes the metadata, search suggestions, and results, pagination, etc.

  const {
    data,
    hits,
    dataRequestStatus,
    advancedSearchFilterValues,
    suggestions,
    summaryStatistics,
  } = dataHook({
    pagination: {
      offset: pagination.pageIndex * pagination.pageSize,
      pageSize: pagination.pageSize,
    },
    searchTerms: searchParam,
    discoveryConfig,
  });

  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [showAdvancedSearch, { toggle: toggleAdvancedSearch }] =
    useDisclosure(false);

  return (
    <div className="flex flex-col items-center p-4 w-full bg-base-lightest">
      <div className="w-full">
        <DiscoveryProvider discoveryConfig={discoveryConfig}>
          {
            discoveryConfig.features?.pageTitle && discoveryConfig?.features?.pageTitle.enabled ? (
              <Text size="xl">{discoveryConfig?.features?.pageTitle.text}</Text>
            ) : null
          }
          <div className="flex items-center  p-2 mb-4 bg-base-max rounded-lg">
            <SummaryStatisticPanel summaries={summaryStatistics} />
            <div className="w-3/4 flex flex-col">
              <AISearchInput />
              <SearchInputWithSuggestions
                suggestions={suggestions}
                clearSearch={() => {
                  setSearchBarTerm([]);
                }}
                searchChanged={(v) => setSearchBarTerm(v.split(' '))}
                placeholder={
                  discoveryConfig?.features?.search?.searchBar?.placeholder ??
                  'Search...'
                }
                label={
                  discoveryConfig?.features?.search?.searchBar?.inputSubtitle
                }
              />
            </div>
          </div>
          <div className="flex flex-row">
            {discoveryConfig?.features?.advSearchFilters?.enabled ?
              <Button onClick={toggleAdvancedSearch} color="accent">
              Filters
            </Button> : false }
            {discoveryConfig?.features?.exportToDataLibrary?.enabled ? (
              <ActionBar config={discoveryConfig.features.exportToDataLibrary} />
            ) : null}
          </div>
          <div className="flex justify-start">
            { discoveryConfig?.features?.advSearchFilters?.enabled ? <AdvancedSearchPanel
              advSearchFilters={advancedSearchFilterValues}
              opened={showAdvancedSearch}
              setAdvancedSearchFilters={setAdvancedSearchTerms}
            /> : false }
            <div className="flex w-full bg-base-max p-4 rounded-lg">
              <DiscoveryTable
                data={data}
                hits={hits}
                dataRequestStatus={dataRequestStatus}
                setPagination={setPagination}
                setSorting={setSorting}
                pagination={pagination}
                sorting={sorting}
              />
            </div>
          </div>
        </DiscoveryProvider>
      </div>
    </div>
  );
};

export default Discovery;
