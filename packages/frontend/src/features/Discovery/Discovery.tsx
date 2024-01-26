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
import { useLoadAllData } from './DataLoaders/MDSAllLocal/DataLoader';
import { AdvancedSearchTerms, SearchCombination } from './Search/types';
import SearchInputWithSuggestions from './Search/SearchInputWithSuggestions';
import { getDiscoveryDataLoader } from "./DataLoaders/registeredDataLoaders";

export interface DiscoveryProps {
  discoveryConfig: DiscoveryConfig;
}

const Discovery = ({
  discoveryConfig,
}: DiscoveryProps) => {

  const dataHook = useMemo(() => getDiscoveryDataLoader(discoveryConfig?.features.dataFetchFunction) ?? useLoadAllData, []);

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
    <div className="flex flex-col items-center p-2 m-2 w-full">
      <div className="w-full">
        <DiscoveryProvider discoveryConfig={discoveryConfig}>
          {
            discoveryConfig.features?.pageTitle && discoveryConfig?.features?.pageTitle.enabled ? (
              <Text size="xl">{discoveryConfig?.features?.pageTitle.text}</Text>
            ) : null
          }
          <div className="flex items-center m-2">
            <SummaryStatisticPanel summaries={summaryStatistics} />
            <div className="flex-grow"></div>
            <div className="w-full">
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
            <Button onClick={toggleAdvancedSearch} color="accent">
              Filters
            </Button>
            {discoveryConfig?.features?.exportToDataLibrary?.enabled ? (
              <ActionBar config={discoveryConfig.features.exportToDataLibrary} />
            ) : null}
          </div>
          <div className="flex justify-start">
            <AdvancedSearchPanel
              advSearchFilters={advancedSearchFilterValues}
              opened={showAdvancedSearch}
              setAdvancedSearchFilters={setAdvancedSearchTerms}
            />

            <div className="flex flex-col w-full">
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
