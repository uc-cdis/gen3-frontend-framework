import React, { ReactNode, useMemo, useRef, useState } from 'react';
import { DiscoveryIndexConfig } from './types';
import DiscoveryTable from './DiscoveryTable';
import DiscoveryProvider from './DiscoveryProvider';
import { Button, Text } from '@mantine/core';
import AdvancedSearchPanel from './Search/AdvancedSearchPanel';
import { MRT_PaginationState, MRT_SortingState } from 'mantine-react-table';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import ActionBar from './ActionBar/ActionBar';
import SummaryStatisticPanel from './Statistics/SummaryStatisticPanel';
import { CollapsableCharts } from '../../components/charts';
import { useLoadAllMDSData } from './DataLoaders/MDSAllLocal/DataLoader';
import { AdvancedSearchTerms, SearchCombination } from './Search/types';
import SearchInputWithSuggestions from './Search/SearchInputWithSuggestions';
import AiSearch from './Search/AiSearch';
import { getDiscoveryDataLoader } from './DataLoaders/registeredDataLoaders';
import StudyProvider from '../Study/StudyProvider';
import { useDeepCompareMemo } from 'use-deep-compare';
import SearchInputSelectableFields from './Search/SearchInputSelectableFields';
import { DEBOUNCE_DELAY_TIME, SearchMode } from './constants';

export interface DiscoveryIndexPanelProps {
  discoveryConfig: DiscoveryIndexConfig;
  indexSelector: ReactNode | null;
}

/**
 * DiscoveryIndexPanel is a React functional component that renders a discovery panel interface.
 * It includes features such as search, sorting, filtering, charts, export functionality, and a discovery table.
 * The component uses hooks for handling state, API data loading, and interface interactions.
 *
 * @param {Object} props - The properties object passed to the component.
 * @param {Object} props.discoveryConfig - Configuration object for setting up the discovery panel.
 * @param {Object} props.discoveryConfig.features - Defines enabled features (e.g., search, charts, export).
 * @param {Object} props.discoveryConfig.minimalFieldMapping - Field mapping configuration, such as `uid`.
 * @param {JSX.Element} props.indexSelector - React component for selecting an index in the discovery panel.
 *
 * @return {JSX.Element} A fully featured discovery interface including search functionality, a table, charts, filters, and more.
 */
const DiscoveryIndexPanel = ({
  discoveryConfig,
  indexSelector,
}: DiscoveryIndexPanelProps) => {
  const dataHook = useMemo(
    () =>
      getDiscoveryDataLoader(
        discoveryConfig?.features?.dataLoader?.dataFetchFunction,
      ) ?? useLoadAllMDSData,
    [discoveryConfig?.features?.dataLoader?.dataFetchFunction],
  );
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const parentDivRef = useRef<HTMLDivElement>(null);
  const [searchBarTerms, setSearchBarTerms] = useState<string[]>([]);
  const [debouncedSearchBarTerms] = useDebouncedValue(
    searchBarTerms,
    DEBOUNCE_DELAY_TIME,
  );
  const [selections, setSelections] = useState<string[]>([]); // table selections
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [advancedSearchTerms, setAdvancedSearchTerms] =
    useState<AdvancedSearchTerms>({
      operation: SearchCombination.and,
      filters: {},
    });

  const searchParam = useDeepCompareMemo(() => {
    return {
      keyword: {
        operator: SearchCombination.and,
        keywords: debouncedSearchBarTerms,
      },
      advancedSearchTerms: advancedSearchTerms,
    };
  }, [debouncedSearchBarTerms, advancedSearchTerms]);

  const [selectedFieldsForSearchIndexing, setSelectedFieldsForSearchIndexing] =
    useState([] as string[]);
  const [searchMode, setSearchMode] = useState<SearchMode>(
    SearchMode.FULL_TEXT,
  );

  // Get all required data from the data hook. This includes the metadata, search suggestions, and results, pagination, etc.
  const {
    data,
    hits,
    dataRequestStatus,
    advancedSearchFilterValues,
    suggestions,
    summaryStatistics,
    charts: chartData,
    allTags,
  } = dataHook({
    pagination: {
      offset: pagination.pageIndex * pagination.pageSize,
      pageSize: pagination.pageSize,
    },
    searchTerms: searchParam,
    discoveryConfig,
    sorting,
    selectedFieldsForSearchIndexing: selectedFieldsForSearchIndexing,
    searchMode: searchMode,
  });
  console.log('allTags', allTags);

  const selectedRecords = useMemo(() => {
    const uidField = discoveryConfig?.minimalFieldMapping?.uid ?? 'guid';
    const filterSelectedMembers = (data: Array<Record<string, any>>) =>
      data?.filter(
        (member) => uidField in member && selections.includes(member[uidField]),
      );
    return filterSelectedMembers(data);
  }, [data, discoveryConfig?.minimalFieldMapping?.uid, selections]);

  const [showAdvancedSearch, { toggle: toggleAdvancedSearch }] =
    useDisclosure(false);

  return (
    <div className="flex flex-col items-center p-4 w-full bg-base-lightest">
      <DiscoveryProvider discoveryIndexConfig={discoveryConfig}>
        <StudyProvider>
          <div className="w-full">
            {discoveryConfig.features?.pageTitle &&
            discoveryConfig?.features?.pageTitle.enabled ? (
              <Text size="xl">{discoveryConfig?.features?.pageTitle.text}</Text>
            ) : null}
            {discoveryConfig.features?.chartsSection?.enabled && (
              <CollapsableCharts
                config={discoveryConfig.features?.chartsSection}
                data={chartData}
                isSuccess={dataRequestStatus.isSuccess}
              />
            )}
            <div className="flex items-center p-2 mb-4 bg-base-max rounded-lg">
              {indexSelector}
              <SummaryStatisticPanel summaries={summaryStatistics} />
              <div className="w-3/4 flex flex-col">
                <SearchInputWithSuggestions
                  searchBarTerms={searchBarTerms}
                  setSearchBarTerms={setSearchBarTerms}
                  suggestions={suggestions}
                  clearSearch={() => {
                    setSearchBarTerms([]);
                  }}
                  searchChanged={(v) => setSearchBarTerms(v.split(' '))}
                  placeholder={
                    discoveryConfig?.features?.search?.searchBar?.placeholder ??
                    'Search...'
                  }
                  label={
                    discoveryConfig?.features?.search?.searchBar?.inputSubtitle
                  }
                />
                <SearchInputSelectableFields
                  searchMode={searchMode}
                  setSearchMode={setSearchMode}
                  searchableTextFields={
                    discoveryConfig?.features?.search?.searchBar
                      ?.searchableTextFields
                  }
                  searchableAndSelectableTextFields={
                    discoveryConfig?.features?.search?.searchBar
                      ?.searchableAndSelectableTextFields
                  }
                  setSelectedFieldsForSearchIndexing={
                    setSelectedFieldsForSearchIndexing
                  }
                />
              </div>
            </div>
            {discoveryConfig?.features?.aiSearch && (
              <div className="mb-4">
                <div className="flex w-full bg-base-max p-4 rounded-lg">
                  <AiSearch />
                </div>
              </div>
            )}
            <div className="flex flex-row">
              {discoveryConfig?.features?.advSearchFilters?.enabled ? (
                <Button onClick={toggleAdvancedSearch} color="accent">
                  Filters
                </Button>
              ) : (
                false
              )}
              {discoveryConfig?.features?.exportFromDiscovery?.enabled ? (
                <ActionBar
                  buttons={discoveryConfig.features.exportFromDiscovery.buttons}
                  exportDataFields={
                    discoveryConfig.features.exportFromDiscovery
                      .exportDataFields
                  }
                  selectedResources={selectedRecords}
                  verifyExternalLogins={
                    discoveryConfig.features.exportFromDiscovery
                      .verifyExternalLogins
                  }
                  dataLibraryStoreMode={
                    discoveryConfig.features.exportFromDiscovery
                      .dataLibraryStoreMode
                  }
                />
              ) : null}
            </div>
            <div className="flex justify-start">
              {discoveryConfig?.features?.advSearchFilters?.enabled ? (
                <AdvancedSearchPanel
                  advSearchFilters={advancedSearchFilterValues}
                  opened={showAdvancedSearch}
                  setAdvancedSearchFilters={setAdvancedSearchTerms}
                />
              ) : (
                false
              )}
              <div
                className="flex w-full grow-0 bg-base-max border-1 border-base-lighter p-4 rounded-md"
                ref={parentDivRef}
              >
                <DiscoveryTable
                  data={data}
                  hits={hits}
                  dataRequestStatus={dataRequestStatus}
                  setPagination={setPagination}
                  setSorting={setSorting}
                  setSelection={setSelections}
                  pagination={pagination}
                  sorting={sorting}
                />
              </div>
            </div>
          </div>
        </StudyProvider>
      </DiscoveryProvider>
    </div>
  );
};

export default DiscoveryIndexPanel;
