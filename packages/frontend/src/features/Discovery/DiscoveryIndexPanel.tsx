import type { ReactNode } from 'react';
import React, { useMemo, useRef, useState } from 'react';
import DiscoveryTable from './DiscoveryTable/DiscoveryTable';
import { Button, Collapse, Grid, Text } from '@mantine/core';
import AdvancedSearchPanel from './Search/AdvancedSearchPanel';
import type {
  MRT_PaginationState,
  MRT_SortingState,
} from 'mantine-react-table-open';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import ActionBar from './ActionBar/ActionBar';
import SummaryStatisticPanel from './Statistics/SummaryStatisticPanel';
import { CollapsableCharts } from '../../components/charts';
import { useLoadAllMDSData } from './DataLoaders/MDSAllLocal/DataLoader';
import type { AdvancedSearchTerms } from './Search/types';
import { SearchCombination } from './Search/types';
import SearchInputWithSuggestions from './Search/SearchInputWithSuggestions';
import AiSearch from './Search/AiSearch';
import { getDiscoveryDataLoader } from './DataLoaders/registeredDataLoaders';
import StudyProvider from '../Study/StudyProvider';
import { useDeepCompareMemo } from 'use-deep-compare';
import SearchInputSelectableFields from './Search/SearchInputSelectableFields';
import { DEBOUNCE_DELAY_TIME, SearchMode } from './constants';
import DiscoveryDropdownTagViewer from './DiscoveryDropdownTagViewer';
import { IoIosArrowDown, IoIosArrowUp, IoIosRefresh } from 'react-icons/io';
import DiscoveryProvider from './DiscoveryProvider';
import { useStudyIdFromWindow } from './utils/useStudyIdFromWindow';
import type { DiscoveryIndexConfig } from './types';
import type { AccessLevel } from '../../utils';
import { processSupportedAccessLevels } from './utils';

export interface DiscoveryIndexPanelProps {
  configuration: DiscoveryIndexConfig;
  indexSelector: ReactNode | null;
}

/**
 * DiscoveryIndexPanel is a React functional component that renders a discovery panel interface.
 * It includes features such as search, sorting, filtering, charts, export functionality, and a discovery table.
 * The component uses hooks for handling state, API data loading, and interface interactions.
 *
 * @param {Object} props - The properties object passed to the component.
 * @param {Object} props.configuration - Configuration object for setting up the discovery panel.
 * @param {Object} props.configuration.features - Defines enabled features (e.g., search, charts, export).
 * @param {Object} props.configuration.minimalFieldMapping - Field mapping configuration, such as `uid`.
 * @param {JSX.Element} props.indexSelector - React component for selecting an index in the discovery panel.
 *
 * @return {JSX.Element} A fully featured discovery interface including search functionality, a table, charts, filters, and more.
 */

const DiscoveryIndexPanel = ({
  configuration,
  indexSelector,
}: DiscoveryIndexPanelProps) => {
  const dataHook = useMemo(
    () =>
      getDiscoveryDataLoader(
        configuration?.features?.dataLoader?.dataFetchFunction,
      ) ?? useLoadAllMDSData,
    [configuration?.features?.dataLoader?.dataFetchFunction],
  );
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [selectedTags, setSelectedTags] = useState<{ [key: string]: boolean }>(
    {},
  );

  const enabledAccessLevels = useMemo(
    () => new Set<AccessLevel>(processSupportedAccessLevels(configuration)),
    [configuration],
  );

  const [selectedAccessLevels, setSelectedAccessLevels] = useState<number[]>(
    () => [...enabledAccessLevels],
  );

  const parentDivRef = useRef<HTMLDivElement>(null);
  const studyIdFromWindow = useStudyIdFromWindow();
  const [searchBarTerms, setSearchBarTerms] = useState<string[]>(
    studyIdFromWindow ? [studyIdFromWindow] : [],
  );
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
      selectedTags: selectedTags,
    };
  }, [debouncedSearchBarTerms, advancedSearchTerms, selectedTags]);

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
    tagCategoryData,
  } = dataHook({
    pagination: {
      offset: pagination.pageIndex * pagination.pageSize,
      pageSize: pagination.pageSize,
    },
    searchTerms: searchParam,
    discoveryConfig: configuration,
    sorting,
    selectedFieldsForSearchIndexing: selectedFieldsForSearchIndexing,
    searchMode: searchMode,
    selectedTags: selectedTags,
    selectedAccessLevels: selectedAccessLevels,
  });

  const selectedRecords = useMemo(() => {
    const uidField = configuration?.minimalFieldMapping?.uid ?? 'guid';
    const filterSelectedMembers = (data: Array<Record<string, any>>) =>
      data?.filter(
        (member) => uidField in member && selections.includes(member[uidField]),
      );
    return filterSelectedMembers(data);
  }, [data, configuration?.minimalFieldMapping?.uid, selections]);

  const [showAdvancedSearch, { toggle: toggleAdvancedSearch }] =
    useDisclosure(false);

  const [isDropdownTagViewerOpen, setIsDropdownTagViewerOpen] = useState(false);
  const tagViewerContentRef = useRef<HTMLDivElement | null>(null);
  const enableSearchBar = configuration?.features?.search?.searchBar?.enabled;
  const enableSearchableTags =
    configuration?.features?.search?.tagSearchDropdown?.enabled;
  const enableSearchInputSelectableFields =
    configuration?.features?.search?.searchBar?.searchableTextFields ||
    configuration?.features?.search?.searchBar
      ?.searchableAndSelectableTextFields;

  const categoryTypes =
    configuration?.features?.search?.tagSearchDropdown?.categoryTypes;

  const tagCategoryMenus = useMemo(() => {
    if (!categoryTypes || !tagCategoryData) {
      return tagCategoryData;
    }

    const allowedTypes = new Set(categoryTypes);
    return tagCategoryData.filter((category) =>
      allowedTypes.has(category.category),
    );
  }, [tagCategoryData, categoryTypes]);

  return (
    <DiscoveryProvider
      discoveryConfig={configuration}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      selectedAccessLevels={selectedAccessLevels}
      setSelectedAccessLevels={setSelectedAccessLevels}
      enabledAccessLevels={enabledAccessLevels}
    >
      <div className="p-4 w-full bg-base-lightest">
        <StudyProvider>
          <div className="w-full">
            {configuration.features?.pageTitle &&
            configuration?.features?.pageTitle.enabled ? (
              <Text size="xl">{configuration?.features?.pageTitle.text}</Text>
            ) : null}
            {configuration.features?.chartsSection?.enabled && (
              <CollapsableCharts
                config={configuration.features?.chartsSection}
                data={chartData}
                isSuccess={dataRequestStatus.isSuccess}
              />
            )}
            <div className="flex items-start p-2 mb-4 bg-base-max rounded-md">
              {indexSelector}
              <SummaryStatisticPanel summaries={summaryStatistics} />
              {enableSearchBar && (
                <div className="w-3/4 flex flex-col ml-2">
                  <Grid
                    gap="sm"
                    justify="space-between"
                    align="flex-start"
                    classNames={{ root: 'w-full' }}
                  >
                    <Grid.Col span={8}>
                      <SearchInputWithSuggestions
                        searchBarTerms={searchBarTerms}
                        setSearchBarTerms={setSearchBarTerms}
                        suggestions={suggestions}
                        clearSearch={() => {
                          setSearchBarTerms([]);
                        }}
                        searchChanged={(v) => setSearchBarTerms(v.split(' '))}
                        placeholder={
                          configuration?.features?.search?.searchBar
                            ?.placeholder ?? 'Search...'
                        }
                        label={
                          configuration?.features?.search?.searchBar
                            ?.inputSubtitle
                        }
                      />
                    </Grid.Col>
                    {enableSearchableTags && (
                      <Grid.Col span={4}>
                        <div className="flex justify-end items-center">
                          <Button
                            onClick={() => setSelectedTags({})}
                            variant="outline"
                            leftSection={<IoIosRefresh />}
                            className={
                              Object.keys(selectedTags).length === 0
                                ? 'border-gray-400 mr-2'
                                : 'mr-2'
                            }
                            data-disabled={
                              Object.keys(selectedTags).length === 0
                            }
                          >
                            Reset
                          </Button>
                          <Button
                            onClick={() =>
                              setIsDropdownTagViewerOpen((prev) => !prev)
                            }
                            disabled={data.length === 0}
                            variant="outline"
                            leftSection={
                              isDropdownTagViewerOpen ? (
                                <IoIosArrowUp />
                              ) : (
                                <IoIosArrowDown />
                              )
                            }
                          >
                            {`${
                              configuration?.features?.search?.tagSearchDropdown
                                ?.collapsibleButtonText || 'Tag Panel'
                            }`}
                          </Button>
                        </div>
                      </Grid.Col>
                    )}
                    <Grid.Col span={8}>
                      {enableSearchInputSelectableFields && (
                        <SearchInputSelectableFields
                          searchMode={searchMode}
                          setSearchMode={setSearchMode}
                          searchableTextFields={
                            configuration?.features?.search?.searchBar
                              ?.searchableTextFields
                          }
                          searchableAndSelectableTextFields={
                            configuration?.features?.search?.searchBar
                              ?.searchableAndSelectableTextFields
                          }
                          setSelectedFieldsForSearchIndexing={
                            setSelectedFieldsForSearchIndexing
                          }
                        />
                      )}
                      {tagCategoryData && tagCategoryData.length > 0 && (
                        <Collapse expanded={isDropdownTagViewerOpen}>
                          <DiscoveryDropdownTagViewer
                            tagCategoryData={tagCategoryMenus}
                          />
                        </Collapse>
                      )}
                    </Grid.Col>
                  </Grid>
                </div>
              )}
            </div>
            {configuration?.features?.aiSearch && (
              <div className="mb-4">
                <div className="flex w-full bg-base-max p-4 rounded-lg">
                  <AiSearch />
                </div>
              </div>
            )}
            <div className="flex flex-row">
              {configuration?.features?.advSearchFilters?.enabled ? (
                <Button onClick={toggleAdvancedSearch} color="accent">
                  Filters
                </Button>
              ) : null}
              {configuration?.features?.exportFromDiscovery?.enabled ? (
                <ActionBar
                  buttons={configuration.features.exportFromDiscovery.buttons}
                  exportDataFields={
                    configuration.features.exportFromDiscovery.exportDataFields
                  }
                  selectedResources={selectedRecords}
                  verifyExternalLogins={
                    configuration.features.exportFromDiscovery
                      .verifyExternalLogins
                  }
                  dataLibraryStoreMode={
                    configuration.features.exportFromDiscovery
                      .dataLibraryStoreMode
                  }
                />
              ) : null}
            </div>
            <div className="flex justify-start">
              {configuration?.features?.advSearchFilters?.enabled ? (
                <AdvancedSearchPanel
                  advSearchFilters={advancedSearchFilterValues}
                  opened={showAdvancedSearch}
                  setAdvancedSearchFilters={setAdvancedSearchTerms}
                />
              ) : null}
              <div
                className="flex w-full grow-0 bg-base-max border-1 border-base-lighter p-4 rounded-md"
                ref={parentDivRef}
              >
                <DiscoveryTable
                  data={data}
                  hits={hits}
                  studyIdFromWindow={studyIdFromWindow as string}
                  dataRequestStatus={dataRequestStatus}
                  setPagination={setPagination}
                  setSorting={setSorting}
                  setSelection={setSelections}
                  pagination={pagination}
                  sorting={sorting}
                  searchTerm={debouncedSearchBarTerms.join(' ')}
                  selectedFieldsForSearchIndexing={
                    selectedFieldsForSearchIndexing
                  }
                  discoveryConfig={configuration}
                />
              </div>
            </div>
          </div>
        </StudyProvider>
      </div>
    </DiscoveryProvider>
  );
};

export default DiscoveryIndexPanel;
